import { Block, SubscriptionPlan, Customer, Vehicle } from "./types";
import { getStorageItem, setStorageItem, initializeMockDatabase } from "./database";
import { DEFAULT_BLOCKS, DEFAULT_PLANS, DEMO_AGENCY_ID, DEMO_APARTMENT_ID } from "./seeds";
import { complexOps } from "./complexOps";
import { financeOps } from "./financeOps";

export const csvOps = {
  importCSVRows(rows: any[], fileName: string): boolean {
    initializeMockDatabase();
    
    const blocks = getStorageItem<Block[]>("sv_blocks", DEFAULT_BLOCKS);
    const plans = getStorageItem<SubscriptionPlan[]>("sv_plans", DEFAULT_PLANS);
    const customers = getStorageItem<Customer[]>("sv_customers", []);
    const vehicles = getStorageItem<Vehicle[]>("sv_vehicles", []);
    const workers = getStorageItem<any[]>("sv_workers", []);
 
    const blockMap = new Map(blocks.map(b => [b.name.toLowerCase(), b.id]));
    const planMap = new Map(plans.map(p => [p.name.toLowerCase(), p.id]));
    const workerMap = new Map(workers.filter(w => w.role === "washer").map(w => [w.name.trim().toLowerCase(), w.id]));
    
    const complexImportCounts: Record<string, number> = {};

    try {
      for (const row of rows) {
        const apts = complexOps.getApartments();
        let apt = apts.find(a => a.name.toLowerCase() === row.complexName.toLowerCase());
        if (!apt && row.complexName) {
          apt = complexOps.addApartment(row.complexName, "Imported Community", "Bengaluru");
        }
        const apartmentId = apt?.id || DEMO_APARTMENT_ID;
        const apartmentName = apt?.name || "Brigade Apartments";

        complexImportCounts[apartmentName] = (complexImportCounts[apartmentName] || 0) + 1;

        let blockId = blockMap.get(row.blockName.toLowerCase()) || null;
        if (!blockId && row.blockName) {
          const newBlock: Block = {
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            apartment_id: apartmentId,
            name: row.blockName
          };
          blocks.push(newBlock);
          blockId = newBlock.id;
          blockMap.set(row.blockName.toLowerCase(), blockId);
        }

        let planId = planMap.get(row.planName.toLowerCase());
        if (!planId) {
          const lowerName = (row.planName || "").toLowerCase();
          if (lowerName.includes("daily")) {
            planId = "plan-daily";
          } else if (lowerName.includes("alternate") || lowerName.includes("every other")) {
            planId = "plan-alternate";
          } else if (lowerName.includes("weekly")) {
            planId = "plan-weekly-once";
          } else {
            planId = plans[0]?.id || "plan-daily";
          }
        }

        const cleanPhoneSuffix = row.phone.slice(-4) || "0000";
        const customId = `SV-BRG-${row.parkingSlot.replace("-", "")}-${cleanPhoneSuffix}`;

        const customerId = `cust-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const newCust: Customer = {
          id: customerId,
          agency_id: DEMO_AGENCY_ID,
          custom_customer_id: customId,
          name: row.customerName,
          phone_number: row.phone,
          email: row.email || null,
          apartment_id: apartmentId,
          block_id: blockId,
          flat_no: row.flatNo || "",
          parking_slot: row.parkingSlot,
          join_date: new Date().toISOString().split("T")[0],
          status: "active"
        };
        customers.push(newCust);

        let customPriceVal: number | null = null;
        if (row.customPrice && typeof row.customPrice === "string" && row.customPrice.trim() !== "") {
          const parsed = parseFloat(row.customPrice);
          if (!isNaN(parsed)) {
            customPriceVal = parsed;
          }
        } else if (typeof row.customPrice === "number" && !isNaN(row.customPrice)) {
          customPriceVal = row.customPrice;
        }

        const assignedWorkerName = (row.assignedWorker || "").trim().toLowerCase();
        const workerId = assignedWorkerName ? workerMap.get(assignedWorkerName) : null;

        const vehicleId = `veh-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const newVeh: Vehicle = {
          id: vehicleId,
          customer_id: customerId,
          license_plate: row.licensePlate,
          vehicle_type: (row.vehicleType || "car").toLowerCase() as any,
          make: row.make || "N/A",
          model: row.model || "N/A",
          color: row.color || "N/A",
          plan_id: planId,
          custom_price: customPriceVal,
          assigned_worker_id: workerId || null,
          interior_frequency: Number(row.interiorFrequency) || 0
        };
        vehicles.push(newVeh);
      }

      setStorageItem("sv_blocks", blocks);
      setStorageItem("sv_customers", customers);
      setStorageItem("sv_vehicles", vehicles);

      financeOps.saveUploadLog({
        fileName,
        totalCount: rows.length,
        breakdown: complexImportCounts
      });

      return true;
    } catch (e) {
      console.error("[mockStorage] Bulk Onboarding CSV Error:", e);
      return false;
    }
  }
};
