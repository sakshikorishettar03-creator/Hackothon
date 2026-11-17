import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  SEED_USERS,
  SEED_OFFICERS,
  SEED_COMPLAINTS,
  SEED_NOTIFICATIONS,
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');
const PORT = process.env.PORT || 4000;
const TOKEN_SECRET = process.env.CIVICFLOW_SECRET || 'civicflow-hdmc-smart-city-2026-secret';

const CATEGORY_TO_DEPT = {
  water: 'HDMC Water Board (24x7)',
  roads: 'Public Works & Roads Dept.',
  sanitation: 'Solid Waste Management',
  streetlights: 'Smart Electrical Wing',
  drainage: 'Stormwater & UGD Cell',
  parks: 'Urban Horticulture Dept.',
};

// ---------------- Database Persistence ----------------
function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = {
      users: SEED_USERS,
      officers: SEED_OFFICERS,
      complaints: SEED_COMPLAINTS,
      notifications: SEED_NOTIFICATIONS,
      settings: {
        autoEscalateHours: 12,
        requireVerificationPhoto: false,
        notifyCitizenSms: true,
      },
    };
    saveDB(initial);
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    const initial = {
      users: SEED_USERS,
      officers: SEED_OFFICERS,
      complaints: SEED_COMPLAINTS,
      notifications: SEED_NOTIFICATIONS,
      settings: { autoEscalateHours: 12, requireVerificationPhoto: false, notifyCitizenSms: true },
    };
    saveDB(initial);
    return initial;
  }
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// ---------------- Signed Token Auth & RBAC ----------------
function signToken(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(encoded).digest('base64url');
  if (sig !== expected) return null;
  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
  } catch {
    return null;
  }
}

function getAuthUser(req, db) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload?.userId) return null;
  const user = db.users.find((u) => u.id === payload.userId);
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

// ---------------- Auto-Escalation Engine ----------------
function runAutoEscalation(db) {
  const nowMs = Date.now();
  let escalatedCount = 0;

  db.complaints.forEach((c) => {
    const closed = ['Resolved', 'Rejected'].includes(c.status);
    if (!closed && !c.isEscalated && c.slaDeadline) {
      const deadlineMs = new Date(c.slaDeadline).getTime();
      if (!Number.isNaN(deadlineMs) && nowMs > deadlineMs) {
        const overdueHrs = Math.max(1, Math.round((nowMs - deadlineMs) / 3600000));
        c.isEscalated = true;
        c.status = 'Escalated';
        c.priority = 'Critical';
        c.escalationReason = `Auto-Escalated: Overdue past SLA deadline by ${overdueHrs} hr(s).`;
        c.updatedAt = new Date().toISOString();
        c.timeline.push({
          step: 'Auto-Escalated (SLA Breached)',
          time: formatTimeNow(),
          done: false,
          active: true,
          note: c.escalationReason,
        });

        pushNotification(db, {
          targetRole: 'department',
          complaintId: c.id,
          title: `SLA Breach Auto-Escalation — ${c.id}`,
          message: `"${c.title}" (${c.ward}) exceeded SLA and was escalated to Command Admin.`,
          type: 'error',
        });
        pushNotification(db, {
          targetRole: 'citizen',
          complaintId: c.id,
          title: `Priority Escalated — ${c.id}`,
          message: `Your complaint "${c.title}" has been escalated to senior HDMC administrators for urgent action.`,
          type: 'warning',
        });
        escalatedCount++;
      }
    }
  });

  if (escalatedCount > 0) saveDB(db);
  return escalatedCount;
}

