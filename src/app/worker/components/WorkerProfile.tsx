"use client";

import React from "react";
import { Worker, Apartment } from "@/lib/mockStorage/types";

interface WorkerProfileProps {
  worker: Worker;
  assignedComplexes: Apartment[];
  onLogout: () => void;
}

export default function WorkerProfile({ worker, assignedComplexes, onLogout }: WorkerProfileProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} className="animate-fade-in">
      
      {/* 1. Worker Profile Summary Card */}
      <div className="worker-premium-card" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
        <div className="worker-avatar-large">🤖</div>
        
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: "4px 0 2px 0" }}>
          {worker.name}
        </h2>
        <div>
          <span className="worker-role-badge">
            👤 {worker.role === "supervisor" ? "SUPERVISOR" : "CLEANER"}
          </span>
        </div>
      </div>

      {/* 2. Detailed Metadata Card */}
      <div className="worker-premium-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <h3 style={{ fontSize: "0.875rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, borderBottom: "1px solid rgba(225, 120, 180, 0.1)", paddingBottom: "8px", margin: "0 0 4px 0" }}>
          Staff Account Info
        </h3>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem" }}>
          <span style={{ color: "#64748b", fontWeight: 500 }}>Mobile Phone:</span>
          <strong style={{ color: "#0f172a" }}>{worker.phone}</strong>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: "0.9rem" }}>
          <span style={{ color: "#64748b", fontWeight: 500 }}>Assigned Hubs:</span>
          <strong style={{ color: "#0f172a", textAlign: "right", maxWidth: "60%" }}>
            {assignedComplexes.map(c => c.name).join(", ") || "No assignments"}
          </strong>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9rem", borderTop: "1px dashed rgba(225, 120, 180, 0.1)", paddingTop: "12px", marginTop: "4px" }}>
          <span style={{ color: "#64748b", fontWeight: 500 }}>Payout Status:</span>
          <span style={{
            fontSize: "0.725rem",
            padding: "4px 10px",
            borderRadius: "6px",
            fontWeight: 700,
            background: worker.salary_status === "credited" ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)",
            border: worker.salary_status === "credited" ? "1px solid rgba(16, 185, 129, 0.15)" : "1px solid rgba(245, 158, 11, 0.15)",
            color: worker.salary_status === "credited" ? "#10b981" : "#f59e0b"
          }}>
            {worker.salary_status === "credited" ? "PAID / CREDITED ✅" : "PENDING ⏳"}
          </span>
        </div>
      </div>

      {/* 3. Action Buttons */}
      <button
        type="button"
        onClick={onLogout}
        className="btn-secondary"
        style={{
          width: "100%",
          justifyContent: "center",
          borderColor: "#ef4444",
          color: "#ef4444",
          background: "rgba(239, 68, 68, 0.05)",
          fontWeight: 700,
          marginTop: "10px"
        }}
      >
        Sign Out / Exit Shift 🚪
      </button>

    </div>
  );
}
