import { InflowPayment, Customer, Vehicle, SubscriptionPlan } from "./types";
import { getStorageItem, setStorageItem, initializeMockDatabase } from "./database";
import { DEFAULT_CUSTOMERS, DEFAULT_VEHICLES, DEFAULT_PLANS } from "./seeds";

export const inflowOps = {
  getInflowPayments(month: string, year: string): InflowPayment[] {
    initializeMockDatabase();
    const payments = getStorageItem<InflowPayment[]>("sv_inflow_payments", []);
    const targetYM = `${year}-${month.padStart(2, "0")}`;

    const customers = getStorageItem<Customer[]>("sv_customers", DEFAULT_CUSTOMERS);
    const vehicles = getStorageItem<Vehicle[]>("sv_vehicles", DEFAULT_VEHICLES);
    const plans = getStorageItem<SubscriptionPlan[]>("sv_plans", DEFAULT_PLANS);
    const planMap = new Map(plans.map(p => [p.id, p]));

    const activeCustomers = customers.filter(c => {
      const joinDate = c.join_date || "2026-01-01";
      const joinYM = joinDate.substring(0, 7);
      if (joinYM > targetYM) return false;
      if (c.status === "left" && c.left_date && c.left_date.substring(0, 7) < targetYM) return false;
      return true;
    });
    const activeCustomerIds = new Set(activeCustomers.map(c => c.id));
    const activeCustomerMap = new Map(activeCustomers.map(c => [c.id, c]));

    let updated = false;
    const existingPaymentIds = new Set(payments.map(p => p.id));

    vehicles.forEach(veh => {
      if (activeCustomerIds.has(veh.customer_id)) {
        const paymentId = `pay-${veh.id}-${targetYM}`;
        if (!existingPaymentIds.has(paymentId)) {
          const cust = activeCustomerMap.get(veh.customer_id);
          const plan = planMap.get(veh.plan_id);
          const isBike = veh.vehicle_type === "bike";
          const basePrice = plan ? (isBike ? plan.price_bike : plan.price_car) : 0;
          const customPriceVal = (veh.custom_price !== null && veh.custom_price !== undefined) ? Number(veh.custom_price) : null;
          const interiorPrice = (!isBike) ? (Number(veh.interior_frequency) || 0) * 50 : 0;
          const amount = (customPriceVal !== null ? customPriceVal : basePrice) + interiorPrice;

          if (amount > 0) {
            const hasIntDesc = !isBike && veh.interior_frequency && veh.interior_frequency > 0 
              ? ` + Interior ${veh.interior_frequency}x` 
              : "";
            payments.push({
              id: paymentId,
              customer_id: veh.customer_id,
              customer_name: cust ? cust.name : "Resident",
              amount,
              date: `${targetYM}-01`,
              payment_type: "subscription",
              status: "pending",
              description: `Subscription plan (${plan?.name || "Standard"})${hasIntDesc} for ${veh.license_plate}`,
              vehicle_id: veh.id
            });
            updated = true;
          }
        }
      }
    });

    if (updated) {
      setStorageItem("sv_inflow_payments", payments);
    }

    return payments.filter(p => p.date.startsWith(targetYM));
  },

  updatePaymentStatus(id: string, status: "pending" | "paid" | "deferred"): boolean {
    initializeMockDatabase();
    const payments = getStorageItem<InflowPayment[]>("sv_inflow_payments", []);
    const idx = payments.findIndex(p => p.id === id);
    if (idx === -1) return false;

    const todayStr = new Date().toISOString().split("T")[0];
    payments[idx].status = status;
    
    if (status === "paid" || status === "deferred") {
      payments[idx].date = todayStr;
    } else if (payments[idx].payment_type === "subscription") {
      const targetYM = payments[idx].date.substring(0, 7);
      payments[idx].date = `${targetYM}-01`;
    }
    
    setStorageItem("sv_inflow_payments", payments);
    return true;
  },

  addAdHocPayment(amount: number, date: string, description: string, status: "pending" | "paid" | "deferred"): InflowPayment {
    initializeMockDatabase();
    const payments = getStorageItem<InflowPayment[]>("sv_inflow_payments", []);
    const newPayment: InflowPayment = {
      id: `adhoc-${Date.now()}`,
      amount: Number(amount),
      date,
      payment_type: "ad_hoc",
      status,
      description
    };
    payments.push(newPayment);
    setStorageItem("sv_inflow_payments", payments);
    return newPayment;
  },

  deleteAdHocPayment(id: string): boolean {
    initializeMockDatabase();
    const payments = getStorageItem<InflowPayment[]>("sv_inflow_payments", []);
    const newPayments = payments.filter(p => p.id !== id);
    setStorageItem("sv_inflow_payments", newPayments);
    return true;
  },

  markAllPaymentsPaid(month: string, year: string): boolean {
    initializeMockDatabase();
    const payments = getStorageItem<InflowPayment[]>("sv_inflow_payments", []);
    const targetYM = `${year}-${month.padStart(2, "0")}`;
    const todayStr = new Date().toISOString().split("T")[0];

    let updated = false;
    payments.forEach(p => {
      if (p.date.startsWith(targetYM) && p.status === "pending") {
        p.status = "paid";
        p.date = todayStr;
        updated = true;
      }
    });

    if (updated) {
      setStorageItem("sv_inflow_payments", payments);
    }
    return true;
  }
};
