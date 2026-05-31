import { useState, useCallback } from "react";
import { mockStorage, DetailedCustomer } from "@/lib/mockStorage";

export function useCustomerAdmin(
  setLoading: (l: boolean) => void,
  fetchStats: () => Promise<void>,
  fetchTrashItems: () => Promise<void>
) {
  const [customersDetailed, setCustomersDetailed] = useState<DetailedCustomer[]>([]);

  const fetchCustomersDetailed = useCallback(async () => {
    setLoading(true);
    try {
      setCustomersDetailed(mockStorage.getCustomersDetailed());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const addCustomerDetailed = async (data: any) => {
    setLoading(true);
    try {
      const res = mockStorage.addCustomerDetailed(data);
      if (res) {
        await fetchCustomersDetailed();
        await fetchStats();
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerDetailed = async (id: string, data: any) => {
    setLoading(true);
    try {
      const res = mockStorage.updateCustomerDetailed(id, data);
      if (res) {
        await fetchCustomersDetailed();
        await fetchStats();
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomerDetailed = async (id: string) => {
    setLoading(true);
    try {
      const res = mockStorage.deleteCustomerDetailed(id);
      if (res) {
        await fetchCustomersDetailed();
        await fetchStats();
        await fetchTrashItems();
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    customersDetailed,
    fetchCustomersDetailed,
    addCustomerDetailed,
    updateCustomerDetailed,
    deleteCustomerDetailed
  };
}
