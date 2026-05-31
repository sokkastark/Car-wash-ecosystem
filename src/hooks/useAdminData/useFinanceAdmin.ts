import { useState, useCallback } from "react";
import { mockStorage, Expense, InflowPayment } from "@/lib/mockStorage";

export function useFinanceAdmin(
  setLoading: (l: boolean) => void,
  fetchStats: () => Promise<void>
) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<InflowPayment[]>([]);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      setExpenses(mockStorage.getExpenses());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const addExpense = async (category: string, amount: number, date: string, description: string) => {
    setLoading(true);
    try {
      const res = mockStorage.addExpense(category, amount, date, description);
      await fetchExpenses();
      await fetchStats();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: string) => {
    setLoading(true);
    try {
      const res = mockStorage.deleteExpense(id);
      await fetchExpenses();
      await fetchStats();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (id: string, category: string, amount: number, date: string, description: string) => {
    setLoading(true);
    try {
      const res = mockStorage.updateExpense(id, category, amount, date, description);
      await fetchExpenses();
      await fetchStats();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = useCallback(async (month: string, year: string) => {
    setLoading(true);
    try {
      if (mockStorage.getInflowPayments) {
        setPayments(mockStorage.getInflowPayments(month, year));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const updatePaymentStatus = async (id: string, status: "pending" | "paid" | "deferred", month: string, year: string) => {
    setLoading(true);
    try {
      if (mockStorage.updatePaymentStatus) {
        mockStorage.updatePaymentStatus(id, status);
        await fetchPayments(month, year);
        await fetchStats();
      }
    } finally {
      setLoading(false);
    }
  };

  const addAdHocPayment = async (amount: number, date: string, description: string, status: "pending" | "paid" | "deferred", month: string, year: string) => {
    setLoading(true);
    try {
      if (mockStorage.addAdHocPayment) {
        mockStorage.addAdHocPayment(amount, date, description, status);
        await fetchPayments(month, year);
        await fetchStats();
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteAdHocPayment = async (id: string, month: string, year: string) => {
    setLoading(true);
    try {
      if (mockStorage.deleteAdHocPayment) {
        mockStorage.deleteAdHocPayment(id);
        await fetchPayments(month, year);
        await fetchStats();
      }
    } finally {
      setLoading(false);
    }
  };

  const markAllPaymentsPaid = async (month: string, year: string) => {
    setLoading(true);
    try {
      if (mockStorage.markAllPaymentsPaid) {
        mockStorage.markAllPaymentsPaid(month, year);
        await fetchPayments(month, year);
        await fetchStats();
      }
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}
