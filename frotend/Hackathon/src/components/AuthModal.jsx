import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShieldAlert,
  Lock,
  Building2,
  User,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';

export default function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalReason,
    loginAccount,
    user,
  } = useCivic();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@hdmc.gov.in');
  const [password, setPassword] = useState('hdmc2026');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const targetView = email.toLowerCase().includes('hdmc.gov.in') ? 'department' : 'citizen';
      const loggedUser = await loginAccount(email, password, targetView);
      if (loggedUser.role === 'department') {
        navigate('/dept/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const quickFillDepartment = () => {
    setEmail('admin@hdmc.gov.in');
    setPassword('hdmc2026');
    setError('');
  };

  const quickFillCitizen = () => {
    setEmail('renuka.patil@hubballidharwad.in');
    setPassword('citizen123');
    setError('');
  };

  return (
    <div
      onClick={() => setAuthModalOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        background: 'rgba(5, 13, 26, 0.84)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '500px',
          background: '#0B1930',
          border: '1px solid rgba(0, 229, 229, 0.35)',
          borderRadius: '22px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7), 0 0 32px rgba(105, 92, 255, 0.2)',
          overflow: 'hidden',
          color: '#FFFFFF',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, rgba(105, 92, 255, 0.14) 0%, rgba(0, 229, 229, 0.1) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(105, 92, 255, 0.2)',
                border: '1px solid rgba(105, 92, 255, 0.5)',
                color: '#00E5E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF' }}>
                Role-Based Access Authorization
              </h3>
              <div style={{ fontSize: '12px', color: '#A8B8CC' }}>
                Current Session: {user.name} ({user.role.toUpperCase()})
              </div>
            </div>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            aria-label="Close authorization modal"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: '#A8B8CC',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={17} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Security Notice */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 159, 67, 0.12)',
              border: '1px solid rgba(255, 159, 67, 0.35)',
              color: '#FFD29D',
              fontSize: '12.5px',
              lineHeight: 1.55,
              display: 'flex',
              gap: '10px',
              marginBottom: '18px',
            }}
          >
            <ShieldAlert size={18} color="#FF9F43" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              {authModalReason ||
                'Citizens cannot gain Department Command permissions without verifying authorized HDMC Department credentials.'}
            </div>
          </div>

          {/* Demo Account Quick-Fill Cards */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#00E5E5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Demo Accounts (Hackathon Verification)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={quickFillDepartment}
                style={{
                  padding: '10px 12px',
                  borderRadius: '11px',
                  border: email === 'admin@hdmc.gov.in' ? '1.5px solid #00E5E5' : '1px solid rgba(255,255,255,0.1)',
                  background: email === 'admin@hdmc.gov.in' ? 'rgba(0, 229, 229, 0.12)' : 'rgba(255,255,255,0.03)',
                  color: '#FFFFFF',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#00E5E5' }}>
                  <Building2 size={14} /> Department Admin
                </div>
                <div style={{ fontSize: '11px', color: '#A8B8CC', marginTop: '3px' }}>admin@hdmc.gov.in</div>
                <div style={{ fontSize: '10.5px', color: '#00D68F', marginTop: '2px' }}>Full Command Access</div>
              </button>

              <button
                type="button"
                onClick={quickFillCitizen}
                style={{
                  padding: '10px 12px',
                  borderRadius: '11px',
                  border: email === 'renuka.patil@hubballidharwad.in' ? '1.5px solid #695CFF' : '1px solid rgba(255,255,255,0.1)',
                  background: email === 'renuka.patil@hubballidharwad.in' ? 'rgba(105, 92, 255, 0.14)' : 'rgba(255,255,255,0.03)',
                  color: '#FFFFFF',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#A89FFF' }}>
                  <User size={14} /> Citizen Account
                </div>
                <div style={{ fontSize: '11px', color: '#A8B8CC', marginTop: '3px' }}>renuka.patil@...</div>
                <div style={{ fontSize: '10.5px', color: '#FF9F43', marginTop: '2px' }}>Citizen Portal Only</div>
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'rgba(255, 71, 87, 0.14)',
                border: '1px solid rgba(255, 71, 87, 0.45)',
                color: '#FF4757',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px',
              }}
            >
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#A8B8CC', marginBottom: '6px' }}>
                Authorized Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: 'rgba(5, 13, 26, 0.7)',
                  border: '1px solid rgba(0, 229, 229, 0.25)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#A8B8CC', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  background: 'rgba(5, 13, 26, 0.7)',
                  border: '1px solid rgba(0, 229, 229, 0.25)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="btn-glass-secondary"
                style={{ padding: '10px 16px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-neon-cyan"
                style={{ padding: '10px 20px' }}
              >
                <KeyRound size={15} />
                {submitting
                  ? 'Verifying...'
                  : email.includes('hdmc.gov.in')
                  ? 'Verify & Open Department View'
                  : 'Sign In as Citizen'}
              </button>
            </div>
          </form>

          <div
            style={{
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              fontSize: '11.5px',
              color: '#5E718D',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle2 size={13} color="#00D68F" />
            HMAC-SHA256 signed server token • Protected API endpoints enforce role checks.
          </div>
        </div>
      </div>
    </div>
  );
}
