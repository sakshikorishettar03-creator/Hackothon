import React from 'react';

export const STATUS_COLORS = {
  New: '#00E5E5',
  Accepted: '#00B8D9',
  Assigned: '#695CFF',
  'In Progress': '#FF9F43',
  'Pending Verification': '#A855F7',
  Resolved: '#00D68F',
  Rejected: '#94A3B8',
  Escalated: '#FF4757',
  Pending: '#FF4757',
};

export const PRIORITY_COLORS = {
  Low: '#00D68F',
  Medium: '#00E5E5',
  High: '#FF9F43',
  Critical: '#FF4757',
};

export function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#00E5E5';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11.5px',
        fontWeight: 700,
        background: `${color}1C`,
        color,
        border: `1px solid ${color}4D`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const color = PRIORITY_COLORS[priority] || '#00E5E5';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: '7px',
        fontSize: '11px',
        fontWeight: 700,
        background: `${color}1A`,
        color,
        border: `1px solid ${color}44`,
        whiteSpace: 'nowrap',
      }}
    >
      {priority}
    </span>
  );
}

export function formatRelativeDate(isoString) {
  if (!isoString) return 'Just now';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatShortDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
