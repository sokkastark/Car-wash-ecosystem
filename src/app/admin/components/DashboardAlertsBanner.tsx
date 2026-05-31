"use client";

import React from "react";

interface DashboardAlertsBannerProps {
  oldComplaintsCount: number;
  absentWorkersCount: number;
  consecutiveSkipsCount: number;
}

export default function DashboardAlertsBanner({
  oldComplaintsCount,
  absentWorkersCount,
  consecutiveSkipsCount
}: DashboardAlertsBannerProps) {
  const hasAlerts = oldComplaintsCount > 0 || absentWorkersCount > 0 || consecutiveSkipsCount > 0;

  if (!hasAlerts) return null;

  return (
    <div 
      className="glass-panel animate-fade-in" 
      style={{ 
        padding: '16px 20px', 
        marginBottom: '32px', 
        background: 'hsla(var(--warning) / 0.1)',
        border: '1px solid hsla(var(--warning) / 0.3)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '1.2rem' }}>⚠️</span>
        <strong style={{ color: 'hsl(var(--warning))', fontSize: '1rem', fontWeight: 700 }}>
          Operational Alerts & System Health Warnings
        </strong>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
        {oldComplaintsCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'hsl(var(--danger))', fontWeight: 'bold' }}>• Dues Open &gt; 24h:</span>
            <span><b>{oldComplaintsCount}</b> resident complaint(s) unresolved.</span>
          </div>
        )}

        {absentWorkersCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'hsl(var(--warning))', fontWeight: 'bold' }}>• Staff Absences:</span>
            <span><b>{absentWorkersCount}</b> active cleaner(s) marked absent today.</span>
          </div>
        )}

        {consecutiveSkipsCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}>• Left Resident Risks:</span>
            <span><b>{consecutiveSkipsCount}</b> vehicle(s) skipped for 3 consecutive days.</span>
          </div>
        )}
      </div>
    </div>
  );
}
