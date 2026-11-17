import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  decimals = 0,
  trend,
  trendPositive = true,
  accentColor = '#00E5E5',
  delay = 0,
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime = null;
    let rafId = null;
    const duration = 1100;

    const timeout = setTimeout(() => {
      const animate = (ts) => {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(value * eased);
        if (progress < 1) {
          rafId = requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
        }
      };
      rafId = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value, delay]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString();

  return (
    <div
      className="glass-card stat-card-item"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '148px',
        background: `linear-gradient(145deg, var(--bg-card) 0%, ${accentColor}0D 100%)`,
        border: `1px solid ${accentColor}30`,
      }}
    >
      {/* Subtle corner glow */}
      <div
        style={{
          position: 'absolute',
          top: '-28px',
          right: '-28px',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: `${accentColor}20`,
          filter: 'blur(24px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: `${accentColor}1C`,
            border: `1px solid ${accentColor}44`,
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 18px ${accentColor}28`,
          }}
        >
          <Icon size={20} strokeWidth={2.2} />
        </div>

        {trend && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11.5px',
              fontWeight: 700,
              padding: '4px 9px',
              borderRadius: '20px',
              background: trendPositive ? 'rgba(0, 214, 143, 0.14)' : 'rgba(255, 159, 67, 0.14)',
              color: trendPositive ? '#00D68F' : '#FF9F43',
              border: trendPositive
                ? '1px solid rgba(0, 214, 143, 0.3)'
                : '1px solid rgba(255, 159, 67, 0.3)',
            }}
          >
            {trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </span>
        )}
      </div>

      <div>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '28px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            lineHeight: 1.15,
          }}
        >
          {formatted}
          {suffix && (
            <span style={{ fontSize: '17px', fontWeight: 700, marginLeft: '3px', color: accentColor }}>
              {suffix}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: '12.5px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            marginTop: '6px',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
