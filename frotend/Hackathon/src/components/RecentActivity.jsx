import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';

export default function RecentActivity() {
  const { complaints, selectedWard } = useCivic();
  const navigate = useNavigate();

  const visibleComplaints = complaints
    .filter((c) => {
      if (selectedWard.startsWith('All Wards')) return true;
      return c.ward === selectedWard;
    })
    .slice(0, 5);

  const items = visibleComplaints.length > 0 ? visibleComplaints : complaints.slice(0, 5);

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(105, 92, 255, 0.16)',
              border: '1px solid rgba(105, 92, 255, 0.35)',
              color: '#695CFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Recent Activity</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Real-time municipal resolution timeline across Hubballi-Dharwad
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/track-status')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '7px 13px',
            borderRadius: '9px',
            background: 'rgba(0, 229, 229, 0.1)',
            border: '1px solid rgba(0, 229, 229, 0.28)',
            color: '#00E5E5',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          View All Tickets <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Timeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item, idx) => {
          const isResolved = item.status === 'Resolved';
          const isProgress = item.status === 'In Progress';
          const statusColor = isResolved ? '#00D68F' : isProgress ? '#FF9F43' : '#FF4757';
          const StatusIcon = isResolved ? CheckCircle2 : isProgress ? Clock : AlertCircle;

          return (
            <div
              key={item.id}
              onClick={() => navigate(`/track-status?id=${item.id}`)}
              className="activity-timeline-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '14px 16px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.025)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              {/* Left: Status Icon + Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: `${statusColor}18`,
                    border: `1px solid ${statusColor}44`,
                    color: statusColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: `0 0 14px ${statusColor}22`,
                  }}
                >
                  <StatusIcon size={19} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '14.5px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {item.title}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#00E5E5',
                        background: 'rgba(0, 229, 229, 0.1)',
                        padding: '2px 7px',
                        borderRadius: '6px',
                      }}
                    >
                      {item.id}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginTop: '4px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#00B8D9" /> {item.location}
                    </span>
                    <span>•</span>
                    <span>{item.department}</span>
                  </div>
                </div>
              </div>

              {/* Right: Time + Status Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }} className="activity-time">
                  {item.createdAt}
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: `${statusColor}18`,
                    color: statusColor,
                    border: `1px solid ${statusColor}44`,
                    minWidth: '104px',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: statusColor,
                      boxShadow: `0 0 8px ${statusColor}`,
                    }}
                  />
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .activity-timeline-row:hover {
          background: rgba(0, 229, 229, 0.06) !important;
          border-color: rgba(0, 229, 229, 0.35) !important;
          transform: translateX(4px);
        }
        @media (max-width: 640px) {
          .activity-timeline-row {
            flex-direction: column;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
}
