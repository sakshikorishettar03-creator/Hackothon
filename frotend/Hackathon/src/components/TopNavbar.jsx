import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  ChevronDown,
  Sun,
  Moon,
  Bell,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Info,
  User,
  Building2,
  Lock,
  ShieldCheck,
  LogOut,
  KeyRound,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { HUBBALLI_DHARWAD_WARDS } from '../data/mockData';
import { formatRelativeDate } from './StatusBadge';

export default function TopNavbar({ onOpenMobile }) {
  const {
    theme,
    toggleTheme,
    user,
    isDepartmentAuthorized,
    activeView,
    requestViewSwitch,
    logoutToCitizen,
    setAuthModalOpen,
    setAuthModalReason,
    selectedWard,
    setSelectedWard,
    notifications,
    unreadCount,
    markAllNotificationsRead,
  } = useCivic();

  const navigate = useNavigate();
  const [wardOpen, setWardOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setWardOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchCitizen = () => {
    requestViewSwitch('citizen', () => navigate('/'));
  };

  const handleSwitchDepartment = () => {
    requestViewSwitch('department', () => navigate('/dept/dashboard'));
  };

  return (
    <header
      ref={navRef}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        background: theme === 'dark' ? 'rgba(5, 13, 26, 0.88)' : 'rgba(240, 244, 248, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom:
          activeView === 'department'
            ? '1px solid rgba(105, 92, 255, 0.28)'
            : '1px solid var(--border-glass)',
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        flexWrap: 'wrap',
      }}
      className="civicflow-topbar"
    >
      {/* Left: Mobile Menu + Location + Welcome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onOpenMobile}
          className="mobile-menu-btn"
          aria-label="Open menu"
          style={{
            display: 'none',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            color: 'var(--primary-cyan)',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Menu size={20} />
        </button>

        {/* Location Selector */}
        <div style={{ position: 'relative' }} className="topbar-location">
          <button
            onClick={() => {
              setWardOpen((v) => !v);
              setNotifOpen(false);
              setProfileOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 12px',
              borderRadius: '11px',
              background: 'var(--bg-card)',
              border: '1px solid rgba(0, 229, 229, 0.25)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <MapPin size={15} color="#00E5E5" />
            <span>
              {selectedWard.startsWith('All Wards')
                ? 'Hubballi-Dharwad'
                : selectedWard.split('—')[1]?.trim() || 'Hubballi-Dharwad'}
            </span>
            <ChevronDown size={14} color="var(--text-secondary)" />
          </button>

          {wardOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '250px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                borderRadius: '14px',
                padding: '8px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
                zIndex: 200,
                maxHeight: '280px',
                overflowY: 'auto',
              }}
            >
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#00E5E5', padding: '6px 10px', textTransform: 'uppercase' }}>
                Hubballi-Dharwad Zone
              </div>
              {HUBBALLI_DHARWAD_WARDS.map((ward) => (
                <button
                  key={ward}
                  onClick={() => {
                    setSelectedWard(ward);
                    setWardOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: ward === selectedWard ? 'rgba(0, 229, 229, 0.14)' : 'transparent',
                    color: ward === selectedWard ? '#00E5E5' : 'var(--text-secondary)',
                    fontSize: '12.5px',
                    fontWeight: ward === selectedWard ? 600 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {ward}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="welcome-greeting">
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Welcome, <span style={{ color: '#00E5E5' }}>{user.firstName}!</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {activeView === 'department' ? 'HDMC Command & Control Centre' : 'Live Citizen Grievance Network'}
          </div>
        </div>
      </div>

      {/* CENTER: PROMINENT DIRECT VIEW SWITCHER [ 👤 Citizen View ] [ 🏢 Department View ] */}
      <div
        role="tablist"
        aria-label="Dashboard View Switcher"
        className="view-switcher-pill"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px',
          borderRadius: '14px',
          background: theme === 'dark' ? 'rgba(11, 25, 48, 0.95)' : '#E2E8F0',
          border: '1px solid rgba(0, 229, 229, 0.3)',
          boxShadow: '0 0 22px rgba(0, 229, 229, 0.12)',
        }}
      >
        <button
          role="tab"
          aria-selected={activeView === 'citizen'}
          onClick={handleSwitchCitizen}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '8px 15px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            fontSize: '13px',
            fontWeight: 700,
            background:
              activeView === 'citizen'
                ? 'linear-gradient(135deg, #00E5E5 0%, #00B8D9 100%)'
                : 'transparent',
            color: activeView === 'citizen' ? '#050D1A' : 'var(--text-secondary)',
            boxShadow: activeView === 'citizen' ? '0 0 16px rgba(0, 229, 229, 0.45)' : 'none',
            transition: 'all 0.22s ease',
          }}
        >
          <User size={15} strokeWidth={2.4} />
          <span>Citizen View</span>
        </button>

        <button
          role="tab"
          aria-selected={activeView === 'department'}
          onClick={handleSwitchDepartment}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '8px 15px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
            fontSize: '13px',
            fontWeight: 700,
            background:
              activeView === 'department'
                ? 'linear-gradient(135deg, #695CFF 0%, #00B8D9 100%)'
                : 'transparent',
            color: activeView === 'department' ? '#FFFFFF' : 'var(--text-secondary)',
            boxShadow: activeView === 'department' ? '0 0 18px rgba(105, 92, 255, 0.5)' : 'none',
            transition: 'all 0.22s ease',
          }}
        >
          <Building2 size={15} strokeWidth={2.4} />
          <span>Department View</span>
          {!isDepartmentAuthorized && (
            <Lock size={12} color="#FF9F43" title="Department Authorization Required" />
          )}
        </button>
      </div>

      {/* Right: Theme Toggle + Notifications + Account Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle color theme"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            color: theme === 'dark' ? '#FF9F43' : '#695CFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setNotifOpen((v) => !v);
              setWardOpen(false);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '6px',
                  minWidth: '15px',
                  height: '15px',
                  borderRadius: '10px',
                  background: '#FF4757',
                  color: '#FFFFFF',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  boxShadow: '0 0 8px #FF4757',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '340px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)',
                zIndex: 200,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '13px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '13.5px' }}>
                  {activeView === 'department' ? 'Command Alerts' : 'Citizen Updates'} ({unreadCount})
                </span>
                <button
                  onClick={markAllNotificationsRead}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#00E5E5',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Mark all read
                </button>
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '22px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setNotifOpen(false);
                        navigate(
                          activeView === 'department'
                            ? '/dept/notifications'
                            : n.complaintId
                            ? `/track-status?id=${n.complaintId}`
                            : '/notifications'
                        );
                      }}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        background: n.read ? 'transparent' : 'rgba(0, 229, 229, 0.06)',
                        display: 'flex',
                        gap: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ marginTop: '2px', flexShrink: 0 }}>
                        {n.type === 'success' && <CheckCircle2 size={15} color="#00D68F" />}
                        {(n.type === 'warning' || n.type === 'error') && (
                          <AlertTriangle size={15} color={n.type === 'error' ? '#FF4757' : '#FF9F43'} />
                        )}
                        {n.type === 'info' && <Info size={15} color="#00E5E5" />}
                      </div>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '3px' }}>
                          {formatRelativeDate(n.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile / Account Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setProfileOpen((v) => !v);
              setWardOpen(false);
              setNotifOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              padding: '4px 10px 4px 5px',
              borderRadius: '13px',
              background: 'var(--bg-card)',
              border: `1px solid ${isDepartmentAuthorized ? 'rgba(105, 92, 255, 0.45)' : 'var(--border-glass)'}`,
              cursor: 'pointer',
              color: 'var(--text-primary)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                background: isDepartmentAuthorized
                  ? 'linear-gradient(135deg, #695CFF 0%, #00E5E5 100%)'
                  : 'linear-gradient(135deg, #00E5E5 0%, #00B8D9 100%)',
                color: '#050D1A',
                fontWeight: 800,
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {user.avatarInitials}
            </div>
            <div className="avatar-meta" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, lineHeight: 1.2 }}>{user.firstName}</div>
              <div style={{ fontSize: '10px', color: isDepartmentAuthorized ? '#A89FFF' : '#00E5E5', fontWeight: 600 }}>
                {isDepartmentAuthorized ? 'Dept Admin' : 'Citizen'}
              </div>
            </div>
          </button>

          {profileOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: 0,
                width: '255px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-glass)',
                borderRadius: '14px',
                padding: '10px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.55)',
                zIndex: 200,
              }}
            >
              <div style={{ padding: '6px 8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: '13.5px' }}>{user.name}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{user.email}</div>
                <div style={{ marginTop: '5px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', fontWeight: 700, color: isDepartmentAuthorized ? '#00D68F' : '#00E5E5' }}>
                  <ShieldCheck size={12} /> Role: {user.role.toUpperCase()}
                </div>
              </div>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  setAuthModalReason('Switch between Citizen and Authorized Department demo accounts.');
                  setAuthModalOpen(true);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 10px',
                  marginTop: '6px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'rgba(0, 229, 229, 0.08)',
                  color: '#00E5E5',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <KeyRound size={14} /> Switch Account / Auth
              </button>

              {isDepartmentAuthorized && (
                <button
                  onClick={async () => {
                    setProfileOpen(false);
                    await logoutToCitizen(() => navigate('/'));
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 10px',
                    marginTop: '4px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(255, 71, 87, 0.1)',
                    color: '#FF4757',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={14} /> Revoke Dept & Citizen Mode
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1220px) {
          .welcome-greeting { display: none; }
        }
        @media (max-width: 960px) {
          .mobile-menu-btn { display: inline-flex !important; }
          .topbar-location { display: none; }
        }
        @media (max-width: 768px) {
          .civicflow-topbar { padding: 10px 14px !important; }
          .avatar-meta { display: none; }
          .view-switcher-pill button { padding: 7px 10px !important; font-size: 12px !important; }
        }
      `}</style>
    </header>
  );
}
