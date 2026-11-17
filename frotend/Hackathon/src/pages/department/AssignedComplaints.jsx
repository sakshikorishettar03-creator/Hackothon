import React, { useState, useRef } from 'react';
import {
  Briefcase,
  UserCheck,
  Calendar,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Wrench,
  X,
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { StatusBadge, PriorityBadge, formatShortDate } from '../../components/StatusBadge';

export default function AssignedComplaints() {
  const {
    complaints,
    officers,
    assignOfficer,
    updateComplaintProgress,
    verifyAndResolveComplaint,
  } = useCivic();

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusVal, setStatusVal] = useState('In Progress');
  const [noteText, setNoteText] = useState('');
  const [expectedDate, setExpectedDate] = useState('2026-11-19');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [officerIdVal, setOfficerIdVal] = useState('');
  const [verifyTicket, setVerifyTicket] = useState(null);
  const [verifyNote, setVerifyNote] = useState('Site inspected, geo-tagged completion verified by HDMC Command.');
  const [submitting, setSubmitting] = useState(false);

  const fileRef = useRef(null);

  const activeWork = complaints.filter((c) =>
    ['Accepted', 'Assigned', 'In Progress', 'Pending Verification', 'Escalated'].includes(c.status)
  );

  const openProgressModal = (ticket) => {
    setSelectedTicket(ticket);
    setStatusVal(ticket.status === 'Accepted' ? 'In Progress' : ticket.status);
    setNoteText('');
    setPhotoPreview(null);
    setExpectedDate(ticket.expectedResolutionDate || '2026-11-19');
    setOfficerIdVal(ticket.assignedOfficerId || officers[0]?.id || '');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleProgressSave = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSubmitting(true);
    try {
      if (officerIdVal && officerIdVal !== selectedTicket.assignedOfficerId) {
        await assignOfficer(selectedTicket.id, officerIdVal, expectedDate);
      }
      await updateComplaintProgress(selectedTicket.id, {
        status: statusVal,
        description: noteText,
        photo: photoPreview,
        expectedResolutionDate: expectedDate,
      });
      setSelectedTicket(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyResolve = async (e) => {
    e.preventDefault();
    if (!verifyTicket) return;
    setSubmitting(true);
    try {
      await verifyAndResolveComplaint(verifyTicket.id, {
        verificationNote: verifyNote,
      });
      setVerifyTicket(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ animation: 'fadeInPage 0.35s ease' }}>
      <div style={{ marginBottom: '22px' }}>
        <div className="badge-neon" style={{ marginBottom: '10px' }}>
          <Briefcase size={13} /> Field Operations & Resolution Management
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Assigned Complaints</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Update field progress, upload site photographs, set expected resolution dates, submit work for verification, and mark resolved.
        </p>
      </div>

      {activeWork.length === 0 ? (
        <div className="glass-card" style={{ padding: '44px', textAlign: 'center' }}>
          <CheckCircle2 size={38} color="#00D68F" style={{ marginBottom: '10px' }} />
          <h3>All assigned complaints are cleared!</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeWork.map((c) => {
            const awaitingVerify = c.status === 'Pending Verification';
            return (
              <div
                key={c.id}
                className="glass-card"
                style={{
                  padding: '22px',
                  borderLeft: awaitingVerify ? '4px solid #A855F7' : '4px solid #00E5E5',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 800, color: '#00E5E5', fontSize: '13px' }}>{c.id}</span>
                      <StatusBadge status={c.status} />
                      <PriorityBadge priority={c.priority} />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.department}</span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{c.title}</h3>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Citizen: <strong>{c.citizenName}</strong> • {c.location}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => openProgressModal(c)}
                      className="btn-glass-secondary"
                      style={{ padding: '9px 14px', fontSize: '12.5px' }}
                    >
                      <Wrench size={14} /> Update Progress & Photo
                    </button>

                    <button
                      onClick={() => {
                        setVerifyTicket(c);
                        setVerifyNote('Field work inspected & verified complete by HDMC Command Admin.');
                      }}
                      className="btn-neon-cyan"
                      style={{
                        padding: '9px 15px',
                        fontSize: '12.5px',
                        background: awaitingVerify
                          ? 'linear-gradient(135deg, #00D68F 0%, #059669 100%)'
                          : undefined,
                      }}
                    >
                      <ShieldCheck size={15} /> {awaitingVerify ? 'Verify & Mark Resolved' : 'Resolve Ticket'}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '18px',
                    flexWrap: 'wrap',
                    fontSize: '12.5px',
                    color: 'var(--text-secondary)',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <UserCheck size={14} color="#00D68F" /> Officer: <strong style={{ color: 'var(--text-primary)' }}>{c.officer}</strong>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={14} color="#00E5E5" /> Expected Date:{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>{c.expectedResolutionDate || 'Not set'}</strong>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={14} color="#FF9F43" /> Last Updated: {formatShortDate(c.updatedAt)}
                  </span>
                </div>

                {c.progressNotes?.length > 0 && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(0, 229, 229, 0.05)',
                      fontSize: '12.5px',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <strong style={{ color: '#00E5E5' }}>Latest Field Log:</strong> {c.progressNotes[0].text}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Update Progress Modal */}
      {selectedTicket && (
        <div
          onClick={() => setSelectedTicket(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1300, background: 'rgba(5,13,26,0.82)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <form
            onSubmit={handleProgressSave}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '540px', background: '#0B1930', border: '1px solid rgba(0,229,229,0.35)', borderRadius: '20px', padding: '24px', color: '#FFFFFF', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '18px' }}>Update Field Progress — {selectedTicket.id}</h3>
              <button type="button" onClick={() => setSelectedTicket(null)} style={{ background: 'transparent', border: 'none', color: '#A8B8CC', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#A8B8CC', marginBottom: '5px' }}>Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#050D1A', border: '1px solid rgba(0,229,229,0.3)', color: '#FFFFFF' }}
                >
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending Verification">Submit for Verification</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#A8B8CC', marginBottom: '5px' }}>Expected Resolution Date</label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  style={{ width: '100%', padding: '9px', borderRadius: '10px', background: '#050D1A', border: '1px solid rgba(0,229,229,0.3)', color: '#FFFFFF' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#A8B8CC', marginBottom: '5px' }}>Assigned Officer</label>
              <select
                value={officerIdVal}
                onChange={(e) => setOfficerIdVal(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#050D1A', border: '1px solid rgba(0,229,229,0.3)', color: '#FFFFFF' }}
              >
                {officers.map((off) => (
                  <option key={off.id} value={off.id}>{off.name} — {off.department}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#A8B8CC', marginBottom: '5px' }}>Progress Description *</label>
              <textarea
                required
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Describe repair progress, crew work completed, or parts replaced..."
                style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#050D1A', border: '1px solid rgba(0,229,229,0.3)', color: '#FFFFFF', fontSize: '13.5px' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#A8B8CC', marginBottom: '5px' }}>Upload Progress Photograph (Visible to Citizen)</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px dashed rgba(0,229,229,0.45)', background: 'rgba(0,229,229,0.05)', color: '#00E5E5', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Upload size={15} /> {photoPreview ? 'Change Uploaded Progress Photo' : 'Click to Upload Field Work Photo'}
              </button>
              {photoPreview && (
                <img src={photoPreview} alt="Progress preview" style={{ marginTop: '10px', maxHeight: '140px', borderRadius: '10px', objectFit: 'cover' }} />
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setSelectedTicket(null)} className="btn-glass-secondary" style={{ padding: '9px 16px' }}>Cancel</button>
              <button type="submit" disabled={submitting} className="btn-neon-cyan" style={{ padding: '9px 20px' }}>
                {submitting ? 'Syncing...' : 'Save Progress Update'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Verify & Mark Resolved Modal */}
      {verifyTicket && (
        <div
          onClick={() => setVerifyTicket(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1300, background: 'rgba(5,13,26,0.82)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <form
            onSubmit={handleVerifyResolve}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '480px', background: '#0B1930', border: '1px solid rgba(0,214,143,0.45)', borderRadius: '20px', padding: '24px', color: '#FFFFFF' }}
          >
            <h3 style={{ fontSize: '18px', color: '#00D68F', marginBottom: '6px' }}>
              Verify Completion & Resolve ({verifyTicket.id})
            </h3>
            <p style={{ fontSize: '13px', color: '#A8B8CC', marginBottom: '14px' }}>
              Marking this ticket resolved will automatically update the Citizen Dashboard and send a resolution notification to <strong>{verifyTicket.citizenName}</strong>.
            </p>
            <textarea
              required
              rows={3}
              value={verifyNote}
              onChange={(e) => setVerifyNote(e.target.value)}
              style={{ width: '100%', padding: '11px', borderRadius: '10px', background: '#050D1A', border: '1px solid rgba(0,214,143,0.4)', color: '#FFFFFF', fontSize: '13.5px', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setVerifyTicket(null)} className="btn-glass-secondary" style={{ padding: '9px 16px' }}>Cancel</button>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '9px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #00D68F 0%, #059669 100%)', color: '#050D1A', fontWeight: 800, cursor: 'pointer' }}
              >
                {submitting ? 'Verifying...' : 'Confirm & Mark Resolved'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
