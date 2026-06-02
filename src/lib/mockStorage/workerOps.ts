import { Worker } from "./types";
import { getStorageItem, setStorageItem, initializeMockDatabase, generateUUID } from "./database";
import { DEFAULT_WORKERS, DEMO_AGENCY_ID } from "./seeds";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const workerOps = {
  getWorkers(apartmentId?: string): Worker[] {
    initializeMockDatabase();
    const workers = getStorageItem<Worker[]>("sv_workers", DEFAULT_WORKERS);
    if (apartmentId) {
      return workers.filter(w => Array.isArray(w.assigned_complex_ids) && w.assigned_complex_ids.includes(apartmentId));
    }
    return workers;
  },

  addWorker(name: string, phone: string, role: string, assigned_complex_ids: string[], monthly_salary: number): Worker {
    initializeMockDatabase();
    const workers = getStorageItem<Worker[]>("sv_workers", []);
    const newWorker: Worker = {
      id: generateUUID(),
      agency_id: DEMO_AGENCY_ID,
      name,
      phone,
      role: role as any || "washer",
      is_active: true,
      assigned_complex_ids: assigned_complex_ids || [],
      monthly_salary: monthly_salary || 0,
      salary_status: "pending",
      attendance_today: "present"
    };
    workers.push(newWorker);
    setStorageItem("sv_workers", workers);

    // Background push to Supabase relational table
    if (isSupabaseConfigured) {
      const dbRole = newWorker.role === "super_admin" || newWorker.role === "agency_owner" || newWorker.role === "supervisor" || newWorker.role === "washer" 
        ? newWorker.role 
        : "washer";
      supabase.from("workers").insert([{
        id: newWorker.id,
        agency_id: newWorker.agency_id,
        name: newWorker.name,
        phone: newWorker.phone,
        role: dbRole,
        is_active: newWorker.is_active
      }]).then(({ error }) => {
        if (error) console.error("[Supabase] Error inserting worker:", error);
      });
    }

    return newWorker;
  },

  updateWorker(id: string, name: string, phone: string, role: string, assigned_complex_ids: string[], monthly_salary: number, salary_status: string, attendance_today: string): Worker | null {
    initializeMockDatabase();
    const workers = getStorageItem<Worker[]>("sv_workers", []);
    const index = workers.findIndex(w => w.id === id);
    if (index === -1) return null;

    workers[index].name = name;
    workers[index].phone = phone;
    workers[index].role = role as any;
    workers[index].assigned_complex_ids = assigned_complex_ids || [];
    workers[index].monthly_salary = monthly_salary || 0;
    workers[index].salary_status = salary_status as any;
    workers[index].attendance_today = attendance_today as any;

    setStorageItem("sv_workers", workers);

    // Background update in Supabase relational table
    if (isSupabaseConfigured) {
      const dbRole = role === "super_admin" || role === "agency_owner" || role === "supervisor" || role === "washer" 
        ? role 
        : "washer";
      supabase.from("workers").update({
        name,
        phone,
        role: dbRole
      }).eq("id", id).then(({ error }) => {
        if (error) console.error("[Supabase] Error updating worker:", error);
      });
    }

    return workers[index];
  },

  toggleWorkerActive(workerId: string): Worker | null {
    initializeMockDatabase();
    const workers = getStorageItem<Worker[]>("sv_workers", []);
    const index = workers.findIndex(w => w.id === workerId);
    if (index === -1) return null;
    workers[index].is_active = !workers[index].is_active;
    setStorageItem("sv_workers", workers);

    // Background update in Supabase relational table
    if (isSupabaseConfigured) {
      supabase.from("workers").update({
        is_active: workers[index].is_active
      }).eq("id", workerId).then(({ error }) => {
        if (error) console.error("[Supabase] Error toggling worker status:", error);
      });
    }

    return workers[index];
  }
};
