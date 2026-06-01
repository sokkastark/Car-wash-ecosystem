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
    // Build worker map with both full name and first-name-only keys for flexible CSV matching
    const workerMap = new Map<string, string>();
    workers.filter(w => w.role === "washer").forEach(w => {
      const fullKey = w.name.trim().toLowerCase();
      workerMap.set(fullKey, w.id);
      // Also index by first name only (e.g. "shanmugha" maps to same worker)
      const firstKey = fullKey.split(" ")[0];
      if (firstKey && !workerMap.has(firstKey)) {
        workerMap.set(firstKey, w.id);
      }
    });
    // Fuzzy lookup helper: tries exact, then first-word, then partial includes
    const findWorkerId = (rawName: string): string | null => {
      if (!rawName) return null;
      const key = rawName.trim().toLowerCase();
      if (workerMap.has(key)) return workerMap.get(key)!;
      // Try first word match
      const firstWord = key.split(" ")[0];
      if (workerMap.has(firstWord)) return workerMap.get(firstWord)!;
      // Try includes match
      const entries = Array.from(workerMap.entries());
      for (let j = 0; j < entries.length; j++) {
        const mapKey = entries[j][0];
        const id = entries[j][1];
        if (mapKey.includes(key) || key.includes(mapKey)) return id;
      }
      return null;
    };
    
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

        const cleanName = (row.customerName || "RESIDENT").trim().split(" ")[0].toUpperCase().replace(/[^A-Z0-9]/g, "");
        const cleanFlat = String(row.flatNo || row.parkingSlot || "000").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
        
        let customId = "";
        const minLen = Math.min(cleanName.length, cleanFlat.length);
        for (let i = 0; i < minLen; i++) {
          customId += cleanName[i] + cleanFlat[i];
        }
        if (customId.length < 4) {
          const maxLen = Math.max(cleanName.length, cleanFlat.length);
          for (let i = minLen; i < maxLen; i++) {
            if (i < cleanName.length) customId += cleanName[i];
            if (i < cleanFlat.length) customId += cleanFlat[i];
          }
        }

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

        const assignedWorkerName = (row.assignedWorker || "").trim();
        const workerId = assignedWorkerName ? findWorkerId(assignedWorkerName) : null;
        if (workerId) {
          const wObj = workers.find(w => w.id === workerId);
          if (wObj) {
            if (!Array.isArray(wObj.assigned_complex_ids)) {
              wObj.assigned_complex_ids = [];
            }
            if (!wObj.assigned_complex_ids.includes(apartmentId)) {
              wObj.assigned_complex_ids.push(apartmentId);
            }
          }
        }

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
      setStorageItem("sv_workers", workers);

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
