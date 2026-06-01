import { Customer, Vehicle, Apartment, SubscriptionPlan, Worker, UploadLog } from "./types";
import { getStorageItem, initializeMockDatabase } from "./database";
import { DEFAULT_CUSTOMERS, DEFAULT_VEHICLES, DEFAULT_APARTMENTS, DEFAULT_PLANS, DEFAULT_WORKERS, DEMO_APARTMENT_ID } from "./seeds";
import { complexOps } from "./complexOps";

export const analyticsOps = {
  getAnalyticsData() {
    initializeMockDatabase();
    const customers = getStorageItem<Customer[]>("sv_customers", DEFAULT_CUSTOMERS);
    const vehicles = getStorageItem<Vehicle[]>("sv_vehicles", DEFAULT_VEHICLES);
    const apartments = getStorageItem<Apartment[]>("sv_apartments", DEFAULT_APARTMENTS);
    const plans = getStorageItem<SubscriptionPlan[]>("sv_plans", DEFAULT_PLANS);

    let standardCount = 0;
    let customCount = 0;
    vehicles.forEach(v => {
      if (v.custom_price !== null && v.custom_price !== undefined) {
        customCount++;
      } else {
        standardCount++;
      }
    });

    let totalDiscountLoss = 0;
    let totalPremiumGain = 0;
    let customCustomersCount = 0;
    const complexLossMap: Record<string, number> = {};
    const detailedDiscounts: any[] = [];

    const custMap = new Map(customers.map(c => [c.id, c]));
    const aptMap = new Map(apartments.map(a => [a.id, a.name]));

    vehicles.forEach(v => {
      if (v.custom_price !== null && v.custom_price !== undefined) {
        const cust = custMap.get(v.customer_id);
        if (!cust) return;

        const basePrice = complexOps.getPlanPriceForComplex(cust.apartment_id, v.plan_id, v.vehicle_type, plans);
        const difference = basePrice - v.custom_price;

        customCustomersCount++;
        if (difference > 0) {
          totalDiscountLoss += difference;
          const aptName = aptMap.get(cust.apartment_id) || "Other";
          complexLossMap[aptName] = (complexLossMap[aptName] || 0) + difference;

          detailedDiscounts.push({
            id: v.id,
            customerName: cust.name,
            apartmentName: aptName,
            licensePlate: v.license_plate,
            vehicleType: v.vehicle_type,
            planName: plans.find(p => p.id === v.plan_id)?.name || "Standard Plan",
            basePrice,
            customPrice: v.custom_price,
            loss: difference
          });
        } else if (difference < 0) {
          totalPremiumGain += Math.abs(difference);
        }
      }
    });

    const currentMonthEnrolled = customers.filter(c => c.join_date?.startsWith("2026-05")).length;
    const currentMonthLeft = customers.filter(c => c.status === "left" && c.left_date?.startsWith("2026-05")).length;

    const growthTrend = [
      { month: "Dec 2025", enrolled: 4, left: 1 },
      { month: "Jan 2026", enrolled: 6, left: 2 },
      { month: "Feb 2026", enrolled: 5, left: 0 },
      { month: "Mar 2026", enrolled: 8, left: 3 },
      { month: "Apr 2026", enrolled: 7, left: 1 },
      { month: "May 2026", enrolled: currentMonthEnrolled, left: currentMonthLeft }
    ];

    return {
      planDistribution: {
        standard: standardCount,
        custom: customCount,
        total: vehicles.length
      },
      discountLoss: {
        totalDiscountLoss,
        totalPremiumGain,
        customCustomersCount,
        complexLoss: Object.keys(complexLossMap).map(name => ({ name, loss: complexLossMap[name] })),
        detailedDiscounts
      },
      growthTrend
    };
  },

  getStats(apartmentId?: string) {
    initializeMockDatabase();
    const apartments = getStorageItem<Apartment[]>("sv_apartments", DEFAULT_APARTMENTS);
    const workers = getStorageItem<Worker[]>("sv_workers", DEFAULT_WORKERS);
    const vehicles = getStorageItem<Vehicle[]>("sv_vehicles", DEFAULT_VEHICLES);
    const plans = getStorageItem<SubscriptionPlan[]>("sv_plans", DEFAULT_PLANS);
    const customers = getStorageItem<Customer[]>("sv_customers", DEFAULT_CUSTOMERS);

    const targetCustomers = apartmentId ? customers.filter(c => c.apartment_id === apartmentId) : customers;
    const targetCustomerIds = new Set(targetCustomers.map(c => c.id));
    const targetVehicles = vehicles.filter(v => targetCustomerIds.has(v.customer_id));

    const planMap = new Map(plans.map(p => [p.id, p]));

    let mrr = 0;
    targetVehicles.forEach(veh => {
      const plan = planMap.get(veh.plan_id);
      const isBike = veh.vehicle_type === "bike";
      const basePrice = plan ? (isBike ? plan.price_bike : plan.price_car) : 0;
      
      let customPriceVal: number | null = null;
      if (veh.custom_price !== null && veh.custom_price !== undefined) {
        const parsed = Number(veh.custom_price);
        if (!isNaN(parsed)) {
          customPriceVal = parsed;
        }
      }
      mrr += customPriceVal !== null ? customPriceVal : basePrice;
    });

    const activeCleaners = workers.filter(w => w.role === "washer" && w.is_active && (!apartmentId || (Array.isArray(w.assigned_complex_ids) && w.assigned_complex_ids.includes(apartmentId)))).length;

    return {
      totalVehicles: targetVehicles.length,
      totalComplexes: apartmentId ? 1 : apartments.length,
      activeCleaners,
      mrr: mrr.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    };
  },

  getComplexesProgress(apartmentId?: string) {
    initializeMockDatabase();
    const apartments = getStorageItem<Apartment[]>("sv_apartments", []);
    const customers = getStorageItem<Customer[]>("sv_customers", []);
    const vehicles = getStorageItem<Vehicle[]>("sv_vehicles", []);
    const logs = getStorageItem<any[]>("sv_daily_service_logs", []);

    const SIMULATION_DATE = "2026-05-30";

    const list = apartments.map(apt => {
      const aptCustomers = customers.filter(c => c.apartment_id === apt.id);
      const custIds = new Set(aptCustomers.map(c => c.id));
      const aptVehicles = vehicles.filter(v => custIds.has(v.customer_id));
      const vehIds = new Set(aptVehicles.map(v => v.id));

      const aptLogs = logs.filter(l => l.log_date === SIMULATION_DATE && vehIds.has(l.vehicle_id));
      
      const washed = aptLogs.filter(l => l.status === "washed").length;
      const skipped = aptLogs.filter(l => l.status === "skipped").length;
      const missed = aptLogs.filter(l => l.status === "missed").length;
      const total = aptVehicles.length;

      const progress = total > 0 ? Math.round(((washed + skipped) / total) * 100) : 0;

      return {
        id: apt.id,
        name: apt.name,
        progress,
        washed,
        skipped,
        missed
      };
    });

    if (apartmentId) {
      return list.filter(item => item.id === apartmentId);
    }
    return list;
  }
};
