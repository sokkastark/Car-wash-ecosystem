"use client";

import { useEffect } from "react";

// Hardcoded current client build timestamp
const CLIENT_BUILD_TIME = 1780409300000; // June 2, 2026 20:00:00

export default function AutoUpdateChecker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only run update check if not already reloaded in the last 15 seconds
    const lastCheck = sessionStorage.getItem("sv_last_update_check");
    const now = Date.now();
    if (lastCheck && now - Number(lastCheck) < 15000) return;
    sessionStorage.setItem("sv_last_update_check", now.toString());

    const checkUpdates = async () => {
      try {
        const response = await fetch(`/version.json?t=${now}`, {
          cache: "no-store",
          headers: { 
            "Pragma": "no-cache", 
            "Cache-Control": "no-cache" 
          }
        });
        if (!response.ok) return;
        const data = await response.json();
        
        if (data && data.timestamp && Number(data.timestamp) > CLIENT_BUILD_TIME) {
          console.log("[AutoUpdate] New deployment detected on server! Clearing cache and updating...");
          
          if ("caches" in window) {
            try {
              const keys = await caches.keys();
              await Promise.all(keys.map(key => caches.delete(key)));
            } catch (e) {
              console.warn("Cache API clear failed:", e);
            }
          }
          if ("serviceWorker" in navigator) {
            try {
              const registrations = await navigator.serviceWorker.getRegistrations();
              await Promise.all(registrations.map(r => r.unregister()));
            } catch (e) {
              console.warn("ServiceWorker unregistration failed:", e);
            }
          }
          try {
            sessionStorage.clear();
          } catch (e) {}

          // Force reload with cache-busting search param to get fresh code
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set("reload_t", data.timestamp.toString());
          window.location.replace(currentUrl.toString());
        }
      } catch (err) {
        console.warn("[AutoUpdate] Update check failed:", err);
      }
    };

    // Delay the check by 2.5 seconds to avoid blocking main thread on initial load
    const timer = setTimeout(checkUpdates, 2500);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
