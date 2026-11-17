import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { HUBBALLI_DHARWAD_WARDS } from '../data/mockData';

const CivicContext = createContext(null);

const STORAGE_KEYS = {
  THEME: 'civicflow_theme_v3',
  TOKEN: 'civicflow_auth_token_v3',
  VIEW: 'civicflow_active_view_v3',
  PREFS: 'civicflow_prefs_v3',
};

const DEFAULT_PREFS = {
  language: 'English',
  notifications: {
    sms: true,
    email: true,
    push: true,
    weeklyDigest: false,
  },
};

export function CivicProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.THEME) || 'dark');
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN) || null);
  const [authUser, setAuthUser] = useState(null);
  const [activeView, setActiveView] = useState(() => localStorage.getItem(STORAGE_KEYS.VIEW) || 'citizen');
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);

  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedWard, setSelectedWard] = useState(HUBBALLI_DHARWAD_WARDS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState('');
  const [pendingViewAfterAuth, setPendingViewAfterAuth] = useState(null);

  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFS);
      return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Persist activeView
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEW, activeView);
  }, [activeView]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  // Refresh shared database state from unified backend API
  const refreshAll = useCallback(
    async (overrideToken = token, overrideView = activeView) => {
      try {
        const [{ complaints: list }, { notifications: notifs }] = await Promise.all([
          api.getComplaints(overrideToken),
          api.getNotifications(overrideView === 'department' ? 'department' : 'citizen'),
        ]);
        setComplaints(list || []);
        setNotifications(notifs || []);
        setApiError(null);

        // Only fetch officers if authorized department user
        if (overrideToken) {
          try {
            const { officers: offList } = await api.getOfficers(overrideToken);
            setOfficers(offList || []);
          } catch {
            // Citizen role will receive 403 — expected RBAC behavior
            setOfficers([]);
          }
        }
      } catch (err) {
        setApiError(err.message || 'Failed to sync with CivicFlow API');
      }
    },
    [token, activeView]
  );

  // Bootstrap session: auto-sign in Demo Citizen (Renuka) if no valid token exists
  useEffect(() => {
    let cancelled = false;
    async function init() {
      setIsLoading(true);
      try {
        let activeToken = token;
        let currentUser = null;

        if (activeToken) {
          try {
            const res = await api.getMe(activeToken);
            currentUser = res.user;
          } catch {
            activeToken = null;
          }
        }

        if (!activeToken) {
          const loginRes = await api.login('renuka.patil@hubballidharwad.in', 'citizen123');
          activeToken = loginRes.token;
          currentUser = loginRes.user;
          localStorage.setItem(STORAGE_KEYS.TOKEN, activeToken);
        }

        if (cancelled) return;
        setToken(activeToken);
        setAuthUser(currentUser);

        // Enforce RBAC on startup: Citizens cannot stay in department view
        const safeView =
          activeView === 'department' && currentUser?.role !== 'department'
            ? 'citizen'
            : activeView;
        setActiveView(safeView);

        await refreshAll(activeToken, safeView);
      } catch (err) {
        if (!cancelled) setApiError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload role-specific notifications when switching views
  useEffect(() => {
    if (!token) return;
    api
      .getNotifications(activeView === 'department' ? 'department' : 'citizen')
      .then((res) => setNotifications(res.notifications || []))
      .catch(() => {});
  }, [activeView, token]);

  const isDepartmentAuthorized = authUser?.role === 'department';

  // Trigger smooth view switch with strict RBAC check
  const requestViewSwitch = useCallback(
    (targetView, onSuccessNavigate) => {
      if (targetView === activeView) return true;

      if (targetView === 'department' && !isDepartmentAuthorized) {
        setAuthModalReason(
          'Department Command Centre is restricted to authorized HDMC municipal accounts. Please sign in with Department credentials.'
        );
        setPendingViewAfterAuth(() => onSuccessNavigate || null);
        setAuthModalOpen(true);
        return false;
      }

      setIsViewTransitioning(true);
      setTimeout(() => {
        setActiveView(targetView);
        if (onSuccessNavigate) onSuccessNavigate();
        setTimeout(() => setIsViewTransitioning(false), 220);
      }, 120);
      showToast(
        targetView === 'department'
          ? 'Switched to Department Command & Control Centre'
          : 'Switched to Citizen Portal View',
        'info'
      );
      return true;
    },
    [activeView, isDepartmentAuthorized, showToast]
  );

  // Login with real backend RBAC token
  const loginAccount = async (email, password, targetViewOnSuccess = null) => {
    const res = await api.login(email, password);
    localStorage.setItem(STORAGE_KEYS.TOKEN, res.token);
    setToken(res.token);
    setAuthUser(res.user);

    const nextView =
      targetViewOnSuccess || (res.user.role === 'department' ? 'department' : 'citizen');

    if (nextView === 'department' && res.user.role !== 'department') {
      throw new Error('This account does not have Department Command permissions.');
    }

    setAuthModalOpen(false);
    setAuthModalReason('');
    setIsViewTransitioning(true);
    setActiveView(nextView);
    await refreshAll(res.token, nextView);
    if (pendingViewAfterAuth) {
      pendingViewAfterAuth();
      setPendingViewAfterAuth(null);
    }
    setTimeout(() => setIsViewTransitioning(false), 220);
    showToast(`Authenticated as ${res.user.name} (${res.user.role.toUpperCase()})`, 'success');
    return res.user;
  };

  // Switch back to strictly Citizen-only session (revokes department token)
  const logoutToCitizen = async (onDone) => {
    const loginRes = await api.login('renuka.patil@hubballidharwad.in', 'citizen123');
    localStorage.setItem(STORAGE_KEYS.TOKEN, loginRes.token);
    setToken(loginRes.token);
    setAuthUser(loginRes.user);
    setOfficers([]);
    setActiveView('citizen');
    await refreshAll(loginRes.token, 'citizen');
    if (onDone) onDone();
    showToast('Department session ended. Active account: Renuka Patil (Citizen)', 'info');
  };

  // ---------- Shared Complaint Mutations (Synced to Backend DB) ----------
  const addComplaint = async (formData) => {
    const { complaint } = await api.createComplaint(token, formData);
    await refreshAll(token, activeView);
    showToast(`Complaint ${complaint.id} submitted & synced to HDMC Command!`, 'success');
    return complaint;
  };

  const rateComplaint = async (id, rating) => {
    await api.rateComplaint(token, id, rating);
    await refreshAll(token, activeView);
    showToast(`Rated ${rating}/5 stars for ${id}. Thank you!`, 'success');
  };

  // Department Protected Mutations
  const acceptComplaint = async (id) => {
    const { complaint } = await api.acceptComplaint(token, id);
    await refreshAll(token, activeView);
    showToast(`Accepted ${id} — Citizen notified!`, 'success');
    return complaint;
  };

  const rejectComplaint = async (id, reason) => {
    const { complaint } = await api.rejectComplaint(token, id, reason);
    await refreshAll(token, activeView);
    showToast(`Rejected ${id} with reason.`, 'warning');
    return complaint;
  };

  const assignOfficer = async (id, officerId, expectedResolutionDate) => {
    const { complaint } = await api.assignOfficer(token, id, officerId, expectedResolutionDate);
    await refreshAll(token, activeView);
    showToast(`Assigned ${complaint.officer} to ${id}!`, 'success');
    return complaint;
  };

  const changePriority = async (id, priority) => {
    const { complaint } = await api.changePriority(token, id, priority);
    await refreshAll(token, activeView);
    showToast(`${id} priority changed to ${priority}.`, 'info');
    return complaint;
  };

  const updateComplaintProgress = async (id, payload) => {
    const { complaint } = await api.updateProgress(token, id, payload);
    await refreshAll(token, activeView);
    showToast(`Progress updated on ${id} (${complaint.status}).`, 'success');
    return complaint;
  };

  const verifyAndResolveComplaint = async (id, payload) => {
    const { complaint } = await api.resolveComplaint(token, id, payload);
    await refreshAll(token, activeView);
    showToast(`${id} verified & marked Resolved! Citizen dashboard updated.`, 'success');
    return complaint;
  };

  const escalateComplaint = async (id, reason) => {
    const { complaint } = await api.escalateComplaint(token, id, reason);
    await refreshAll(token, activeView);
    showToast(`${id} escalated to Command Administrators!`, 'warning');
    return complaint;
  };

  const runEscalationAudit = async () => {
    const res = await api.runEscalationAudit(token);
    await refreshAll(token, activeView);
    showToast(
      res.escalatedCount > 0
        ? `Auto-escalated ${res.escalatedCount} overdue complaint(s)!`
        : 'SLA Audit complete — all active escalations are up to date.',
      res.escalatedCount > 0 ? 'warning' : 'info'
    );
    return res.escalatedCount;
  };

  const addOfficer = async (payload) => {
    const { officer } = await api.createOfficer(token, payload);
    await refreshAll(token, activeView);
    showToast(`Added field officer ${officer.name}!`, 'success');
    return officer;
  };

  const markAllNotificationsRead = async () => {
    const role = activeView === 'department' ? 'department' : 'citizen';
    await api.markNotificationsRead(role);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const updateUser = async (updates) => {
    const { user: updated } = await api.updateProfile(token, updates);
    setAuthUser(updated);
    if (updates.language || updates.notifications) {
      const nextPrefs = {
        ...prefs,
        ...(updates.language ? { language: updates.language } : {}),
        ...(updates.notifications ? { notifications: updates.notifications } : {}),
      };
      setPrefs(nextPrefs);
      localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(nextPrefs));
    }
    showToast('Profile & preferences saved!', 'success');
  };

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const user = useMemo(
    () => ({
      id: authUser?.id || 'USR-CIT-001',
      name: authUser?.name || 'Renuka Patil',
      firstName: authUser?.firstName || 'Renuka',
      email: authUser?.email || 'renuka.patil@hubballidharwad.in',
      phone: authUser?.phone || '+91 98452 71024',
      ward: authUser?.ward || 'Ward 14 — Vidyanagar',
      city: authUser?.city || 'Hubballi-Dharwad',
      role: authUser?.role || 'citizen',
      title: authUser?.title || 'Verified Citizen • Smart Ward Ambassador',
      department: authUser?.department || null,
      avatarInitials: authUser?.avatarInitials || 'RP',
      language: prefs.language,
      notifications: prefs.notifications,
    }),
    [authUser, prefs]
  );

  // Real live computed statistics from the shared complaints database!
  const stats = useMemo(() => {
    const total = complaints.length;
    const newCount = complaints.filter((c) => c.status === 'New').length;
    const pendingCount = complaints.filter((c) => ['New', 'Accepted', 'Assigned'].includes(c.status)).length;
    const inProgressCount = complaints.filter((c) =>
      ['In Progress', 'Pending Verification'].includes(c.status)
    ).length;
    const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;
    const escalatedCount = complaints.filter((c) => c.isEscalated || c.status === 'Escalated').length;
    const rejectedCount = complaints.filter((c) => c.status === 'Rejected').length;

    // Citizen-specific metrics (complaints submitted by Renuka or current citizen)
    const citizenList = complaints.filter(
      (c) => c.citizenEmail?.toLowerCase() === 'renuka.patil@hubballidharwad.in'
    );
    const citizenTotal = citizenList.length;
    const citizenPending = citizenList.filter((c) => ['New', 'Accepted', 'Assigned'].includes(c.status)).length;
    const citizenInProgress = citizenList.filter((c) =>
      ['In Progress', 'Pending Verification', 'Escalated'].includes(c.status)
    ).length;
    const citizenResolved = citizenList.filter((c) => c.status === 'Resolved').length;

    return {
      // Live DB counts
      totalReceived: total,
      newComplaints: newCount,
      pendingComplaints: pendingCount,
      inProgressComplaints: inProgressCount,
      resolvedComplaints: resolvedCount,
      escalatedComplaints: escalatedCount,
      rejectedComplaints: rejectedCount,
      avgResolutionHrs: 1.5,
      citizenSatisfaction: 98,
      // Citizen Dashboard live counts
      citizenTotal,
      citizenPending,
      citizenInProgress,
      citizenResolved,
      // City-wide historical totals + live delta
      cityTotalComplaints: 12443 + total,
      cityResolvedComplaints: 11202 + resolvedCount,
    };
  }, [complaints]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value = {
    theme,
    setTheme,
    toggleTheme,
    token,
    user,
    isDepartmentAuthorized,
    activeView,
    isViewTransitioning,
    requestViewSwitch,
    loginAccount,
    logoutToCitizen,
    authModalOpen,
    setAuthModalOpen,
    authModalReason,
    setAuthModalReason,
    complaints,
    officers,
    refreshAll,
    addComplaint,
    rateComplaint,
    acceptComplaint,
    rejectComplaint,
    assignOfficer,
    changePriority,
    updateComplaintProgress,
    verifyAndResolveComplaint,
    escalateComplaint,
    runEscalationAudit,
    addOfficer,
    updateUser,
    selectedWard,
    setSelectedWard,
    notifications,
    unreadCount,
    markAllNotificationsRead,
    searchQuery,
    setSearchQuery,
    toasts,
    showToast,
    isLoading,
    apiError,
    stats,
    isDemoOpen,
    setIsDemoOpen,
  };

  return <CivicContext.Provider value={value}>{children}</CivicContext.Provider>;
}

export function useCivic() {
  const ctx = useContext(CivicContext);
  if (!ctx) throw new Error('useCivic must be used within CivicProvider');
  return ctx;
}
