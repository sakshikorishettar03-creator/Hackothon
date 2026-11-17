import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { useCivic } from '../context/CivicContext';

export default function ProtectedDepartmentRoute({ children }) {
  const { isDepartmentAuthorized, setAuthModalOpen, setAuthModalReason, user } = useCivic();
  const navigate = useNavigate();

  if (isDepartmentAuthorized) {
    return children;
  }

  return (
    <div
      className="glass-card"
      style={{
        maxWidth: '580px',
        margin: '48px auto',
        padding: '38px 30px',
        textAlign: 'center',
        border: '1px solid rgba(255, 71, 87, 0.4)',
      }}
    >
      <div
        style={{
          width: '68px',
          height: '68px',
          borderRadius: '18px',
          background: 'rgba(255, 71, 87, 0.14)',
          border: '1.5px solid #FF4757',
          color: '#FF4757',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
          boxShadow: '0 0 28px rgba(255, 71, 87, 0.25)',
        }}
      >
        <ShieldAlert size={34} />
      </div>

      <span
        style={{
          fontSize: '11.5px',
          fontWeight: 800,
          letterSpacing: '0.08em',
          color: '#FF4757',
          background: 'rgba(255, 71, 87, 0.12)',
          padding: '4px 12px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 71, 87, 0.35)',
        }}
      >
        HTTP 403 • UNAUTHORIZED ACCESS BLOCKED
      </span>

      <h1 style={{ fontSize: '25px', fontWeight: 800, marginTop: '14px', marginBottom: '10px' }}>
        Department Command Authorization Required
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.65, marginBottom: '24px' }}>
        You are currently signed in as <strong>{user.name}</strong> (<code>{user.role}</code> role).
        Municipal Department Command routes and operational controls are strictly restricted to authorized HDMC Department accounts.
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/')} className="btn-glass-secondary">
          <ArrowLeft size={15} /> Back to Citizen View
        </button>
        <button
          onClick={() => {
            setAuthModalReason('Sign in with authorized HDMC Department credentials to unlock Command & Control Centre.');
            setAuthModalOpen(true);
          }}
          className="btn-neon-cyan"
        >
          <Lock size={15} /> Department Admin Sign In
        </button>
      </div>
    </div>
  );
}