function pushNotification(db, { targetRole, complaintId, title, message, type = 'info' }) {
  db.notifications.unshift({
    id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    targetRole,
    complaintId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

function formatTimeNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ---------------- HTTP Helpers ----------------
function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 10 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function requireDepartment(req, res, db) {
  const user = getAuthUser(req, db);
  if (!user) {
    sendJSON(res, 401, { error: 'Authentication required.' });
    return null;
  }
  if (user.role !== 'department') {
    sendJSON(res, 403, {
      error: 'Forbidden: Authorized HDMC Department credentials are required for this action.',
    });
    return null;
  }
  return user;
}

// ---------------- Router ----------------
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const db = loadDB();

  try {
    // Health check
    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJSON(res, 200, { status: 'ok', service: 'CivicFlow Unified API', timestamp: new Date().toISOString() });
    }

    // ---------- AUTH ----------
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = await readBody(req);
      const user = db.users.find(
        (u) => u.email.toLowerCase() === (email || '').trim().toLowerCase() && u.password === password
      );
      if (!user) {
        return sendJSON(res, 401, { error: 'Invalid credentials. Check email and password.' });
      }
      const { password: _, ...safeUser } = user;
      const token = signToken({ userId: user.id, role: user.role, email: user.email });
      return sendJSON(res, 200, { token, user: safeUser });
    }

    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const user = getAuthUser(req, db);
      if (!user) return sendJSON(res, 401, { error: 'Not authenticated' });
      return sendJSON(res, 200, { user });
    }

    if (pathname === '/api/auth/profile' && req.method === 'PATCH') {
      const user = getAuthUser(req, db);
      if (!user) return sendJSON(res, 401, { error: 'Not authenticated' });
      const body = await readBody(req);
      const record = db.users.find((u) => u.id === user.id);
      if (record) {
        if (body.name) {
          record.name = body.name;
          record.firstName = body.name.trim().split(' ')[0] || record.firstName;
          record.avatarInitials = body.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        }
        if (body.phone) record.phone = body.phone;
        if (body.ward) record.ward = body.ward;
        if (body.city) record.city = body.city;
        saveDB(db);
        const { password: _, ...safeUser } = record;
        return sendJSON(res, 200, { user: safeUser });
      }
      return sendJSON(res, 404, { error: 'User not found' });
    }

    // ---------- COMPLAINTS (SHARED DATABASE) ----------
    if (pathname === '/api/complaints' && req.method === 'GET') {
      runAutoEscalation(db);
      return sendJSON(res, 200, { complaints: db.complaints });
    }

    if (pathname === '/api/complaints' && req.method === 'POST') {
      const body = await readBody(req);
      const authUser = getAuthUser(req, db);

      if (!body.title?.trim() || !body.description?.trim() || !body.location?.trim()) {
        return sendJSON(res, 400, { error: 'Title, description, and exact location are required.' });
      }

      const nextNum = 4830 + db.complaints.length + Math.floor(Math.random() * 90);
      const id = `CF-2026-${nextNum}`;
      const nowIso = new Date().toISOString();
      const dept = body.department || CATEGORY_TO_DEPT[body.categoryId] || 'Municipal Rapid Response Cell';
      const slaHrs = body.priority === 'Critical' ? 4 : body.priority === 'High' ? 8 : 18;
      const slaDeadline = new Date(Date.now() + slaHrs * 3600 * 1000).toISOString();

      const newComplaint = {
        id,
        title: body.title.trim(),
        category: body.category || body.categoryLabel || 'Civic Infrastructure',
        categoryId: body.categoryId || 'roads',
        description: body.description.trim(),
        city: body.city || 'Hubballi-Dharwad',
        area: body.area || 'Central Hubballi',
        ward: body.ward || 'Ward 14 — Vidyanagar',
        location: body.location.trim(),
        lat: Number(body.lat) || 15.3647,
        lng: Number(body.lng) || 75.124,
        citizenName: authUser?.name || body.citizenName || 'Renuka Patil',
        citizenEmail: authUser?.email || 'renuka.patil@hubballidharwad.in',
        status: 'New',
        priority: body.priority || 'High',
        department: dept,
        assignedOfficerId: null,
        officer: 'Unassigned',
        officerPhone: '—',
        expectedResolutionDate: null,
        slaDeadline,
        isEscalated: false,
        escalationReason: null,
        rejectionReason: null,
        resolutionTime: `SLA: ${slaHrs} hrs`,
        rating: null,
        imagePreview: body.imagePreview || null,
        progressNotes: [],
        verificationProof: null,
        createdAt: nowIso,
        updatedAt: nowIso,
        timeline: [
          {
            step: 'Complaint Submitted',
            time: formatTimeNow(),
            done: true,
            note: `Registered by ${authUser?.name || 'Renuka Patil'} with GPS (${(Number(body.lat) || 15.3647).toFixed(4)}°N, ${(Number(body.lng) || 75.124).toFixed(4)}°E).`,
          },
          {
            step: 'Pending Department Review',
            time: 'Awaiting',
            done: false,
            active: true,
            note: `Routed to ${dept} Incoming Queue.`,
          },
          { step: 'Officer Assigned', time: 'Pending', done: false, note: 'Awaiting assignment.' },
          { step: 'Work In Progress', time: 'Pending', done: false, note: 'Awaiting field update.' },
          { step: 'Verified & Resolved', time: 'Pending', done: false, note: 'Pending verification.' },
        ],
      };

      db.complaints.unshift(newComplaint);

      pushNotification(db, {
        targetRole: 'department',
        complaintId: id,
        title: `New Citizen Complaint — ${id}`,
        message: `${newComplaint.citizenName} reported "${newComplaint.title}" in ${newComplaint.ward}.`,
        type: 'info',
      });

      pushNotification(db, {
        targetRole: 'citizen',
        complaintId: id,
        title: `Complaint Registered — ${id}`,
        message: `"${newComplaint.title}" has been submitted to ${dept}.`,
        type: 'success',
      });

      saveDB(db);
      return sendJSON(res, 201, { complaint: newComplaint });
    }

    // Citizen rating on complaint
    const rateMatch = pathname.match(/^\/api\/complaints\/([^/]+)\/rate$/);
    if (rateMatch && req.method === 'POST') {
      const id = decodeURIComponent(rateMatch[1]);
      const { rating } = await readBody(req);
      const complaint = db.complaints.find((c) => c.id === id);
      if (!complaint) return sendJSON(res, 404, { error: 'Complaint not found' });
      complaint.rating = Number(rating);
      complaint.updatedAt = new Date().toISOString();
      saveDB(db);
      return sendJSON(res, 200, { complaint });
    }

    // ---------- PROTECTED DEPARTMENT ACTIONS (RBAC ENFORCED) ----------
    // Accept complaint
    const acceptMatch = pathname.match(/^\/api\/complaints\/([^/]+)\/accept$/);
    if (acceptMatch && req.method === 'POST') {
      const admin = requireDepartment(req, res, db);
      if (!admin) return;
      const id = decodeURIComponent(acceptMatch[1]);
      const complaint = db.complaints.find((c) => c.id === id);
      if (!complaint) return sendJSON(res, 404, { error: 'Complaint not found' });

      complaint.status = 'Accepted';
      complaint.rejectionReason = null;
      complaint.updatedAt = new Date().toISOString();
      complaint.timeline = [
        complaint.timeline[0],
        { step: 'Accepted by Department', time: formatTimeNow(), done: true, note: `Accepted by ${admin.name}.` },
        { step: 'Officer Assigned', time: 'Next Step', done: false, active: true, note: 'Ready for officer dispatch.' },
        { step: 'Work In Progress', time: 'Pending', done: false, note: 'Awaiting field crew.' },
        { step: 'Verified & Resolved', time: 'Pending', done: false, note: 'Pending verification.' },
      ];

      pushNotification(db, {
        targetRole: 'citizen',
        complaintId: id,
        title: `Complaint Accepted — ${id}`,
        message: `${complaint.department} accepted "${complaint.title}" and is preparing dispatch.`,
        type: 'info',
      });

      saveDB(db);
      return sendJSON(res, 200, { complaint });
    }

    // Reject complaint with reason
    const rejectMatch = pathname.match(/^\/api\/complaints\/([^/]+)\/reject$/);
    if (rejectMatch && req.method === 'POST') {
      const admin = requireDepartment(req, res, db);
      if (!admin) return;
      const id = decodeURIComponent(rejectMatch[1]);
      const { reason } = await readBody(req);
      if (!reason?.trim()) return sendJSON(res, 400, { error: 'Rejection reason is required.' });

      const complaint = db.complaints.find((c) => c.id === id);
      if (!complaint) return sendJSON(res, 404, { error: 'Complaint not found' });

      complaint.status = 'Rejected';
      complaint.isEscalated = false;
      complaint.rejectionReason = reason.trim();
      complaint.updatedAt = new Date().toISOString();
      complaint.timeline.push({
        step: 'Rejected by Department',
        time: formatTimeNow(),
        done: true,
        note: `Rejected by ${admin.name}: ${reason.trim()}`,
      });

      pushNotification(db, {
        targetRole: 'citizen',
        complaintId: id,
        title: `Complaint Rejected — ${id}`,
        message: `"${complaint.title}" was closed: ${reason.trim()}`,
        type: 'error',
      });

      saveDB(db);
      return sendJSON(res, 200, { complaint });
    }

    // Assign officer
    const assignMatch = pathname.match(/^\/api\/complaints\/([^/]+)\/assign$/);
    if (assignMatch && req.method === 'POST') {
      const admin = requireDepartment(req, res, db);
      if (!admin) return;
      const id = decodeURIComponent(assignMatch[1]);
      const { officerId, expectedResolutionDate } = await readBody(req);
      const complaint = db.complaints.find((c) => c.id === id);
      if (!complaint) return sendJSON(res, 404, { error: 'Complaint not found' });

      const officer = db.officers.find((o) => o.id === officerId);
      if (!officer) return sendJSON(res, 400, { error: 'Selected officer not found.' });

      complaint.assignedOfficerId = officer.id;
      complaint.officer = officer.name;
      complaint.officerPhone = officer.phone;
      complaint.department = officer.department;
      if (expectedResolutionDate) complaint.expectedResolutionDate = expectedResolutionDate;
      if (['New', 'Accepted', 'Escalated'].includes(complaint.status)) {
        complaint.status = 'Assigned';
      }
      complaint.updatedAt = new Date().toISOString();

      complaint.timeline = [
        complaint.timeline[0],
        { step: 'Accepted by Department', time: formatTimeNow(), done: true, note: `Verified by ${admin.name}.` },
        {
          step: 'Officer Assigned',
          time: formatTimeNow(),
          done: true,
          note: `Assigned to ${officer.name} (${officer.designation}, ${officer.phone}).`,
        },
        { step: 'Work In Progress', time: 'Dispatched', done: false, active: true, note: 'Field officer mobilizing to site.' },
        { step: 'Verified & Resolved', time: 'Pending', done: false, note: 'Pending completion.' },
      ];

      pushNotification(db, {
        targetRole: 'citizen',
        complaintId: id,
        title: `Officer Assigned — ${id}`,
        message: `${officer.name} (${officer.department}) has been assigned to "${complaint.title}".`,
        type: 'info',
      });

      saveDB(db);
      return sendJSON(res, 200, { complaint });
    }

    // Change priority
    const priorityMatch = pathname.match(/^\/api\/complaints\/([^/]+)\/priority$/);
    if (priorityMatch && req.method === 'PATCH') {
      const admin = requireDepartment(req, res, db);
      if (!admin) return;
      const id = decodeURIComponent(priorityMatch[1]);
      const { priority } = await readBody(req);
      const complaint = db.complaints.find((c) => c.id === id);
      if (!complaint) return sendJSON(res, 404, { error: 'Complaint not found' });

      complaint.priority = priority;
      complaint.updatedAt = new Date().toISOString();
      complaint.timeline.push({
        step: `Priority Changed to ${priority}`,
        time: formatTimeNow(),
        done: true,
        note: `Updated by ${admin.name}.`,
      });

      saveDB(db);
      return sendJSON(res, 200, { complaint });
    }

    // Update progress (status, notes, photo, expected resolution date)
    const progressMatch = pathname.match(/^\/api\/complaints\/([^/]+)\/progress$/);
    if (progressMatch && req.method === 'POST') {
      const admin = requireDepartment(req, res, db);
      if (!admin) return;
      const id = decodeURIComponent(progressMatch[1]);
      const { status, description, photo, expectedResolutionDate } = await readBody(req);
      const complaint = db.complaints.find((c) => c.id === id);
      if (!complaint) return sendJSON(res, 404, { error: 'Complaint not found' });

      if (status) complaint.status = status;
      if (expectedResolutionDate) complaint.expectedResolutionDate = expectedResolutionDate;
      complaint.updatedAt = new Date().toISOString();

      if (description?.trim() || photo) {
        complaint.progressNotes = complaint.progressNotes || [];
        complaint.progressNotes.unshift({
          id: `PN-${Date.now()}`,
          text: description?.trim() || `Status updated to ${complaint.status}`,
          photo: photo || null,
          author: complaint.officer !== 'Unassigned' ? complaint.officer : admin.name,
          timestamp: new Date().toISOString(),
        });
      }

      const stepLabel =
        complaint.status === 'Pending Verification'
          ? 'Submitted for Verification'
          : `Status Updated: ${complaint.status}`;

      complaint.timeline = [
        complaint.timeline[0],
        { step: 'Accepted by Department', time: 'Done', done: true, note: 'Accepted by municipal command.' },
        { step: 'Officer Assigned', time: 'Done', done: true, note: `Assigned to ${complaint.officer}.` },
        {
          step: stepLabel,
          time: formatTimeNow(),
          done: complaint.status === 'Pending Verification',
          active: true,
          note: description?.trim() || `Marked as ${complaint.status}.`,
        },
        { step: 'Verified & Resolved', time: 'Pending', done: false, note: 'Awaiting final admin verification.' },
      ];

      pushNotification(db, {
        targetRole: 'citizen',
        complaintId: id,
        title: `Progress Update (${complaint.status}) — ${id}`,
        message: description?.trim() || `"${complaint.title}" is now ${complaint.status}.`,
        type: 'warning',
      });

      if (complaint.status === 'Pending Verification') {
        pushNotification(db, {
          targetRole: 'department',
          complaintId: id,
          title: `Ready for Verification — ${id}`,
          message: `Completed work submitted for "${complaint.title}". Review & mark resolved.`,
          type: 'info',
        });
      }

      saveDB(db);
      return sendJSON(res, 200, { complaint });
    }

    // Verify & Mark Resolved
    const resolveMatch = pathname.match(/^\/api\/complaints\/([^/]+)\/resolve$/);
    if (resolveMatch && req.method === 'POST') {
      const admin = requireDepartment(req, res, db);
      if (!admin) return;
      const id = decodeURIComponent(resolveMatch[1]);
      const { verificationNote, photo } = await readBody(req);
      const complaint = db.complaints.find((c) => c.id === id);
      if (!complaint) return sendJSON(res, 404, { error: 'Complaint not found' });

      complaint.status = 'Resolved';
      complaint.isEscalated = false;
      complaint.updatedAt = new Date().toISOString();
      complaint.verificationProof = {
        verifiedBy: admin.name,
        verifiedAt: new Date().toISOString(),
        note: verificationNote?.trim() || 'Work inspected and verified complete by HDMC Command.',
        photo: photo || null,
      };

      const hrs = Math.max(
        0.5,
        ((Date.now() - new Date(complaint.createdAt).getTime()) / 3600000)
      ).toFixed(1);
      complaint.resolutionTime = `${hrs} hrs`;

      if (complaint.assignedOfficerId) {
        const off = db.officers.find((o) => o.id === complaint.assignedOfficerId);
        if (off) off.resolvedCount = (off.resolvedCount || 0) + 1;
      }

      complaint.timeline = [
        complaint.timeline[0],
        { step: 'Accepted by Department', time: 'Done', done: true, note: 'Verified intake.' },
        { step: 'Officer Assigned', time: 'Done', done: true, note: `Handled by ${complaint.officer}.` },
        { step: 'Work Completed', time: 'Done', done: true, note: 'Field repair completed.' },
        {
          step: 'Verified & Resolved',
          time: formatTimeNow(),
          done: true,
          note: `${complaint.verificationProof.note} (Verified by ${admin.name})`,
        },
      ];

      pushNotification(db, {
        targetRole: 'citizen',
        complaintId: id,
        title: `Issue Resolved! — ${id}`,
        message: `"${complaint.title}" has been verified & marked Resolved by ${admin.name}.`,
        type: 'success',
      });

      saveDB(db);
      return sendJSON(res, 200, { complaint });
    }

    // Manual Escalate
    const escalateMatch = pathname.match(/^\/api\/complaints\/([^/]+)\/escalate$/);
    if (escalateMatch && req.method === 'POST') {
      const admin = requireDepartment(req, res, db);
      if (!admin) return;
      const id = decodeURIComponent(escalateMatch[1]);
      const { reason } = await readBody(req);
      const complaint = db.complaints.find((c) => c.id === id);
      if (!complaint) return sendJSON(res, 404, { error: 'Complaint not found' });

      complaint.status = 'Escalated';
      complaint.isEscalated = true;
      complaint.priority = 'Critical';
      complaint.escalationReason = reason?.trim() || `Manually escalated by ${admin.name} for urgent executive action.`;
      complaint.updatedAt = new Date().toISOString();
      complaint.timeline.push({
        step: 'Escalated to Command Admin',
        time: formatTimeNow(),
        done: false,
        active: true,
        note: complaint.escalationReason,
      });

      pushNotification(db, {
        targetRole: 'department',
        complaintId: id,
        title: `Escalation Alert — ${id}`,
        message: `"${complaint.title}" escalated: ${complaint.escalationReason}`,
        type: 'error',
      });
      pushNotification(db, {
        targetRole: 'citizen',
        complaintId: id,
        title: `Complaint Escalated — ${id}`,
        message: `"${complaint.title}" has been escalated to Critical priority by HDMC Command.`,
        type: 'warning',
      });

      saveDB(db);
      return sendJSON(res, 200, { complaint });
    }

    // Trigger SLA Escalation Audit
    if (pathname === '/api/escalations/audit' && req.method === 'POST') {
      const admin = requireDepartment(req, res, db);
      if (!admin) return;
      const count = runAutoEscalation(db);
      return sendJSON(res, 200, { escalatedCount: count, complaints: db.complaints });
    }

    // ---------- OFFICERS (DEPARTMENT ONLY) ----------
    if (pathname === '/api/officers' && req.method === 'GET') {
      const admin = requireDepartment(req, res, db);
      if (!admin) return;
      return sendJSON(res, 200, { officers: db.officers });
    }

    if (pathname === '/api/officers' && req.method === 'POST') {
      const admin = requireDepartment(req, res, db);
      if (!admin) return;
      const body = await readBody(req);
      if (!body.name?.trim() || !body.department?.trim()) {
        return sendJSON(res, 400, { error: 'Officer name and department are required.' });
      }
      const newOfficer = {
        id: `OFF-${100 + db.officers.length + 1}`,
        name: body.name.trim(),
        department: body.department.trim(),
        designation: body.designation?.trim() || 'Field Operations Officer',
        phone: body.phone?.trim() || '+91 836-221-9000',
        wardZone: body.wardZone?.trim() || 'Hubballi-Dharwad Central',
        status: 'On Duty',
        resolvedCount: 0,
        rating: 5.0,
      };
      db.officers.push(newOfficer);
      saveDB(db);
      return sendJSON(res, 201, { officer: newOfficer });
    }

    // ---------- NOTIFICATIONS ----------
    if (pathname === '/api/notifications' && req.method === 'GET') {
      const role = url.searchParams.get('role') || 'citizen';
      const filtered = db.notifications.filter((n) => n.targetRole === role);
      return sendJSON(res, 200, { notifications: filtered });
    }

    if (pathname === '/api/notifications/read-all' && req.method === 'POST') {
      const { role } = await readBody(req);
      db.notifications.forEach((n) => {
        if (!role || n.targetRole === role) n.read = true;
      });
      saveDB(db);
      return sendJSON(res, 200, { ok: true });
    }

    return sendJSON(res, 404, { error: 'API endpoint not found' });
  } catch (err) {
    console.error('[CivicFlow API Error]', err);
    return sendJSON(res, 500, { error: err.message || 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`CivicFlow Unified API Server running on http://localhost:${PORT}`);
});
