import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  MapPin,
  Building2,
  Phone,
  UserCheck,
  Star,
  Calendar,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { StatusBadge, PriorityBadge, formatShortDate } from '../components/StatusBadge';

export default function TrackStatus() {
  const { complaints, rateComplaint } = useCivic();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('id') || searchParams.get('q') || complaints[0]?.id || '';
  const [query, setQuery] = useState(initialQuery);
  const [selectedId, setSelectedId] = useState(initialQuery);

  useEffect(() => {
    const paramId = searchParams.get('id') || searchParams.get('q');
    if (paramId) {
      setQuery(paramId);
      setSelectedId(paramId);
    } else if (!selectedId && complaints[0]?.id) {
      setQuery(complaints[0].id);
      setSelectedId(complaints[0].id);
    }
  }, [searchParams, complaints, selectedId]);

  const activeTicket =
    complaints.find(
      (c) =>
        c.id.toLowerCase() === selectedId.trim().toLowerCase() ||
        c.title.toLowerCase().includes(selectedId.trim().toLowerCase())
    ) || null;

  const handleSearch = (e) => {
    e.preventDefault();
    setSelectedId(query);
    if (query.trim()) setSearchParams({ id: query.trim() });
  };

  const selectQuickTicket = (id) => {
    setQuery(id);
    setSelectedId(id);
    setSearchParams({ id });
  };

  return (
    <div style={{ animation: 'fadeInPage 0.35s ease' }}>
      <div style={{ marginBottom: '22px' }}>
        <div className="badge-neon" style={{ marginBottom: '10px' }}>
          <span className="badge-pulse-dot" /> Live Synchronized Grievance Telemetry
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Track Complaint Status</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Inspect real-time department acceptance, officer dispatch, field photos, and verification proofs.
        </p>
      </div>

      {/* Search Card */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '22px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search
              size={18}
              color="#00E5E5"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Complaint ID (e.g. CF-2026-4821) or keyword..."
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                borderRadius: '12px',
                background: 'rgba(5, 13, 26, 0.55)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>
          <button type="submit" className="btn-neon-cyan">
            Track Ticket
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Live Tickets:</span>
          {complaints.slice(0, 6).map((c) => {
            const isCurrent = activeTicket?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => selectQuickTicket(c.id)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '8px',
                  border: isCurrent ? '1px solid #00E5E5' : '1px solid var(--border-subtle)',
                  background: isCurrent ? 'rgba(0, 229, 229, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                  color: isCurrent ? '#00E5E5' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {c.id} • {c.status}
              </button>
            );
          })}
        </div>
      </div>

      {!activeTicket ? (
        <div className="glass-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <AlertCircle size={40} color="#FF9F43" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '19px', marginBottom: '6px' }}>No Matching Complaint Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Select one of the live tickets above or check your Ticket ID format.
          </p>
        </div>
      ) : (
        <div className="track-status-grid">
          {/* Left: Details + Field Progress + Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '14px',
                  flexWrap: 'wrap',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '12.5px',
                        fontWeight: 800,
                        color: '#00E5E5',
                        background: 'rgba(0, 229, 229, 0.12)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                      }}
                    >
                      {activeTicket.id}
                    </span>
                    <PriorityBadge priority={activeTicket.priority} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{activeTicket.category}</span>
                  </div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{activeTicket.title}</h2>
                </div>
                <StatusBadge status={activeTicket.status} />
              </div>

              {activeTicket.isEscalated && activeTicket.escalationReason && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '11px',
                    background: 'rgba(255, 71, 87, 0.12)',
                    border: '1px solid rgba(255, 71, 87, 0.4)',
                    color: '#FF8A94',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '14px',
                  }}
                >
                  <AlertTriangle size={17} color="#FF4757" />
                  <span>{activeTicket.escalationReason}</span>
                </div>
              )}

              {activeTicket.rejectionReason && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '11px',
                    background: 'rgba(148, 163, 184, 0.14)',
                    border: '1px solid rgba(148, 163, 184, 0.4)',
                    color: '#E2E8F0',
                    fontSize: '13px',
                    marginBottom: '14px',
                  }}
                >
                  <strong>Department Rejection Reason:</strong> {activeTicket.rejectionReason}
                </div>
              )}

              {activeTicket.verificationProof && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '11px',
                    background: 'rgba(0, 214, 143, 0.12)',
                    border: '1px solid rgba(0, 214, 143, 0.35)',
                    color: '#7CF3C5',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '14px',
                  }}
                >
                  <ShieldCheck size={18} color="#00D68F" />
                  <div>
                    <strong>Verified & Resolved by {activeTicket.verificationProof.verifiedBy}:</strong>{' '}
                    {activeTicket.verificationProof.note}
                  </div>
                </div>
              )}

              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.65, marginBottom: '16px' }}>
                {activeTicket.description}
              </p>

              {activeTicket.imagePreview && (
                <div style={{ marginBottom: '16px' }}>
                  <img
                    src={activeTicket.imagePreview}
                    alt="Citizen evidence"
                    style={{ maxHeight: '220px', width: '100%', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border-glass)' }}
                  />
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '12.5px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} color="#00E5E5" />
                  <span>{activeTicket.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-secondary)' }}>
                  <Calendar size={14} color="#695CFF" />
                  <span>Submitted: {formatShortDate(activeTicket.createdAt)}</span>
                </div>
                {activeTicket.expectedResolutionDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#00D68F', fontWeight: 600 }}>
                    <Clock size={14} />
                    <span>Expected Resolution: {activeTicket.expectedResolutionDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Field Progress Updates & Photos */}
            {activeTicket.progressNotes?.length > 0 && (
              <div className="glass-card" style={{ padding: '22px' }}>
                <h3 style={{ fontSize: '16.5px', fontWeight: 700, marginBottom: '14px' }}>
                  Field Officer Progress Logs
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeTicket.progressNotes.map((note) => (
                    <div
                      key={note.id}
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        background: 'rgba(0, 229, 229, 0.05)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                        <strong style={{ color: '#00E5E5' }}>{note.author}</strong>
                        <span style={{ color: 'var(--text-muted)' }}>{formatShortDate(note.timestamp)}</span>
                      </div>
                      <p style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{note.text}</p>
                      {note.photo && (
                        <img
                          src={note.photo}
                          alt="Field work progress"
                          style={{ marginTop: '10px', maxHeight: '190px', borderRadius: '10px', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Progress Timeline */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '20px' }}>
                Interactive Progress Timeline
              </h3>
              <div>
                {(activeTicket.timeline || []).map((step, idx) => {
                  const isLast = idx === activeTicket.timeline.length - 1;
                  const dotColor = step.done
                    ? '#00D68F'
                    : step.active
                    ? '#00E5E5'
                    : 'rgba(168, 184, 204, 0.35)';

                  return (
                    <div key={`${step.step}-${idx}`} style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' }}>
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: step.done || step.active ? dotColor : 'transparent',
                            border: `2.5px solid ${dotColor}`,
                            boxShadow: step.done || step.active ? `0 0 12px ${dotColor}` : 'none',
                            marginTop: '3px',
                          }}
                        />
                        {!isLast && (
                          <div
                            style={{
                              width: '2px',
                              flex: 1,
                              minHeight: '42px',
                              background: step.done
                                ? 'linear-gradient(180deg, #00D68F 0%, rgba(0,229,229,0.35) 100%)'
                                : 'rgba(168, 184, 204, 0.16)',
                              margin: '4px 0',
                            }}
                          />
                        )}
                      </div>
                      <div style={{ paddingBottom: isLast ? '4px' : '20px', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: step.done || step.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            {step.step}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: step.done ? '#00D68F' : step.active ? '#00E5E5' : 'var(--text-muted)' }}>
                            {step.time}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{step.note}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Department Info + Rating */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '11px',
                    background: 'rgba(0, 229, 229, 0.14)',
                    color: '#00E5E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building2 size={19} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Department & Officer</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Live Command Assignment</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
                <div style={{ padding: '12px', borderRadius: '11px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ASSIGNED DEPARTMENT</div>
                  <div style={{ fontWeight: 700, color: '#00E5E5', marginTop: '3px' }}>{activeTicket.department}</div>
                </div>

                <div style={{ padding: '12px', borderRadius: '11px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ASSIGNED FIELD OFFICER</div>
                  <div style={{ fontWeight: 700, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={15} color="#00D68F" /> {activeTicket.officer}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color="#00B8D9" /> {activeTicket.officerPhone}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ padding: '11px', borderRadius: '11px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>PRIORITY</div>
                    <div style={{ marginTop: '4px' }}><PriorityBadge priority={activeTicket.priority} /></div>
                  </div>
                  <div style={{ padding: '11px', borderRadius: '11px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>SLA / TIME</div>
                    <strong style={{ color: '#00D68F', fontSize: '13px' }}>{activeTicket.resolutionTime}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>Citizen Satisfaction Rating</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Rate the speed and quality of HDMC’s response for this grievance.
              </p>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = (activeTicket.rating || 0) >= star;
                  return (
                    <button
                      key={star}
                      onClick={() => rateComplaint(activeTicket.id, star)}
                      aria-label={`Rate ${star} stars`}
                      style={{
                        background: filled ? 'rgba(255, 159, 67, 0.16)' : 'rgba(255,255,255,0.04)',
                        border: filled ? '1px solid #FF9F43' : '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <Star size={20} color={filled ? '#FF9F43' : '#5E718D'} fill={filled ? '#FF9F43' : 'none'} />
                    </button>
                  );
                })}
              </div>
              {activeTicket.rating && (
                <div style={{ marginTop: '10px', fontSize: '12.5px', color: '#00D68F', fontWeight: 600 }}>
                  Recorded Citizen Rating: {activeTicket.rating} / 5 Stars
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .track-status-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 1020px) {
          .track-status-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
