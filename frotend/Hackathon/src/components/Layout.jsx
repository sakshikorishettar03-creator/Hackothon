import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import DemoModal from './DemoModal';
import AuthModal from './AuthModal';
import { useCivic } from '../context/CivicContext';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toasts, isDemoOpen, setIsDemoOpen, isViewTransitioning, apiError } = useCivic();

  return (
    <div className="civicflow-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="civicflow-content-wrapper">
        <TopNavbar onOpenMobile={() => setMobileOpen(true)} />
        <main
          className="civicflow-main-content"
          style={{
            opacity: isViewTransitioning ? 0.25 : 1,
            transform: isViewTransitioning ? 'translateY(6px)' : 'translateY(0)',
            transition: 'opacity 0.22s ease, transform 0.22s ease',
          }}
        >
          {apiError && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(255, 71, 87, 0.14)',
                border: '1px solid rgba(255, 71, 87, 0.4)',
                color: '#FF4757',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} /> Backend sync notice: {apiError}
            </div>
          )}
          <Outlet />
        </main>
      </div>

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <AuthModal />

      {/* Floating Toasts */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1500,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => {
          const accent =
            t.type === 'success' ? '#00D68F' : t.type === 'warning' ? '#FF9F43' : '#00E5E5';
          return (
            <div
              key={t.id}
              style={{
                pointerEvents: 'auto',
                background: 'rgba(11, 25, 48, 0.96)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${accent}66`,
                borderLeft: `4px solid ${accent}`,
                borderRadius: '12px',
                padding: '12px 18px',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: `0 12px 32px rgba(0, 0, 0, 0.5), 0 0 16px ${accent}25`,
                animation: 'slideInToast 0.25s ease forwards',
              }}
            >
              {t.type === 'success' && <CheckCircle2 size={18} color="#00D68F" />}
              {t.type === 'warning' && <AlertTriangle size={18} color="#FF9F43" />}
              {t.type === 'info' && <Info size={18} color="#00E5E5" />}
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideInToast {
          from { opacity: 0; transform: translateY(14px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
