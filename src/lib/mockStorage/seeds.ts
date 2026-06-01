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

export const DEFAULT_APARTMENTS: Apartment[] = [
  { id: DEMO_APARTMENT_ID, name: "Brigade Apartments", address: "Whitefield Road, Pattandur Agrahara", city: "Bengaluru", agency_id: DEMO_AGENCY_ID },
  { id: "prestige-shantiniketan", name: "Prestige Shantiniketan", address: "ITPL Main Road, Thigalarapalya", city: "Bengaluru", agency_id: DEMO_AGENCY_ID },
  { id: "sobha-dream-acres", name: "Sobha Dream Acres", address: "Panathur Main Road, Balagere", city: "Bengaluru", agency_id: DEMO_AGENCY_ID }
];

export const DEFAULT_BLOCKS: Block[] = [
  { id: "block-brigade-a", apartment_id: DEMO_APARTMENT_ID, name: "Block A" },
  { id: "block-brigade-b", apartment_id: DEMO_APARTMENT_ID, name: "Block B" },
  { id: "block-brigade-c", apartment_id: DEMO_APARTMENT_ID, name: "Block C" },
  { id: "block-prestige-t1", apartment_id: "prestige-shantiniketan", name: "Tower 1" },
  { id: "block-prestige-t2", apartment_id: "prestige-shantiniketan", name: "Tower 2" },
  { id: "block-sobha-w1", apartment_id: "sobha-dream-acres", name: "Wing 1" }
];

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
  { id: "worker-rajesh", agency_id: DEMO_AGENCY_ID, name: "Shanmugha P", phone: "+918095695154", role: "washer", is_active: true, assigned_complex_ids: [DEMO_APARTMENT_ID], monthly_salary: 14000, salary_status: "credited", attendance_today: "present" },
  { id: "worker-ramesh", agency_id: DEMO_AGENCY_ID, name: "Perumal S", phone: "+918825492512", role: "washer", is_active: true, assigned_complex_ids: [DEMO_APARTMENT_ID, "prestige-shantiniketan"], monthly_salary: 15500, salary_status: "pending", attendance_today: "present" },
  { id: "worker-sunil", agency_id: DEMO_AGENCY_ID, name: "Sunil Rao", phone: "+919876543212", role: "supervisor", is_active: true, assigned_complex_ids: [DEMO_APARTMENT_ID, "prestige-shantiniketan", "sobha-dream-acres"], monthly_salary: 22000, salary_status: "credited", attendance_today: "present" },
  { id: "worker-amit", agency_id: DEMO_AGENCY_ID, name: "Amit Shah", phone: "+919876543213", role: "washer", is_active: false, assigned_complex_ids: ["prestige-shantiniketan"], monthly_salary: 12000, salary_status: "pending", attendance_today: "absent" },
  { id: "worker-kiran", agency_id: DEMO_AGENCY_ID, name: "Kiran J", phone: "+919876543214", role: "washer", is_active: true, assigned_complex_ids: ["sobha-dream-acres"], monthly_salary: 13500, salary_status: "credited", attendance_today: "present" },
  { id: "worker-sanjay", agency_id: DEMO_AGENCY_ID, name: "Sanjay M", phone: "+919876543215", role: "washer", is_active: true, assigned_complex_ids: ["sobha-dream-acres"], monthly_salary: 13000, salary_status: "pending", attendance_today: "present" }
];

