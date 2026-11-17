import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  SearchCheck,
  BarChart3,
  Info,
  ArrowRight,
} from 'lucide-react';

const ACTIONS = [
  {
    title: 'Report Issue',
    subtitle: 'Log potholes, leaks & hazards with GPS',
    path: '/raise-issue',
    icon: PlusCircle,
    gradient: 'linear-gradient(135deg, #00E5E5 0%, #0095B6 100%)',
    shadow: 'rgba(0, 229, 229, 0.32)',
    darkText: true,
  },
  {
    title: 'Track Status',
    subtitle: 'Real-time progress & engineer updates',
    path: '/track-status',
    icon: SearchCheck,
    gradient: 'linear-gradient(135deg, #695CFF 0%, #4338CA 100%)',
    shadow: 'rgba(105, 92, 255, 0.35)',
    darkText: false,
  },
  {
    title: 'View Reports',
    subtitle: 'Monthly analytics & ward scorecards',
    path: '/reports',
    icon: BarChart3,
    gradient: 'linear-gradient(135deg, #00B8D9 0%, #1D4ED8 100%)',
    shadow: 'rgba(0, 184, 217, 0.35)',
    darkText: false,
  },
  {
    title: 'Know More',
    subtitle: 'Explore Hubballi-Dharwad Smart City vision',
    path: '/about',
    icon: Info,
    gradient: 'linear-gradient(135deg, #00D68F 0%, #059669 100%)',
    shadow: 'rgba(0, 214, 143, 0.32)',
    darkText: true,
  },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <section style={{ marginTop: '24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Quick Actions</h2>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          One-click municipal services
        </span>
      </div>

      <div className="quick-actions-grid">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const textColor = action.darkText ? '#04101F' : '#FFFFFF';
          const subColor = action.darkText ? 'rgba(4, 16, 31, 0.78)' : 'rgba(255, 255, 255, 0.84)';

          return (
            <button
              key={action.title}
              onClick={() => navigate(action.path)}
              className="quick-action-card"
              style={{
                background: action.gradient,
                boxShadow: `0 12px 30px ${action.shadow}`,
                border: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: '18px',
                padding: '22px',
                textAlign: 'left',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '132px',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Decorative light ring */}
              <div
                style={{
                  position: 'absolute',
                  right: '-24px',
                  top: '-24px',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.16)',
                  pointerEvents: 'none',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  marginBottom: '14px',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: action.darkText
                      ? 'rgba(4, 16, 31, 0.14)'
                      : 'rgba(255, 255, 255, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: textColor,
                  }}
                >
                  <Icon size={22} strokeWidth={2.2} />
                </div>

                <ArrowRight size={18} color={textColor} className="qa-arrow" />
              </div>

              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '17px',
                    fontWeight: 800,
                    color: textColor,
                    marginBottom: '4px',
                  }}
                >
                  {action.title}
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: 500, color: subColor }}>
                  {action.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }
        .quick-action-card:hover {
          transform: translateY(-5px) scale(1.015);
          filter: brightness(1.06);
        }
        .quick-action-card:hover .qa-arrow {
          transform: translateX(4px);
        }
        .qa-arrow {
          transition: transform 0.2s ease;
        }
        @media (max-width: 1120px) {
          .quick-actions-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 560px) {
          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
