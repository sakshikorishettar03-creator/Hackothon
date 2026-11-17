import React, { useState } from 'react';
import { Users, Phone, MapPin, Star, PlusCircle, ShieldCheck, X } from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export default function OfficerManagement() {
  const { officers, complaints, addOfficer } = useCivic();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('HDMC Water Board (24x7)');
  const [designation, setDesignation] = useState('Field Operations Engineer');
  const [phone, setPhone] = useState('+91 836-221-9100');
  const [wardZone, setWardZone] = useState('Zone F — Hubballi Central');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addOfficer({ name, department, designation, phone, wardZone });
    setModalOpen(false);
    setName('');
  };

  return (
    <div style={{ animation: 'fadeInPage 0.35s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px', flexWrap: 'wrap', marginBottom: '22px' }}>
        <div>
          <div className="badge-neon" style={{ marginBottom: '10px' }}>
            <Users size={13} /> Municipal Field Force
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Officer Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Monitor active HDMC engineers, live assigned workloads, ward coverage, and citizen ratings.
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-neon-cyan">
          <PlusCircle size={16} /> Add Field Officer
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '18px' }}>
        {officers.map((off) => {
          const activeAssigned = complaints.filter(
            (c) => c.assignedOfficerId === off.id && !['Resolved', 'Rejected'].includes(c.status)
          ).length;

          return (
            <div key={off.id} className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(0,229,229,0.22) 0%, rgba(105,92,255,0.28) 100%)',
                      border: '1px solid rgba(0,229,229,0.4)',
                      color: '#00E5E5',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{off.name}</h3>
                    <div style={{ fontSize: '12px', color: '#00E5E5' }}>{off.designation}</div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: '12px',
                    background: off.status === 'On Duty' ? 'rgba(0,214,143,0.16)' : 'rgba(255,159,67,0.16)',
                    color: off.status === 'On Duty' ? '#00D68F' : '#FF9F43',
                  }}
                >
                  {off.status}
                </span>
              </div>

              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                <div><strong>Division:</strong> {off.department}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={13} color="#00B8D9" /> {off.wardZone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={13} color="#695CFF" /> {off.phone}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#FF9F43' }}>{activeAssigned}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Active</div>
                </div>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#00D68F' }}>{off.resolvedCount}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Resolved</div>
                </div>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#00E5E5', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    {off.rating} <Star size={12} fill="#FF9F43" color="#FF9F43" />
                  </div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Rating</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div onClick={() => setModalOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1300, background: 'rgba(5,13,26,0.82)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={handleAdd} onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '460px', background: '#0B1930', border: '1px solid rgba(0,229,229,0.35)', borderRadius: '20px', padding: '24px', color: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '18px' }}>Register Field Officer</h3>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#A8B8CC', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input required placeholder="Full Name (e.g. Er. Sneha Kulkarni)" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '10px', borderRadius: '10px', background: '#050D1A', border: '1px solid rgba(0,229,229,0.3)', color: '#FFFFFF' }} />
              <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ padding: '10px', borderRadius: '10px', background: '#050D1A', border: '1px solid rgba(0,229,229,0.3)', color: '#FFFFFF' }}>
                <option value="HDMC Water Board (24x7)">HDMC Water Board (24x7)</option>
                <option value="Public Works & Roads Dept.">Public Works & Roads Dept.</option>
                <option value="Solid Waste Management">Solid Waste Management</option>
                <option value="Smart Electrical Wing">Smart Electrical Wing</option>
                <option value="Stormwater & UGD Cell">Stormwater & UGD Cell</option>
              </select>
              <input placeholder="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} style={{ padding: '10px', borderRadius: '10px', background: '#050D1A', border: '1px solid rgba(0,229,229,0.3)', color: '#FFFFFF' }} />
              <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '10px', borderRadius: '10px', background: '#050D1A', border: '1px solid rgba(0,229,229,0.3)', color: '#FFFFFF' }} />
              <input placeholder="Ward Zone" value={wardZone} onChange={(e) => setWardZone(e.target.value)} style={{ padding: '10px', borderRadius: '10px', background: '#050D1A', border: '1px solid rgba(0,229,229,0.3)', color: '#FFFFFF' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-glass-secondary" style={{ padding: '9px 15px' }}>Cancel</button>
                <button type="submit" className="btn-neon-cyan" style={{ padding: '9px 18px' }}>Add Officer</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