export const DEFAULT_CUSTOMERS: Customer[] = [
  { id: "cust-amit", agency_id: DEMO_AGENCY_ID, custom_customer_id: "SV-BRG-A102-3210", name: "Amit Kumar", phone_number: "+919876543210", email: "amit.k@example.com", apartment_id: DEMO_APARTMENT_ID, block_id: "block-brigade-a", flat_no: "102", parking_slot: "A-102", join_date: "2026-01-15", status: "active" },
  { id: "cust-rajesh", agency_id: DEMO_AGENCY_ID, custom_customer_id: "SV-BRG-B304-4321", name: "Rajesh Sharma", phone_number: "+919999999999", email: "sharma.r@example.com", apartment_id: DEMO_APARTMENT_ID, block_id: "block-brigade-b", flat_no: "304", parking_slot: "B-304", join_date: "2026-02-10", status: "active" },
  { id: "cust-karan", agency_id: DEMO_AGENCY_ID, custom_customer_id: "SV-BRG-A505-1122", name: "Karan Johar", phone_number: "+919811122233", email: "karan@example.com", apartment_id: DEMO_APARTMENT_ID, block_id: "block-brigade-a", flat_no: "505", parking_slot: "A-505", join_date: "2026-05-05", status: "active" },
  { id: "cust-churn1", agency_id: DEMO_AGENCY_ID, custom_customer_id: "SV-BRG-C201-9988", name: "Vikram Malhotra", phone_number: "+919888877777", email: "vikram@example.com", apartment_id: DEMO_APARTMENT_ID, block_id: "block-brigade-c", flat_no: "201", parking_slot: "C-201", join_date: "2026-03-01", status: "left", left_date: "2026-05-10" },
  { id: "cust-churn2", agency_id: DEMO_AGENCY_ID, custom_customer_id: "SV-BRG-B104-5544", name: "Suresh Raina", phone_number: "+919555544444", email: "suresh@example.com", apartment_id: DEMO_APARTMENT_ID, block_id: "block-brigade-b", flat_no: "104", parking_slot: "B-104", join_date: "2026-04-10", status: "left", left_date: "2026-05-18" }
];

export const DEFAULT_VEHICLES: Vehicle[] = [
  { id: "veh-i20", customer_id: "cust-amit", license_plate: "KA-03-MS-1111", vehicle_type: "hatchback", make: "maruthi", model: "800", color: "Red", plan_id: "plan-daily", custom_price: null, assigned_worker_id: "worker-rajesh" },
  { id: "veh-activa", customer_id: "cust-amit", license_plate: "KA-03-MS-2222", vehicle_type: "bike", make: "Honda", model: "Activa 6G", color: "Black", plan_id: "plan-alternate", custom_price: 220, assigned_worker_id: "worker-rajesh" },
  { id: "veh-swift", customer_id: "cust-rajesh", license_plate: "KA-05-AB-5555", vehicle_type: "hatchback", make: "Maruti", model: "Swift", color: "Blue", plan_id: "plan-weekly-once", custom_price: null, assigned_worker_id: "worker-ramesh" },
  { id: "veh-duke", customer_id: "cust-karan", license_plate: "KA-01-XY-9999", vehicle_type: "bike", make: "KTM", model: "Duke 250", color: "Orange", plan_id: "plan-daily", custom_price: null, assigned_worker_id: "worker-rajesh" }
];

export const DEFAULT_COMPLAINTS: Complaint[] = [
  { id: "comp-1", customer_id: "cust-amit", customer_name: "Amit Kumar (A-102)", details: "Missed cleaning on Tuesday", status: "pending", date: "2026-05-27" },
  { id: "comp-2", customer_id: "cust-karan", customer_name: "Karan Johar (A-505)", details: "Water stains on the bike windshield", status: "pending", date: "2026-05-28" },
  { id: "comp-3", customer_id: "cust-rajesh", customer_name: "Rajesh Sharma (B-304)", details: "Alarm sounded during wiping", status: "resolved", date: "2026-05-26" }
];

export const DEFAULT_UPLOAD_LOGS: UploadLog[] = [
  { id: "log-1", timestamp: "2026-05-28T09:12:00Z", fileName: "brigade_initial_roster.csv", totalCount: 3, breakdown: { [DEMO_APARTMENT_ID]: 3 } }
];

export const DEFAULT_EXPENSES: Expense[] = [
  { id: "exp-1", category: "microfabric_cloths", amount: 1500, date: "2026-05-10", description: "Microfiber cloths - pack of 50" },
  { id: "exp-2", category: "buckets", amount: 600, date: "2026-05-12", description: "Heavy duty washing buckets" },
  { id: "exp-3", category: "spray_pumps", amount: 1200, date: "2026-05-15", description: "Pressure spray pumps (2L)" },
  { id: "exp-4", category: "morning_tea", amount: 150, date: "2026-05-25", description: "Daily morning tea/coffee" },
  { id: "exp-5", category: "sunday_breakfast", amount: 800, date: "2026-05-24", description: "Sunday breakfast for field staff" },
  { id: "exp-6", category: "salary", amount: 14000, date: "2026-05-01", description: "Washer salary Shanmugha P" },
  { id: "exp-7", category: "salary", amount: 13500, date: "2026-05-01", description: "Washer salary Kiran J" },
  { id: "exp-8", category: "others", amount: 450, date: "2026-05-20", description: "Stationery clipboard and binders" }
];
