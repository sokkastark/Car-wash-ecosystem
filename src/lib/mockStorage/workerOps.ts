import { Worker } from "./types";
import { getStorageItem, setStorageItem, initializeMockDatabase } from "./database";
import { DEFAULT_WORKERS, DEMO_AGENCY_ID } from "./seeds";

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
      id: `worker-${Date.now()}`,
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
    return workers[index];
  },

  toggleWorkerActive(workerId: string): Worker | null {
    initializeMockDatabase();
    const workers = getStorageItem<Worker[]>("sv_workers", []);
    const index = workers.findIndex(w => w.id === workerId);
    if (index === -1) return null;
    workers[index].is_active = !workers[index].is_active;
    setStorageItem("sv_workers", workers);
    return workers[index];
  }
};
