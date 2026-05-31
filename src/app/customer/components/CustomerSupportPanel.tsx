"use client";

import React from "react";

interface CustomerSupportPanelProps {
  activeComplaints: any[];
  complaintText: string;
  setComplaintText: (txt: string) => void;
  complaintSuccess: boolean;
  onSubmit: (e: React.FormEvent) => void;
  customer: any;
  assignedWasher: { name: string; phone: string } | null;
  assignedSupervisor: { name: string; phone: string } | null;
}

export default function CustomerSupportPanel({
  activeComplaints,
  complaintText,
  setComplaintText,
  complaintSuccess,
  onSubmit,
  customer,
  assignedWasher,
  assignedSupervisor
}: CustomerSupportPanelProps) {
  return (
    <section className="glass-panel" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1rem', color: '#475569', marginBottom: '14px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>
        Operations & Support Feed
      </h2>

      {/* 📞 Direct Staff Contact Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>
          Contact Assigned Field Staff
        </span>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {assignedWasher && (
            <div style={{
              flex: "1 1 calc(50% - 6px)",
              minWidth: "200px",
              background: "rgba(255, 255, 255, 0.45)",
              border: "1px solid rgba(158, 168, 253, 0.15)",
              borderRadius: "20px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              transition: "var(--transition-smooth)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.5rem" }}>👷</span>
                <div>
                  <span style={{ fontSize: "0.725rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em", display: "block" }}>
                    Assigned Cleaner
                  </span>
                  <strong style={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 800 }}>
                    {assignedWasher.name}
                  </strong>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <a 
                  href={`tel:${assignedWasher.phone}`}
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    padding: "8px 12px !important",
                    borderRadius: "12px !important",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    textDecoration: "none",
                    boxShadow: "none"
                  }}
                >
                  📞 Call
                </a>
                <a 
                  href={`https://wa.me/${assignedWasher.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${assignedWasher.name}, I am a resident from ${customer.apartmentName} Block ${customer.blockName} (${customer.flatNo}). I am contacting you regarding my vehicle wash...`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    textDecoration: "none",
                    background: "#25D366",
                    color: "white",
                    border: "none",
                    fontFamily: "var(--font-title)",
                    boxShadow: "0 4px 12px rgba(37, 211, 102, 0.2)"
                  }}
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          )}

          {assignedSupervisor && (
            <div style={{
              flex: "1 1 calc(50% - 6px)",
              minWidth: "200px",
              background: "rgba(255, 255, 255, 0.45)",
              border: "1px solid rgba(158, 168, 253, 0.15)",
              borderRadius: "20px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              transition: "var(--transition-smooth)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.5rem" }}>📋</span>
                <div>
                  <span style={{ fontSize: "0.725rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em", display: "block" }}>
                    Operations Supervisor
                  </span>
                  <strong style={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 800 }}>
                    {assignedSupervisor.name}
                  </strong>
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <a 
                  href={`tel:${assignedSupervisor.phone}`}
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    padding: "8px 12px !important",
                    borderRadius: "12px !important",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    textDecoration: "none",
                    boxShadow: "none"
                  }}
                >
                  📞 Call
                </a>
                <a 
                  href={`https://wa.me/${assignedSupervisor.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi ${assignedSupervisor.name}, I am a resident from ${customer.apartmentName} Block ${customer.blockName} (${customer.flatNo}). I am contacting you regarding our apartment complex service operations...`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    textDecoration: "none",
                    background: "#25D366",
                    color: "white",
                    border: "none",
                    fontFamily: "var(--font-title)",
                    boxShadow: "0 4px 12px rgba(37, 211, 102, 0.2)"
                  }}
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {activeComplaints.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}>
            Active Logged Complaints ({activeComplaints.length})
          </span>
          {activeComplaints.map(comp => (
            <div 
              key={comp.id} 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                background: "rgba(255, 255, 255, 0.45)", 
                border: "1px solid rgba(158, 168, 253, 0.15)", 
                padding: "14px 16px", 
                borderRadius: "16px" 
              }}
            >
              <div style={{ fontSize: "0.85rem", maxWidth: "78%" }}>
                <p style={{ margin: "0 0 4px 0", color: "#0f172a", fontWeight: 600, lineHeight: "1.4" }}>{comp.details}</p>
                <span style={{ fontSize: "0.725rem", color: "#94a3b8", fontFamily: "monospace" }}>Filed on {comp.date}</span>
              </div>
              <span 
                className="status-badge"
                style={{
                  textTransform: 'uppercase',
                  fontSize: '0.675rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  background: comp.status === "resolved" ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)",
                  color: comp.status === "resolved" ? "#10b981" : "#f59e0b",
                  border: comp.status === "resolved" ? "1px solid rgba(16, 185, 129, 0.15)" : "1px solid rgba(245, 158, 11, 0.15)"
                }}
              >
                {comp.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {complaintSuccess && (
          <div style={{ color: "#10b981", fontSize: "0.85rem", background: "rgba(16, 185, 129, 0.08)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(16, 185, 129, 0.15)", fontWeight: 600 }}>
            ✔ Report sent to operations support. A supervisor will check with cleaners shortly.
          </div>
        )}
        
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 600 }}>Report a missed cleaning or request help:</label>
          <textarea 
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            placeholder="e.g. Missed washing on my car yesterday morning, or wiper blade details..."
            style={{
              padding: "14px",
              background: "rgba(255, 255, 255, 0.8)",
              border: "1px solid rgba(158, 168, 253, 0.2)",
              borderRadius: "14px",
              color: "#0f172a",
              fontSize: "0.9rem",
              minHeight: "90px",
              resize: "vertical",
              outline: "none",
              transition: "all 0.2s ease"
            }}
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          style={{ justifyContent: "center", padding: "14px", borderRadius: "9999px" }} 
          disabled={!complaintText.trim()}
        >
          💬 Contact Operations Support
        </button>
      </form>
    </section>
  );
}
