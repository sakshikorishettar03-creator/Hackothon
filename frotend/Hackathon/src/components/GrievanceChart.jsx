import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Activity, Calendar, TrendingUp } from 'lucide-react';
import { GRIEVANCE_TRENDS } from '../data/mockData';
import { useCivic } from '../context/CivicContext';

const TIMEFRAMES = [
  { key: '7D', label: 'Last 7 Days' },
  { key: '30D', label: 'Last 30 Days' },
  { key: '90D', label: 'Last 90 Days' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: 'rgba(7, 20, 38, 0.96)',
        border: '1px solid rgba(0, 229, 229, 0.35)',
        borderRadius: '12px',
        padding: '12px 14px',
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.5)',
        color: '#FFFFFF',
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#00E5E5', marginBottom: '6px' }}>
        {label}
      </div>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '12.5px',
            marginTop: '3px',
          }}
        >
          <span style={{ color: '#A8B8CC', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: entry.color,
              }}
            />
            {entry.name}:
          </span>
          <strong style={{ color: '#FFFFFF' }}>{entry.value.toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
}

export default function GrievanceChart() {
  const [timeframe, setTimeframe] = useState('30D');
  const { theme } = useCivic();

  const data = GRIEVANCE_TRENDS[timeframe];
  const totalInRange = data.reduce((sum, d) => sum + d.complaints, 0);
  const resolvedInRange = data.reduce((sum, d) => sum + d.resolved, 0);
  const rate = ((resolvedInRange / totalInRange) * 100).toFixed(1);

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '18px',
        }}
      >
        <div>
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
              <Activity size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Grievance Overview</h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Complaint trends & monthly resolution analytics
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px',
            borderRadius: '11px',
            background: theme === 'dark' ? 'rgba(5, 13, 26, 0.7)' : '#EDF2F7',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {TIMEFRAMES.map((tf) => {
            const active = tf.key === timeframe;
            return (
              <button
                key={tf.key}
                onClick={() => setTimeframe(tf.key)}
                style={{
                  padding: '6px 11px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: active
                    ? 'linear-gradient(135deg, #00E5E5 0%, #00B8D9 100%)'
                    : 'transparent',
                  color: active ? '#050D1A' : 'var(--text-secondary)',
                  boxShadow: active ? '0 0 12px rgba(0, 229, 229, 0.35)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {active && <Calendar size={12} />}
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mini Summary Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '12px',
          marginBottom: '18px',
        }}
      >
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(0, 229, 229, 0.06)',
            border: '1px solid rgba(0, 229, 229, 0.16)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Logged Grievances</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#00E5E5', marginTop: '2px' }}>
            {totalInRange.toLocaleString()}
          </div>
        </div>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(0, 214, 143, 0.06)',
            border: '1px solid rgba(0, 214, 143, 0.18)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Resolved Cases</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#00D68F', marginTop: '2px' }}>
            {resolvedInRange.toLocaleString()}
          </div>
        </div>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(105, 92, 255, 0.08)',
            border: '1px solid rgba(105, 92, 255, 0.22)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SLA Efficiency</div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#695CFF',
              marginTop: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            {rate}% <TrendingUp size={14} color="#00D68F" />
          </div>
        </div>
      </div>

      {/* Recharts Smooth Cyan Gradient Area Chart */}
      <div style={{ width: '100%', height: '270px', marginTop: 'auto' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="cyanAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E5E5" stopOpacity={0.42} />
                <stop offset="65%" stopColor="#00B8D9" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#00E5E5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="purpleAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#695CFF" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#695CFF" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 4"
              stroke={theme === 'dark' ? 'rgba(0, 229, 229, 0.14)' : 'rgba(15, 23, 42, 0.1)'}
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="var(--text-muted)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="var(--text-muted)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="complaints"
              name="Total Reported"
              stroke="#00E5E5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#cyanAreaFill)"
              activeDot={{ r: 6, fill: '#00E5E5', stroke: '#050D1A', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="resolved"
              name="Resolved"
              stroke="#695CFF"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#purpleAreaFill)"
              activeDot={{ r: 5, fill: '#695CFF', stroke: '#050D1A', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
