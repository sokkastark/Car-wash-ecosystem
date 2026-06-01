"use client";

import React, { useState } from "react";
import { Apartment } from "@/lib/mockStorage/types";
import { useAttendanceGPS } from "../hooks/useAttendanceGPS";

interface WorkerAttendanceProps {
  assignedComplexes: Apartment[];
  onCheckIn: (complexId: string, timeStr: string, lat: number, lng: number) => void;
  onCheckOut: (timeStr: string) => void;
  onResetSession: () => void;
  session: { checkedIn: boolean; checkedOut: boolean; checkInTime: string | null; checkOutTime: string | null; complexId: string | null; lat: number | null; lng: number | null; };
  finishedCount: number;
  totalCount: number;
  activeWorkerName: string;
  activeWorkerRole: string;
  assistantMessage: string;
  setActiveTab: (tab: "attendance" | "checklist" | "profile" | "settings") => void;
  onSyncRoster?: () => void;
}

export default function WorkerAttendance({
  assignedComplexes, onCheckIn, onCheckOut, onResetSession, session, finishedCount, totalCount, activeWorkerName, activeWorkerRole, assistantMessage, setActiveTab, onSyncRoster
}: WorkerAttendanceProps) {
  const {
    selectedComplexId, setSelectedComplexId, gpsLoading, gpsError, timerText, handleGPSCheckIn, handleCheckOut
  } = useAttendanceGPS(assignedComplexes, session, onCheckIn, onCheckOut);

  const [wantsCheckIn, setWantsCheckIn] = useState(false);

  const getGreetingText = () => {
    const hr = new Date().getHours();
    let greeting = "Good morning";
    if (hr >= 12 && hr < 16) greeting = "Good afternoon";
    else if (hr >= 16 && hr < 21) greeting = "Good evening";
    else if (hr >= 21 || hr < 4) greeting = "Good night";
    const icon = hr >= 6 && hr < 17 ? "☀️" : hr >= 17 && hr < 20 ? "🌤️" : "🌙";
    return `Hey ${activeWorkerName.split(" ")[0]}, ${greeting}! ${icon}`;
  };

  const activeComplex = assignedComplexes.find(c => c.id === (session.complexId || selectedComplexId));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} className="animate-fade-in">
      
      {/* 1. Profile Avatar Banner (shown only on the Attendance landing states) */}
      {!session.checkedIn && (
        <div style={{ textAlign: "center", margin: "10px 0 15px 0" }}>
          <div className="worker-avatar-large">🤖</div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: "4px 0" }}>
            {activeWorkerName}
          </h2>
          <span className="worker-role-badge">
            👤 {activeWorkerRole === "supervisor" ? "SUPERVISOR" : "CLEANER"}
          </span>
        </div>
      )}

      {/* 2. Conversational Chat Card from SV Operations Assistant */}
      <div className="worker-premium-card" style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
        <div className="worker-avatar-small">🤖</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
          <strong style={{ fontSize: "0.725rem", color: "#a855f7", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.05em" }}>
            SV Operations Assistant
          </strong>
          <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", margin: "2px 0 4px 0" }}>
            {session.checkedIn ? "Active Shift Tasks" : getGreetingText()}
          </h4>
          <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.45", margin: 0 }}>
            {session.checkedIn ? assistantMessage : "Ready to start your shift check-in? Or do you want to see which vehicles are on your list first?"}
          </p>
        </div>
      </div>

      {/* 3. Interactive Conversational Flow Panel */}
      {gpsLoading ? (
        <div className="worker-premium-card" style={{ padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", textAlign: "center" }}>
          <div style={{ width: "50px", height: "50px", borderRadius: "50%", border: "3px solid rgba(168, 85, 247, 0.15)", borderTopColor: "#a855f7", animation: "spin 1s linear infinite" }} />
          <span style={{ fontSize: "0.95rem", color: "#475569", fontWeight: 600 }}>Scanning GPS Coordinates...</span>
        </div>
      ) : !session.checkedIn ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {!wantsCheckIn ? (
            <>
              {/* Sync Roster Banner — shown when no complexes are assigned yet */}
              {assignedComplexes.length === 0 && (
                <div className="worker-premium-card" style={{ display: "flex", gap: "14px", alignItems: "center", padding: "14px !important", background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.2) !important" }}>
                  <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: "0.8rem", color: "#f59e0b", display: "block", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>No Complexes Assigned</strong>
                    <p style={{ fontSize: "0.8rem", color: "#475569", margin: 0, marginTop: "2px" }}>Ask your admin to assign you to a complex, then tap Sync below.</p>
                  </div>
                  {onSyncRoster && (
                    <button
                      type="button"
                      onClick={onSyncRoster}
                      style={{ background: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.3)", color: "#a855f7", borderRadius: "12px", padding: "8px 14px", fontSize: "0.775rem", fontWeight: 700, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}
                    >
                      🔄 Sync
                    </button>
                  )}
                </div>
              )}

              {/* Option A: Preview Vehicles */}
              <div 
                className="worker-premium-card clickable" onClick={() => setActiveTab("checklist")}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "18px"
                }}
              >
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "50%", 
                  background: "rgba(251, 146, 60, 0.1)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontSize: "1.4rem",
                  flexShrink: 0
                }}>
                  📋
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "1.05rem", color: "#0f172a", fontWeight: 700, margin: 0 }}>Show My Vehicles List</h3>
                  <p style={{ fontSize: "0.825rem", color: "#64748b", marginTop: "4px", lineHeight: "1.4", margin: 0 }}>
                    View blocks, slot details, and subscriptions assigned to you today.
                  </p>
                </div>
                <span style={{ fontSize: "1.5rem", color: "#a855f7", fontWeight: 300, paddingLeft: "10px" }}>›</span>
              </div>

              {/* Option B: Geofence Checkin */}
              <div 
                className="worker-premium-card clickable" onClick={() => setWantsCheckIn(true)}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "18px"
                }}
              >
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "50%", 
                  background: "rgba(244, 114, 182, 0.1)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  fontSize: "1.4rem",
                  flexShrink: 0
                }}>
                  📍
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "1.05rem", color: "#0f172a", fontWeight: 700, margin: 0 }}>Verify GPS & Check In</h3>
                  <p style={{ fontSize: "0.825rem", color: "#64748b", marginTop: "4px", lineHeight: "1.4", margin: 0 }}>
                    Mark attendance at the complex to unlock washing capability.
                  </p>
                </div>
                <span style={{ fontSize: "1.5rem", color: "#a855f7", fontWeight: 300, paddingLeft: "10px" }}>›</span>
              </div>
            </>
          ) : (
            <div className="worker-premium-card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Mark Complex Check-In</h3>
                <button 
                  onClick={() => setWantsCheckIn(false)} 
                  style={{ background: "none", border: "none", color: "#a855f7", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}
                >
                  ⬅ Back
                </button>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.825rem", color: "#475569", fontWeight: 600 }}>Select Complex Location:</label>
                <select
                  value={selectedComplexId}
                  onChange={e => setSelectedComplexId(e.target.value)}
                  style={{ width: "100%" }}
                >
                  {assignedComplexes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {gpsError && (
                <div style={{ fontSize: "0.85rem", color: "#ef4444", display: "flex", alignItems: "center", gap: "6px", background: "rgba(239, 68, 68, 0.05)", padding: "10px 14px", borderRadius: "12px" }}>
                  ❌ {gpsError}
                </div>
              )}

              <button
                type="button" 
                onClick={handleGPSCheckIn} 
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", marginTop: "4px" }}
              >
                Verify Geofence & Check In 📍
              </button>
            </div>
          )}
        </div>
      ) : !session.checkedOut ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Active stats display */}
          <div className="worker-premium-card" style={{ display: "flex", justifyContent: "space-around", textAlign: "center", padding: "20px 12px !important" }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.03em", marginBottom: "4px" }}>
                Shift Clock ⏱️
              </span>
              <strong style={{ fontSize: "1.3rem", fontFamily: "monospace", color: "#0f172a" }}>{timerText}</strong>
            </div>
            <div style={{ width: "1px", background: "rgba(225, 120, 180, 0.15)", alignSelf: "stretch" }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.03em", marginBottom: "4px" }}>
                Wash Progress 🧼
              </span>
              <strong style={{ fontSize: "1.3rem", color: "#10b981" }}>{finishedCount} / {totalCount}</strong>
            </div>
          </div>

          <div className="worker-premium-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Active Location Details</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "rgba(168, 85, 247, 0.03)", border: "1px solid rgba(168, 85, 247, 0.08)", padding: "14px", borderRadius: "16px", fontSize: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#64748b", fontWeight: 500 }}>Complex Location:</span>
                <strong style={{ color: "#0f172a" }}>{activeComplex?.name}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#64748b", fontWeight: 500 }}>GPS Range status:</span>
                <span style={{ color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                  Verified Proximity (Within 25m) ✅
                </span>
              </div>
              {session.lat && session.lng && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "monospace", borderTop: "1px dashed rgba(225, 120, 180, 0.15)", paddingTop: "8px", marginTop: "4px" }}>
                  <span style={{ color: "#64748b" }}>Coordinates:</span>
                  <span style={{ color: "#475569" }}>{session.lat.toFixed(5)}° N, {session.lng.toFixed(5)}° E</span>
                </div>
              )}
            </div>

            <button
              type="button" 
              onClick={handleCheckOut} 
              className="btn-secondary"
              style={{ width: "100%", justifyContent: "center", borderColor: "#ef4444", color: "#ef4444", background: "rgba(239, 68, 68, 0.05)", marginTop: "4px" }}
            >
              Verify Geofence & Check Out 🚪
            </button>
          </div>
        </div>
      ) : (
        <div className="worker-premium-card" style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "14px", alignItems: "center" }}>
          <span style={{ fontSize: "2.75rem", margin: "10px 0 0 0" }}>🎉</span>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Good Job Today!</h3>
          <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: "1.4", margin: 0 }}>
            Shift completed. Check-in was at <strong>{session.checkInTime}</strong> and check-out was at <strong>{session.checkOutTime}</strong>.
          </p>
          
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px", background: "rgba(16, 185, 129, 0.03)", border: "1px solid rgba(16, 185, 129, 0.1)", padding: "14px", borderRadius: "16px", fontSize: "0.875rem", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Washed Vehicles:</span>
              <strong style={{ color: "#10b981" }}>{finishedCount}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Total Roster:</span>
              <strong style={{ color: "#0f172a" }}>{totalCount} Vehicles</strong>
            </div>
          </div>
          
          <button
            type="button" 
            onClick={onResetSession} 
            className="btn-secondary"
            style={{ width: "100%", justifyContent: "center", marginTop: "10px", fontSize: "0.875rem", border: "1px solid #a855f7", color: "#a855f7", background: "rgba(168, 85, 247, 0.05)" }}
          >
            Accidentally Checked Out? Resume Shift 🔄
          </button>
        </div>
      )}
    </div>
  );
}
