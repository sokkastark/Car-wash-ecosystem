"use client";

import React, { useState } from "react";
import { Worker } from "@/lib/mockStorage/types";

interface WorkerLoginProps {
  workers: Worker[];
  onLoginSuccess: (worker: Worker) => void;
}

export default function WorkerLogin({ workers, onLoginSuccess }: WorkerLoginProps) {
  const [phoneInput, setPhoneInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showDemoList, setShowDemoList] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanInput = phoneInput.replace(/[^0-9]/g, "");
    if (!cleanInput) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }

    const matched = workers.find(w => {
      const cleanPhone = w.phone.replace(/[^0-9]/g, "");
      // Compare the last 10 digits of both numbers to allow flexible login with/without country code (+91)
      const phoneLast10 = cleanPhone.slice(-10);
      const inputLast10 = cleanInput.slice(-10);
      return phoneLast10 === inputLast10;
    });

    if (matched) {
      if (!matched.is_active) {
        setErrorMsg("This worker profile is currently marked inactive.");
        return;
      }
      onLoginSuccess(matched);
    } else {
      setErrorMsg("Phone number not registered. Ask admin for credentials.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "10px 4px", textAlign: "center" }} className="animate-fade-in">
      
      {/* 1. Premium Vector Illustration Graphic */}
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "center" }}>
        <img 
          src="/worker_welcome.png" 
          alt="Welcome Illustration" 
          style={{ 
            width: "220px", 
            height: "220px", 
            objectFit: "contain",
            borderRadius: "32px",
            filter: "drop-shadow(0 15px 30px rgba(168, 85, 247, 0.25))"
          }} 
        />
      </div>

      {/* 2. Bold Greetings Header & Captions */}
      <div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", fontFamily: "var(--font-title)", margin: 0 }}>
          Welcome to SV Roster
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem", marginTop: "8px", lineHeight: "1.45", margin: 0 }}>
          Coordinate your shift, verify your geofence location, and manage your vehicle checklist.
        </p>
      </div>

      {/* 3. Onboarding Sign-In Form */}
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "6px" }}>
        <input
          type="tel"
          value={phoneInput}
          onChange={e => setPhoneInput(e.target.value)}
          placeholder="Enter registered mobile number"
          style={{
            padding: "16px 20px",
            background: "#ffffff",
            border: "1px solid rgba(225, 120, 180, 0.15)",
            borderRadius: "9999px",
            color: "#0f172a",
            fontSize: "1rem",
            outline: "none",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(168, 85, 247, 0.05)",
            transition: "all 0.2s ease"
          }}
        />

        {errorMsg && (
          <div style={{ fontSize: "0.85rem", color: "#ef4444", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Pill buttons matching email/facebook welcome style */}
        <button 
          type="submit" 
          className="btn-primary" 
          style={{ 
            justifyContent: "center", 
            width: "100%",
            borderRadius: "9999px"
          }}
        >
          Sign In 🔑
        </button>

        <button 
          type="button"
          onClick={() => setShowDemoList(!showDemoList)}
          className="btn-secondary" 
          style={{ 
            justifyContent: "center", 
            width: "100%",
            borderRadius: "9999px",
            marginTop: "4px"
          }}
        >
          Demo Worker Roster 👥
        </button>
      </form>

      {/* 4. Autofill Credentials List Drawer */}
      {showDemoList && (
        <div className="worker-premium-card animate-fade-in" style={{ padding: "18px !important", display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px", textAlign: "left" }}>
          <p style={{ fontSize: "0.825rem", color: "#64748b", margin: 0, fontWeight: 500 }}>
            Tap on any registered field cleaner profile below to autofill and verify sign-in:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
            {workers.filter(w => w.is_active).slice(0, 3).map(w => (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  setPhoneInput(w.phone);
                  setErrorMsg("");
                  setShowDemoList(false);
                }}
                style={{
                  background: "rgba(168, 85, 247, 0.03)",
                  border: "1px dashed rgba(168, 85, 247, 0.25)",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  textAlign: "left",
                  color: "#0f172a",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s ease"
                }}
              >
                <span>👤 <strong>{w.name}</strong> <span style={{ color: "#a855f7", fontSize: "0.75rem", fontWeight: 700, marginLeft: "4px", textTransform: "uppercase" }}>({w.role})</span></span>
                <span style={{ color: "#a855f7", fontWeight: 700 }}>{w.phone}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
