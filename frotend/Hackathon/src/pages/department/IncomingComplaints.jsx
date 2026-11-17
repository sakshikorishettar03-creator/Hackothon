import React, { useState } from 'react';
import {
  Inbox,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  UserPlus,
  X,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { StatusBadge, PriorityBadge, formatShortDate } from '../../components/StatusBadge';

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function IncomingComplaints() {
  const {
    complaints,
    officers,
    acceptComplaint,
    rejectComplaint,
    assignOfficer,
    changePriority,
    escalateComplaint,
  } = useCivic();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [detailTicket, setDetailTicket] = useState(null);
  const [rejectTicket, setRejectTicket] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [assignTicket, setAssignTicket] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [expectedDate, setExpectedDate] = useState('2026-11-19');
  const [busyId, setBusyId] = useState(null);

  const filtered = complaints.filter((c) => {
    const matchFilter =
      filter === 'ALL'
        ? true
        : filter === 'NEW'
        ? c.status === 'New'
        : filter === 'ACCEPTED'
        ? c.status === 'Accepted'
        : c.status === filter;
    const q = search.trim().toLowerCase();
    const matchQ =
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      (c.citizenName || '').toLowerCase().includes(q) ||
      (c.location || '').toLowerCase().includes(q);
    return matchFilter && matchQ;
  });

  const handleAccept = async (id) => {
    setBusyId(id);
    try {
      await acceptComplaint(id);
    } finally {
      setBusyId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim() || !rejectTicket) return;
    setBusyId(rejectTicket.id);
    try {
      await rejectComplaint(rejectTicket.id, rejectReason.trim());
      setRejectTicket(null);
      setRejectReason('');
    } finally {
      setBusyId(null);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOfficerId || !assignTicket) return;
    setBusyId(assignTicket.id);
    try {
      await assignOfficer(assignTicket.id, selectedOfficerId, expectedDate);
      setAssignTicket(null);
      setSelectedOfficerId('');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ animation: 'fadeInPage 0.35s ease' }}>
      <div style={{ marginBottom: '22px' }}>
        <div className="badge-neon" style={{ marginBottom: '10px' }}>
          <Inbox size={13} /> Citizen Intake Queue
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Incoming Complaints</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Review citizen submissions, accept or reject with reason, override priority, and dispatch field officers.
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '18px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '420px' }}>
          <Search size={15} color="#00E5E5" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by ID, citizen name, title, or location..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '10px',
              background: 'rgba(5,13,26,0.6)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: `All (${complaints.length})` },
            { key: 'NEW', label: `New (${complaints.filter((c) => c.status === 'New').length})` },
            { key: 'ACCEPTED', label: `Accepted (${complaints.filter((c) => c.status === 'Accepted').length})` },
            { key: 'Assigned', label: `Assigned (${complaints.filter((c) => c.status === 'Assigned').length})` },
            { key: 'Rejected', label: `Rejected (${complaints.filter((c) => c.status === 'Rejected').length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '6px 12px',
                borderRadius: '9px',
                border: filter === tab.key ? '1px solid #00E5E5' : '1px solid var(--border-subtle)',
                background: filter === tab.key ? 'rgba(0,229,229,0.16)' : 'transparent',
                color: filter === tab.key ? '#00E5E5' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Operational Table */}
      <div className="glass-card" style={{ padding: '18px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1040px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 8px' }}>ID</th>
              <th style={{ padding: '10px 8px' }}>CITIZEN</th>
              <th style={{ padding: '10px 8px' }}>COMPLAINT & CATEGORY</th>
              <th style={{ padding: '10px 8px' }}>LOCATION</th>
              <th style={{ padding: '10px 8px' }}>SUBMITTED</th>
              <th style={{ padding: '10px 8px' }}>PRIORITY</th>
              <th style={{ padding: '10px 8px' }}>STATUS</th>
              <th style={{ padding: '10px 8px', textAlign: 'right' }}>COMMAND ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '13px' }}>
                <td style={{ padding: '13px 8px', fontWeight: 800, color: '#00E5E5', whiteSpace: 'nowrap' }}>{c.id}</td>
                <td style={{ padding: '13px 8px', fontWeight: 600, whiteSpace: 'nowrap' }}>{c.citizenName}</td>
                <td style={{ padding: '13px 8px', maxWidth: '250px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{c.title}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.category}</div>
                </td>
                <td style={{ padding: '13px 8px', color: 'var(--text-secondary)', fontSize: '12px', maxWidth: '180px' }}>
                  {c.location}
                </td>
                <td style={{ padding: '13px 8px', color: 'var(--text-muted)', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
                  {formatShortDate(c.createdAt)}
                </td>
                <td style={{ padding: '13px 8px' }}>
                  <select
                    aria-label={`Change priority for ${c.id}`}
                    value={c.priority}
                    onChange={(e) => changePriority(c.id, e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '8px',
                      background: 'rgba(5,13,26,0.75)',
                      border: '1px solid var(--border-glass)',
                      color: '#FFFFFF',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p} style={{ background: '#0B1930' }}>{p}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '13px 8px' }}>
                  <StatusBadge status={c.status} />
                </td>
                <td style={{ padding: '13px 8px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setDetailTicket(c)}
                      title="View Details"
                      style={{
                        padding: '6px 9px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-glass)',
                        background: 'rgba(255,255,255,0.04)',
                        color: 'var(--text-primary)',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Eye size={13} /> View
                    </button>

                    {c.status === 'New' && (
                      <button
                        disabled={busyId === c.id}
                        onClick={() => handleAccept(c.id)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid rgba(0, 214, 143, 0.5)',
                          background: 'rgba(0, 214, 143, 0.16)',
                          color: '#00D68F',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <CheckCircle2 size={13} /> Accept
                      </button>
                    )}

                    {!['Resolved', 'Rejected'].includes(c.status) && (
                      <>
                        <button
                          onClick={() => {
                            setAssignTicket(c);
                            setSelectedOfficerId(c.assignedOfficerId || officers[0]?.id || '');
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(0, 229, 229, 0.45)',
                            background: 'rgba(0, 229, 229, 0.14)',
                            color: '#00E5E5',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <UserPlus size={13} /> Assign
                        </button>

                        <button
                          onClick={() => {
                            setRejectTicket(c);
                            setRejectReason('');
                          }}
                          style={{
                            padding: '6px 9px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 71, 87, 0.45)',
                            background: 'rgba(255, 71, 87, 0.12)',
                            color: '#FF4757',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Details Modal */}
      {detailTicket && (
        <div
          onClick={() => setDetailTicket(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1300, background: 'rgba(5,13,26,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '580px', background: '#0B1930', border: '1px solid rgba(0,229,229,0.35)', borderRadius: '20px', padding: '24px', color: '#FFFFFF', maxHeight: '85vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#00E5E5', fontWeight: 800 }}>{detailTicket.id}</span>
                <StatusBadge status={detailTicket.status} />
                <PriorityBadge priority={detailTicket.priority} />
              </div>
              <button onClick={() => setDetailTicket(null)} style={{ background: 'transparent', border: 'none', color: '#A8B8CC', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{detailTicket.title}</h3>
            <p style={{ fontSize: '13.5px', color: '#A8B8CC', lineHeight: 1.6, marginBottom: '14px' }}>{detailTicket.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px', marginBottom: '16px', background: 'rgba(5,13,26,0.55)', padding: '14px', borderRadius: '12px' }}>
              <div><span style={{ color: '#5E718D' }}>Citizen:</span> <strong>{detailTicket.citizenName}</strong></div>
              <div><span style={{ color: '#5E718D' }}>Category:</span> <strong>{detailTicket.category}</strong></div>
              <div><span style={{ color: '#5E718D' }}>Ward:</span> <strong>{detailTicket.ward}</strong></div>
              <div><span style={{ color: '#5E718D' }}>Officer:</span> <strong>{detailTicket.officer}</strong></div>
              <div style={{ gridColumn: '1 / -1' }}><MapPin size={12} color="#00E5E5" /> {detailTicket.location} ({detailTicket.lat?.toFixed(4)}°N, {detailTicket.lng?.toFixed(4)}°E)</div>
            </div>
            {detailTicket.imagePreview && (
              <img src={detailTicket.imagePreview} alt="Site" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '14px' }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {!detailTicket.isEscalated && !['Resolved', 'Rejected'].includes(detailTicket.status) && (
                <button
                  onClick={async () => {
                    await escalateComplaint(detailTicket.id, 'Escalated from Incoming Queue review.');
                    setDetailTicket(null);
                  }}
                  style={{ padding: '9px 14px', borderRadius: '10px', border: '1px solid rgba(255,71,87,0.5)', background: 'rgba(255,71,87,0.14)', color: '#FF4757', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <AlertTriangle size={14} /> Escalate Now
                </button>
              )}
              <button onClick={() => setDetailTicket(null)} className="btn-neon-cyan" style={{ padding: '9px 18px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Officer Modal */}
      {assignTicket && (
        <div
          onClick={() => setAssignTicket(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1300, background: 'rgba(5,13,26,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <form
            onSubmit={handleAssignSubmit}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '460px', background: '#0B1930', border: '1px solid rgba(0,229,229,0.35)', borderRadius: '20px', padding: '24px', color: '#FFFFFF' }}
          >
            <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>Assign Field Officer</h3>
            <p style={{ fontSize: '13px', color: '#A8B8CC', marginBottom: '16px' }}>
              Dispatch an authorized municipal engineer for <strong>{assignTicket.id}</strong> — {assignTicket.title}.
            </p>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>Select Officer</label>
              <select
                required
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                style={{ width: '100%', padding: '11px', borderRadius: '10px', background: '#050D1A', border: '1px solid rgba(0,229,229,0.3)', color: '#FFFFFF', fontSize: '13.5px' }}
              >
                {officers.map((off) => (
                  <option key={off.id} value={off.id}>
                    {off.name} — {off.department} ({off.status})
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>Expected Resolution Date</label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#050D1A', border: '1px solid rgba(0,229,229,0.3)', color: '#FFFFFF', fontSize: '13.5px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setAssignTicket(null)} className="btn-glass-secondary" style={{ padding: '9px 16px' }}>Cancel</button>
              <button type="submit" className="btn-neon-cyan" style={{ padding: '9px 18px' }}>Confirm Assignment</button>
            </div>
          </form>
        </div>
      )}

      {/* Reject with Reason Modal */}
      {rejectTicket && (
        <div
          onClick={() => setRejectTicket(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1300, background: 'rgba(5,13,26,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <form
            onSubmit={handleRejectSubmit}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '460px', background: '#0B1930', border: '1px solid rgba(255,71,87,0.45)', borderRadius: '20px', padding: '24px', color: '#FFFFFF' }}
          >
            <h3 style={{ fontSize: '18px', color: '#FF4757', marginBottom: '6px' }}>Reject Complaint ({rejectTicket.id})</h3>
            <p style={{ fontSize: '13px', color: '#A8B8CC', marginBottom: '14px' }}>
              A clear municipal justification is required and will be sent directly to the citizen.
            </p>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Duplicate ticket already under resolution (CF-2026-4821) / Private property outside HDMC jurisdiction..."
              style={{ width: '100%', padding: '11px', borderRadius: '10px', background: '#050D1A', border: '1px solid rgba(255,71,87,0.35)', color: '#FFFFFF', fontSize: '13.5px', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setRejectTicket(null)} className="btn-glass-secondary" style={{ padding: '9px 16px' }}>Cancel</button>
              <button
                type="submit"
                style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: '#FF4757', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
