"use client";

import React from "react";

interface AddInflowFormProps {
  inflowAmount: string;
  setInflowAmount: (val: string) => void;
  inflowDescription: string;
  setInflowDescription: (val: string) => void;
  inflowDate: string;
  setInflowDate: (val: string) => void;
  inflowStatus: "paid" | "pending" | "deferred";
  setInflowStatus: (val: "paid" | "pending" | "deferred") => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function AddInflowForm({
  inflowAmount,
  setInflowAmount,
  inflowDescription,
  setInflowDescription,
  inflowDate,
  setInflowDate,
  inflowStatus,
  setInflowStatus,
  onSubmit,
  onCancel
}: AddInflowFormProps) {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "hsl(var(--text-secondary))" }}>Payment Amount (₹)</label>
        <input 
          type="number" required value={inflowAmount} onChange={e => setInflowAmount(e.target.value)} placeholder="e.g. 500" 
          style={{ padding: "10px 12px", background: "hsl(var(--bg-input))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white", fontSize: "0.95rem", outline: "none" }}
        />
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "hsl(var(--text-secondary))" }}>Date</label>
        <input 
          type="date" required value={inflowDate} onChange={e => setInflowDate(e.target.value)} 
          style={{ padding: "10px 12px", background: "hsl(var(--bg-input))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white", fontSize: "0.95rem", outline: "none" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "hsl(var(--text-secondary))" }}>Payment Status</label>
        <select 
          value={inflowStatus} onChange={e => setInflowStatus(e.target.value as any)} 
          style={{ padding: "10px 12px", background: "hsl(var(--bg-input))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white", fontSize: "0.95rem", outline: "none", cursor: "pointer" }}
        >
          <option value="paid">Paid 🟢</option>
          <option value="pending">Pending 🟡</option>
          <option value="deferred">Will Pay Next Month 🔵</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "hsl(var(--text-secondary))" }}>Description / Notes</label>
        <input 
          type="text" required value={inflowDescription} onChange={e => setInflowDescription(e.target.value)} placeholder="e.g. Extra service, Tip" 
          style={{ padding: "10px 12px", background: "hsl(var(--bg-input))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white", fontSize: "0.95rem", outline: "none" }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
        <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
          Save Inflow
        </button>
      </div>
    </form>
  );
}
