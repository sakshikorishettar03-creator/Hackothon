import React, { useState } from 'react';
import {
  User,
  Bell,
  Palette,
  Globe,
  Shield,
  Save,
  Sun,
  Moon,
  Check,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';
import { HUBBALLI_DHARWAD_WARDS } from '../data/mockData';

export default function Settings() {
  const { user, updateUser, theme, setTheme, activeView } = useCivic();
  const isDept = activeView === 'department';

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [ward, setWard] = useState(user.ward);
  const [language, setLanguage] = useState(user.language || 'English');
  const [notifs, setNotifs] = useState(user.notifications);

  const handleSave = (e) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      phone,
      ward,
      language,
      notifications: notifs,
    });
  };

  const toggleNotif = (key) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ animation: 'fadeInPage 0.35s ease' }}>
      <div style={{ marginBottom: '24px' }}>
        <div className="badge-neon" style={{ marginBottom: '10px' }}>
          <span className="badge-pulse-dot" /> {isDept ? 'HDMC Command Configuration' : 'Citizen Account & Profile'}
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>
          {isDept ? 'Department Settings' : 'My Profile & Settings'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          {isDept
            ? 'Configure municipal command officer profile, escalation alerts, and display theme.'
            : 'Manage your verified Hubballi-Dharwad citizen profile, alert channels, and display theme.'}
        </p>
      </div>

      <form onSubmit={handleSave} className="settings-grid">
        {/* Profile Management */}
        <div className="glass-card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
            <User size={19} color="#00E5E5" />
            <h2 style={{ fontSize: '18px' }}>Profile Management</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '62px',
                height: '62px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #00E5E5 0%, #695CFF 100%)',
                color: '#050D1A',
                fontWeight: 800,
                fontSize: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 22px rgba(0, 229, 229, 0.3)',
              }}
            >
              {user.avatarInitials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>{name || user.name}</div>
              <div style={{ fontSize: '12.5px', color: '#00E5E5' }}>{user.title}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label className="cf-label">Full Name</label>
              <input className="cf-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="cf-label">Email Address</label>
              <input className="cf-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="cf-label">Mobile Number</label>
              <input className="cf-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="cf-label">Home Ward</label>
              <select className="cf-input" value={ward} onChange={(e) => setWard(e.target.value)}>
                {HUBBALLI_DHARWAD_WARDS.slice(1).map((w) => (
                  <option key={w} value={w} style={{ background: '#0B1930', color: '#FFFFFF' }}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px' }}>
            <button type="submit" className="btn-neon-cyan">
              <Save size={16} /> Save Profile & Preferences
            </button>
          </div>
        </div>

        {/* Right Column: Theme + Notifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Theme Settings */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Palette size={19} color="#695CFF" />
              <h2 style={{ fontSize: '17px' }}>Theme & Appearance</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: theme === 'dark' ? '1.5px solid #00E5E5' : '1px solid var(--border-subtle)',
                  background: theme === 'dark' ? 'rgba(0, 229, 229, 0.14)' : 'rgba(255,255,255,0.02)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Moon size={18} color="#00E5E5" />
                  {theme === 'dark' && <Check size={16} color="#00E5E5" />}
                </div>
                <div style={{ fontWeight: 700, fontSize: '13.5px' }}>Futuristic Dark</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Smart City Command</div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: theme === 'light' ? '1.5px solid #00B8D9' : '1px solid var(--border-subtle)',
                  background: theme === 'light' ? 'rgba(0, 184, 217, 0.14)' : 'rgba(255,255,255,0.02)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Sun size={18} color="#FF9F43" />
                  {theme === 'light' && <Check size={16} color="#00B8D9" />}
                </div>
                <div style={{ fontWeight: 700, fontSize: '13.5px' }}>Clean Daylight</div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>High-contrast Light</div>
              </button>
            </div>

            <div>
              <label className="cf-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={14} color="#00E5E5" /> Portal Language
              </label>
              <select className="cf-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="English" style={{ background: '#0B1930' }}>English (India)</option>
                <option value="Kannada" style={{ background: '#0B1930' }}>ಕನ್ನಡ (Kannada)</option>
                <option value="Hindi" style={{ background: '#0B1930' }}>हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Bell size={19} color="#00D68F" />
              <h2 style={{ fontSize: '17px' }}>Notification Preferences</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { key: 'sms', label: 'SMS Dispatch Alerts', desc: 'Instant SMS when engineer is assigned' },
                { key: 'email', label: 'Email Resolution Proofs', desc: 'Geo-tagged closure photos via email' },
                { key: 'push', label: 'Live Browser Alerts', desc: 'Real-time status changes on dashboard' },
                { key: 'weeklyDigest', label: 'Weekly Ward Digest', desc: 'Summary of resolved issues in your ward' },
              ].map((item) => {
                const enabled = Boolean(notifs[item.key]);
                return (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '11px',
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{item.label}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{item.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleNotif(item.key)}
                      aria-label={`Toggle ${item.label}`}
                      style={{
                        width: '44px',
                        height: '24px',
                        borderRadius: '20px',
                        border: 'none',
                        background: enabled ? '#00E5E5' : 'rgba(168, 184, 204, 0.25)',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: '3px',
                          left: enabled ? '23px' : '3px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: enabled ? '#050D1A' : '#FFFFFF',
                          transition: 'left 0.2s ease',
                        }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="glass-card"
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderColor: 'rgba(0, 214, 143, 0.25)',
            }}
          >
            <Shield size={20} color="#00D68F" />
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Your citizen session is protected with end-to-end HDMC GovTech encryption.
            </div>
          </div>
        </div>
      </form>

      <style>{`
        .settings-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }
        .cf-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 7px;
        }
        .cf-input {
          width: 100%;
          padding: 11px 14px;
          border-radius: 11px;
          background: rgba(5, 13, 26, 0.55);
          border: 1px solid var(--border-glass);
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 14px;
          outline: none;
        }
        [data-theme='light'] .cf-input {
          background: #F8FAFC;
        }
        .cf-input:focus {
          border-color: #00E5E5;
          box-shadow: 0 0 0 3px rgba(0, 229, 229, 0.14);
        }
        @media (max-width: 1020px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
