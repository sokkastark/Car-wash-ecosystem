import { useState, useEffect, useCallback } from "react";
import { 
  mockStorage, 
  Complaint, 
  DashboardStats, 
  TrashItem, 
  UploadLog, 
  SubscriptionPlan 
} from "@/lib/mockStorage";
import { useComplexAdmin } from "./useAdminData/useComplexAdmin";
import { useWorkerAdmin } from "./useAdminData/useWorkerAdmin";
import { useCustomerAdmin } from "./useAdminData/useCustomerAdmin";
import { useFinanceAdmin } from "./useAdminData/useFinanceAdmin";

export function useAdminData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Standard core dashboard states
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalVehicles: 0, totalComplexes: 0, activeCleaners: 0, mrr: "₹0" });
  const [complexesProgress, setComplexesProgress] = useState<any[]>([]);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [uploadLogs, setUploadLogs] = useState<UploadLog[]>([]);

  // State load definitions
  const fetchStats = useCallback(async (apartmentId?: string) => {
    try {
      setStats(mockStorage.getStats(apartmentId));
      setComplexesProgress(mockStorage.getComplexesProgress(apartmentId));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchTrashItems = useCallback(async () => {
    try {
      setTrashItems(mockStorage.getTrashItems());
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchComplaints = useCallback(async (apartmentId?: string) => {
    try {
      setComplaints(mockStorage.getComplaints(apartmentId));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      setPlans(mockStorage.getPlans());
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchUploadLogs = useCallback(async () => {
    try {
      setUploadLogs(mockStorage.getUploadLogs());
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Sub-hook state delegates
  const { customersDetailed, fetchCustomersDetailed, addCustomerDetailed, updateCustomerDetailed, deleteCustomerDetailed } = useCustomerAdmin(setLoading, fetchStats, fetchTrashItems);
  const { apartments, fetchApartments, addApartment, updateApartment, deleteApartment, addBlock, deleteBlock, getComplexPlanPrices, saveComplexPlanPrices } = useComplexAdmin(setLoading, fetchStats, fetchTrashItems, fetchCustomersDetailed);
  const { workers, fetchWorkers, addWorker, updateWorker, toggleWorkerStatus, deleteWorker } = useWorkerAdmin(setLoading, fetchStats, fetchTrashItems);
  const { 
    expenses, 
    payments, 
    fetchExpenses, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    fetchPayments, 
    updatePaymentStatus, 
    addAdHocPayment, 
    deleteAdHocPayment, 
    markAllPaymentsPaid 
  } = useFinanceAdmin(setLoading, fetchStats);

  // Common shared mutations
  const resolveComplaint = async (complaintId: string) => {
    try {
      mockStorage.resolveComplaint(complaintId);
      await fetchComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  const restoreItem = async (trashId: string) => {
    setLoading(true);
    try {
      const res = mockStorage.restoreFromTrash(trashId);
      if (res) {
        await fetchApartments();
        await fetchWorkers();
        await fetchCustomersDetailed();
        await fetchStats();
        await fetchTrashItems();
      }
      return res;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const purgeItemPermanently = async (trashId: string) => {
    setLoading(true);
    try {
      const res = mockStorage.purgeItemPermanently(trashId);
      if (res) {
        await fetchTrashItems();
      }
      return res;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getFinancialSummary = useCallback((month?: string, year?: string) => {
    return mockStorage.getFinancialSummary(month, year);
  }, []);

  const getAnalyticsData = useCallback(() => {
    return mockStorage.getAnalyticsData();
  }, []);

  useEffect(() => {
    fetchApartments();
    fetchWorkers();
    fetchComplaints();
    fetchStats();
    fetchCustomersDetailed();
    fetchPlans();
    fetchTrashItems();
    fetchUploadLogs();
    fetchExpenses();
  }, [fetchApartments, fetchWorkers, fetchComplaints, fetchStats, fetchCustomersDetailed, fetchPlans, fetchTrashItems, fetchUploadLogs, fetchExpenses]);

  return {
    apartments,
    workers,
    complaints,
    customersDetailed,
    plans,
    stats,
    complexesProgress,
    trashItems,
    uploadLogs,
    expenses,
    loading,
    error,
    refetchApartments: fetchApartments,
    refetchWorkers: fetchWorkers,
    refetchComplaints: fetchComplaints,
    refetchStats: fetchStats,
    refetchCustomersDetailed: fetchCustomersDetailed,
    refetchTrashItems: fetchTrashItems,
    refetchUploadLogs: fetchUploadLogs,
    refetchExpenses: fetchExpenses,
    addApartment,
    updateApartment,
    deleteApartment,
    addBlock,
    deleteBlock,
    addWorker,
    updateWorker,
    toggleWorkerStatus,
    deleteWorker,
    resolveComplaint,
    addCustomerDetailed,
    updateCustomerDetailed,
    deleteCustomerDetailed,
    restoreItem,
    purgeItemPermanently,
    getComplexPlanPrices,
    saveComplexPlanPrices,
    addExpense,
    updateExpense,
    deleteExpense,
    payments,
    fetchPayments,
    updatePaymentStatus,
    addAdHocPayment,
    deleteAdHocPayment,
    markAllPaymentsPaid,
    getFinancialSummary,
    getAnalyticsData
  };
}
