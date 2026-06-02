import { DailyServiceLog, Complaint, Vehicle, Customer, Block, InteriorCleaningRequest } from "./types";
import { getStorageItem, setStorageItem, initializeMockDatabase } from "./database";
import { DEFAULT_VEHICLES, DEFAULT_CUSTOMERS, DEFAULT_APARTMENTS, DEFAULT_BLOCKS, DEFAULT_COMPLAINTS, DEMO_AGENCY_ID } from "./seeds";
import { complexOps } from "./complexOps";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const serviceOps = {
  getDailyServiceLogs(dateStr?: string): DailyServiceLog[] {
    initializeMockDatabase();
    const logs = getStorageItem<DailyServiceLog[]>("sv_daily_service_logs", []);
    if (dateStr) {
      return logs.filter(l => l.log_date === dateStr);
    }
    return logs;
  },

  getWorkerTasks(workerId: string, dateStr: string) {
    initializeMockDatabase();
    const vehicles = getStorageItem<Vehicle[]>("sv_vehicles", DEFAULT_VEHICLES);
    const customers = getStorageItem<Customer[]>("sv_customers", DEFAULT_CUSTOMERS);
    const apartments = complexOps.getApartments();
    const blocks = getStorageItem<Block[]>("sv_blocks", DEFAULT_BLOCKS);
    let logs = getStorageItem<DailyServiceLog[]>("sv_daily_service_logs", []);
    const interiorReqs = getStorageItem<InteriorCleaningRequest[]>("sv_interior_requests", []);

    const aptMap = new Map(apartments.map(a => [a.id, a.name]));
    const blockMap = new Map(blocks.map(b => [b.id, b.name]));
    const custMap = new Map(customers.map(c => [c.id, c]));

    const workerVehicles = vehicles.filter(v => v.assigned_worker_id === workerId);

    const tasks = workerVehicles.map(veh => {
      const cust = custMap.get(veh.customer_id);
      
      let log = logs.find(l => l.vehicle_id === veh.id && l.log_date === dateStr);
      if (!log) {
        log = {
          id: `log-${veh.id}-${dateStr}`,
          agency_id: DEMO_AGENCY_ID,
          worker_id: workerId,
          vehicle_id: veh.id,
          log_date: dateStr,
          status: "pending",
          reason: null,
          notes: null,
          marked_at: null
        };
        logs.push(log);
        setStorageItem("sv_daily_service_logs", logs);
      }

      const hasInteriorRequest = interiorReqs.some(
        r => r.vehicle_id === veh.id && (r.status === "pending" || r.status === "scheduled")
      );

      return {
        id: log.id,
        vehicleId: veh.id,
        license: veh.license_plate,
        model: `${veh.make} ${veh.model}`,
        vehicleType: veh.vehicle_type,
        slot: cust ? `${cust.flat_no || ""}` : "N/A",
        parkingSlot: cust ? cust.parking_slot : "N/A",
        status: log.status,
        apartmentName: cust ? (aptMap.get(cust.apartment_id) || "N/A") : "N/A",
        blockName: cust && cust.block_id ? (blockMap.get(cust.block_id) || "N/A") : "N/A",
        interiorFrequency: veh.vehicle_type !== "bike" ? (veh.interior_frequency || 0) : 0,
        hasInteriorRequest,
        markedAt: log.marked_at
      };
    });

    return tasks;
  },

  updateTaskStatus(vehicleId: string, workerId: string, dateStr: string, status: "pending" | "washed" | "skipped" | "missed", reason?: string, notes?: string): boolean {
    initializeMockDatabase();
    const logs = getStorageItem<DailyServiceLog[]>("sv_daily_service_logs", []);
    
    let index = logs.findIndex(l => l.vehicle_id === vehicleId && l.log_date === dateStr);
    const timestamp = new Date().toISOString();
    
    if (index === -1) {
      const newLog: DailyServiceLog = {
        id: `log-${vehicleId}-${dateStr}`,
        agency_id: DEMO_AGENCY_ID,
        worker_id: workerId,
        vehicle_id: vehicleId,
        log_date: dateStr,
        status,
        reason: (reason as any) || null,
        notes: notes || null,
        marked_at: status !== "pending" ? timestamp : null
      };
      logs.push(newLog);
    } else {
      logs[index].status = status;
      logs[index].worker_id = workerId;
      logs[index].reason = (reason as any) || null;
      logs[index].notes = notes || null;
      logs[index].marked_at = status !== "pending" ? timestamp : null;
    }

    setStorageItem("sv_daily_service_logs", logs);

    // If status is washed, auto-complete any pending/scheduled interior cleaning requests
    const interiorReqs = getStorageItem<InteriorCleaningRequest[]>("sv_interior_requests", []);
    let reqsChanged = false;
    interiorReqs.forEach(r => {
      if (r.vehicle_id === vehicleId && (r.status === "pending" || r.status === "scheduled")) {
        if (status === "washed") {
          r.status = "done";
          reqsChanged = true;
          
          // Also mark the linked payment as paid
          if (r.payment_id) {
            const payments = getStorageItem<any[]>("sv_inflow_payments", []);
            const payIdx = payments.findIndex((p: any) => p.id === r.payment_id);
            if (payIdx !== -1) {
              payments[payIdx].status = "paid";
              setStorageItem("sv_inflow_payments", payments);
            }
          }
        }
      } else if (r.vehicle_id === vehicleId && r.status === "done" && status === "pending") {
        // Revert back if marked back to pending
        r.status = "pending";
        reqsChanged = true;
        
        // Also revert payment to pending
        if (r.payment_id) {
          const payments = getStorageItem<any[]>("sv_inflow_payments", []);
          const payIdx = payments.findIndex((p: any) => p.id === r.payment_id);
          if (payIdx !== -1) {
            payments[payIdx].status = "pending";
            setStorageItem("sv_inflow_payments", payments);
          }
        }
      }
    });
    if (reqsChanged) {
      setStorageItem("sv_interior_requests", interiorReqs);
    }

    // Background push to Supabase relational table
    if (isSupabaseConfigured) {
      const dbStatus = status; // ENUM: pending, washed, skipped, missed
      const dbReason = reason || null; // ENUM: owner_away, vehicle_not_present, lockout, bad_weather, other
      const dbNotes = notes || null;
      
      supabase.from("daily_service_logs").upsert({
        agency_id: DEMO_AGENCY_ID,
        worker_id: workerId && workerId.length === 36 ? workerId : null,
        vehicle_id: vehicleId,
        log_date: dateStr,
        status: dbStatus,
        reason: dbReason,
        notes: dbNotes,
        marked_at: status !== "pending" ? timestamp : null
      }, { onConflict: "vehicle_id, log_date" }).then(({ error }) => {
        if (error) console.error("[Supabase] Error upserting daily service log:", error);
      });
    }

    return true;
  },

  getCustomerDailyLogs(customerId: string): DailyServiceLog[] {
    initializeMockDatabase();
    const vehicles = getStorageItem<Vehicle[]>("sv_vehicles", DEFAULT_VEHICLES);
    const logs = getStorageItem<DailyServiceLog[]>("sv_daily_service_logs", []);

    const custVehicleIds = new Set(vehicles.filter(v => v.customer_id === customerId).map(v => v.id));
    return logs.filter(l => custVehicleIds.has(l.vehicle_id));
  },

  submitCustomerComplaint(customerId: string, details: string): Complaint {
    initializeMockDatabase();
    const complaints = getStorageItem<Complaint[]>("sv_complaints", DEFAULT_COMPLAINTS);
    const customers = getStorageItem<Customer[]>("sv_customers", DEFAULT_CUSTOMERS);
    
    const cust = customers.find(c => c.id === customerId || c.custom_customer_id === customerId);
    const custName = cust ? `${cust.name} (${cust.flat_no})` : "Resident";

    const newComplaint: Complaint = {
      id: `comp-${Date.now()}`,
      customer_id: cust?.id,
      customer_name: custName,
      details,
      status: "pending",
      date: new Date().toISOString().split("T")[0]
    };

    complaints.unshift(newComplaint);
    setStorageItem("sv_complaints", complaints);
    return newComplaint;
  },

  getComplaints(apartmentId?: string): Complaint[] {
    initializeMockDatabase();
    const complaints = getStorageItem<Complaint[]>("sv_complaints", DEFAULT_COMPLAINTS);
    if (!apartmentId) return complaints;

    const customers = getStorageItem<Customer[]>("sv_customers", DEFAULT_CUSTOMERS);
    const customersInApt = new Set(customers.filter(c => c.apartment_id === apartmentId).map(c => c.id));
    
    return complaints.filter(comp => {
      if (comp.customer_id) return customersInApt.has(comp.customer_id);
      return false;
    });
  },

  resolveComplaint(complaintId: string): Complaint | null {
    initializeMockDatabase();
    const complaints = getStorageItem<Complaint[]>("sv_complaints", []);
    const index = complaints.findIndex(c => c.id === complaintId);
    if (index === -1) return null;
    complaints[index].status = "resolved";
    setStorageItem("sv_complaints", complaints);
    return complaints[index];
  },

  // ─── Interior Cleaning Requests ─────────────────────────────────────────────

  getInteriorCleaningRequests(customerId?: string): InteriorCleaningRequest[] {
    initializeMockDatabase();
    const requests = getStorageItem<InteriorCleaningRequest[]>("sv_interior_requests", []);
    if (customerId) return requests.filter(r => r.customer_id === customerId);
    return requests;
  },

  requestAdHocInteriorCleaning(
    customerId: string,
    vehicleId: string,
    preferredDate?: string,
    notes?: string
  ): InteriorCleaningRequest {
    initializeMockDatabase();
    const requests = getStorageItem<InteriorCleaningRequest[]>("sv_interior_requests", []);

    const newRequest: InteriorCleaningRequest = {
      id: `int-req-${Date.now()}`,
      customer_id: customerId,
      vehicle_id: vehicleId,
      request_type: "one_time",
      preferred_date: preferredDate || undefined,
      notes: notes || undefined,
      status: "pending",
      requested_at: new Date().toISOString(),
      amount: 50
    };

    // Auto-create a linked inflow payment (ad_hoc ₹50)
    const payments = getStorageItem<any[]>("sv_inflow_payments", []);
    const vehicles = getStorageItem<Vehicle[]>("sv_vehicles", DEFAULT_VEHICLES);
    const customers = getStorageItem<Customer[]>("sv_customers", DEFAULT_CUSTOMERS);
    const veh = vehicles.find(v => v.id === vehicleId);
    const cust = customers.find(c => c.id === customerId);
    const payDate = preferredDate || new Date().toISOString().split("T")[0];

    const newPayment = {
      id: `pay-int-${Date.now()}`,
      customer_id: customerId,
      customer_name: cust ? cust.name : "Resident",
      vehicle_id: vehicleId,
      amount: 50,
      date: payDate,
      payment_type: "ad_hoc",
      status: "pending",
      description: `One-Time Interior Cleaning — ${veh?.license_plate || vehicleId}${preferredDate ? ` on ${preferredDate}` : ""}`
    };

    newRequest.payment_id = newPayment.id;
    payments.push(newPayment);

    requests.push(newRequest);
    setStorageItem("sv_interior_requests", requests);
    setStorageItem("sv_inflow_payments", payments);

    return newRequest;
  },

  cancelInteriorCleaningRequest(requestId: string): boolean {
    initializeMockDatabase();
    const requests = getStorageItem<InteriorCleaningRequest[]>("sv_interior_requests", []);
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return false;

    const req = requests[index];
    requests[index].status = "cancelled";
    setStorageItem("sv_interior_requests", requests);

    // Also cancel the linked payment if it's still pending
    if (req.payment_id) {
      const payments = getStorageItem<any[]>("sv_inflow_payments", []);
      const payIdx = payments.findIndex((p: any) => p.id === req.payment_id);
      if (payIdx !== -1 && payments[payIdx].status === "pending") {
        payments.splice(payIdx, 1);
        setStorageItem("sv_inflow_payments", payments);
      }
    }
    return true;
  }
};
