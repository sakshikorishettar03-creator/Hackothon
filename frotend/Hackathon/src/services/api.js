const API_BASE = '/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  getMe: (token) => request('/auth/me', { token }),
  updateProfile: (token, body) => request('/auth/profile', { method: 'PATCH', token, body }),

  // Shared Complaints
  getComplaints: (token) => request('/complaints', { token }),
  createComplaint: (token, payload) => request('/complaints', { method: 'POST', token, body: payload }),
  rateComplaint: (token, id, rating) =>
    request(`/complaints/${encodeURIComponent(id)}/rate`, { method: 'POST', token, body: { rating } }),

  // Protected Department Actions (RBAC enforced server-side)
  acceptComplaint: (token, id) =>
    request(`/complaints/${encodeURIComponent(id)}/accept`, { method: 'POST', token }),
  rejectComplaint: (token, id, reason) =>
    request(`/complaints/${encodeURIComponent(id)}/reject`, { method: 'POST', token, body: { reason } }),
  assignOfficer: (token, id, officerId, expectedResolutionDate) =>
    request(`/complaints/${encodeURIComponent(id)}/assign`, {
      method: 'POST',
      token,
      body: { officerId, expectedResolutionDate },
    }),
  changePriority: (token, id, priority) =>
    request(`/complaints/${encodeURIComponent(id)}/priority`, {
      method: 'PATCH',
      token,
      body: { priority },
    }),
  updateProgress: (token, id, payload) =>
    request(`/complaints/${encodeURIComponent(id)}/progress`, {
      method: 'POST',
      token,
      body: payload,
    }),
  resolveComplaint: (token, id, payload) =>
    request(`/complaints/${encodeURIComponent(id)}/resolve`, {
      method: 'POST',
      token,
      body: payload,
    }),
  escalateComplaint: (token, id, reason) =>
    request(`/complaints/${encodeURIComponent(id)}/escalate`, {
      method: 'POST',
      token,
      body: { reason },
    }),
  runEscalationAudit: (token) =>
    request('/escalations/audit', { method: 'POST', token }),

  // Officers (Department Only)
  getOfficers: (token) => request('/officers', { token }),
  createOfficer: (token, payload) => request('/officers', { method: 'POST', token, body: payload }),

  // Notifications
  getNotifications: (role) => request(`/notifications?role=${encodeURIComponent(role)}`),
  markNotificationsRead: (role) =>
    request('/notifications/read-all', { method: 'POST', body: { role } }),
};
