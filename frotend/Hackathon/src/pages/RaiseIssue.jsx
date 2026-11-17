import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  PlusCircle,
  MapPin,
  Upload,
  Crosshair,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Trash2,
  Building,
  Sparkles,
} from 'lucide-react';
import { ISSUE_CATEGORIES, HUBBALLI_DHARWAD_WARDS } from '../data/mockData';
import { useCivic } from '../context/CivicContext';

const PRIORITIES = [
  { id: 'Low', color: '#00D68F' },
  { id: 'Medium', color: '#00E5E5' },
  { id: 'High', color: '#FF9F43' },
  { id: 'Critical', color: '#FF4757' },
];

export default function RaiseIssue() {
  const { addComplaint, theme, showToast } = useCivic();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(ISSUE_CATEGORIES[0].id);
  const [priority, setPriority] = useState('High');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Hubballi-Dharwad');
  const [area, setArea] = useState('Vidyanagar');
  const [location, setLocation] = useState('');
  const [ward, setWard] = useState(HUBBALLI_DHARWAD_WARDS[1]);
  const [coords, setCoords] = useState({ lat: 15.3647, lng: 75.124 });
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageName, setImageName] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [error, setError] = useState('');

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Interactive mini-map for GPS pin selection
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    if (theme === 'dark') {
      mapRef.current.classList.add('civic-dark-map');
    }

    const pinIcon = L.divIcon({
      className: 'raise-issue-pin',
      html: `<div style="width:20px;height:20px;border-radius:50%;background:#00E5E5;border:3px solid #050D1A;box-shadow:0 0 16px #00E5E5;"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const marker = L.marker([coords.lat, coords.lng], { icon: pinIcon, draggable: true }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setCoords({ lat: pos.lat, lng: pos.lng });
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapInstance.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  const handleDetectGPS = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(next);
          mapInstance.current?.setView([next.lat, next.lng], 15);
          markerRef.current?.setLatLng([next.lat, next.lng]);
          if (!location) setLocation('Current GPS Location, Hubballi-Dharwad');
          setLocating(false);
          showToast('GPS coordinates locked accurately!', 'info');
        },
        () => {
          // Graceful Hubballi-Dharwad smart fallback
          const fallback = { lat: 15.3692, lng: 75.1217 };
          setCoords(fallback);
          mapInstance.current?.setView([fallback.lat, fallback.lng], 15);
          markerRef.current?.setLatLng([fallback.lat, fallback.lng]);
          if (!location) setLocation('Vidyanagar Main Road, Hubballi');
          setLocating(false);
          showToast('Pinned to Vidyanagar, Hubballi GPS sector.', 'info');
        },
        { timeout: 5000 }
      );
    } else {
      setLocating(false);
      showToast('Click anywhere on the map to place your GPS pin.', 'info');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim() || !city.trim() || !area.trim()) {
      setError('Please complete title, city, area, exact location, and description.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const cat = ISSUE_CATEGORIES.find((c) => c.id === categoryId) || ISSUE_CATEGORIES[0];
      const created = await addComplaint({
        title: title.trim(),
        categoryId: cat.id,
        category: cat.label,
        categoryLabel: cat.label,
        department: cat.department,
        priority,
        description: description.trim(),
        city: city.trim(),
        area: area.trim(),
        location: location.trim(),
        ward,
        lat: coords.lat,
        lng: coords.lng,
        imagePreview,
      });
      setSubmittedTicket(created);
    } catch (err) {
      setError(err.message || 'Failed to submit complaint to server.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedTicket) {
    return (
      <div className="glass-card" style={{ padding: '40px 28px', maxWidth: '640px', margin: '24px auto', textAlign: 'center' }}>
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '20px',
            background: 'rgba(0, 214, 143, 0.16)',
            border: '1.5px solid #00D68F',
            color: '#00D68F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 30px rgba(0, 214, 143, 0.35)',
          }}
        >
          <CheckCircle2 size={38} />
        </div>
        <div className="badge-neon" style={{ marginBottom: '12px' }}>
          <Sparkles size={13} /> Grievance Registered on Live Grid
        </div>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Ticket {submittedTicket.id} Created</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', maxWidth: '460px', margin: '0 auto 24px' }}>
          Your report <strong>"{submittedTicket.title}"</strong> has been routed to{' '}
          <strong style={{ color: '#00E5E5' }}>{submittedTicket.department}</strong> and pinned on the Live City Map.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            textAlign: 'left',
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(0, 229, 229, 0.05)',
            border: '1px solid var(--border-glass)',
            marginBottom: '26px',
            fontSize: '13px',
          }}
        >
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>WARD</div>
            <div style={{ fontWeight: 600 }}>{submittedTicket.ward}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>GPS COORDINATES</div>
            <div style={{ fontWeight: 600 }}>
              {submittedTicket.lat.toFixed(4)}°N, {submittedTicket.lng.toFixed(4)}°E
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/track-status?id=${submittedTicket.id}`)}
            className="btn-neon-cyan"
          >
            Track Live Status <ArrowRight size={16} />
          </button>
          <button
            onClick={() => {
              setSubmittedTicket(null);
              setTitle('');
              setDescription('');
              setLocation('');
              setImagePreview(null);
              setImageName('');
            }}
            className="btn-glass-secondary"
          >
            Report Another Issue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeInPage 0.35s ease' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <div className="badge-neon" style={{ marginBottom: '10px' }}>
          <span className="badge-pulse-dot" /> Citizen Reporting Portal
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Raise a Civic Issue</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Submit geo-tagged grievances directly to Hubballi-Dharwad Municipal Corporation rapid response teams.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="raise-issue-grid">
        {/* Left Main Form */}
        <div className="glass-card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 71, 87, 0.14)',
                border: '1px solid rgba(255, 71, 87, 0.4)',
                color: '#FF4757',
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="cf-label">Complaint Title *</label>
            <input
              type="text"
              className="cf-input"
              placeholder="e.g. Burst water pipeline near Vidyanagar Circle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Category Grid */}
          <div>
            <label className="cf-label">Issue Category *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: '10px' }}>
              {ISSUE_CATEGORIES.map((cat) => {
                const active = cat.id === categoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      background: active ? `${cat.color}1C` : 'rgba(255, 255, 255, 0.025)',
                      border: active ? `1.5px solid ${cat.color}` : '1px solid var(--border-subtle)',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 700, fontSize: '13px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
                      {cat.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      SLA: {cat.sla}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority + Ward */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label className="cf-label">Urgency / Priority</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {PRIORITIES.map((p) => {
                  const active = priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      style={{
                        padding: '9px 6px',
                        borderRadius: '10px',
                        border: active ? `1.5px solid ${p.color}` : '1px solid var(--border-subtle)',
                        background: active ? `${p.color}20` : 'transparent',
                        color: active ? p.color : 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {p.id}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="cf-label">Ward Number *</label>
              <select className="cf-input" value={ward} onChange={(e) => setWard(e.target.value)}>
                {HUBBALLI_DHARWAD_WARDS.slice(1).map((w) => (
                  <option key={w} value={w} style={{ background: '#0B1930', color: '#FFFFFF' }}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* City + Area */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label className="cf-label">City *</label>
              <input
                type="text"
                className="cf-input"
                placeholder="Hubballi-Dharwad"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <label className="cf-label">Area / Locality *</label>
              <input
                type="text"
                className="cf-input"
                placeholder="e.g. Vidyanagar, KCD Road, Gokul Road"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="cf-label">Exact Landmark / Location Address *</label>
            <input
              type="text"
              className="cf-input"
              placeholder="e.g. Opposite KIMS Main Gate, PB Road, Hubballi"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="cf-label">Detailed Description *</label>
            <textarea
              rows={4}
              className="cf-input"
              placeholder="Describe the severity, hazard to commuters/residents, and how long it has persisted..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="cf-label">Evidence Photo (Optional)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '1.5px dashed rgba(0, 229, 229, 0.35)',
                  borderRadius: '14px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'rgba(0, 229, 229, 0.04)',
                }}
              >
                <Upload size={26} color="#00E5E5" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Click to upload site photo</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  JPG, PNG or WebP — geo-tagged photos speed up resolution
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  padding: '12px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-glass)',
                  background: 'rgba(0, 229, 229, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={imagePreview}
                    alt="Uploaded evidence"
                    style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{imageName}</div>
                    <div style={{ fontSize: '11.5px', color: '#00D68F' }}>Ready for dispatch attachment</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageName('');
                  }}
                  style={{
                    background: 'rgba(255, 71, 87, 0.14)',
                    border: 'none',
                    color: '#FF4757',
                    padding: '8px',
                    borderRadius: '9px',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '6px' }}>
            <button type="submit" disabled={submitting} className="btn-neon-cyan" style={{ padding: '13px 28px' }}>
              <PlusCircle size={18} /> {submitting ? 'Submitting to HDMC Command...' : 'Submit Municipal Complaint'}
            </button>
          </div>
        </div>

        {/* Right Side: Interactive GPS Pin Picker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="#00E5E5" />
                <h3 style={{ fontSize: '16px' }}>GPS Location Pin</h3>
              </div>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={locating}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 229, 229, 0.4)',
                  background: 'rgba(0, 229, 229, 0.12)',
                  color: '#00E5E5',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Crosshair size={14} /> {locating ? 'Locating...' : 'Detect GPS'}
              </button>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Click anywhere on the map or drag the cyan marker to pinpoint the exact civic hazard.
            </p>

            <div
              ref={mapRef}
              style={{
                width: '100%',
                height: '280px',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid var(--border-glass)',
                marginBottom: '14px',
              }}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                fontSize: '12.5px',
              }}
            >
              <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,229,229,0.06)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>LATITUDE</div>
                <strong style={{ color: '#00E5E5' }}>{coords.lat.toFixed(5)}° N</strong>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,229,229,0.06)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>LONGITUDE</div>
                <strong style={{ color: '#00E5E5' }}>{coords.lng.toFixed(5)}° E</strong>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Building size={17} color="#695CFF" />
              <h4 style={{ fontSize: '15px' }}>Auto-Routing Department</h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Selected issue will be automatically dispatched to{' '}
              <strong style={{ color: '#00E5E5' }}>
                {ISSUE_CATEGORIES.find((c) => c.id === categoryId)?.department}
              </strong>{' '}
              with a guaranteed municipal SLA response window of{' '}
              <strong>{ISSUE_CATEGORIES.find((c) => c.id === categoryId)?.sla}</strong>.
            </p>
          </div>
        </div>
      </form>

      <style>{`
        .civic-dark-map .leaflet-tile-pane {
          filter: invert(100%) hue-rotate(192deg) brightness(0.84) contrast(1.08) saturate(1.15);
        }
        .raise-issue-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }
        .cf-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .cf-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 11px;
          background: rgba(5, 13, 26, 0.55);
          border: 1px solid var(--border-glass);
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        [data-theme='light'] .cf-input {
          background: #F8FAFC;
        }
        .cf-input:focus {
          border-color: #00E5E5;
          box-shadow: 0 0 0 3px rgba(0, 229, 229, 0.14);
        }
        @media (max-width: 1060px) {
          .raise-issue-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
