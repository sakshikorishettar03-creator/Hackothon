import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  FileWarning,
  CheckCircle2,
  Clock,
  Hourglass,
  Radio,
} from 'lucide-react';
import StatCard from './StatCard';
import { useCivic } from '../context/CivicContext';

export default function HeroSection() {
  const navigate = useNavigate();
  const { stats, user, setIsDemoOpen } = useCivic();

  return (
    <section className="hero-stats-grid">
      {/* Left: Cinematic Futuristic Hero Banner */}
      <div
        className="hero-banner-card"
        style={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 229, 229, 0.28)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.45), 0 0 30px rgba(0, 229, 229, 0.1)',
          minHeight: '312px',
          display: 'flex',
          alignItems: 'center',
          background: '#081529',
        }}
      >
        <img
          src="/hero-smart-city.jpg"
          alt="Futuristic Smart City Command Skyline"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'right center',
            opacity: 0.7,
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(95deg, rgba(5, 13, 26, 0.96) 0%, rgba(7, 20, 38, 0.88) 48%, rgba(11, 25, 48, 0.42) 82%, rgba(0, 229, 229, 0.12) 100%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 12px',
            borderRadius: '10px',
            background: 'rgba(5, 13, 26, 0.78)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0, 229, 229, 0.35)',
            color: '#00E5E5',
            fontSize: '11.5px',
            fontWeight: 600,
            zIndex: 2,
          }}
          className="hero-live-badge"
        >
          <Radio size={14} />
          <span>Synced with HDMC Command</span>
        </div>

        <div style={{ position: 'relative', zIndex: 2, padding: '30px 32px', maxWidth: '580px' }}>
          <div className="badge-neon" style={{ marginBottom: '14px' }}>
            <span className="badge-pulse-dot" />
            Citizen Portal • Welcome, {user.name}
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(26px, 2.8vw, 38px)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#FFFFFF',
              marginBottom: '12px',
              letterSpacing: '-0.025em',
            }}
          >
            Fix City Breakdowns with{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #00E5E5 0%, #00B8D9 65%, #73F7FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CivicFlow
            </span>
          </h1>

          <p
            style={{
              fontSize: '14px',
              color: '#C7D6EA',
              lineHeight: 1.6,
              marginBottom: '24px',
              maxWidth: '480px',
            }}
          >
            Report potholes, water leaks, and sanitation hazards with real-time GPS tracking and live
            synchronization with Hubballi-Dharwad Department Command.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/raise-issue')} className="btn-neon-cyan">
              Report New Issue <ArrowRight size={17} />
            </button>

            <button
              onClick={() => setIsDemoOpen(true)}
              className="btn-glass-secondary"
              style={{ color: '#FFFFFF' }}
            >
              <Play size={15} fill="#00E5E5" color="#00E5E5" />
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Right: 4 Live Citizen Statistics Cards (Synced to Shared DB) */}
      <div className="hero-stats-2x2">
        <StatCard
          icon={FileWarning}
          value={stats.citizenTotal}
          label="Total Complaints Submitted"
          trend="Live Sync"
          trendPositive={true}
          accentColor="#00E5E5"
          delay={0}
        />
        <StatCard
          icon={Hourglass}
          value={stats.citizenPending}
          label="Pending Complaints"
          trend="In Queue"
          trendPositive={false}
          accentColor="#FF4757"
          delay={80}
        />
        <StatCard
          icon={Clock}
          value={stats.citizenInProgress}
          label="In-Progress Complaints"
          trend="Active"
          trendPositive={true}
          accentColor="#FF9F43"
          delay={160}
        />
        <StatCard
          icon={CheckCircle2}
          value={stats.citizenResolved}
          label="Resolved Complaints"
          trend="Verified"
          trendPositive={true}
          accentColor="#00D68F"
          delay={240}
        />
      </div>

      <style>{`
        .hero-stats-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.48fr) minmax(0, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }
        .hero-stats-2x2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        @media (max-width: 1260px) {
          .hero-stats-grid { grid-template-columns: 1fr; }
          .hero-stats-2x2 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
        @media (max-width: 860px) {
          .hero-stats-2x2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .hero-live-badge { display: none !important; }
        }
        @media (max-width: 480px) {
          .hero-stats-2x2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
