"use client";

import React, { useState } from "react";

interface VehicleTask {
  id: string;
  vehicleId: string;
  license: string;
  model: string;
  vehicleType: string;
  slot: string;
  parkingSlot: string;
  status: "pending" | "washed" | "skipped" | "missed";
  apartmentName: string;
  blockName: string;
  interiorFrequency?: number;
  hasInteriorRequest?: boolean;
  markedAt?: string | null;
}

interface WorkerChecklistGridProps {
  tasks: VehicleTask[];
  finishedCount: number;
  sessionCheckedIn: boolean;
  toggleStatus: (task: VehicleTask, overrideStatus?: "washed" | "skipped" | "missed" | "pending") => void;
  onMarkAllWashed: () => void;
  onUndoMarkAll: () => void;
  hasUndo: boolean;
}

/* 
   SwipeableCard Sub-Component
   Uses native HTML5 Touch Gestures with 0 bundle-size overhead and hardware acceleration.
   Swipe Right -> Washed Today 🧼
   Swipe Left -> Skip Exception ⚠️
*/
interface SwipeableCardProps {
  task: VehicleTask;
  toggleStatus: (task: VehicleTask, overrideStatus?: "washed" | "skipped" | "missed" | "pending") => void;
  formatMarkedTime: (isoString?: string | null) => string;
}

function getVehicleVisuals(vehicleType: string) {
  const type = (vehicleType || "").toLowerCase().trim();
  switch (type) {
    case "sedan":
      return {
        emoji: "🚗",
        label: "Sedan",
        bg: "linear-gradient(135deg, #FFF9DB 0%, #FFF3BF 100%)",
        color: "#B7791F"
      };
    case "hatchback":
      return {
        emoji: "🚗",
        label: "Hatchback",
        bg: "linear-gradient(135deg, #E6F4EA 0%, #CEEAD6 100%)",
        color: "#137333"
      };
    case "suv":
      return {
        emoji: "🚙",
        label: "SUV",
        bg: "linear-gradient(135deg, #E8F0FE 0%, #D2E3FC 100%)",
        color: "#174EA6"
      };
    case "luxury":
      return {
        emoji: "🏎️",
        label: "Luxury",
        bg: "linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)",
        color: "#C2185B"
      };
    case "bike":
      return {
        emoji: "🏍️",
        label: "Bike",
        bg: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
        color: "#3730A3"
      };
    case "scooter":
      return {
        emoji: "🛵",
        label: "Scooter",
        bg: "linear-gradient(135deg, #E6FFFA 0%, #CCFBF1 100%)",
        color: "#0F766E"
      };
    default:
      return {
        emoji: "🚗",
        label: "Car",
        bg: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
        color: "#475569"
      };
  }
}

