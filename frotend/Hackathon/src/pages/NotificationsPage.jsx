import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  CheckCheck,
  ArrowRight,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { formatShortDate } from '../components/StatusBadge';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllNotificationsRead, activeView } = useCivic();
  const navigate = useNavigate();

  const isDept = activeView === 'department';

  return (
    <div style={{ animation: 'fadeInPage 0.35s ease' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '22px',
        }}
      >
        <div>
          <div className="badge-neon" style={{ marginBottom: '10px' }}>
            <Bell size={13} /> {isDept ? 'Command Centre Alert Feed' : 'Real-Time Citizen Alerts'}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Notifications</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {isDept
              ? 'Live incoming citizen complaints, overdue SLA auto-escalations, and verification requests.'
              : 'Instant updates whenever HDMC accepts, assigns, updates, escalates, or resolves your complaint.'}
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          disabled={unreadCount === 0}
          className="btn-glass-secondary"
          style={{ padding: '10px 16px', opacity: unreadCount === 0 ? 0.5 : 1 }}
        >
          <CheckCheck size={16} /> Mark All Read ({unreadCount})
        </button>
      </div>

      <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No notifications yet.
          </div>
        ) : (
          notifications.map((n) => {
            const accent =
              n.type === 'success'
                ? '#00D68F'
                : n.type === 'error'
                ? '#FF4757'
                : n.type === 'warning'
                ? '#FF9F43'
                : '#00E5E5';

            return (
              <div
                key={n.id}
                onClick={() => {
                  if (n.complaintId) {
                    navigate(isDept ? '/dept/incoming' : `/track-status?id=${n.complaintId}`);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  padding: '16px 18px',
                  borderRadius: '14px',
                  background: n.read ? 'rgba(255,255,255,0.02)' : `${accent}10`,
                  border: `1px solid ${n.read ? 'var(--border-subtle)' : `${accent}44`}`,
                  borderLeft: `4px solid ${accent}`,
                  cursor: n.complaintId ? 'pointer' : 'default',
                }}
              >
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1 }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '11px',
                      background: `${accent}1A`,
                      color: accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {n.type === 'success' && <CheckCircle2 size={18} />}
                    {(n.type === 'warning' || n.type === 'error') && <AlertTriangle size={18} />}
                    {n.type === 'info' && <Info size={18} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)' }}>
                        {n.title}
                      </span>
                      {!n.read && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '10px',
                            background: `${accent}26`,
                            color: accent,
                          }}
                        >
                          NEW
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {n.message}
                    </p>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '5px' }}>
                      {formatShortDate(n.createdAt)}
                    </div>
                  </div>
                </div>

                {n.complaintId && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#00E5E5',
                    }}
                  >
                    Inspect {n.complaintId} <ArrowRight size={14} />
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
