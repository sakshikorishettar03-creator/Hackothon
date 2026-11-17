import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ClipboardList, MapPin, Building2, Calendar } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import GrievanceChart from '../components/GrievanceChart';
import LiveCityMap from '../components/LiveCityMap';
import QuickActions from '../components/QuickActions';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { StatusBadge, formatShortDate } from '../components/StatusBadge';
import { useCivic } from '../context/CivicContext';

export default function Dashboard() {
  const { isLoading, complaints } = useCivic();
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div style={{ animation: 'fadeInPage 0.35s ease' }}>
      {/* Hero Banner + 4 Citizen Statistics Cards */}
      <HeroSection />

      {/* Recent Complaints Interactive Table (Live Synced with Department View) */}
      <section className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(0, 229, 229, 0.14)',
                border: '1px solid rgba(0, 229, 229, 0.3)',
                color: '#00E5E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ClipboardList size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Recent Complaints</h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Real-time complaint status synchronized directly with HDMC Department Command
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/my-complaints')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '7px 14px',
              borderRadius: '9px',
              background: 'rgba(0, 229, 229, 0.1)',
              border: '1px solid rgba(0, 229, 229, 0.28)',
              color: '#00E5E5',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            View All My Complaints <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-glass)',
                  textAlign: 'left',
                  fontSize: '11.5px',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.04em',
                }}
              >
                <th style={{ padding: '10px' }}>COMPLAINT ID</th>
                <th style={{ padding: '10px' }}>TITLE</th>
                <th style={{ padding: '10px' }}>CATEGORY</th>
                <th style={{ padding: '10px' }}>LOCATION</th>
                <th style={{ padding: '10px' }}>SUBMITTED</th>
                <th style={{ padding: '10px' }}>ASSIGNED DEPT.</th>
                <th style={{ padding: '10px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {complaints.slice(0, 6).map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/track-status?id=${c.id}`)}
                  className="cf-table-row"
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    transition: 'background 0.18s ease',
                  }}
                >
                  <td style={{ padding: '13px 10px', fontWeight: 800, color: '#00E5E5', whiteSpace: 'nowrap' }}>
                    {c.id}
                  </td>
                  <td style={{ padding: '13px 10px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {c.title}
                  </td>
                  <td style={{ padding: '13px 10px', color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                    {c.category}
                  </td>
                  <td style={{ padding: '13px 10px', color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#00B8D9" /> {c.area || c.location}
                    </span>
                  </td>
                  <td style={{ padding: '13px 10px', color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {formatShortDate(c.createdAt)}
                    </span>
                  </td>
                  <td style={{ padding: '13px 10px', color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Building2 size={12} color="#695CFF" /> {c.department}
                    </span>
                  </td>
                  <td style={{ padding: '13px 10px' }}>
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Analytics + Live City Map */}
      <section className="dashboard-analytics-map-grid">
        <GrievanceChart />
        <LiveCityMap />
      </section>

      {/* 4 Colorful Quick Actions */}
      <QuickActions />

      <style>{`
        .cf-table-row:hover {
          background: rgba(0, 229, 229, 0.06);
        }
        .dashboard-analytics-map-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
          gap: 20px;
        }
        @media (max-width: 1180px) {
          .dashboard-analytics-map-grid { grid-template-columns: 1fr; }
        }
        @keyframes fadeInPage {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
