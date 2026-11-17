import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Layers,
  Locate,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';

const HUBBALLI_CENTER = [15.3647, 75.124];
const RENUKA_LOCATION = [15.3685, 75.1235];

export default function LiveCityMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState('ALL');
  const { complaints, theme } = useCivic();
  const navigate = useNavigate();

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: HUBBALLI_CENTER,
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap tiles (styled dark-navy via CSS filter in dark mode)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Attribution small text
      L.control
        .attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; OpenStreetMap contributors')
        .addTo(map);

      // Current citizen location pulsing marker
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="position: relative; width: 22px; height: 22px;">
            <div style="position: absolute; inset: 0; border-radius: 50%; background: #00E5E5; opacity: 0.4; animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position: absolute; inset: 3px; border-radius: 50%; background: #00E5E5; border: 2.5px solid #050D1A; box-shadow: 0 0 12px #00E5E5;"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      userMarkerRef.current = L.marker(RENUKA_LOCATION, { icon: userIcon })
        .addTo(map)
        .bindPopup(
          `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 6px 2px; color: #FFFFFF;">
            <div style="font-size: 11px; color: #00E5E5; font-weight: 700; text-transform: uppercase;">You Are Here</div>
            <div style="font-size: 13px; font-weight: 700; margin-top: 2px;">Renuka's Location • Ward 14</div>
            <div style="font-size: 11.5px; color: #A8B8CC;">Vidyanagar, Hubballi</div>
          </div>
        `,
          { className: 'govtech-leaflet-popup' }
        );

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      // Invalidate size if container resizes
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync map dark-mode tile filter class cleanly when theme toggles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (theme === 'dark') {
      mapContainerRef.current.classList.add('civic-dark-map');
    } else {
      mapContainerRef.current.classList.remove('civic-dark-map');
    }
  }, [theme]);

  // Update markers when complaints or filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const isPendingStatus = (s) => ['New', 'Accepted', 'Pending', 'Escalated'].includes(s);
    const isProgressStatus = (s) => ['Assigned', 'In Progress', 'Pending Verification'].includes(s);

    const filtered = complaints.filter((c) => {
      if (activeFilter === 'PENDING') return isPendingStatus(c.status);
      if (activeFilter === 'IN_PROGRESS') return isProgressStatus(c.status);
      if (activeFilter === 'RESOLVED') return c.status === 'Resolved';
      return true;
    });

    filtered.forEach((complaint) => {
      if (!complaint.lat || !complaint.lng) return;

      const isPending = isPendingStatus(complaint.status);
      const isInProgress = isProgressStatus(complaint.status);

      const color = isPending ? '#FF4757' : isInProgress ? '#FF9F43' : '#00D68F';
      const label = complaint.status;

      const customIcon = L.divIcon({
        className: 'custom-complaint-marker',
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              inset: 0;
              border-radius: 50%;
              background: ${color};
              opacity: ${isPending ? '0.35' : '0.2'};
              animation: ${isPending ? 'ping 2s cubic-bezier(0,0,0.2,1) infinite' : 'none'};
            "></div>
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: #0B1930;
              border: 2px solid ${color};
              box-shadow: 0 0 14px ${color};
              display: flex;
              align-items: center;
              justify-content: center;
              color: ${color};
            ">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([complaint.lat, complaint.lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 210px; padding: 4px 2px; color: #FFFFFF;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: #00E5E5; letter-spacing: 0.04em;">${complaint.id}</span>
            <span style="
              font-size: 10px;
              font-weight: 700;
              padding: 2px 7px;
              border-radius: 6px;
              background: ${color}22;
              color: ${color};
              border: 1px solid ${color}66;
            ">${label}</span>
          </div>
          <div style="font-size: 13.5px; font-weight: 700; color: #FFFFFF; line-height: 1.3; margin-bottom: 4px;">
            ${complaint.title}
          </div>
          <div style="font-size: 11.5px; color: #A8B8CC; margin-bottom: 8px;">
            📍 ${complaint.location}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
            <span style="font-size: 11px; color: #5E718D;">${complaint.createdAt}</span>
            <a href="/track-status?id=${complaint.id}" style="
              font-size: 11.5px;
              font-weight: 700;
              color: #00E5E5;
              text-decoration: none;
              display: inline-flex;
              align-items: center;
              gap: 4px;
            ">Track Ticket →</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { className: 'govtech-leaflet-popup' });
      marker.on('popupopen', () => {
        const link = document.querySelector(`.leaflet-popup-content a[href="/track-status?id=${complaint.id}"]`);
        if (link) {
          link.onclick = (e) => {
            e.preventDefault();
            navigate(`/track-status?id=${complaint.id}`);
          };
        }
      });
      markersLayerRef.current.addLayer(marker);
    });
  }, [complaints, activeFilter]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleResetView = () => {
    mapInstanceRef.current?.setView(HUBBALLI_CENTER, 12);
  };
  const handleLocateMe = () => {
    mapInstanceRef.current?.setView(RENUKA_LOCATION, 15);
    userMarkerRef.current?.openPopup();
  };

  const pendingCount = complaints.filter((c) => ['New', 'Accepted', 'Pending', 'Escalated'].includes(c.status)).length;
  const inProgressCount = complaints.filter((c) => ['Assigned', 'In Progress', 'Pending Verification'].includes(c.status)).length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Map Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(0, 229, 229, 0.14)',
              border: '1px solid rgba(0, 229, 229, 0.3)',
              color: '#00E5E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MapPin size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Live City Map</h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Interactive geo-spatial telemetry for Hubballi-Dharwad
            </p>
          </div>
        </div>

        {/* Status Filter Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveFilter('ALL')}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              border: activeFilter === 'ALL' ? '1px solid #00E5E5' : '1px solid var(--border-subtle)',
              background: activeFilter === 'ALL' ? 'rgba(0, 229, 229, 0.15)' : 'transparent',
              color: activeFilter === 'ALL' ? '#00E5E5' : 'var(--text-secondary)',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            All ({complaints.length})
          </button>

          <button
            onClick={() => setActiveFilter('PENDING')}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              border: activeFilter === 'PENDING' ? '1px solid #FF4757' : '1px solid var(--border-subtle)',
              background: activeFilter === 'PENDING' ? 'rgba(255, 71, 87, 0.16)' : 'transparent',
              color: activeFilter === 'PENDING' ? '#FF4757' : 'var(--text-secondary)',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4757' }} />
            Pending ({pendingCount})
          </button>

          <button
            onClick={() => setActiveFilter('IN_PROGRESS')}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              border: activeFilter === 'IN_PROGRESS' ? '1px solid #FF9F43' : '1px solid var(--border-subtle)',
              background: activeFilter === 'IN_PROGRESS' ? 'rgba(255, 159, 67, 0.16)' : 'transparent',
              color: activeFilter === 'IN_PROGRESS' ? '#FF9F43' : 'var(--text-secondary)',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF9F43' }} />
            In Progress ({inProgressCount})
          </button>

          <button
            onClick={() => setActiveFilter('RESOLVED')}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              border: activeFilter === 'RESOLVED' ? '1px solid #00D68F' : '1px solid var(--border-subtle)',
              background: activeFilter === 'RESOLVED' ? 'rgba(0, 214, 143, 0.16)' : 'transparent',
              color: activeFilter === 'RESOLVED' ? '#00D68F' : 'var(--text-secondary)',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D68F' }} />
            Resolved ({resolvedCount})
          </button>
        </div>
      </div>

      {/* Map Display Container with Float Controls */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '340px',
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid var(--border-glass)',
          boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Custom Map Floating Controls */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 400,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            aria-label="Zoom In"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(11, 25, 48, 0.92)',
              border: '1px solid rgba(0, 229, 229, 0.3)',
              color: '#00E5E5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            aria-label="Zoom Out"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(11, 25, 48, 0.92)',
              border: '1px solid rgba(0, 229, 229, 0.3)',
              color: '#00E5E5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={handleLocateMe}
            title="My Location (Renuka)"
            aria-label="My Location"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(11, 25, 48, 0.92)',
              border: '1px solid rgba(0, 229, 229, 0.3)',
              color: '#00D68F',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <Locate size={16} />
          </button>
          <button
            onClick={handleResetView}
            title="Reset to Hubballi Center"
            aria-label="Reset View"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(11, 25, 48, 0.92)',
              border: '1px solid rgba(0, 229, 229, 0.3)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Legend Overlay at Bottom-Left */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            zIndex: 400,
            background: 'rgba(7, 20, 38, 0.88)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0, 229, 229, 0.22)',
            borderRadius: '10px',
            padding: '7px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '11px',
            color: '#FFFFFF',
          }}
          className="map-legend-overlay"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF4757', boxShadow: '0 0 6px #FF4757' }} />
            <span>Pending</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF9F43', boxShadow: '0 0 6px #FF9F43' }} />
            <span>In Progress</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D68F', boxShadow: '0 0 6px #00D68F' }} />
            <span>Resolved</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00E5E5', boxShadow: '0 0 8px #00E5E5' }} />
            <span>Your Location</span>
          </div>
        </div>
      </div>

      <style>{`
        .civic-dark-map .leaflet-tile-pane {
          filter: invert(100%) hue-rotate(192deg) brightness(0.84) contrast(1.08) saturate(1.15);
        }
        .civic-dark-map .leaflet-control-attribution {
          background: rgba(5, 13, 26, 0.72) !important;
          color: #A8B8CC !important;
          font-size: 10px !important;
        }
        .civic-dark-map .leaflet-control-attribution a {
          color: #00E5E5 !important;
        }
        .govtech-leaflet-popup .leaflet-popup-content-wrapper {
          background: rgba(7, 20, 38, 0.96) !important;
          border: 1px solid rgba(0, 229, 229, 0.35) !important;
          border-radius: 14px !important;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6) !important;
          backdrop-filter: blur(10px) !important;
        }
        .govtech-leaflet-popup .leaflet-popup-tip {
          background: rgba(7, 20, 38, 0.96) !important;
          border: 1px solid rgba(0, 229, 229, 0.35) !important;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @media (max-width: 640px) {
          .map-legend-overlay {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