function SwipeableCard({ task, toggleStatus, formatMarkedTime }: SwipeableCardProps) {
  const [startX, setStartX] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || startX === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;

    // Apply damping resistance beyond 100px swipe to create a natural, bouncy native-feel
    let offset = diff;
    if (diff > 100) {
      offset = 100 + (diff - 100) * 0.2;
    } else if (diff < -100) {
      offset = -100 + (diff + 100) * 0.2;
    }
    setSwipeOffset(offset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setStartX(null);

    // Trigger actions when swipe surpasses the 80px gesture threshold
    if (swipeOffset > 80) {
      if (task.status !== "missed") {
        toggleStatus(task, "missed");
      }
    } else if (swipeOffset < -88) {
      toggleStatus(task, "skipped");
    }

    setSwipeOffset(0);
  };

  const cardClass = task.status === "washed" ? "checklist-card-washed" :
                    task.status === "skipped" ? "checklist-card-skipped" :
                    task.status === "missed" ? "checklist-card-missed" :
                    "checklist-card-pending";

  const visuals = getVehicleVisuals(task.vehicleType);

  return (
    <div 
      style={{ 
        position: "relative", 
        width: "100%", 
        borderRadius: "24px", 
        overflow: "hidden",
        background: "#E2E8F0", // Neutral track revealed during swipe
        touchAction: "pan-y"   // Intercept horizontal gestures while allowing vertical page scrolling
      }}
    >
      {/* Background Action Indicators */}
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "24px",
          zIndex: 1,
          overflow: "hidden"
        }}
      >
        {/* Swipe Right: Missed */}
        <div 
          style={{
            flex: 1,
            height: "100%",
            background: "linear-gradient(90deg, #64748b, #94a3b8)",
            display: "flex",
            alignItems: "center",
            paddingLeft: "20px",
            color: "white",
            fontWeight: 700,
            fontSize: "0.875rem",
            opacity: swipeOffset > 0 ? Math.min(swipeOffset / 80, 1) : 0,
            transition: "opacity 0.15s ease"
          }}
        >
          ⏳ Missed
        </div>

        {/* Swipe Left: Skipped */}
        <div 
          style={{
            flex: 1,
            height: "100%",
            background: "linear-gradient(270deg, #f59e0b, #fbbf24)",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: "20px",
            color: "white",
            fontWeight: 700,
            fontSize: "0.875rem",
            opacity: swipeOffset < 0 ? Math.min(-swipeOffset / 80, 1) : 0,
            transition: "opacity 0.15s ease"
          }}
        >
          ⚠️ Skip Exception
        </div>
      </div>

      {/* Actual Interactive Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`worker-premium-card clickable ${cardClass}`}
        onClick={() => toggleStatus(task)}
        style={{
          position: "relative",
          zIndex: 2,
          padding: "16px 20px !important",
          display: "flex",
          gap: "16px",
          alignItems: "center",
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Left Visual Avatar Cue - Bigger and More Prominent */}
        <div
          style={{
            width: "58px",
            height: "58px",
            borderRadius: "18px",
            background: visuals.bg,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.7)"
          }}
          title={visuals.label}
        >
          <span style={{ fontSize: "1.65rem", lineHeight: 1.1 }}>{visuals.emoji}</span>
          <span style={{ fontSize: "0.58rem", fontWeight: 800, color: visuals.color, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: "1px" }}>
            {visuals.label}
          </span>
        </div>

        {/* Spacious Edge-to-Edge Vehicle Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: "0.775rem", color: "#64748b", display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "3px" }}>
            {task.blockName} • Flat {task.slot}
          </span>
          <strong style={{ fontSize: "1.25rem", fontFamily: "var(--font-title)", color: "#0f172a", display: "block", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            {task.license}
          </strong>
          <span style={{ fontSize: "0.85rem", color: "#475569", display: "block", marginTop: "2px" }}>
            {task.model} <span style={{ color: "#94a3b8", fontSize: "0.8rem", marginLeft: "4px" }}>({task.parkingSlot ? `Slot ${task.parkingSlot}` : "No Slot"})</span>
          </span>

          {/* Bottom Badges & Status Row (Clean and Organized Below Vehicle Info) */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", marginTop: "8px" }}>
            {/* Real-time Status Badge */}
            {task.status === "washed" && <span className="status-badge washed" style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "0.675rem", fontWeight: 700 }}>Washed</span>}
            {task.status === "skipped" && <span className="status-badge skipped" style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "0.675rem", fontWeight: 700 }}>Skipped</span>}
            {task.status === "missed" && <span className="status-badge missed" style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "0.675rem", fontWeight: 700 }}>Missed</span>}
            {task.status === "pending" && <span className="status-badge pending" style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "0.675rem", fontWeight: 700 }}>Pending</span>}
            
            {task.status !== "pending" && task.markedAt && (
              <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontFamily: "monospace", fontWeight: 600 }}>
                at {formatMarkedTime(task.markedAt)}
              </span>
            )}

            {task.interiorFrequency !== undefined && task.interiorFrequency > 0 && (
              <span style={{
                fontSize: "0.675rem",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.15)",
                color: "#10b981",
                padding: "2px 8px",
                borderRadius: "6px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}>
                🧼 SUNDAY INTERIOR
              </span>
            )}
            {task.hasInteriorRequest && (
              <span style={{
                fontSize: "0.675rem",
                background: "rgba(168, 85, 247, 0.08)",
                border: "1px solid rgba(168, 85, 247, 0.15)",
                color: "#a855f7",
                padding: "2px 8px",
                borderRadius: "6px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}>
                🧼 INTERIOR REQUESTED
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkerChecklistGrid({
  tasks,
  finishedCount,
  sessionCheckedIn,
  toggleStatus,
  onMarkAllWashed,
  onUndoMarkAll,
  hasUndo
}: WorkerChecklistGridProps) {

  const formatMarkedTime = (isoString?: string | null) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="animate-fade-in">
      
      {/* Geofence Check-in warning alert bubble if previewing before attendance checkin */}
      {!sessionCheckedIn && (
        <div className="worker-premium-card" style={{ display: "flex", gap: "14px", alignItems: "flex-start", padding: "16px !important" }}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.1rem",
            flexShrink: 0
          }}>
            🤖
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
            <strong style={{ fontSize: "0.75rem", color: "#f59e0b", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.05em" }}>
              Geofence Preview Lock 🔒
            </strong>
            <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.4", margin: 0 }}>
              Here are the vehicles assigned to you today. You can view them, but to mark their status as Washed or Skipped, you must check in at the complex first!
            </p>
          </div>
        </div>
      )}

      {/* Header and Stats */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
        <h2 style={{ fontSize: "0.875rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, margin: 0 }}>
          Assigned Vehicles ({tasks.length})
        </h2>
        <strong style={{ fontSize: "0.9rem", color: finishedCount === tasks.length && tasks.length > 0 ? "#10b981" : "#a855f7", fontWeight: 700 }}>
          {finishedCount} / {tasks.length} Completed
        </strong>
      </div>

      {/* Mark All Washed Bulk Action Button Row */}
      {tasks.length > 0 && (
        <div style={{ display: "flex", gap: "10px", margin: "0 0 4px 0", width: "100%" }}>
          {hasUndo && (
            <button
              type="button"
              onClick={onUndoMarkAll}
              className="btn-secondary"
              style={{
                flex: "0 0 32%",
                justifyContent: "center",
                padding: "12px 10px !important",
                fontSize: "0.875rem",
                borderRadius: "16px",
                borderColor: "#a855f7",
                color: "#a855f7",
                background: "rgba(168, 85, 247, 0.05)",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              ↩️ Undo
            </button>
          )}
          <button
            type="button"
            onClick={onMarkAllWashed}
            className="btn-primary"
            style={{
              flex: 1,
              justifyContent: "center",
              padding: "12px 20px !important",
              fontSize: "0.875rem",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #a855f7, #6366f1) !important",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(168, 85, 247, 0.2)"
            }}
          >
            ⚡ Mark All as Washed
          </button>
        </div>
      )}

      {/* Checklist Grid */}
      {tasks.length === 0 ? (
        <div className="worker-premium-card" style={{ padding: "40px 20px !important", textAlign: "center", color: "#64748b" }}>
          No vehicle washes assigned for today at this complex.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {tasks.map(task => (
            <SwipeableCard
              key={task.id}
              task={task}
              toggleStatus={toggleStatus}
              formatMarkedTime={formatMarkedTime}
            />
          ))}
        </div>
      )}
    </main>
  );
}
