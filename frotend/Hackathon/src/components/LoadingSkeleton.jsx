import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.48fr 1fr', gap: '20px' }}>
        <div className="skeleton-box" style={{ height: '312px', borderRadius: '20px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="skeleton-box" style={{ height: '148px', borderRadius: '14px' }} />
          <div className="skeleton-box" style={{ height: '148px', borderRadius: '14px' }} />
          <div className="skeleton-box" style={{ height: '148px', borderRadius: '14px' }} />
          <div className="skeleton-box" style={{ height: '148px', borderRadius: '14px' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '20px' }}>
        <div className="skeleton-box" style={{ height: '400px', borderRadius: '16px' }} />
        <div className="skeleton-box" style={{ height: '400px', borderRadius: '16px' }} />
      </div>

      <style>{`
        .skeleton-box {
          background: linear-gradient(
            90deg,
            rgba(11, 25, 48, 0.7) 25%,
            rgba(0, 229, 229, 0.1) 50%,
            rgba(11, 25, 48, 0.7) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite linear;
          border: 1px solid rgba(0, 229, 229, 0.1);
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
