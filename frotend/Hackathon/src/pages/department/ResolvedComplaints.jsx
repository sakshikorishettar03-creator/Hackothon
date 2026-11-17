import React from 'react';
import { CheckCircle2, FileSpreadsheet, Star, ShieldCheck } from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { StatusBadge, formatShortDate } from '../../components/StatusBadge';

export default function ResolvedComplaints() {
  const { complaints, showToast } = useCivic();
  const resolved = complaints.filter((c) => c.status === 'Resolved');

  const handleExport = () => {
    const header = ['Complaint ID', 'Title', 'Citizen', 'Department', 'Officer', 'Resolution Time', 'Rating'];
    const rows = resolved.map((c) => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.citizenName,
      c.department,
      c.officer,
      c.resolutionTime,
      c.rating || 'N/A',
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'HDMC_Resolved_Complaints.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Resolved Complaints archive CSV!', 'success');
  };

  return (
    <div style={{ animation: 'fadeInPage 0.35s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px', flexWrap: 'wrap', marginBottom: '22px' }}>
        <div>
          <div className="badge-neon" style={{ marginBottom: '10px' }}>
            <CheckCircle2 size={13} /> Verified Completion Archive
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Resolved Complaints ({resolved.length})</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            All verified and closed civic grievances with resolution duration and citizen satisfaction scores.
          </p>
        </div>

        <button onClick={handleExport} className="btn-neon-cyan">
          <FileSpreadsheet size={16} /> Export Resolved CSV
        </button>
      </div>

      <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass)', textAlign: 'left', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px' }}>ID</th>
              <th style={{ padding: '10px' }}>COMPLAINT</th>
              <th style={{ padding: '10px' }}>DEPARTMENT & OFFICER</th>
              <th style={{ padding: '10px' }}>VERIFICATION NOTE</th>
              <th style={{ padding: '10px' }}>RESOLUTION TIME</th>
              <th style={{ padding: '10px' }}>CITIZEN RATING</th>
              <th style={{ padding: '10px' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {resolved.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '13px' }}>
                <td style={{ padding: '14px 10px', fontWeight: 800, color: '#00E5E5' }}>{c.id}</td>
                <td style={{ padding: '14px 10px' }}>
                  <div style={{ fontWeight: 700 }}>{c.title}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {c.citizenName} • {formatShortDate(c.updatedAt)}
                  </div>
                </td>
                <td style={{ padding: '14px 10px', color: 'var(--text-secondary)' }}>
                  <div>{c.department}</div>
                  <div style={{ fontSize: '11.5px', color: '#00D68F' }}>{c.officer}</div>
                </td>
                <td style={{ padding: '14px 10px', color: 'var(--text-secondary)', maxWidth: '240px', fontSize: '12px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <ShieldCheck size={14} color="#00D68F" />
                    {c.verificationProof?.note || 'Verified complete by HDMC Command.'}
                  </span>
                </td>
                <td style={{ padding: '14px 10px', fontWeight: 700, color: '#00E5E5' }}>{c.resolutionTime}</td>
                <td style={{ padding: '14px 10px' }}>
                  {c.rating ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#FF9F43', fontWeight: 700 }}>
                      {c.rating}/5 <Star size={13} fill="#FF9F43" color="#FF9F43" />
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Awaiting</span>
                  )}
                </td>
                <td style={{ padding: '14px 10px' }}>
                  <StatusBadge status={c.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
