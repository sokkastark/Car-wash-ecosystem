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

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function mapPlanId(localId: string): string {
  if (localId === "plan-daily") return "d1e2f300-0001-44ab-b3c9-4deff111a111";
  if (localId === "plan-alternate") return "d1e2f300-0002-44ab-b3c9-4deff111a112";
  if (localId === "plan-weekly-once") return "d1e2f300-0003-44ab-b3c9-4deff111a113";
  if (localId && localId.length === 36) return localId;
  return "d1e2f300-0001-44ab-b3c9-4deff111a111";
}

export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(item);
};

let syncDebounceTimer: any = null;

export const setStorageItem = <T>(key: string, value: T) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
    
    // Auto background push to Supabase cloud database snapshot!
    const SYNC_KEYS = [
      "sv_apartments", "sv_blocks", "sv_plans", "sv_workers", "sv_customers", 
      "sv_vehicles", "sv_complaints", "sv_upload_logs", "sv_expenses", 
      "sv_trash", "sv_interior_requests", "sv_inflow_payments", "sv_daily_service_logs",
      "sv_complex_plan_prices"
    ];
    if (isSupabaseConfigured && SYNC_KEYS.includes(key)) {
      if (sessionStorage.getItem("sv_initial_cloud_pull_in_progress") === "true") {
        console.warn(`[SyncEngine] Skipping auto-push for key "${key}" because a cloud pull is in progress.`);
        return;
      }
      if (syncDebounceTimer) {
        clearTimeout(syncDebounceTimer);
      }
      syncDebounceTimer = setTimeout(() => {
        import("./syncEngine").then(({ pushToSupabase }) => {
          pushToSupabase()
            .then(res => {
              if (res.success) {
                console.log("[SyncEngine] Auto-pushed database snapshot to Supabase successfully!");
              } else {
                console.warn("[SyncEngine] Auto-push warning:", res.error);
              }
            })
            .catch(err => console.error("[SyncEngine] Auto-push failed:", err));
        });
      }, 500); // 500ms debounce
    }
  }
};

const writeLocalSeeds = () => {
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
};

const repairNaNValues = () => {
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
};

const upgradePlansPricing = () => {
  try {
    const plansItem = localStorage.getItem("sv_plans");
    if (plansItem) {
      const plans = JSON.parse(plansItem);
      const dailyPlan = plans.find((p: any) => p.id === "plan-daily");
      if (dailyPlan && dailyPlan.price_sedan === 850) {
        setStorageItem("sv_plans", DEFAULT_PLANS);
        console.log("[mockStorage] Upgraded local subscription plan pricing to match correct baseline rates.");
      }
    }
  } catch (e) {
    console.error("[mockStorage] Failed to run plans pricing upgrade:", e);
  }
};

export const initializeMockDatabase = (force = false) => {
  if (typeof window === "undefined") return;

  // Real-time automatic background pull from Supabase on application load
  if (isSupabaseConfigured) {
    const pulledFlag = sessionStorage.getItem("sv_initial_cloud_pull_done");
    if (!pulledFlag) {
      sessionStorage.setItem("sv_initial_cloud_pull_done", "true");
      sessionStorage.setItem("sv_initial_cloud_pull_in_progress", "true");
      import("./syncEngine").then(({ pullFromSupabase }) => {
        pullFromSupabase().then((res) => {
          sessionStorage.removeItem("sv_initial_cloud_pull_in_progress");
          if (res.success && res.hasData) {
            console.log("[SyncEngine] Auto-pulled database snapshot from Supabase successfully!");
            window.dispatchEvent(new Event("db_cloud_sync_completed"));
            repairNaNValues();
            upgradePlansPricing();
          } else if (res.success && !res.hasData) {
            // Cloud is empty, initialize with seeds and push
            if (!localStorage.getItem("sv_db_initialized_v6")) {
              console.log("[SyncEngine] Cloud database is empty. Initializing with local seed data...");
              writeLocalSeeds();
            } else {
              console.log("[SyncEngine] Cloud database is empty. Proactively pushing local database snapshot...");
              import("./syncEngine").then(({ pushToSupabase }) => {
                pushToSupabase()
                  .then(() => window.dispatchEvent(new Event("db_cloud_sync_completed")))
                  .catch(err => console.error("[SyncEngine] Proactive push failed:", err));
              });
            }
          }
        }).catch(err => {
          sessionStorage.removeItem("sv_initial_cloud_pull_in_progress");
          console.error("[SyncEngine] Auto-pull failed:", err);
          // Fallback to local seeds if not initialized
          if (!localStorage.getItem("sv_db_initialized_v6")) {
            writeLocalSeeds();
          }
        });
      });
      return; // Stop execution here and await the database fetch outcome
    }
  }

  // If a pull is in progress, do not write seeds yet or run repairs
  if (sessionStorage.getItem("sv_initial_cloud_pull_in_progress") === "true") {
    return;
  }

  if (force || !localStorage.getItem("sv_db_initialized_v6")) {
    writeLocalSeeds();
  } else {
    repairNaNValues();
    upgradePlansPricing();
  }
};
