"use client";

import { useState } from "react";
import { useWorkerSession, VehicleTask } from "./hooks/useWorkerSession";
import SkipExceptionModal from "./components/SkipExceptionModal";
import WorkerLogin from "./components/WorkerLogin";
import WorkerAttendance from "./components/WorkerAttendance";
import WorkerProfile from "./components/WorkerProfile";
import WorkerChecklistGrid from "./components/WorkerChecklistGrid";
import WorkerSettings from "./components/WorkerSettings";
import "./worker.css";

export default function WorkerChecklist() {
  const {
    workers,
    apartments,
    loggedInWorker,
    activeTab,
    setActiveTab,
    session,
    tasks,
    isSkipModalOpen,
    setIsSkipModalOpen,
    pendingSkipTask,
    setPendingSkipTask,
    assistantMessage,
    handleLoginSuccess,
    handleLogout,
    handleCheckIn,
    handleCheckOut,
    handleResetSession,
    toggleStatus,
    handleSkipSubmit,
    markAllWashed,
    undoMarkAll,
    hasUndo,
    triggerDbRefresh
  } = useWorkerSession();

  // If worker has assigned complexes, show only those; otherwise fallback to all apartments
  const assignedComplexes = loggedInWorker?.assigned_complex_ids?.length
    ? apartments.filter(a => loggedInWorker.assigned_complex_ids!.includes(a.id))
    : apartments;
  const finishedCount = tasks.filter(t => t.status !== "pending").length;
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!loggedInWorker) {
    return (
      <div className="worker-theme-wrapper" style={{ minHeight: "100vh", width: "100%" }}>
        <div style={{ padding: "20px 16px", maxWidth: "480px", margin: "0 auto" }}>
          <WorkerLogin workers={workers} onLoginSuccess={handleLoginSuccess} onDbRefresh={triggerDbRefresh} />
        </div>
      </div>
    );
  }

  return (
    <div className="worker-theme-wrapper" style={{ minHeight: "100vh", width: "100%" }}>
      <div style={{ padding: "20px 16px 110px 16px", maxWidth: "480px", margin: "0 auto" }}>
        
        {/* Active Worker Mini-Header */}
        <header style={{ marginBottom: "22px" }}>
          <span style={{ fontSize: "0.75rem", color: "#a855f7", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Active Shift — {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
        </header>

        {/* Tab Selection Page Render */}
        {activeTab === "attendance" && (
          <WorkerAttendance
            assignedComplexes={assignedComplexes}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onResetSession={handleResetSession}
            session={session}
            finishedCount={finishedCount}
            totalCount={tasks.length}
            activeWorkerName={loggedInWorker.name}
            activeWorkerRole={loggedInWorker.role}
            assistantMessage={assistantMessage}
            setActiveTab={setActiveTab}
            onSyncRoster={triggerDbRefresh}
          />
        )}

        {activeTab === "checklist" && (
          <WorkerChecklistGrid
            tasks={tasks}
            finishedCount={finishedCount}
            sessionCheckedIn={session.checkedIn && !session.checkedOut}
            toggleStatus={toggleStatus}
            onMarkAllWashed={() => setShowConfirmModal(true)}
            onUndoMarkAll={undoMarkAll}
            hasUndo={hasUndo}
          />
        )}

        {activeTab === "profile" && (
          <WorkerProfile worker={loggedInWorker} assignedComplexes={assignedComplexes} onLogout={handleLogout} />
        )}

        {activeTab === "settings" && (
          <WorkerSettings />
        )}

      </div>

      {/* Sleek Floating PWA Navigation Bottom Bar */}
      <nav className="worker-floating-nav">
        <button
          onClick={() => setActiveTab("attendance")}
          className={`worker-tab-button ${activeTab === "attendance" ? "active" : ""}`}
        >
          <span style={{ fontSize: "1.35rem" }}>📍</span>
          <span>Attendance</span>
          <div className="active-bar" />
        </button>

        <button
          onClick={() => setActiveTab("checklist")}
          className={`worker-tab-button ${activeTab === "checklist" ? "active" : ""}`}
        >
          <span style={{ fontSize: "1.35rem" }}>📋</span>
          <span>Checklist</span>
          <div className="active-bar" />
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`worker-tab-button ${activeTab === "profile" ? "active" : ""}`}
        >
          <span style={{ fontSize: "1.35rem" }}>👤</span>
          <span>Profile</span>
          <div className="active-bar" />
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`worker-tab-button ${activeTab === "settings" ? "active" : ""}`}
        >
          <span style={{ fontSize: "1.35rem" }}>⚙️</span>
          <span>Settings</span>
          <div className="active-bar" />
        </button>
      </nav>

      {/* Skip Reasons Exception dialog */}
      {isSkipModalOpen && pendingSkipTask && (
        <SkipExceptionModal
          isOpen={isSkipModalOpen}
          onClose={() => {
            setIsSkipModalOpen(false);
            setPendingSkipTask(null);
          }}
          onSubmit={handleSkipSubmit}
          vehicleLicense={pendingSkipTask.license}
        />
      )}

      {/* Gorgeous custom confirmation modal overlay (flawless fixed screen centering) */}
      {showConfirmModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
          padding: "20px"
        }} className="animate-fade-in">
          <div 
            className="worker-premium-card" 
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "28px !important",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              border: "1px solid rgba(225, 120, 180, 0.15) !important",
              boxShadow: "0 20px 50px -10px rgba(168, 85, 247, 0.25) !important",
              animation: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
            }}
          >
            <div className="worker-avatar-large" style={{ margin: "0 auto 4px auto" }}>🤖</div>
            
            <div>
              <strong style={{ fontSize: "0.725rem", color: "#a855f7", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>
                SV Operations Assistant
              </strong>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
                Confirm Bulk Wash 🧼
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: "1.5", margin: 0 }}>
                Hey, do you want me to mark all remaining vehicles as washed? You can still adjust individual skipped vehicles afterward!
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "8px" }}>
              <button 
                type="button" 
                onClick={() => setShowConfirmModal(false)} 
                className="btn-secondary" 
                style={{ flex: 1, justifyContent: "center", borderRadius: "9999px" }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowConfirmModal(false);
                  markAllWashed();
                }} 
                className="btn-primary" 
                style={{ flex: 1, justifyContent: "center", borderRadius: "9999px" }}
              >
                Yes, Mark All
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
