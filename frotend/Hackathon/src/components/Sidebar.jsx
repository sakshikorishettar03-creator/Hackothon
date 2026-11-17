import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  SearchCheck,
  Bell,
  UserCircle,
  LogOut,
  Building2,
  ShieldCheck,
  X,
  Inbox,
  Briefcase,
  Users,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Settings,
  Radio,
} from 'lucide-react';
import CitySkylineSvg from './CitySkylineSvg';
import { useCivic } from '../context/CivicContext';

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const navigate = useNavigate();
  const {
    activeView,
    isDepartmentAuthorized,
    stats,
    unreadCount,
    logoutToCitizen,
    setAuthModalOpen,
    setAuthModalReason,
  } = useCivic();

  const isDeptMode = activeView === 'department' && isDepartmentAuthorized;

  const CITIZEN_NAV = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { path: '/raise-issue', label: 'Raise an Issue', icon: PlusCircle, badge: 'New', badgeColor: '#00E5E5' },
    { path: '/my-complaints', label: 'My Complaints', icon: ClipboardList, badge: stats.citizenTotal > 0 ? String(stats.citizenTotal) : null, badgeColor: '#695CFF' },
    { path: '/track-status', label: 'Track Status', icon: SearchCheck },
    { path: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? String(unreadCount) : null, badgeColor: '#FF9F43' },
    { path: '/profile', label: 'My Profile', icon: UserCircle },
  ];

  const DEPARTMENT_NAV = [
    { path: '/dept/dashboard', label: 'Command Dashboard', icon: LayoutDashboard },
    { path: '/dept/incoming', label: 'Incoming Complaints', icon: Inbox, badge: stats.newComplaints > 0 ? String(stats.newComplaints) : null, badgeColor: '#00E5E5' },
    { path: '/dept/assigned', label: 'Assigned Complaints', icon: Briefcase, badge: stats.inProgressComplaints + stats.pendingComplaints > 0 ? String(stats.inProgressComplaints + stats.pendingComplaints) : null, badgeColor: '#695CFF' },
    { path: '/dept/officers', label: 'Officer Management', icon: Users },
    { path: '/dept/escalated', label: 'Escalated Complaints', icon: AlertTriangle, badge: stats.escalatedComplaints > 0 ? String(stats.escalatedComplaints) : null, badgeColor: '#FF4757' },
    { path: '/dept/resolved', label: 'Resolved Complaints', icon: CheckCircle2, badge: stats.resolvedComplaints > 0 ? String(stats.resolvedComplaints) : null, badgeColor: '#00D68F' },
    { path: '/dept/analytics', label: 'Department Analytics', icon: BarChart3 },
    { path: '/dept/notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? String(unreadCount) : null, badgeColor: '#FF9F43' },
    { path: '/dept/settings', label: 'Settings', icon: Settings },
  ];

  const navItems = isDeptMode ? DEPARTMENT_NAV : CITIZEN_NAV;
  const accentColor = isDeptMode ? '#695CFF' : '#00E5E5';

  const handleLogout = async () => {
    if (isDepartmentAuthorized) {
      await logoutToCitizen(() => navigate('/'));
    } else {
      setAuthModalReason('Switch accounts or authenticate as an HDMC Department Officer.');
      setAuthModalOpen(true);
    }
    if (mobileOpen && onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 13, 26, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 998,
          }}
        />
      )}

      <aside
        className={`civicflow-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: 'var(--sidebar-width, 270px)',
          background: isDeptMode
            ? 'linear-gradient(180deg, #071226 0%, #091026 100%)'
            : 'var(--bg-sidebar, #071426)',
          borderRight: isDeptMode
            ? '1px solid rgba(105, 92, 255, 0.28)'
            : '1px solid var(--border-glass, rgba(0, 229, 229, 0.15))',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto',
          overflowX: 'hidden',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.45)',
        }}
      >
        {/* Top Branding */}
        <div>
          <div
            style={{
              padding: '22px 18px 18px',
              borderBottom: `1px solid ${isDeptMode ? 'rgba(105, 92, 255, 0.18)' : 'rgba(0, 229, 229, 0.1)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: isDeptMode
                    ? 'linear-gradient(135deg, rgba(105, 92, 255, 0.3) 0%, rgba(0, 229, 229, 0.22) 100%)'
                    : 'linear-gradient(135deg, rgba(0, 229, 229, 0.22) 0%, rgba(105, 92, 255, 0.3) 100%)',
                  border: `1.5px solid ${accentColor}`,
                  boxShadow: `0 0 16px ${accentColor}55`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00E5E5',
                  flexShrink: 0,
                }}
              >
                <Building2 size={22} strokeWidth={2.2} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 800,
                      fontSize: '19px',
                      letterSpacing: '-0.02em',
                      color: '#FFFFFF',
                    }}
                  >
                    Civic<span style={{ color: '#00E5E5' }}>Flow</span>
                  </span>
                  <span
                    style={{
                      fontSize: '9.5px',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      background: isDeptMode ? 'rgba(105, 92, 255, 0.25)' : 'rgba(0, 229, 229, 0.15)',
                      color: isDeptMode ? '#B6ADFF' : '#00E5E5',
                      fontWeight: 700,
                      border: `1px solid ${isDeptMode ? 'rgba(105, 92, 255, 0.45)' : 'rgba(0, 229, 229, 0.3)'}`,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {isDeptMode ? 'CMD' : 'GOV'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#A8B8CC', fontWeight: 500, marginTop: '2px' }}>
                  {isDeptMode ? 'Smart City Command Centre' : 'Smart City. Stronger Together.'}
                </div>
              </div>
            </div>

            {mobileOpen && (
              <button
                onClick={onCloseMobile}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav style={{ padding: '14px 12px' }}>
            <div
              style={{
                fontSize: '10.5px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: isDeptMode ? '#8B82FF' : '#5E718D',
                padding: '4px 12px 10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isDeptMode && <Radio size={12} color="#00E5E5" />}
              {isDeptMode ? 'Department Operations' : 'Citizen Services'}
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.end}
                      onClick={() => {
                        if (mobileOpen && onCloseMobile) onCloseMobile();
                      }}
                      className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 13px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontSize: '13.5px',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#FFFFFF' : '#A8B8CC',
                        background: isActive
                          ? isDeptMode
                            ? 'linear-gradient(90deg, rgba(105, 92, 255, 0.28) 0%, rgba(0, 229, 229, 0.08) 100%)'
                            : 'linear-gradient(90deg, rgba(0, 229, 229, 0.22) 0%, rgba(0, 229, 229, 0.04) 100%)'
                          : 'transparent',
                        borderLeft: isActive ? `3.5px solid ${isDeptMode ? '#00E5E5' : '#00E5E5'}` : '3.5px solid transparent',
                        boxShadow: isActive ? 'inset 0 0 16px rgba(0, 229, 229, 0.12)' : 'none',
                        transition: 'all 0.2s ease',
                      })}
                    >
                      {({ isActive }) => (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                            <Icon
                              size={17}
                              strokeWidth={isActive ? 2.4 : 2}
                              style={{
                                color: isActive ? '#00E5E5' : 'currentColor',
                                filter: isActive ? 'drop-shadow(0 0 8px rgba(0, 229, 229, 0.6))' : 'none',
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.label}
                            </span>
                          </div>

                          {item.badge && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: '10px',
                                background: `${item.badgeColor || '#00E5E5'}24`,
                                color: item.badgeColor || '#00E5E5',
                                border: `1px solid ${item.badgeColor || '#00E5E5'}55`,
                                flexShrink: 0,
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}

              {/* Logout */}
              <li style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <button
                  onClick={handleLogout}
                  className="sidebar-logout-btn"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '11px',
                    padding: '10px 13px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '13.5px',
                    fontWeight: 500,
                    color: '#A8B8CC',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <LogOut size={17} />
                  <span>{isDeptMode ? 'Logout (End Command)' : 'Logout'}</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Skyline & Tagline */}
        <div
          style={{
            padding: '14px 14px 16px',
            borderTop: '1px solid rgba(0, 229, 229, 0.12)',
            background: 'linear-gradient(180deg, rgba(7, 20, 38, 0.2) 0%, rgba(11, 25, 48, 0.85) 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: isDeptMode ? 'rgba(105, 92, 255, 0.16)' : 'rgba(0, 229, 229, 0.08)',
              border: `1px solid ${isDeptMode ? 'rgba(105, 92, 255, 0.35)' : 'rgba(0, 229, 229, 0.2)'}`,
              marginBottom: '10px',
            }}
          >
            <ShieldCheck size={14} color="#00E5E5" />
            <span style={{ fontSize: '11px', color: '#FFFFFF', fontWeight: 600 }}>
              {isDeptMode ? 'Authorized HDMC Admin' : 'HDMC Command Center'}
            </span>
          </div>

          <div style={{ padding: '2px 0 6px', filter: 'drop-shadow(0 0 10px rgba(0, 229, 229, 0.25))' }}>
            <CitySkylineSvg />
          </div>

          <div
            style={{
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: 600,
              color: '#00E5E5',
              textShadow: '0 0 10px rgba(0, 229, 229, 0.35)',
            }}
          >
            "A Better City For a Better Tomorrow"
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar-nav-link:hover:not(.active) {
          background: rgba(255, 255, 255, 0.04) !important;
          color: #FFFFFF !important;
          transform: translateX(3px);
        }
        .sidebar-logout-btn:hover {
          background: rgba(255, 71, 87, 0.12) !important;
          color: #FF4757 !important;
          transform: translateX(3px);
        }
        @media (max-width: 960px) {
          .civicflow-sidebar {
            width: 270px !important;
            transform: translateX(-100%);
          }
          .civicflow-sidebar.mobile-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
