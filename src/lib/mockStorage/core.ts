import { Apartment, Block, Customer, Vehicle, Worker, SubscriptionPlan } from "./types";
import { getStorageItem, setStorageItem, initializeMockDatabase } from "./database";
import { complexOps } from "./complexOps";
import { workerOps } from "./workerOps";
import { customerOps } from "./customerOps";
import { serviceOps } from "./serviceOps";
import { csvOps } from "./csvOps";
import { trashOps } from "./trashOps";
import { financeOps } from "./financeOps";
import { analyticsOps } from "./analyticsOps";
import { inflowOps } from "./inflowOps";
import { DEFAULT_PLANS } from "./seeds";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export { initializeMockDatabase } from "./database";

export const mockStorage = {
  // Complexes & Pricing
  getApartments: complexOps.getApartments,
  addApartment: complexOps.addApartment,
  updateApartment: complexOps.updateApartment,
  addBlock: complexOps.addBlock,
  deleteBlock: complexOps.deleteBlock,
  getComplexPlanPrices: complexOps.getComplexPlanPrices,
  saveComplexPlanPrices: complexOps.saveComplexPlanPrices,
  getPlanPriceForComplex: complexOps.getPlanPriceForComplex,

  deleteApartment(id: string): boolean {
    initializeMockDatabase();
    const apartments = getStorageItem<Apartment[]>("sv_apartments", []);
    const blocks = getStorageItem<Block[]>("sv_blocks", []);
    const customers = getStorageItem<Customer[]>("sv_customers", []);
    const vehicles = getStorageItem<Vehicle[]>("sv_vehicles", []);

    const aptIndex = apartments.findIndex(a => a.id === id);
    if (aptIndex === -1) return false;

    try {
      const deletedApt = apartments[aptIndex];
      const aptBlocks = blocks.filter(b => b.apartment_id === id);
      const aptCustomers = customers.filter(c => c.apartment_id === id);
      const customerIds = new Set(aptCustomers.map(c => c.id));
      const aptVehicles = vehicles.filter(v => customerIds.has(v.customer_id));

      const snapData = {
        apartment: deletedApt,
        blocks: aptBlocks,
        customers: aptCustomers,
        vehicles: aptVehicles
      };

      trashOps.moveToTrash("complex", deletedApt.name, snapData);

      const newApartments = apartments.filter(a => a.id !== id);
      const newBlocks = blocks.filter(b => b.apartment_id !== id);
      const newCustomers = customers.filter(c => c.apartment_id !== id);
      const newVehicles = vehicles.filter(v => !customerIds.has(v.customer_id));

      setStorageItem("sv_apartments", newApartments);
      setStorageItem("sv_blocks", newBlocks);
      setStorageItem("sv_customers", newCustomers);
      setStorageItem("sv_vehicles", newVehicles);

      // Background delete from Supabase apartments table
      if (isSupabaseConfigured) {
        supabase.from("apartments").delete().eq("id", id).then(({ error }) => {
          if (error) console.error("[Supabase] Error deleting apartment:", error);
        });
      }

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // Workers
  getWorkers: workerOps.getWorkers,
  addWorker: workerOps.addWorker,
  updateWorker: workerOps.updateWorker,
  toggleWorkerActive: workerOps.toggleWorkerActive,

  deleteWorker(id: string): boolean {
    initializeMockDatabase();
    const workers = getStorageItem<Worker[]>("sv_workers", []);
    const index = workers.findIndex(w => w.id === id);
    if (index === -1) return false;

    try {
      const deletedWorker = workers[index];
      trashOps.moveToTrash("worker", deletedWorker.name, deletedWorker);

      const newWorkers = workers.filter(w => w.id !== id);
      setStorageItem("sv_workers", newWorkers);

      // Background delete from Supabase workers table
      if (isSupabaseConfigured) {
        supabase.from("workers").delete().eq("id", id).then(({ error }) => {
          if (error) console.error("[Supabase] Error deleting worker:", error);
        });
      }

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // Customers & Vehicles
  getCustomersDetailed: customerOps.getCustomersDetailed,
  addCustomerDetailed: customerOps.addCustomerDetailed,
  updateCustomerDetailed: customerOps.updateCustomerDetailed,
  deleteCustomerDetailed: customerOps.deleteCustomerDetailed,

  // Plans
  getPlans(): SubscriptionPlan[] {
    initializeMockDatabase();
    return getStorageItem<SubscriptionPlan[]>("sv_plans", DEFAULT_PLANS);
  },
  addPlan(plan: SubscriptionPlan): boolean {
    initializeMockDatabase();
    const plans = getStorageItem<SubscriptionPlan[]>("sv_plans", DEFAULT_PLANS);
    plans.push(plan);
    setStorageItem("sv_plans", plans);
    return true;
  },
  updatePlan(updated: SubscriptionPlan): boolean {
    initializeMockDatabase();
    const plans = getStorageItem<SubscriptionPlan[]>("sv_plans", DEFAULT_PLANS);
    const idx = plans.findIndex(p => p.id === updated.id);
    if (idx === -1) return false;
    plans[idx] = updated;
    setStorageItem("sv_plans", plans);
    return true;
  },
  deletePlan(id: string): boolean {
    initializeMockDatabase();
    const plans = getStorageItem<SubscriptionPlan[]>("sv_plans", DEFAULT_PLANS);
    const updated = plans.filter(p => p.id !== id);
    setStorageItem("sv_plans", updated);
    return true;
  },

  // Daily service schedules & logs
  getDailyServiceLogs: serviceOps.getDailyServiceLogs,
  getWorkerTasks: serviceOps.getWorkerTasks,
  updateTaskStatus: serviceOps.updateTaskStatus,
  getCustomerDailyLogs: serviceOps.getCustomerDailyLogs,
  submitCustomerComplaint: serviceOps.submitCustomerComplaint,
  getComplaints: serviceOps.getComplaints,
  resolveComplaint: serviceOps.resolveComplaint,

  // Interior Cleaning Requests (recurring + one-time)
  getInteriorCleaningRequests: serviceOps.getInteriorCleaningRequests,
  requestAdHocInteriorCleaning: serviceOps.requestAdHocInteriorCleaning,
  cancelInteriorCleaningRequest: serviceOps.cancelInteriorCleaningRequest,

  // CSV Import Onboardings
  importCSVRows: csvOps.importCSVRows,

  // Trash
  getTrashItems: trashOps.getTrashItems,
  restoreFromTrash: trashOps.restoreFromTrash,
  purgeItemPermanently: trashOps.purgeItemPermanently,

  // Finance Ledger
  getExpenses: financeOps.getExpenses,
  addExpense: financeOps.addExpense,
  updateExpense: financeOps.updateExpense,
  deleteExpense: financeOps.deleteExpense,
  getFinancialSummary: financeOps.getFinancialSummary,
  getAnalyticsData: analyticsOps.getAnalyticsData,
  getStats: analyticsOps.getStats,
  getComplexesProgress: analyticsOps.getComplexesProgress,
  getUploadLogs: financeOps.getUploadLogs,
  saveUploadLog: financeOps.saveUploadLog,

  // Cash Inflows Ledger
  getInflowPayments: inflowOps.getInflowPayments,
  updatePaymentStatus: inflowOps.updatePaymentStatus,
  addAdHocPayment: inflowOps.addAdHocPayment,
  deleteAdHocPayment: inflowOps.deleteAdHocPayment,
  markAllPaymentsPaid: inflowOps.markAllPaymentsPaid
};
