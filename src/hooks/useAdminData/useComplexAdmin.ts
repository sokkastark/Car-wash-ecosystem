import { useState, useCallback } from "react";
import { mockStorage, Apartment, ComplexPlanPrice } from "@/lib/mockStorage";

export function useComplexAdmin(
  setLoading: (l: boolean) => void,
  fetchStats: () => Promise<void>,
  fetchTrashItems: () => Promise<void>,
  fetchCustomersDetailed: () => Promise<void>
) {
  const [apartments, setApartments] = useState<Apartment[]>([]);

  const fetchApartments = useCallback(async () => {
    setLoading(true);
    try {
      setApartments(mockStorage.getApartments());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const addApartment = async (name: string, address: string, city: string) => {
    setLoading(true);
    try {
      const res = mockStorage.addApartment(name, address, city);
      await fetchApartments();
      await fetchStats();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const updateApartment = async (id: string, name: string, address: string, city: string) => {
    setLoading(true);
    try {
      const res = mockStorage.updateApartment(id, name, address, city);
      await fetchApartments();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const deleteApartment = async (id: string) => {
    setLoading(true);
    try {
      const res = mockStorage.deleteApartment(id);
      await fetchApartments();
      await fetchStats();
      await fetchTrashItems();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const addBlock = async (apartmentId: string, name: string) => {
    setLoading(true);
    try {
      const res = mockStorage.addBlock(apartmentId, name);
      await fetchApartments();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const deleteBlock = async (id: string) => {
    setLoading(true);
    try {
      const res = mockStorage.deleteBlock(id);
      await fetchApartments();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const getComplexPlanPrices = useCallback((complexId: string) => {
    return mockStorage.getComplexPlanPrices(complexId);
  }, []);

  const saveComplexPlanPrices = useCallback(async (complexId: string, prices: ComplexPlanPrice[]) => {
    setLoading(true);
    try {
      const res = mockStorage.saveComplexPlanPrices(complexId, prices);
      if (res) {
        await fetchCustomersDetailed();
      }
      return res;
    } finally {
      setLoading(false);
    }
  }, [setLoading, fetchCustomersDetailed]);

  return {
    apartments,
    fetchApartments,
    addApartment,
    updateApartment,
    deleteApartment,
    addBlock,
    deleteBlock,
    getComplexPlanPrices,
    saveComplexPlanPrices
  };
}
