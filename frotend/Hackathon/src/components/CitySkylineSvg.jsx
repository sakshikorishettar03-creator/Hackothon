import React from 'react';

export default function CitySkylineSvg({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <defs>
        <linearGradient id="skylineGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00E5E5" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#071426" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="skylineGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#695CFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#071426" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="skylineGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00B8D9" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#071426" stopOpacity="0.05" />
        </linearGradient>
        <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background silhouettes */}
      <rect x="18" y="28" width="16" height="42" fill="url(#skylineGrad3)" rx="2" />
      <rect x="42" y="16" width="22" height="54" fill="url(#skylineGrad3)" rx="2" />
      <rect x="80" y="24" width="20" height="46" fill="url(#skylineGrad3)" rx="2" />
      <rect x="120" y="12" width="24" height="58" fill="url(#skylineGrad3)" rx="2" />
      <rect x="160" y="22" width="18" height="48" fill="url(#skylineGrad3)" rx="2" />
      <rect x="195" y="32" width="28" height="38" fill="url(#skylineGrad3)" rx="2" />

      {/* Main Midground Skyline with Spire */}
      {/* Skyscraper 1 */}
      <rect x="6" y="35" width="18" height="35" fill="url(#skylineGrad1)" rx="2" />
      {/* Tower 2 with angled roof */}
      <polygon points="30,68 30,22 42,12 42,68" fill="url(#skylineGrad2)" />
      {/* Central Spire Tower */}
      <rect x="60" y="18" width="22" height="52" fill="url(#skylineGrad1)" rx="2" />
      <line x1="71" y1="6" x2="71" y2="18" stroke="#00E5E5" strokeWidth="2" filter="url(#cyanGlow)" />
      <circle cx="71" cy="5" r="2" fill="#00E5E5" filter="url(#cyanGlow)" />
      
      {/* Modern Diagonal Building */}
      <polygon points="88,68 88,30 110,18 110,68" fill="url(#skylineGrad1)" opacity="0.9" />
      
      {/* High-rise with windows */}
      <rect x="116" y="22" width="24" height="48" fill="url(#skylineGrad2)" rx="2" />
      <circle cx="123" cy="30" r="1" fill="#00E5E5" opacity="0.8" />
      <circle cx="131" cy="30" r="1" fill="#00E5E5" opacity="0.8" />
      <circle cx="123" cy="38" r="1" fill="#00E5E5" opacity="0.8" />
      <circle cx="131" cy="38" r="1" fill="#00E5E5" opacity="0.8" />
      <circle cx="123" cy="46" r="1" fill="#00E5E5" opacity="0.8" />
      <circle cx="131" cy="46" r="1" fill="#00E5E5" opacity="0.8" />

      {/* Curved Pavilion / Dome */}
      <path d="M148,68 L148,40 Q162,26 176,40 L176,68 Z" fill="url(#skylineGrad1)" />
      <line x1="162" y1="26" x2="162" y2="18" stroke="#695CFF" strokeWidth="1.5" />
      <circle cx="162" cy="17" r="1.5" fill="#695CFF" />

      {/* Right Modern Towers */}
      <rect x="182" y="26" width="20" height="44" fill="url(#skylineGrad2)" rx="2" />
      <rect x="208" y="38" width="22" height="32" fill="url(#skylineGrad1)" rx="2" />

      {/* Ground Horizon Grid line */}
      <line x1="0" y1="68" x2="240" y2="68" stroke="#00E5E5" strokeWidth="1.2" opacity="0.4" />
      <line x1="0" y1="69.5" x2="240" y2="69.5" stroke="#695CFF" strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}
