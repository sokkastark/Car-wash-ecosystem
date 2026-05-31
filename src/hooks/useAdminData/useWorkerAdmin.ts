import { useState, useCallback } from "react";
import { mockStorage, Worker } from "@/lib/mockStorage";

export function useWorkerAdmin(
  setLoading: (l: boolean) => void,
  fetchStats: () => Promise<void>,
  fetchTrashItems: () => Promise<void>
) {
  const [workers, setWorkers] = useState<Worker[]>([]);

  const fetchWorkers = useCallback(async (apartmentId?: string) => {
    setLoading(true);
    try {
      setWorkers(mockStorage.getWorkers(apartmentId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const addWorker = async (name: string, phone: string, role: string, assignedComplexIds: string[], salary: number) => {
    setLoading(true);
    try {
      const res = mockStorage.addWorker(name, phone, role, assignedComplexIds, salary);
      await fetchWorkers();
      await fetchStats();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const updateWorker = async (id: string, name: string, phone: string, role: string, assignedComplexIds: string[], salary: number, salaryStatus: string, attendance: string) => {
    setLoading(true);
    try {
      const res = mockStorage.updateWorker(id, name, phone, role, assignedComplexIds, salary, salaryStatus, attendance);
      await fetchWorkers();
      await fetchStats();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkerStatus = async (workerId: string) => {
    setLoading(true);
    try {
      mockStorage.toggleWorkerActive(workerId);
      await fetchWorkers();
      await fetchStats();
    } finally {
      setLoading(false);
    }
  };

  const deleteWorker = async (id: string) => {
    setLoading(true);
    try {
      const res = mockStorage.deleteWorker(id);
      await fetchWorkers();
      await fetchStats();
      await fetchTrashItems();
      return res;
    } finally {
      setLoading(false);
    }
  };

  return {
    workers,
    fetchWorkers,
    addWorker,
    updateWorker,
    toggleWorkerStatus,
    deleteWorker
  };
}
