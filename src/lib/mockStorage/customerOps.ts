import { DetailedCustomer, Customer, Vehicle, SubscriptionPlan, Worker, Apartment, Block, DetailedVehicle } from "./types";
import { getStorageItem, setStorageItem, initializeMockDatabase } from "./database";
import { DEFAULT_CUSTOMERS, DEFAULT_VEHICLES, DEFAULT_PLANS, DEFAULT_WORKERS, DEFAULT_APARTMENTS, DEFAULT_BLOCKS, DEMO_AGENCY_ID } from "./seeds";
import { complexOps } from "./complexOps";
import { trashOps } from "./trashOps";

export const customerOps = {
  getCustomersDetailed(): DetailedCustomer[] {
    initializeMockDatabase();
    const customers = getStorageItem<Customer[]>("sv_customers", DEFAULT_CUSTOMERS);
    const vehicles = getStorageItem<Vehicle[]>("sv_vehicles", DEFAULT_VEHICLES);
    const apartments = getStorageItem<Apartment[]>("sv_apartments", DEFAULT_APARTMENTS);
    const blocks = getStorageItem<Block[]>("sv_blocks", DEFAULT_BLOCKS);
    const plans = getStorageItem<SubscriptionPlan[]>("sv_plans", DEFAULT_PLANS);
    const workers = getStorageItem<Worker[]>("sv_workers", DEFAULT_WORKERS);

    const aptMap = new Map(apartments.map(a => [a.id, a.name]));
    const blockMap = new Map(blocks.map(b => [b.id, b.name]));
    const planMap = new Map(plans.map(p => [p.id, p]));
    const workerMap = new Map(workers.map(w => [w.id, w.name]));

    const result: DetailedCustomer[] = [];

    customers.forEach(cust => {
      const custVehicles = vehicles.filter(v => v.customer_id === cust.id);
      
      const detailedVehicles: DetailedVehicle[] = custVehicles.map(veh => {
        const plan = planMap.get(veh.plan_id);
        const basePrice = complexOps.getPlanPriceForComplex(cust.apartment_id, veh.plan_id, veh.vehicle_type, plans);
        
        let customPriceVal: number | null = null;
        if (veh.custom_price !== null && veh.custom_price !== undefined) {
          const parsed = Number(veh.custom_price);
          if (!isNaN(parsed)) {
            customPriceVal = parsed;
          }
        }
        const interiorPrice = (veh.vehicle_type !== "bike") ? (Number(veh.interior_frequency) || 0) * 50 : 0;
        const finalPrice = (customPriceVal !== null ? customPriceVal : basePrice) + interiorPrice;

        return {
          id: veh.id,
          licensePlate: veh.license_plate,
          vehicleType: veh.vehicle_type,
          make: veh.make,
          model: veh.model,
          color: veh.color,
          planId: veh.plan_id,
          planName: plan?.name || "No Plan",
          customPrice: customPriceVal,
          assignedWorkerId: veh.assigned_worker_id,
          assignedWorkerName: veh.assigned_worker_id ? (workerMap.get(veh.assigned_worker_id) || "N/A") : "Not Assigned",
          price: finalPrice,
          interiorFrequency: veh.vehicle_type !== "bike" ? (veh.interior_frequency || 0) : 0
        };
      });

      const overallPrice = detailedVehicles.reduce((sum, v) => sum + v.price, 0);

      result.push({
        id: cust.id,
        customCustomerId: cust.custom_customer_id,
        name: cust.name,
        phone: cust.phone_number,
        email: cust.email || "N/A",
        apartmentId: cust.apartment_id,
        apartmentName: aptMap.get(cust.apartment_id) || "N/A",
        blockId: cust.block_id || "",
        blockName: cust.block_id ? (blockMap.get(cust.block_id) || "N/A") : "N/A",
        flatNo: cust.flat_no || "N/A",
        parkingSlot: cust.parking_slot,
        vehicles: detailedVehicles,
        overallPrice,
        joinDate: cust.join_date,
        status: cust.status,
        leftDate: cust.left_date
      });
    });

    return result;
  },

  addCustomerDetailed(data: any): boolean {
    initializeMockDatabase();
    const customers = getStorageItem<Customer[]>("sv_customers", []);
    const vehicles = getStorageItem<Vehicle[]>("sv_vehicles", []);

    try {
      const customerId = `cust-${Date.now()}`;
      const cleanPhoneSuffix = data.phone.slice(-4) || "0000";
      const customId = `SV-BRG-${data.parkingSlot.replace("-", "")}-${cleanPhoneSuffix}`;

      const newCust: Customer = {
        id: customerId,
        agency_id: DEMO_AGENCY_ID,
        custom_customer_id: customId,
        name: data.name,
        phone_number: data.phone,
        email: data.email || null,
        apartment_id: data.apartmentId,
        block_id: data.blockId || null,
        flat_no: data.flatNo,
        parking_slot: data.parkingSlot,
        join_date: new Date().toISOString().split("T")[0],
        status: "active"
      };
      customers.push(newCust);

      if (data.vehicles && Array.isArray(data.vehicles)) {
        data.vehicles.forEach((veh: any, i: number) => {
          const newVeh: Vehicle = {
            id: `veh-${Date.now()}-${i}`,
            customer_id: customerId,
            license_plate: veh.licensePlate,
            vehicle_type: veh.vehicleType,
            make: veh.make,
            model: veh.model,
            color: veh.color,
            plan_id: veh.planId || "plan-daily",
            custom_price: veh.customPrice !== undefined ? veh.customPrice : null,
            assigned_worker_id: veh.assignedWorkerId || null,
            interior_frequency: veh.vehicleType !== "bike" ? (Number(veh.interiorFrequency) || 0) : 0
          };
          vehicles.push(newVeh);
        });
      }

      setStorageItem("sv_customers", customers);
      setStorageItem("sv_vehicles", vehicles);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  updateCustomerDetailed(id: string, data: any): boolean {
    initializeMockDatabase();
    const customers = getStorageItem<Customer[]>("sv_customers", []);
    let vehicles = getStorageItem<Vehicle[]>("sv_vehicles", []);

    const custIndex = customers.findIndex(c => c.id === id);
    if (custIndex === -1) return false;

    try {
      customers[custIndex].name = data.name;
      customers[custIndex].phone_number = data.phone;
      customers[custIndex].email = data.email || null;
      customers[custIndex].block_id = data.blockId || null;
      customers[custIndex].flat_no = data.flatNo;
      customers[custIndex].parking_slot = data.parkingSlot;

      vehicles = vehicles.filter(v => v.customer_id !== id);
      if (data.vehicles && Array.isArray(data.vehicles)) {
        data.vehicles.forEach((veh: any, i: number) => {
          vehicles.push({
            id: veh.id || `veh-${Date.now()}-${i}`,
            customer_id: id,
            license_plate: veh.licensePlate,
            vehicle_type: veh.vehicleType,
            make: veh.make,
            model: veh.model,
            color: veh.color,
            plan_id: veh.planId || "plan-daily",
            custom_price: veh.customPrice !== undefined ? veh.customPrice : null,
            assigned_worker_id: veh.assignedWorkerId || null,
            interior_frequency: veh.vehicleType !== "bike" ? (Number(veh.interiorFrequency) || 0) : 0
          });
        });
      }

      setStorageItem("sv_customers", customers);
      setStorageItem("sv_vehicles", vehicles);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  deleteCustomerDetailed(customerId: string): boolean {
    initializeMockDatabase();
    const customers = getStorageItem<Customer[]>("sv_customers", []);
    const vehicles = getStorageItem<Vehicle[]>("sv_vehicles", []);

    const custIndex = customers.findIndex(c => c.id === customerId);
    if (custIndex === -1) return false;

    try {
      const deletedCust = customers[custIndex];
      const custVehicles = vehicles.filter(v => v.customer_id === customerId);

      const snapData = { customer: deletedCust, vehicles: custVehicles };
      trashOps.moveToTrash("customer", deletedCust.name, snapData);

      const newCustomers = customers.filter(c => c.id !== customerId);
      const newVehicles = vehicles.filter(v => v.customer_id !== customerId);

      setStorageItem("sv_customers", newCustomers);
      setStorageItem("sv_vehicles", newVehicles);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};
