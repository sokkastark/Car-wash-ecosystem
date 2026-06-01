import { DailyServiceLog } from "./types";
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
  }
};

export const initializeMockDatabase = (force = false) => {
  if (typeof window === "undefined") return;
  if (force || !localStorage.getItem("sv_db_initialized_v5")) {
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

    // Pre-seed an active pending one-time interior cleaning request for Amit's Maruthi 800 (veh-i20)
    const defaultInteriorRequests = [
      {
        id: "int-req-seed-1",
        customer_id: "cust-amit",
        vehicle_id: "veh-i20",
        request_type: "one_time",
        preferred_date: "2026-05-31",
        notes: "Just returned from weekend trip, need interior deep clean",
        status: "pending",
        requested_at: new Date().toISOString(),
        amount: 50
      }
    ];
    setStorageItem("sv_interior_requests", defaultInteriorRequests);

    // Pre-seed the corresponding ad-hoc payment for the interior clean
    const defaultPayments = [
      {
        id: "pay-int-seed-1",
        customer_id: "cust-amit",
        customer_name: "Amit Kumar",
        vehicle_id: "veh-i20",
        amount: 50,
        date: "2026-05-31",
        payment_type: "ad_hoc",
        status: "pending",
        description: "One-Time Interior Cleaning — KA-03-MS-1111 on 2026-05-31"
      }
    ];
    setStorageItem("sv_inflow_payments", defaultPayments);

    // Seed Daily Service Logs for May 2026 to show robust streak calendar!
    const defaultLogs: DailyServiceLog[] = [];
    const vehiclesList = DEFAULT_VEHICLES;
    const washDays = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 26, 27];
    const skipDays = [6, 13, 19, 25];

    for (let day = 1; day <= 30; day++) {
      const dayStr = String(day).padStart(2, "0");
      const dateStr = `2026-05-${dayStr}`;

      vehiclesList.forEach(veh => {
        let status: "pending" | "washed" | "skipped" | "missed" = "pending";
        let reason: string | null = null;
        let notes: string | null = null;

        if (day === 30) {
          // Explicitly seed exactly 3 skips on May 30 to match the dashboard skips count!
          if (veh.id === "veh-i20") {
            status = "skipped";
            reason = "owner_away";
            notes = "Owner out of town for weekend";
          } else if (veh.id === "veh-swift") {
            status = "skipped";
            reason = "vehicle_not_present";
            notes = "Vehicle not in parking slot B-304";
          } else if (veh.id === "veh-duke") {
            status = "skipped";
            reason = "lockout";
            notes = "Bike locked under cover";
          } else {
            status = "washed";
          }
        } else if (day === 29) {
          status = "washed";
        } else if (veh.id === "veh-i20" || veh.id === "veh-activa") {
          status = washDays.includes(day) ? "washed" : (skipDays.includes(day) ? "skipped" : "pending");
          if (status === "skipped") {
            reason = "owner_away";
            notes = "Owner out of town";
          }
        } else {
          status = (day % 7 === 0) ? "skipped" : "washed";
          if (status === "skipped") {
            reason = "owner_away";
            notes = "Owner out of town";
          }
        }

        defaultLogs.push({
          id: `log-${veh.id}-${dateStr}`,
          agency_id: DEMO_AGENCY_ID,
          worker_id: veh.assigned_worker_id,
          vehicle_id: veh.id,
          log_date: dateStr,
          status,
          reason: reason as any,
          notes,
          marked_at: status !== "pending" ? `${dateStr}T08:30:00Z` : null
        });
      });
    }

    setStorageItem("sv_daily_service_logs", defaultLogs);
    localStorage.setItem("sv_db_initialized_v5", "true");
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
