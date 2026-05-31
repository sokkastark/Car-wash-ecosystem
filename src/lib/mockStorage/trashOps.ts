import { TrashItem, Apartment, Block, Customer, Vehicle, Worker } from "./types";
import { getStorageItem, setStorageItem, initializeMockDatabase } from "./database";
import { DEFAULT_APARTMENTS, DEFAULT_BLOCKS, DEFAULT_CUSTOMERS, DEFAULT_VEHICLES, DEFAULT_WORKERS } from "./seeds";

export const trashOps = {
  getTrashItems(): TrashItem[] {
    initializeMockDatabase();
    return getStorageItem<TrashItem[]>("sv_trash", []);
  },

  moveToTrash(type: "complex" | "worker" | "customer", name: string, data: any) {
    initializeMockDatabase();
    const trash = getStorageItem<TrashItem[]>("sv_trash", []);
    const newItem: TrashItem = {
      id: `trash-${Date.now()}`,
      type,
      name,
      data,
      deleted_at: new Date().toISOString()
    };
    trash.unshift(newItem);
    setStorageItem("sv_trash", trash);
  },

  restoreFromTrash(trashId: string): boolean {
    initializeMockDatabase();
    const trash = getStorageItem<TrashItem[]>("sv_trash", []);
    const index = trash.findIndex(t => t.id === trashId);
    if (index === -1) return false;

    const item = trash[index];
    const data = item.data;

    try {
      if (item.type === "complex") {
        const apartments = getStorageItem<Apartment[]>("sv_apartments", DEFAULT_APARTMENTS);
        const blocks = getStorageItem<Block[]>("sv_blocks", DEFAULT_BLOCKS);
        const customers = getStorageItem<Customer[]>("sv_customers", DEFAULT_CUSTOMERS);
        const vehicles = getStorageItem<Vehicle[]>("sv_vehicles", DEFAULT_VEHICLES);

        apartments.push(data.apartment);
        if (data.blocks) blocks.push(...data.blocks);
        if (data.customers) customers.push(...data.customers);
        if (data.vehicles) vehicles.push(...data.vehicles);

        setStorageItem("sv_apartments", apartments);
        setStorageItem("sv_blocks", blocks);
        setStorageItem("sv_customers", customers);
        setStorageItem("sv_vehicles", vehicles);
      } 
      else if (item.type === "worker") {
        const workers = getStorageItem<Worker[]>("sv_workers", DEFAULT_WORKERS);
        workers.push(data);
        setStorageItem("sv_workers", workers);
      } 
      else if (item.type === "customer") {
        const customers = getStorageItem<Customer[]>("sv_customers", DEFAULT_CUSTOMERS);
        const vehicles = getStorageItem<Vehicle[]>("sv_vehicles", DEFAULT_VEHICLES);

        customers.push(data.customer);
        if (data.vehicles) vehicles.push(...data.vehicles);

        setStorageItem("sv_customers", customers);
        setStorageItem("sv_vehicles", vehicles);
      }

      const newTrash = trash.filter(t => t.id !== trashId);
      setStorageItem("sv_trash", newTrash);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  purgeItemPermanently(trashId: string): boolean {
    initializeMockDatabase();
    const trash = getStorageItem<TrashItem[]>("sv_trash", []);
    const newTrash = trash.filter(t => t.id !== trashId);
    setStorageItem("sv_trash", newTrash);
    return true;
  }
};
