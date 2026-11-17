import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Target,
  Eye,
  ShieldCheck,
  Cpu,
  Globe2,
  Users,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';

const OBJECTIVES = [
  {
    icon: Cpu,
    title: 'Real-Time IoT & GPS Dispatch',
    desc: 'Every citizen report is pinned with precise latitude/longitude telemetry and instantly routed to the nearest ward field crew.',
    color: '#00E5E5',
  },
  {
    icon: ShieldCheck,
    title: 'Zero-Opacity Accountability',
    desc: 'Every ticket carries an immutable timeline, assigned municipal officer contact, SLA countdown, and geo-tagged resolution proof.',
    color: '#00D68F',
  },
  {
    icon: Globe2,
    title: 'Twin-City Unified Coverage',
    desc: 'Connecting all 82 wards across Hubballi and Dharwad — bridging water boards, public works, sanitation, and smart street lighting.',
    color: '#695CFF',
  },
  {
    icon: Users,
    title: 'Citizen-First Co-Governance',
    desc: 'Transparent monthly reports, open CSV/JSON civic datasets, and 5-star citizen verification ensure continuous improvement.',
    color: '#FF9F43',
  },
];

const FAQS = [
  {
    q: 'How fast are civic grievances resolved on CivicFlow?',
    a: 'Critical issues like water main bursts and major road hazards have a 1.5-hour average response time, with strict department SLAs ranging from 6 to 24 hours.',
  },
  {
    q: 'Can I report an issue without knowing my exact ward number?',
    a: 'Yes! Simply click "Detect GPS" or tap the exact spot on the Raise Issue map, and CivicFlow automatically attaches accurate coordinates for dispatch.',
  },
  {
    q: 'How is resolution verified before a ticket is closed?',
    a: 'Field engineers must upload geo-tagged completion proof from the physical site, and citizens can rate the resolution quality directly in Track Status.',
  },
];

export default function About() {
  const [openFaq, setOpenFaq] = useState(0);
  const navigate = useNavigate();

  return (
    <div style={{ animation: 'fadeInPage 0.35s ease', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Intro Hero */}
      <div
        className="glass-card"
        style={{
          padding: '34px',
          background:
            'linear-gradient(135deg, rgba(11, 25, 48, 0.95) 0%, rgba(0, 229, 229, 0.1) 60%, rgba(105, 92, 255, 0.14) 100%)',
          border: '1px solid rgba(0, 229, 229, 0.28)',
        }}
      >
        <div className="badge-neon" style={{ marginBottom: '12px' }}>
          <Building2 size={13} /> About CivicFlow GovTech
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', maxWidth: '720px' }}>
          Powering <span className="gradient-text-cyan">Hubballi-Dharwad’s</span> Next-Generation Smart Municipal Command
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.7, maxWidth: '760px', marginBottom: '22px' }}>
          CivicFlow is a unified Smart Municipal Issue Resolution Platform built to eliminate delays,
          silos, and opacity in urban service delivery. By combining real-time GPS mapping, automated
          department triage, and public analytics, we empower citizens and city engineers to build a
          cleaner, safer, and smarter twin city together.
        </p>
        <button onClick={() => navigate('/raise-issue')} className="btn-neon-cyan">
          Report a Civic Issue Now <ArrowRight size={16} />
        </button>
      </div>

      {/* Mission & Vision */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '26px', borderTop: '3px solid #00E5E5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Target size={22} color="#00E5E5" />
            <h2 style={{ fontSize: '20px' }}>Our Mission</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7 }}>
            To give every citizen of Hubballi-Dharwad a frictionless, 30-second digital channel to report
            municipal breakdowns and track verified field action in real time — turning civic grievances
            into rapid, accountable urban maintenance.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '26px', borderTop: '3px solid #695CFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Eye size={22} color="#695CFF" />
            <h2 style={{ fontSize: '20px' }}>Our Vision</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7 }}>
            A predictive, citizen-centric Smart City where infrastructure anomalies are detected early,
            resolved within strict SLA benchmarks, and governed through radical open-data transparency —
            <em> "A Better City For a Better Tomorrow."</em>
          </p>
        </div>
      </div>

      {/* Smart City Objectives */}
      <div>
        <h2 style={{ fontSize: '20px', marginBottom: '14px' }}>Smart City Objectives</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {OBJECTIVES.map((obj) => {
            const Icon = obj.icon;
            return (
              <div key={obj.title} className="glass-card" style={{ padding: '22px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: `${obj.color}1C`,
                    border: `1px solid ${obj.color}44`,
                    color: obj.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <Icon size={21} />
                </div>
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{obj.title}</h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{obj.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '19px', marginBottom: '16px' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQS.map((item, idx) => {
            const open = openFaq === idx;
            return (
              <div
                key={item.q}
                style={{
                  borderRadius: '12px',
                  border: open ? '1px solid rgba(0, 229, 229, 0.35)' : '1px solid var(--border-subtle)',
                  background: open ? 'rgba(0, 229, 229, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setOpenFaq(open ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '15px 18px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '14.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    size={18}
                    color="#00E5E5"
                    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
                  />
                </button>
                {open && (
                  <div style={{ padding: '0 18px 16px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
