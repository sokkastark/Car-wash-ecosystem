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
    price_car: 700, 
    price_bike: 350,
    price_hatchback: 700,
    price_sedan: 850,
    price_suv: 1000,
    price_luxury: 1200
  },
  { 
    id: "plan-alternate", 
    agency_id: DEMO_AGENCY_ID, 
    name: "Alternate Days", 
    recurrence: "alternate_days", 
    price_car: 500, 
    price_bike: 250,
    price_hatchback: 500,
    price_sedan: 600,
    price_suv: 700,
    price_luxury: 750
  },
  { 
    id: "plan-weekly-once", 
    agency_id: DEMO_AGENCY_ID, 
    name: "Weekly Once", 
    recurrence: "weekly_once", 
    price_car: 250, 
    price_bike: 120,
    price_hatchback: 250,
    price_sedan: 300,
    price_suv: 350,
    price_luxury: 400
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
