"use client";

import React from "react";

interface CustomerLoginProps {
  customerId: string;
  setCustomerId: (id: string) => void;
  errorMessage: string | null;
  handleLogin: (e: React.FormEvent) => void;
}

export default function CustomerLogin({
  customerId,
  setCustomerId,
  errorMessage,
  handleLogin
}: CustomerLoginProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "10px 16px", textAlign: "center" }} className="animate-fade-in">
      
      {/* 1. Centered Customer Welcome Vector Graphic */}
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
        <img 
          src="/customer_welcome.png" 
          alt="Welcome Resident Illustration" 
          style={{ 
            width: "250px", 
            height: "250px", 
            objectFit: "contain",
            borderRadius: "32px",
            filter: "drop-shadow(0 15px 30px rgba(158, 168, 253, 0.25))"
          }} 
        />
      </div>

      {/* 2. Frosted Glass Sign-In Panel */}
      <div className="glass-panel" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <header style={{ textAlign: "center" }}>
          <span style={{ fontSize: "0.8rem", color: "#9ea8fd", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Resident Operations Portal
          </span>
          <h1 style={{ fontSize: "1.75rem", marginTop: "6px", fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-title)" }}>
            Just checking in
          </h1>
          <p style={{ color: "#475569", fontSize: "0.95rem", marginTop: "6px", lineHeight: "1.4" }}>
            Unlock your dashboard to audit daily wash logs, view Sunday interior schedules, and file supervisor support requests.
          </p>
        </header>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {errorMessage && (
            <div style={{ fontSize: "0.85rem", color: "hsl(var(--danger))", padding: "4px" }}>
              ⚠️ {errorMessage}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }}>
            <label style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 600 }}>Gated Resident ID:</label>
            <input 
              type="text" 
              value={customerId} 
              onChange={(e) => setCustomerId(e.target.value.replace(/[^A-Z0-9]/gi, "").toUpperCase())} 
              placeholder="e.g. A1J5A9Y4"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              inputMode="text"
              style={{
                padding: "16px 20px",
                background: "rgba(255, 255, 255, 0.6)",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                borderRadius: "9999px",
                color: "#0f172a",
                fontSize: "1.1rem",
                outline: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.01)",
                letterSpacing: "0.08em",
                fontWeight: 700,
                fontFamily: "monospace"
              }}
            />
          </div>

          {/* Pitch-black pill button style matching breaks modal */}
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              justifyContent: "center", 
              padding: "16px", 
              borderRadius: "9999px",
              fontWeight: 700,
              fontSize: "0.95rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}
          >
            Unlock Dashboard 🔑
          </button>
        </form>
      </div>

    </div>
  );
}
