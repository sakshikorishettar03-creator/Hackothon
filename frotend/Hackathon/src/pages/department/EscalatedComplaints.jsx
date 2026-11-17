import React from 'react';
import { AlertTriangle, ShieldAlert, ShieldCheck, UserPlus } from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { StatusBadge, PriorityBadge, formatShortDate } from '../../components/StatusBadge';

export default function EscalatedComplaints() {
  const {
    complaints,
    officers,
    runEscalationAudit,
    assignOfficer,
    verifyAndResolveComplaint,
  } = useCivic();

  const escalated = complaints.filter((c) => c.isEscalated || c.status === 'Escalated');

  return (
    <div style={{ animation: 'fadeInPage 0.35s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px', flexWrap: 'wrap', marginBottom: '22px' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '20px',
              background: 'rgba(255, 71, 87, 0.16)',
              border: '1px solid rgba(255, 71, 87, 0.45)',
              color: '#FF4757',
              fontSize: '11.5px',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            <AlertTriangle size={13} /> Automated SLA Escalation Watchtower
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Escalated Complaints ({escalated.length})</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Overdue complaints automatically detected by CivicFlow’s SLA engine and flagged for immediate executive action.
          </p>
        </div>

        <button
          onClick={() => runEscalationAudit()}
          className="btn-neon-cyan"
          style={{ background: 'linear-gradient(135deg, #FF4757 0%, #FF9F43 100%)', color: '#FFFFFF' }}
        >
          <ShieldAlert size={16} /> Run Overdue SLA Audit
        </button>
      </div>

      {escalated.length === 0 ? (
        <div className="glass-card" style={{ padding: '44px', textAlign: 'center' }}>
          <ShieldCheck size={38} color="#00D68F" style={{ marginBottom: '10px' }} />
          <h3>Zero Active SLA Escalations</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>All municipal complaints are currently within SLA targets.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {escalated.map((c) => (
            <div
              key={c.id}
              className="glass-card"
              style={{
                padding: '22px',
                border: '1px solid rgba(255, 71, 87, 0.45)',
                borderLeft: '5px solid #FF4757',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 800, color: '#FF4757' }}>{c.id}</span>
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.ward}</span>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{c.title}</h3>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {officers[0] && (
                    <button
                      onClick={() => assignOfficer(c.id, officers[0].id, '2026-11-18')}
                      className="btn-glass-secondary"
                      style={{ padding: '8px 13px', fontSize: '12px' }}
                    >
                      <UserPlus size={14} /> Dispatch Senior Lead
                    </button>
                  )}
                  <button
                    onClick={() =>
                      verifyAndResolveComplaint(c.id, {
                        verificationNote: 'Escalated ticket resolved under Chief Commissioner directive.',
                      })
                    }
                    className="btn-neon-cyan"
                    style={{ padding: '8px 14px', fontSize: '12px' }}
                  >
                    <ShieldCheck size={14} /> Verify & Resolve
                  </button>
                </div>
              </div>

              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 71, 87, 0.12)',
                  color: '#FF9DA6',
                  fontSize: '13px',
                  marginBottom: '10px',
                }}
              >
                <strong>Escalation Trigger:</strong> {c.escalationReason || 'Overdue beyond department SLA threshold.'}
              </div>

              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Citizen: <strong>{c.citizenName}</strong> • Officer: <strong>{c.officer}</strong> • Logged: {formatShortDate(c.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
