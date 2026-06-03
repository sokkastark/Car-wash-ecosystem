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
  "sv_daily_service_logs",
  "sv_complex_plan_prices"
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

    // Ensure the mock storage is set to initialized with version 6
    localStorage.setItem("sv_db_initialized_v6", "true");
    
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
    localStorage.setItem("sv_db_initialized_v6", "true");
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
    console.log("[SyncEngine] Pulling fresh relational database tables from Supabase...");
    
    // 1. Fetch all relational tables in parallel from Supabase
    const [
      { data: apartments, error: e1 },
      { data: blocks, error: e2 },
      { data: plans, error: e3 },
      { data: workers, error: e4 },
      { data: customers, error: e5 },
      { data: vehicles, error: e6 },
      { data: subs, error: e7 },
      { data: logs, error: e8 }
    ] = await Promise.all([
      supabase.from("apartments").select("*"),
      supabase.from("blocks").select("*"),
      supabase.from("subscription_plans").select("*"),
      supabase.from("workers").select("*"),
      supabase.from("customers").select("*"),
      supabase.from("vehicles").select("*"),
      supabase.from("subscriptions").select("*"),
      supabase.from("daily_service_logs").select("*")
    ]);

    let hasRelationalData = false;
    if (!e1 && apartments && apartments.length > 0 && customers && customers.length > 0) {
      hasRelationalData = true;
    }

    if (hasRelationalData) {
      console.log("[SyncEngine] Live relational SQL data found in Supabase! Merging fresh database...");
      const subMap = new Map((subs || []).map((s: any) => [s.vehicle_id, s.plan_id]));
      const demoAptId = apartments![0].id;

      const sv_apartments = apartments!.map((apt: any) => ({
        id: apt.id,
        agency_id: apt.agency_id,
        name: apt.name,
        address: apt.address,
        city: apt.city
      }));

      const sv_blocks = (blocks || []).map((b: any) => ({
        id: b.id,
        apartment_id: b.apartment_id,
        name: b.name
      }));

      const sv_plans = (plans || []).map((p: any) => ({
        id: p.id,
        agency_id: p.agency_id,
        name: p.name,
        recurrence: p.recurrence,
        price_car: Number(p.price_car) || 0,
        price_bike: Number(p.price_bike) || 0,
        price_hatchback: Number(p.price_car) || 0,
        price_sedan: Number(p.price_car) || 0,
        price_suv: Number(p.price_car) || 0,
        price_luxury: Number(p.price_car) || 0
      }));

      const sv_workers = (workers || []).map((w: any) => ({
        id: w.id,
        agency_id: w.agency_id,
        name: w.name,
        phone: w.phone,
        role: w.role === "washer" ? "washer" : "supervisor",
        is_active: w.is_active,
        assigned_complex_ids: [demoAptId],
        monthly_salary: w.role === "supervisor" ? 18000 : 14000,
        salary_status: "pending",
        attendance_today: "present"
      }));

      const sv_customers = (customers || []).map((c: any) => ({
        id: c.id,
        agency_id: c.agency_id,
        custom_customer_id: c.custom_customer_id,
        name: c.name,
        phone_number: c.phone_number,
        email: c.email,
        apartment_id: c.apartment_id,
        block_id: c.block_id,
        flat_no: c.parking_slot ? c.parking_slot.replace(/[^\d]/g, "") : "101",
        parking_slot: c.parking_slot,
        join_date: "2026-05-01",
        status: "active"
      }));

      const sv_vehicles = (vehicles || []).map((v: any) => {
        const plan_id = subMap.get(v.id) || (plans && plans[0] ? plans[0].id : "plan-daily");
        const firstWasher = (workers || []).find((w: any) => w.role === "washer");
        return {
          id: v.id,
          customer_id: v.customer_id,
          license_plate: v.license_plate,
          vehicle_type: v.vehicle_type === "suv" ? "suv" : v.vehicle_type === "bike" ? "bike" : "car",
          make: v.make_model ? v.make_model.split(" ")[0] : "Hyundai",
          model: v.make_model ? v.make_model.split(" ").slice(1).join(" ") : "i20",
          color: v.color || "White",
          plan_id,
          custom_price: null,
          assigned_worker_id: firstWasher ? firstWasher.id : null,
          interior_frequency: 0
        };
      });

      const sv_daily_service_logs = (logs || []).map((l: any) => ({
        id: l.id,
        agency_id: l.agency_id,
        worker_id: l.worker_id,
        vehicle_id: l.vehicle_id,
        log_date: l.log_date,
        status: l.status,
        reason: l.reason,
        notes: l.notes,
        marked_at: l.marked_at
      }));

      const dataToPush: Record<string, any> = {
        sv_apartments,
        sv_blocks,
        sv_plans,
        sv_workers,
        sv_customers,
        sv_vehicles,
        sv_daily_service_logs
      };

      const SYNC_KEYS_ADDITIONAL = ["sv_complaints", "sv_upload_logs", "sv_expenses", "sv_trash", "sv_interior_requests", "sv_inflow_payments"];
      SYNC_KEYS_ADDITIONAL.forEach(key => {
        const existingVal = localStorage.getItem(key);
        dataToPush[key] = existingVal ? JSON.parse(existingVal) : [];
      });

      // Save fresh data to local storage
      Object.keys(dataToPush).forEach(key => {
        localStorage.setItem(key, JSON.stringify(dataToPush[key]));
      });

      localStorage.setItem("sv_db_initialized_v6", "true");
      localStorage.setItem("sv_last_cloud_pull", new Date().toISOString());

      // Auto backup this snapshot in client_sync_snapshots table
      const timestamp = new Date().toISOString();
      await supabase
        .from("client_sync_snapshots")
        .upsert({ agency_id: DEMO_AGENCY_ID, data: dataToPush, updated_at: timestamp }, { onConflict: "agency_id" });

      localStorage.setItem("sv_last_cloud_push", timestamp);
      return { success: true, hasData: true };
    }

    // 2. Fallback to reading the client_sync_snapshots JSON snapshot if relational tables are empty
    console.log("[SyncEngine] Relational tables are empty. Checking JSON snapshot as fallback...");
    const { data: record, error: fetchErr } = await supabase
      .from("client_sync_snapshots")
      .select("data, updated_at")
      .eq("agency_id", DEMO_AGENCY_ID)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (record && record.data && Object.keys(record.data).length > 0) {
      const cloudData = record.data;
      Object.keys(cloudData).forEach(key => {
        if (SYNC_KEYS.includes(key)) {
          localStorage.setItem(key, JSON.stringify(cloudData[key]));
        }
      });

      localStorage.setItem("sv_db_initialized_v6", "true");
      localStorage.setItem("sv_last_cloud_pull", new Date().toISOString());
      if (record.updated_at) {
        localStorage.setItem("sv_last_cloud_push", record.updated_at);
      }
      return { success: true, hasData: true };
    }

    return { success: true, hasData: false };
  } catch (e: any) {
    console.error("[SyncEngine] pullFromSupabase failed:", e);
    return { success: false, error: e.message || String(e) };
  }
}
