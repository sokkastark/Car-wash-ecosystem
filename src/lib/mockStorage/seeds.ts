import { 
  Apartment, 
  Block, 
  SubscriptionPlan, 
  Worker, 
  Customer, 
  Vehicle, 
  Complaint, 
  UploadLog, 
  Expense 
} from "./types";

export const DEMO_AGENCY_ID = "a7b3c200-a299-4c4d-9051-fb18c5054992";
export const DEMO_APARTMENT_ID = "b4c5d600-e102-4d1a-821b-cfc12dcd3422";

export const DEFAULT_APARTMENTS: Apartment[] = [];
export const DEFAULT_BLOCKS: Block[] = [];

export const DEFAULT_PLANS: SubscriptionPlan[] = [
  { 
    id: "plan-daily", 
    agency_id: DEMO_AGENCY_ID, 
    name: "Daily Wash", 
    recurrence: "daily", 
    price_car: 999, 
    price_bike: 350,
    price_hatchback: 999,
    price_sedan: 1200,
    price_suv: 1200,
    price_luxury: 1500
  },
  { 
    id: "plan-alternate", 
    agency_id: DEMO_AGENCY_ID, 
    name: "Alternate Days", 
    recurrence: "alternate_days", 
    price_car: 699, 
    price_bike: 250,
    price_hatchback: 699,
    price_sedan: 899,
    price_suv: 999,
    price_luxury: 1199
  },
  { 
    id: "plan-weekly-once", 
    agency_id: DEMO_AGENCY_ID, 
    name: "Weekly Once", 
    recurrence: "weekly_once", 
    price_car: 399, 
    price_bike: 120,
    price_hatchback: 399,
    price_sedan: 499,
    price_suv: 599,
    price_luxury: 699
  }
];

export const DEFAULT_WORKERS: Worker[] = [
  { id: "worker-rajesh", agency_id: DEMO_AGENCY_ID, name: "Shanmugha P", phone: "+918095695154", role: "washer", is_active: true, assigned_complex_ids: [], monthly_salary: 14000, salary_status: "credited", attendance_today: "present" },
  { id: "worker-ramesh", agency_id: DEMO_AGENCY_ID, name: "Perumal S", phone: "+918825492512", role: "washer", is_active: true, assigned_complex_ids: [], monthly_salary: 15500, salary_status: "pending", attendance_today: "present" }
];

export const DEFAULT_CUSTOMERS: Customer[] = [];
export const DEFAULT_VEHICLES: Vehicle[] = [];
export const DEFAULT_COMPLAINTS: Complaint[] = [];
export const DEFAULT_UPLOAD_LOGS: UploadLog[] = [];
export const DEFAULT_EXPENSES: Expense[] = [];
