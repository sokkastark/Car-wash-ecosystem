"use client";

import React from "react";

export interface SkippedLogDetail {
  id: string;
  licensePlate: string;
  flatNo: string;
  apartmentName: string;
  workerName: string;
  reason: string;
  notes: string | null;
  markedAt: string | null;
}

interface DashboardOperationsFeedProps {
  skippedLogs: SkippedLogDetail[];
}

const REASON_MAP: Record<string, string> = {
  owner_away: "Owner Away ✈️",
  vehicle_not_present: "Vehicle Not Present 🚗",
  lockout: "Lockout / Security Guard Block 🔒",
  bad_weather: "Bad Weather 🌧️",
  other: "Other Reason 📦"
};

export default function DashboardOperationsFeed({ skippedLogs }: DashboardOperationsFeedProps) {
  return (
    <section className="glass-panel" style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>⚠️ Live Worker Exceptions & Skips Feed</span>
        <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'hsla(var(--warning) / 0.15)', color: 'hsl(var(--warning))', borderRadius: '99px', fontWeight: 600 }}>
          {skippedLogs.length} Skip Exception(s)
        </span>
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
        {skippedLogs.length === 0 ? (
          <div style={{ color: 'hsl(var(--text-muted))', padding: '40px 0', textAlign: 'center', fontSize: '0.9rem' }}>
            No cleaners filed skip exceptions today. All active cleanings are proceeding smoothly!
          </div>
        ) : (
          skippedLogs.map(log => (
            <div 
              key={log.id} 
              style={{ 
                background: 'hsla(var(--border-muted) / 0.2)', 
                border: '1px solid hsl(var(--border-muted))', 
                padding: '12px 14px', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'white', fontFamily: 'monospace' }}>
                    {log.licensePlate}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                    Flat {log.flatNo} ({log.apartmentName})
                  </span>
                </div>
                
                <span style={{ fontSize: '0.8rem', display: 'block', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>
                  Washer: <b>{log.workerName}</b>
                </span>
                
                {log.notes && (
                  <span style={{ fontSize: '0.75rem', display: 'block', color: 'hsl(var(--text-muted))', fontStyle: 'italic', marginTop: '4px' }}>
                    Notes: "{log.notes}"
                  </span>
                )}
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span 
                  className="status-badge skipped" 
                  style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    padding: '3px 8px', 
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  {REASON_MAP[log.reason] || log.reason}
                </span>
                {log.markedAt && (
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                    Filed at {new Date(log.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
