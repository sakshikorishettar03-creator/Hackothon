import React, { useState } from 'react';
import { X, Play, MapPin, ShieldCheck, Activity, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEMO_STEPS = [
  {
    step: '01',
    title: 'Snap & Pin with Real-Time GPS',
    desc: 'Citizens capture a photo of potholes, leaks, or sanitation issues. CivicFlow automatically locks high-precision Hubballi-Dharwad ward & GPS coordinates.',
    icon: MapPin,
    color: '#00E5E5',
    metric: 'Avg. Filing Time: 22 sec',
  },
  {
    step: '02',
    title: 'AI Department Auto-Routing',
    desc: 'Issues are instantly triaged to the right HDMC department (Water Board, Public Works, Solid Waste, Smart Electrical) with strict SLA countdowns.',
    icon: Activity,
    color: '#695CFF',
    metric: '99.4% Routing Accuracy',
  },
  {
    step: '03',
    title: 'Live Transparent Accountability',
    desc: 'Track every stage from engineer dispatch to geo-tagged completion proof on the Live City Map, then rate the resolution.',
    icon: ShieldCheck,
    color: '#00D68F',
    metric: '98% Citizen Satisfaction',
  },
];

export default function DemoModal({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const current = DEMO_STEPS[activeStep];
  const Icon = current.icon;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(5, 13, 26, 0.82)',
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
          maxWidth: '680px',
          background: '#0B1930',
          border: '1px solid rgba(0, 229, 229, 0.3)',
          borderRadius: '22px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65), 0 0 35px rgba(0, 229, 229, 0.15)',
          overflow: 'hidden',
          color: '#FFFFFF',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(0, 229, 229, 0.15)',
                color: '#00E5E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Play size={18} fill="#00E5E5" />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', color: '#FFFFFF' }}>CivicFlow Smart City Walkthrough</h3>
              <div style={{ fontSize: '12px', color: '#A8B8CC' }}>
                How Hubballi-Dharwad resolves civic issues in 1.5 hrs avg.
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close demo modal"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: '#A8B8CC',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Interactive Showcase */}
        <div style={{ padding: '24px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(5,13,26,0.9) 0%, rgba(14,34,66,0.9) 100%)',
              border: `1px solid ${current.color}44`,
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: current.color,
                  background: `${current.color}18`,
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: `1px solid ${current.color}44`,
                }}
              >
                STEP {current.step} OF 03
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#00D68F',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <CheckCircle2 size={14} /> {current.metric}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  background: `${current.color}1F`,
                  border: `1px solid ${current.color}55`,
                  color: current.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 0 20px ${current.color}33`,
                }}
              >
                <Icon size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '20px', marginBottom: '8px', color: '#FFFFFF' }}>{current.title}</h4>
                <p style={{ fontSize: '14px', color: '#A8B8CC', lineHeight: 1.6 }}>{current.desc}</p>
              </div>
            </div>
          </div>

          {/* Step selector pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '22px' }}>
            {DEMO_STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setActiveStep(idx)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: idx === activeStep ? `1px solid ${s.color}` : '1px solid rgba(255,255,255,0.08)',
                  background: idx === activeStep ? `${s.color}15` : 'rgba(255,255,255,0.03)',
                  color: idx === activeStep ? '#FFFFFF' : '#A8B8CC',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ color: s.color, fontSize: '11px', marginBottom: '2px' }}>Step {s.step}</div>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.title.split(' ').slice(0, 3).join(' ')}
                </div>
              </button>
            ))}
          </div>

          {/* Footer CTA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <button onClick={onClose} className="btn-glass-secondary" style={{ padding: '10px 18px' }}>
              Close Preview
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/raise-issue');
              }}
              className="btn-neon-cyan"
              style={{ padding: '10px 22px' }}
            >
              Try Reporting an Issue <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
