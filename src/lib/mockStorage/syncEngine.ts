import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { DEMO_AGENCY_ID } from "./seeds";

export const SYNC_KEYS = [
  "sv_apartments",
  "sv_blocks",
  "sv_plans",
  "sv_workers",
  "sv_customers",
  "sv_vehicles",
  "sv_complaints",
  "sv_upload_logs",
  "sv_expenses",
  "sv_trash",
  "sv_interior_requests",
  "sv_inflow_payments",
  "sv_daily_service_logs"
];

/**
 * Gets high-level statistics about the current LocalStorage database.
 */
export function getDatabaseStats() {
  if (typeof window === "undefined") return { vehicles: 0, customers: 0, workers: 0, logs: 0 };
  try {
    const vehicles = JSON.parse(localStorage.getItem("sv_vehicles") || "[]");
    const customers = JSON.parse(localStorage.getItem("sv_customers") || "[]");
    const workers = JSON.parse(localStorage.getItem("sv_workers") || "[]");
    const logs = JSON.parse(localStorage.getItem("sv_daily_service_logs") || "[]");
    return {
      vehicles: Array.isArray(vehicles) ? vehicles.length : 0,
      customers: Array.isArray(customers) ? customers.length : 0,
      workers: Array.isArray(workers) ? workers.length : 0,
      logs: Array.isArray(logs) ? logs.length : 0
    };
  } catch (e) {
    return { vehicles: 0, customers: 0, workers: 0, logs: 0 };
  }
}

/**
 * Exports the current LocalStorage database into a compressed Base64 string.
 */
export function exportToSyncCode(): string {
  if (typeof window === "undefined") return "";
  const data: Record<string, any> = {};
  SYNC_KEYS.forEach(key => {
    const val = localStorage.getItem(key);
    if (val) {
      try {
        data[key] = JSON.parse(val);
      } catch (e) {
        console.error(`Error parsing key ${key} during export:`, e);
      }
    }
  });
  
  const jsonStr = JSON.stringify(data);
  // Safe Base64 encoding supporting Unicode characters
  return btoa(encodeURIComponent(jsonStr));
}

/**
 * Imports a database from a Base64 sync code.
 */
export function importFromSyncCode(code: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const jsonStr = decodeURIComponent(atob(code.trim()));
    const data = JSON.parse(jsonStr);
    
    // Validate we have at least some recognizable keys
    const keys = Object.keys(data);
    const hasValidKey = keys.some(k => SYNC_KEYS.includes(k));
    if (!hasValidKey) {
      throw new Error("Invalid sync code database payload.");
    }

    keys.forEach(key => {
      if (SYNC_KEYS.includes(key)) {
        localStorage.setItem(key, JSON.stringify(data[key]));
      }
    });

    // Ensure the mock storage is set to initialized with version 5
    localStorage.setItem("sv_db_initialized_v5", "true");
    
    // Save metadata tracking when sync occurred
    localStorage.setItem("sv_last_device_sync", new Date().toISOString());
    return true;
  } catch (e) {
    console.error("[SyncEngine] Failed to parse sync code:", e);
    return false;
  }
}

/**
 * Exports database to a downloadable JSON file.
 */
export function exportToJSONFile(): string {
  if (typeof window === "undefined") return "";
  const data: Record<string, any> = {};
  SYNC_KEYS.forEach(key => {
    const val = localStorage.getItem(key);
    if (val) {
      try {
        data[key] = JSON.parse(val);
      } catch (e) {
        data[key] = [];
      }
    }
  });
  return JSON.stringify(data, null, 2);
}

/**
 * Imports database from a raw JSON string.
 */
export function importFromJSONString(jsonString: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const data = JSON.parse(jsonString);
    const keys = Object.keys(data);
    const hasValidKey = keys.some(k => SYNC_KEYS.includes(k));
    if (!hasValidKey) {
      throw new Error("Invalid database JSON file format.");
    }
    
    keys.forEach(key => {
      if (SYNC_KEYS.includes(key)) {
        localStorage.setItem(key, JSON.stringify(data[key]));
      }
    });
    localStorage.setItem("sv_db_initialized_v5", "true");
    localStorage.setItem("sv_last_device_sync", new Date().toISOString());
    return true;
  } catch (e) {
    console.error("[SyncEngine] Failed to import from JSON string:", e);
    return false;
  }
}

/**
 * Pushes the current LocalStorage database payload to Supabase "client_sync_snapshots" table.
 */
export async function pushToSupabase(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: "Supabase client is not configured. Run in mock state." };
  }
  try {
    const data: Record<string, any> = {};
    SYNC_KEYS.forEach(key => {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          data[key] = JSON.parse(val);
        } catch (e) {
          data[key] = [];
        }
      }
    });

    const timestamp = new Date().toISOString();

    // 1. Check if a sync snapshot already exists for this tenant
    const { data: existing, error: fetchErr } = await supabase
      .from("client_sync_snapshots")
      .select("id")
      .eq("agency_id", DEMO_AGENCY_ID)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (existing) {
      // Update existing record
      const { error: updateErr } = await supabase
        .from("client_sync_snapshots")
        .update({ data, updated_at: timestamp })
        .eq("id", existing.id);
      if (updateErr) throw updateErr;
    } else {
      // Insert new record
      const { error: insertErr } = await supabase
        .from("client_sync_snapshots")
        .insert([{ agency_id: DEMO_AGENCY_ID, data, updated_at: timestamp }]);
      if (insertErr) throw insertErr;
    }

    localStorage.setItem("sv_last_cloud_push", timestamp);
    return { success: true };
  } catch (e: any) {
    console.error("[SyncEngine] Supabase push failed:", e);
    return { success: false, error: e.message || String(e) };
  }
}

/**
 * Pulls the latest database payload from Supabase "client_sync_snapshots" table and populates LocalStorage.
 */
export async function pullFromSupabase(): Promise<{ success: boolean; hasData?: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: "Supabase client is not configured. Run in mock state." };
  }
  try {
    const { data: record, error: fetchErr } = await supabase
      .from("client_sync_snapshots")
      .select("data, updated_at")
      .eq("agency_id", DEMO_AGENCY_ID)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (!record || !record.data) {
      return { success: true, hasData: false };
    }

    const cloudData = record.data;
    Object.keys(cloudData).forEach(key => {
      if (SYNC_KEYS.includes(key)) {
        localStorage.setItem(key, JSON.stringify(cloudData[key]));
      }
    });

    localStorage.setItem("sv_db_initialized_v5", "true");
    localStorage.setItem("sv_last_cloud_pull", new Date().toISOString());
    if (record.updated_at) {
      localStorage.setItem("sv_last_cloud_push", record.updated_at);
    }
    return { success: true, hasData: true };
  } catch (e: any) {
    console.error("[SyncEngine] Supabase pull failed:", e);
    return { success: false, error: e.message || String(e) };
  }
}
