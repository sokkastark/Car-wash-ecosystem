import { DetailedCustomer, Customer, Vehicle, SubscriptionPlan, Worker, Apartment, Block, DetailedVehicle } from "./types";
import { getStorageItem, setStorageItem, initializeMockDatabase, generateUUID, mapPlanId } from "./database";
import { DEFAULT_CUSTOMERS, DEFAULT_VEHICLES, DEFAULT_PLANS, DEFAULT_WORKERS, DEFAULT_APARTMENTS, DEFAULT_BLOCKS, DEMO_AGENCY_ID } from "./seeds";
import { complexOps } from "./complexOps";
import { trashOps } from "./trashOps";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
          planName: customPriceVal !== null ? "Custom Plan" : (plan?.name || "No Plan"),
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
      const customerId = generateUUID();
      const cleanName = (data.name || "RESIDENT").trim().split(" ")[0].toUpperCase().replace(/[^A-Z0-9]/g, "");
      const cleanFlat = String(data.flatNo || data.parkingSlot || "0").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
      
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

      const addedVehicles: Vehicle[] = [];
      if (data.vehicles && Array.isArray(data.vehicles)) {
        data.vehicles.forEach((veh: any, i: number) => {
          const newVeh: Vehicle = {
            id: generateUUID(),
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
          addedVehicles.push(newVeh);
        });
      }

      setStorageItem("sv_customers", customers);
      setStorageItem("sv_vehicles", vehicles);

      // Background push to Supabase relational tables
      if (isSupabaseConfigured) {
        supabase.from("customers").insert([{
          id: newCust.id,
          agency_id: newCust.agency_id,
          custom_customer_id: newCust.custom_customer_id,
          name: newCust.name,
          phone_number: newCust.phone_number,
          email: newCust.email,
          apartment_id: newCust.apartment_id,
          block_id: newCust.block_id,
          parking_slot: newCust.parking_slot
        }]).then(({ error: custErr }) => {
          if (custErr) {
            console.error("[Supabase] Error inserting customer:", custErr);
            return;
          }

          if (addedVehicles.length > 0) {
            const mappedVehs = addedVehicles.map(v => {
              const dbType = v.vehicle_type === "bike" ? "bike" : v.vehicle_type === "suv" ? "suv" : "car";
              return {
                id: v.id,
                customer_id: v.customer_id,
                license_plate: v.license_plate,
                vehicle_type: dbType,
                make_model: `${v.make} ${v.model}`.trim(),
                color: v.color
              };
            });

            supabase.from("vehicles").insert(mappedVehs).then(({ error: vehErr }) => {
              if (vehErr) {
                console.error("[Supabase] Error inserting vehicles:", vehErr);
                return;
              }

              // Insert subscriptions
              const mappedSubs = addedVehicles.map(v => ({
                id: generateUUID(),
                vehicle_id: v.id,
                plan_id: mapPlanId(v.plan_id),
                start_date: new Date().toISOString().split("T")[0],
                is_active: true
              }));
              supabase.from("subscriptions").insert(mappedSubs).then(({ error: subErr }) => {
                if (subErr) console.error("[Supabase] Error inserting subscriptions:", subErr);
              });
            });
          }
        });
      }

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

      const cleanName = (data.name || "RESIDENT").trim().split(" ")[0].toUpperCase().replace(/[^A-Z0-9]/g, "");
      const cleanFlat = String(data.flatNo || data.parkingSlot || "0").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
      
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
      customers[custIndex].custom_customer_id = customId;

      const oldVehicles = vehicles.filter(v => v.customer_id === id);
      vehicles = vehicles.filter(v => v.customer_id !== id);
      
      const newVehicles: Vehicle[] = [];
      if (data.vehicles && Array.isArray(data.vehicles)) {
        data.vehicles.forEach((veh: any, i: number) => {
          newVehicles.push({
            id: veh.id || generateUUID(),
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
      vehicles.push(...newVehicles);

      setStorageItem("sv_customers", customers);
      setStorageItem("sv_vehicles", vehicles);

      // Background sync to Supabase relational tables
      if (isSupabaseConfigured) {
        // 1. Update customer row
        supabase.from("customers").update({
          name: data.name,
          phone_number: data.phone,
          email: data.email || null,
          block_id: data.blockId || null,
          parking_slot: data.parkingSlot,
          custom_customer_id: customId
        }).eq("id", id).then(({ error: custErr }) => {
          if (custErr) {
            console.error("[Supabase] Error updating customer:", custErr);
            return;
          }

          // 2. Delete existing vehicles of this customer (cascade handles subscriptions)
          const oldVehIds = oldVehicles.map(ov => ov.id);
          const deletePromise = oldVehIds.length > 0 
            ? supabase.from("vehicles").delete().in("id", oldVehIds)
            : Promise.resolve({ error: null });

          deletePromise.then(({ error: delErr }) => {
            if (delErr) {
              console.error("[Supabase] Error deleting old vehicles:", delErr);
              return;
            }

            // 3. Insert new vehicles
            if (newVehicles.length > 0) {
              const mappedVehs = newVehicles.map(v => {
                const dbType = v.vehicle_type === "bike" ? "bike" : v.vehicle_type === "suv" ? "suv" : "car";
                return {
                  id: v.id,
                  customer_id: v.customer_id,
                  license_plate: v.license_plate,
                  vehicle_type: dbType,
                  make_model: `${v.make} ${v.model}`.trim(),
                  color: v.color
                };
              });

              supabase.from("vehicles").insert(mappedVehs).then(({ error: vehErr }) => {
                if (vehErr) {
                  console.error("[Supabase] Error inserting new vehicles:", vehErr);
                  return;
                }

                // 4. Insert new subscriptions
                const mappedSubs = newVehicles.map(v => ({
                  id: generateUUID(),
                  vehicle_id: v.id,
                  plan_id: mapPlanId(v.plan_id),
                  start_date: new Date().toISOString().split("T")[0],
                  is_active: true
                }));

                supabase.from("subscriptions").insert(mappedSubs).then(({ error: subErr }) => {
                  if (subErr) console.error("[Supabase] Error inserting subscriptions:", subErr);
                });
              });
            }
          });
        });
      }

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

      // Background sync to Supabase (Postgres CASCADE handles vehicles/subscriptions)
      if (isSupabaseConfigured) {
        supabase.from("customers").delete().eq("id", customerId).then(({ error }) => {
          if (error) console.error("[Supabase] Error deleting customer:", error);
        });
      }

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};
