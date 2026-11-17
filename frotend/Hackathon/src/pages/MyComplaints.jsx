import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Search,
  MapPin,
  Building2,
  UserCheck,
  Calendar,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { StatusBadge, PriorityBadge, formatShortDate } from '../components/StatusBadge';

const FILTERS = ['All', 'New', 'Accepted', 'Assigned', 'In Progress', 'Pending Verification', 'Resolved', 'Escalated', 'Rejected'];

export default function MyComplaints() {
  const { complaints } = useCivic();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesQuery =
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

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
            <ClipboardList size={13} /> Citizen Grievance Registry
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>My Complaints</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Filter and monitor every civic issue you have reported with live department updates.
          </p>
        </div>

        <button onClick={() => navigate('/raise-issue')} className="btn-neon-cyan">
          <PlusCircle size={16} /> Report New Issue
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '18px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search
              size={16}
              color="#00E5E5"
              style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Ticket ID, title, area, or department..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '10px',
                background: 'rgba(5, 13, 26, 0.55)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '13.5px',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Showing {filtered.length} of {complaints.length} complaints
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {FILTERS.map((f) => {
            const active = f === statusFilter;
            const count = f === 'All' ? complaints.length : complaints.filter((c) => c.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '9px',
                  border: active ? '1px solid #00E5E5' : '1px solid var(--border-subtle)',
                  background: active ? 'rgba(0, 229, 229, 0.16)' : 'rgba(255,255,255,0.02)',
                  color: active ? '#00E5E5' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {f} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Complaint Cards */}
      {filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '44px 24px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '6px' }}>No complaints match this filter</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
            Try selecting "All" or report a new municipal breakdown.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/track-status?id=${c.id}`)}
              className="glass-card"
              style={{
                padding: '20px 22px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '18px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: '1 1 380px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#00E5E5',
                      background: 'rgba(0, 229, 229, 0.12)',
                      padding: '3px 9px',
                      borderRadius: '7px',
                    }}
                  >
                    {c.id}
                  </span>
                  <PriorityBadge priority={c.priority} />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.category}</span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>{c.title}</h3>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    flexWrap: 'wrap',
                    fontSize: '12.5px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="#00B8D9" /> {c.location}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Building2 size={13} color="#695CFF" /> {c.department}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <UserCheck size={13} color="#00D68F" /> {c.officer}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {formatShortDate(c.createdAt)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <StatusBadge status={c.status} />
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#00E5E5',
                  }}
                >
                  Track <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
