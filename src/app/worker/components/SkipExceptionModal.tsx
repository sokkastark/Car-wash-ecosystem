"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";

interface SkipExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, notes: string) => void;
  vehicleLicense: string;
}

const REASONS = [
  { id: "owner_away", label: "Owner Away ✈️" },
  { id: "vehicle_not_present", label: "Vehicle Not Present 🚗" },
  { id: "lockout", label: "Lockout / Security Guard Block 🔒" },
  { id: "bad_weather", label: "Bad Weather 🌧️" },
  { id: "other", label: "Other Exception 📦" }
];

export default function SkipExceptionModal({
  isOpen,
  onClose,
  onSubmit,
  vehicleLicense
}: SkipExceptionModalProps) {
  const [selectedReason, setSelectedReason] = useState("owner_away");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedReason, notes);
    setSelectedReason("owner_away");
    setNotes("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report Skip Exception: ${vehicleLicense}`}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "hsl(var(--text-secondary))" }}>
            Select Skip Reason (Required):
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {REASONS.map(r => {
              const active = selectedReason === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReason(r.id)}
                  style={{
                    padding: "12px",
                    background: active ? "hsla(var(--warning) / 0.15)" : "rgba(255,255,255,0.02)",
                    border: active ? "1px solid hsl(var(--warning))" : "1px solid hsl(var(--border-muted))",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontWeight: active ? 700 : 500,
                    transition: "var(--transition-smooth)"
                  }}
                >
                  <div style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    border: "2px solid",
                    borderColor: active ? "hsl(var(--warning))" : "hsl(var(--text-secondary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {active && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "hsl(var(--warning))" }} />}
                  </div>
                  <span style={{ color: active ? "white" : "hsl(var(--text-secondary))" }}>
                    {r.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "hsl(var(--text-secondary))" }}>
            Optional Comments / Notes:
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Owner informed via call"
            style={{
              padding: "10px 12px",
              background: "hsl(var(--bg-input))",
              border: "1px solid hsl(var(--border-muted))",
              borderRadius: "var(--radius-md)",
              color: "white",
              fontSize: "0.95rem",
              outline: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
          <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem", background: "hsl(var(--warning))", color: "black", border: "none" }}>
            Submit Skip Reason ⚠️
          </button>
        </div>
      </form>
    </Modal>
  );
}
