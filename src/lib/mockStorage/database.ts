import { DailyServiceLog } from "./types";
import { isSupabaseConfigured } from "@/lib/supabase";
import { 
  DEFAULT_APARTMENTS, 
  DEFAULT_BLOCKS, 
  DEFAULT_PLANS, 
  DEFAULT_WORKERS, 
  DEFAULT_CUSTOMERS, 
  DEFAULT_VEHICLES, 
  DEFAULT_COMPLAINTS, 
  DEFAULT_UPLOAD_LOGS, 
  DEFAULT_EXPENSES, 
  DEMO_AGENCY_ID, 
  DEMO_APARTMENT_ID 
} from "./seeds";

export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(item);
};

export const setStorageItem = <T>(key: string, value: T) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
    
    // Auto background push to Supabase cloud database snapshot!
    const SYNC_KEYS = [
      "sv_apartments", "sv_blocks", "sv_plans", "sv_workers", "sv_customers", 
      "sv_vehicles", "sv_complaints", "sv_upload_logs", "sv_expenses", 
      "sv_trash", "sv_interior_requests", "sv_inflow_payments", "sv_daily_service_logs"
    ];
    if (isSupabaseConfigured && SYNC_KEYS.includes(key)) {
      import("./syncEngine").then(({ pushToSupabase }) => {
        pushToSupabase().catch(err => console.error("[SyncEngine] Auto-push failed:", err));
      });
    }
  }
};

export const initializeMockDatabase = (force = false) => {
  if (typeof window === "undefined") return;

  // Real-time automatic background pull from Supabase on application load
  if (isSupabaseConfigured) {
    const pulledFlag = sessionStorage.getItem("sv_initial_cloud_pull_done");
    if (!pulledFlag) {
      sessionStorage.setItem("sv_initial_cloud_pull_done", "true");
      import("./syncEngine").then(({ pullFromSupabase }) => {
        pullFromSupabase().then((res) => {
          if (res.success && res.hasData) {
            console.log("[SyncEngine] Auto-pulled database snapshot from Supabase successfully!");
            window.dispatchEvent(new Event("db_cloud_sync_completed"));
          }
        }).catch(err => console.error("[SyncEngine] Auto-pull failed:", err));
      });
    }
  }

  if (force || !localStorage.getItem("sv_db_initialized_v6")) {
    setStorageItem("sv_apartments", DEFAULT_APARTMENTS);
    setStorageItem("sv_blocks", DEFAULT_BLOCKS);
    setStorageItem("sv_plans", DEFAULT_PLANS);
    setStorageItem("sv_workers", DEFAULT_WORKERS);
    setStorageItem("sv_customers", DEFAULT_CUSTOMERS);
    setStorageItem("sv_vehicles", DEFAULT_VEHICLES);
    setStorageItem("sv_complaints", DEFAULT_COMPLAINTS);
    setStorageItem("sv_upload_logs", DEFAULT_UPLOAD_LOGS);
    setStorageItem("sv_expenses", DEFAULT_EXPENSES);
    setStorageItem("sv_trash", []);
    setStorageItem("sv_interior_requests", []);
    setStorageItem("sv_inflow_payments", []);
    setStorageItem("sv_daily_service_logs", []);

    localStorage.setItem("sv_db_initialized_v6", "true");
  } else {
    // Auto-repair corrupted NaN values in existing localStorage keys
    try {
      const vehiclesItem = localStorage.getItem("sv_vehicles");
      if (vehiclesItem) {
        const vehicles = JSON.parse(vehiclesItem);
        if (Array.isArray(vehicles)) {
          let modified = false;
          const sanitizedVehicles = vehicles.map((v: any) => {
            if (v.custom_price !== null && v.custom_price !== undefined) {
              const parsed = Number(v.custom_price);
              if (isNaN(parsed)) {
                modified = true;
                return { ...v, custom_price: null };
              }
            }
            return v;
          });
          if (modified) {
            setStorageItem("sv_vehicles", sanitizedVehicles);
            console.log("[mockStorage] Repaired corrupted NaN vehicle custom_price entries in localStorage.");
          }
        }
      }
    } catch (e) {
      console.error("[mockStorage] Failed to run auto-repair for vehicles:", e);
    }
  }
};
