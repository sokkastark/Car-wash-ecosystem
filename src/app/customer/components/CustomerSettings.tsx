"use client";

import React, { useState, useEffect } from "react";

export default function CustomerSettings() {
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installStatus, setInstallStatus] = useState<"browser" | "standalone" | "installed">("browser");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Online / Offline state tracking
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 2. Standalone display mode check
    const checkStandalone = () => {
      const isMqyStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const isNavStandalone = (window.navigator as any).standalone === true;
      const isStandaloneActive = isMqyStandalone || isNavStandalone;
      setIsStandalone(isStandaloneActive);
      if (isStandaloneActive) {
        setInstallStatus("standalone");
      }
    };

    checkStandalone();

    // 3. Listen for PWA beforeinstallprompt
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallStatus("browser");
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    // 4. Listen for appinstalled event
    const handleAppInstalled = () => {
      setInstallStatus("installed");
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("PWA installation is not supported or already installed. If you are on iOS Safari, please tap 'Share' and select 'Add to Home Screen'.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallStatus("installed");
      setDeferredPrompt(null);
    }
  };

  const handleHardRefresh = async () => {
    if (typeof window !== "undefined") {
      try {
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(key => caches.delete(key)));
        }
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map(r => r.unregister()));
        }
      } catch (err) {
        console.error("Failed to clear PWA cache:", err);
      }
      window.location.reload();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} className="animate-fade-in">
      
      {/* Cyan uppercase small category heading */}
      <span style={{ 
        color: "#0284c7", 
        fontSize: "0.75rem", 
        fontWeight: 800, 
        letterSpacing: "0.1em", 
        textTransform: "uppercase", 
        marginBottom: "-8px", 
        display: "block",
        paddingLeft: "4px"
      }}>
        APP STATUS
      </span>

      {/* Settings Options Box inside customer glass-panel */}
      <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px", borderRadius: "28px" }}>
        
        {/* Row 1: Network State */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "50%", 
              background: isOnline ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontSize: "1.2rem"
            }}>
              {isOnline ? "📶" : "⚠️"}
            </div>
            <div>
              <strong style={{ fontSize: "0.95rem", color: "#0f172a", display: "block" }}>Network State</strong>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {isOnline ? "Online & Syncing" : "Offline Mode Active"}
              </span>
            </div>
          </div>
          <span style={{
            fontSize: "0.725rem",
            padding: "4px 10px",
            borderRadius: "9999px",
            fontWeight: 700,
            background: isOnline ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
            border: isOnline ? "1px solid rgba(16, 185, 129, 0.15)" : "1px solid rgba(239, 68, 68, 0.15)",
            color: isOnline ? "#10b981" : "#ef4444"
          }}>
            {isOnline ? "CONNECTED" : "OFFLINE"}
          </span>
        </div>

        <div style={{ height: "1px", background: "rgba(158, 168, 253, 0.1)" }} />

        {/* Row 2: App Installation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "50%", 
              background: "rgba(91, 109, 244, 0.08)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontSize: "1.2rem"
            }}>
              📱
            </div>
            <div>
              <strong style={{ fontSize: "0.95rem", color: "#0f172a", display: "block" }}>App Installation</strong>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {installStatus === "standalone" ? "Running Standalone PWA" : installStatus === "installed" ? "Installed Successfully" : "Running in Browser"}
              </span>
            </div>
          </div>
          
          {installStatus === "standalone" || installStatus === "installed" ? (
            <span style={{
              fontSize: "0.725rem",
              padding: "4px 10px",
              borderRadius: "9999px",
              fontWeight: 700,
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.15)",
              color: "#10b981",
              textTransform: "uppercase"
            }}>
              Installed ✅
            </span>
          ) : (
            <button
              onClick={handleInstallClick}
              style={{
                background: "#ffffff",
                color: "#0f172a",
                border: "1.5px solid #0f172a",
                borderRadius: "9999px",
                padding: "8px 16px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "var(--font-title)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#0f172a";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.color = "#0f172a";
              }}
            >
              INSTALL APP
            </button>
          )}
        </div>

        <div style={{ height: "1px", background: "rgba(158, 168, 253, 0.1)" }} />

        {/* Row 3: Hard Refresh System */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "50%", 
              background: "rgba(239, 68, 68, 0.05)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontSize: "1.2rem"
            }}>
              🔄
            </div>
            <div>
              <strong style={{ fontSize: "0.95rem", color: "#ef4444", display: "block" }}>Hard Refresh System</strong>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                CLEAR CACHE & RELOAD
              </span>
            </div>
          </div>
          
          <button
            onClick={handleHardRefresh}
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              color: "#ef4444",
              border: "1.5px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "9999px",
              padding: "8px 16px",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-title)",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.8)";
            }}
          >
            FORCE RELOAD
          </button>
        </div>

      </div>

      {/* Powered by Aura360Studio footer */}
      <footer style={{ 
        textAlign: "center", 
        marginTop: "16px", 
        fontSize: "0.75rem", 
        color: "#64748b",
        fontWeight: 600,
        letterSpacing: "0.08em"
      }}>
        POWERED BY <strong style={{ color: "#0f172a", fontWeight: 800 }}>AURA360STUDIO</strong>
      </footer>

    </div>
  );
}
