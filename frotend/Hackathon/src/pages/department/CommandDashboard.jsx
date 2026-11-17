import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Inbox,
  FileWarning,
  Hourglass,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Timer,
  ShieldAlert,
  Radio,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import LiveCityMap from '../../components/LiveCityMap';
import { useCivic } from '../../context/CivicContext';
import { GRIEVANCE_TRENDS, MONTHLY_REPORT_DATA, DEPARTMENT_STATS } from '../../data/mockData';

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'rgba(7, 20, 38, 0.96)',
        border: '1px solid rgba(0, 229, 229, 0.35)',
        borderRadius: '10px',
        padding: '10px 13px',
        color: '#FFFFFF',
        fontSize: '12px',
      }}
    >
      {label && <div style={{ fontWeight: 700, color: '#00E5E5', marginBottom: '4px' }}>{label}</div>}
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <span style={{ color: '#A8B8CC' }}>{p.name}:</span>
          <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function CommandDashboard() {
  const { complaints, stats, runEscalationAudit, refreshAll, theme } = useCivic();
  const navigate = useNavigate();

  // Live Category-wise counts from shared DB
  const categoryData = useMemo(() => {
    const map = {};
    complaints.forEach((c) => {
      const key = (c.category || 'Other').split('&')[0].trim();
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [complaints]);

  // Live Ward-wise counts from shared DB
  const wardData = useMemo(() => {
    const map = {};
    complaints.forEach((c) => {
      const label = (c.ward || 'Central').split('—')[1]?.trim() || c.ward || 'Central';
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map)
      .map(([ward, count]) => ({ ward, count }))
      .slice(0, 6);
  }, [complaints]);

  return (
    <div style={{ animation: 'fadeInPage 0.35s ease', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Command Centre Header Banner */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          background:
            'linear-gradient(125deg, rgba(11, 25, 48, 0.96) 0%, rgba(105, 92, 255, 0.16) 55%, rgba(0, 229, 229, 0.12) 100%)',
          border: '1px solid rgba(105, 92, 255, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '18px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '5px 12px',
              borderRadius: '20px',
              background: 'rgba(105, 92, 255, 0.2)',
              border: '1px solid rgba(105, 92, 255, 0.45)',
              color: '#C3BCFF',
              fontSize: '11.5px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            <Radio size={13} color="#00E5E5" /> HDMC Smart City Command & Control Centre
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800 }}>
            Municipal Operations Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px' }}>
            Real-time intake triage, officer dispatch, SLA escalation monitoring, and city-wide resolution analytics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => refreshAll()}
            className="btn-glass-secondary"
            style={{ padding: '10px 14px', fontSize: '13px' }}
          >
            <RefreshCw size={15} /> Sync Live DB
          </button>
          <button
            onClick={() => runEscalationAudit()}
            className="btn-glass-secondary"
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              borderColor: 'rgba(255, 71, 87, 0.5)',
              color: '#FF7B87',
            }}
          >
            <ShieldAlert size={15} /> Run SLA Escalation Audit
          </button>
          <button
            onClick={() => navigate('/dept/incoming')}
            className="btn-neon-cyan"
            style={{ padding: '10px 18px', fontSize: '13px' }}
          >
            Manage Incoming ({stats.newComplaints}) <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* 7 Operational KPI Cards */}
      <section className="cmd-kpi-grid">
        <StatCard icon={FileWarning} value={stats.totalReceived} label="Total Complaints Received" accentColor="#00E5E5" />
        <StatCard icon={Inbox} value={stats.newComplaints} label="New Complaints" accentColor="#00B8D9" delay={60} />
        <StatCard icon={Hourglass} value={stats.pendingComplaints} label="Pending Complaints" accentColor="#695CFF" delay={100} />
        <StatCard icon={Clock} value={stats.inProgressComplaints} label="In-Progress Complaints" accentColor="#FF9F43" delay={140} />
        <StatCard icon={CheckCircle2} value={stats.resolvedComplaints} label="Resolved Complaints" accentColor="#00D68F" delay={180} />
        <StatCard icon={AlertTriangle} value={stats.escalatedComplaints} label="Escalated Complaints" accentColor="#FF4757" delay={220} />
        <StatCard icon={Timer} value={stats.avgResolutionHrs} decimals={1} suffix="hrs" label="Avg Resolution Time" accentColor="#00E5E5" delay={260} />
      </section>

      {/* Row 1 Charts: Complaint Trends + Pending vs Resolved */}
      <section className="cmd-two-col">
        <div className="glass-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '16.5px', fontWeight: 700, marginBottom: '4px' }}>Complaint Trends (30 Days)</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Incoming vs resolved volume across Hubballi-Dharwad
          </p>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={GRIEVANCE_TRENDS['30D']} margin={{ top: 5, right: 10, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="cmdCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5E5" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#00E5E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 4" stroke="rgba(0,229,229,0.12)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-secondary)', fontSize: 11.5 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11.5 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Area type="monotone" dataKey="complaints" name="Received" stroke="#00E5E5" strokeWidth={2.5} fill="url(#cmdCyan)" />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#00D68F" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '16.5px', fontWeight: 700, marginBottom: '4px' }}>Pending vs Resolved Complaints</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Monthly resolution backlog comparison
          </p>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_REPORT_DATA} margin={{ top: 5, right: 10, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 4" stroke="rgba(0,229,229,0.12)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 11.5 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11.5 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="resolved" name="Resolved" fill="#00D68F" radius={[5, 5, 0, 0]} maxBarSize={24} />
                <Bar dataKey="pending" name="Pending" fill="#FF9F43" radius={[5, 5, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Row 2 Charts: Category-wise + Ward-wise + Department Performance */}
      <section className="cmd-three-col">
        <div className="glass-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Category-wise Complaints</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>Live shared database breakdown</p>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 5, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 4" stroke="rgba(0,229,229,0.1)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 10.5 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="count" name="Complaints" fill="#695CFF" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Ward-wise Complaints</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>Active hotspot wards</p>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wardData} layout="vertical" margin={{ top: 0, right: 12, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 4" stroke="rgba(0,229,229,0.1)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="ward" width={88} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="count" name="Complaints" fill="#00E5E5" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Department Performance</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Division SLA compliance share</p>
          <div style={{ width: '100%', height: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={DEPARTMENT_STATS} dataKey="efficiency" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3}>
                  {DEPARTMENT_STATS.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11.5px' }}>
            {DEPARTMENT_STATS.slice(0, 4).map((d) => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} /> {d.name}
                </span>
                <strong style={{ color: d.color }}>{d.efficiency}%</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Geo-Spatial Command Map */}
      <LiveCityMap />

      <style>{`
        .cmd-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
          gap: 14px;
        }
        .cmd-two-col {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }
        .cmd-three-col {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }
        @media (max-width: 1180px) {
          .cmd-two-col, .cmd-three-col { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
