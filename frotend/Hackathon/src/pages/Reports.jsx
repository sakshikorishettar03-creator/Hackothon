import React, { useState } from 'react';
import {
  ResponsiveContainer,
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
  Download,
  FileSpreadsheet,
  BarChart3,
  PieChart as PieIcon,
  Award,
  TrendingUp,
} from 'lucide-react';
import { MONTHLY_REPORT_DATA, DEPARTMENT_STATS } from '../data/mockData';
import { useCivic } from '../context/CivicContext';

function ReportTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'rgba(7, 20, 38, 0.96)',
        border: '1px solid rgba(0, 229, 229, 0.35)',
        borderRadius: '10px',
        padding: '10px 14px',
        color: '#FFFFFF',
        fontSize: '12.5px',
      }}
    >
      {label && <div style={{ fontWeight: 700, color: '#00E5E5', marginBottom: '5px' }}>{label}</div>}
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '2px' }}>
          <span style={{ color: '#A8B8CC' }}>{p.name}:</span>
          <strong>{p.value.toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const { complaints, theme, showToast } = useCivic();
  const [selectedRange, setSelectedRange] = useState('Last 6 Months');

  const handleExportCSV = () => {
    const headers = ['Month', 'Total Complaints', 'Resolved', 'Pending', 'Resolution Rate (%)'];
    const rows = MONTHLY_REPORT_DATA.map((m) => [
      m.month,
      m.total,
      m.resolved,
      m.pending,
      ((m.resolved / m.total) * 100).toFixed(1),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CivicFlow_HubballiDharwad_Report_2026.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Municipal Analytics CSV report!', 'success');
  };

  const handleExportJSON = () => {
    const payload = {
      municipality: 'Hubballi-Dharwad Smart City (HDMC)',
      generatedAt: new Date().toISOString(),
      monthlyStatistics: MONTHLY_REPORT_DATA,
      departmentStats: DEPARTMENT_STATS,
      liveTicketsSample: complaints.map(({ id, title, status, ward, department }) => ({
        id,
        title,
        status,
        ward,
        department,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CivicFlow_Analytics_Export.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported full JSON telemetry dataset!', 'info');
  };

  return (
    <div style={{ animation: 'fadeInPage 0.35s ease' }}>
      {/* Header + Export Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '24px',
        }}
      >
        <div>
          <div className="badge-neon" style={{ marginBottom: '10px' }}>
            <span className="badge-pulse-dot" /> Municipal Open Data Hub
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Civic Analytics & Reports</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Monthly complaint statistics, resolved vs pending comparisons, and department SLA performance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleExportJSON} className="btn-glass-secondary" style={{ padding: '10px 16px' }}>
            <Download size={16} /> Export JSON
          </button>
          <button onClick={handleExportCSV} className="btn-neon-cyan" style={{ padding: '10px 18px' }}>
            <FileSpreadsheet size={16} /> Export CSV Report
          </button>
        </div>
      </div>

      {/* Top Charts Row */}
      <div className="reports-charts-grid" style={{ marginBottom: '22px' }}>
        {/* Resolved vs Pending Grouped Bar Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(0, 229, 229, 0.14)',
                  color: '#00E5E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BarChart3 size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Resolved vs Pending Complaints</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Monthly municipal resolution throughput ({selectedRange})
                </p>
              </div>
            </div>

            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '9px',
                background: 'rgba(5,13,26,0.6)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '12.5px',
                outline: 'none',
              }}
            >
              <option value="Last 6 Months" style={{ background: '#0B1930' }}>Last 6 Months</option>
              <option value="FY 2025-26" style={{ background: '#0B1930' }}>FY 2025–26</option>
            </select>
          </div>

          <div style={{ width: '100%', height: '290px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_REPORT_DATA} margin={{ top: 10, right: 10, left: -14, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke={theme === 'dark' ? 'rgba(168,184,204,0.1)' : 'rgba(15,23,42,0.08)'}
                  vertical={false}
                />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ReportTooltip />} />
                <Bar dataKey="resolved" name="Resolved" fill="#00E5E5" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="pending" name="Pending" fill="#FF9F43" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Donut */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(105, 92, 255, 0.16)',
                color: '#695CFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PieIcon size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Volume by Department</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Share of 12,450 logged issues</p>
            </div>
          </div>

          <div style={{ width: '100%', height: '210px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DEPARTMENT_STATS}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={86}
                  paddingAngle={4}
                >
                  {DEPARTMENT_STATS.map((dept) => (
                    <Cell key={dept.name} fill={dept.color} />
                  ))}
                </Pie>
                <Tooltip content={<ReportTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {DEPARTMENT_STATS.map((d) => (
              <div
                key={d.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12.5px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: d.color }} />
                  {d.name}
                </span>
                <strong style={{ color: 'var(--text-primary)' }}>{d.total.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department-Wise Performance Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={20} color="#00D68F" />
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Department-Wise SLA Performance</h2>
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              color: '#00D68F',
              fontWeight: 600,
            }}
          >
            <TrendingUp size={14} /> +6.2% YoY Improvement
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 10px' }}>DEPARTMENT</th>
                <th style={{ padding: '12px 10px' }}>TOTAL LOGGED</th>
                <th style={{ padding: '12px 10px' }}>RESOLVED</th>
                <th style={{ padding: '12px 10px' }}>AVG RESOLUTION</th>
                <th style={{ padding: '12px 10px', width: '230px' }}>EFFICIENCY RATE</th>
              </tr>
            </thead>
            <tbody>
              {DEPARTMENT_STATS.map((dept) => (
                <tr key={dept.name} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '13.5px' }}>
                  <td style={{ padding: '14px 10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '3px',
                        background: dept.color,
                        boxShadow: `0 0 8px ${dept.color}`,
                      }}
                    />
                    {dept.name}
                  </td>
                  <td style={{ padding: '14px 10px', color: 'var(--text-secondary)' }}>{dept.total.toLocaleString()}</td>
                  <td style={{ padding: '14px 10px', color: '#00D68F', fontWeight: 600 }}>{dept.resolved.toLocaleString()}</td>
                  <td style={{ padding: '14px 10px', color: 'var(--text-primary)', fontWeight: 600 }}>{dept.avgTime}</td>
                  <td style={{ padding: '14px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          flex: 1,
                          height: '8px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.08)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${dept.efficiency}%`,
                            height: '100%',
                            background: dept.color,
                            boxShadow: `0 0 10px ${dept.color}`,
                            borderRadius: '6px',
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '12.5px', minWidth: '42px', color: dept.color }}>
                        {dept.efficiency}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .reports-charts-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
          gap: 20px;
        }
        @media (max-width: 1080px) {
          .reports-charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
