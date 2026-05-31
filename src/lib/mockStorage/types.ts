export interface Apartment {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  agency_id: string;
  blocks?: Array<{ id: string; name: string }>;
}

export interface Block {
  id: string;
  apartment_id: string;
  name: string;
}

export interface Worker {
  id: string;
  agency_id: string;
  name: string;
  phone: string;
  role: "super_admin" | "agency_owner" | "supervisor" | "washer";
  is_active: boolean;
  assigned_complex_ids: string[];
  monthly_salary: number;
  salary_status: "credited" | "pending";
  attendance_today: "present" | "absent";
}

export interface Customer {
  id: string;
  agency_id: string;
  custom_customer_id: string;
  name: string;
  phone_number: string;
  email: string | null;
  apartment_id: string;
  block_id: string | null;
  flat_no: string;
  parking_slot: string;
  join_date?: string; // YYYY-MM-DD
  status?: "active" | "left";
  left_date?: string; // YYYY-MM-DD
}

export interface Vehicle {
  id: string;
  customer_id: string;
  license_plate: string;
  vehicle_type: "hatchback" | "sedan" | "suv" | "luxury" | "bike" | "car";
  make: string;
  model: string;
  color: string;
  plan_id: string;
  custom_price: number | null;
  assigned_worker_id: string | null;
  interior_frequency?: number;
}

export interface Subscription {
  id: string;
  vehicle_id: string;
  plan_id: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

export interface SubscriptionPlan {
  id: string;
  agency_id: string;
  name: string;
  recurrence: "daily" | "alternate_days" | "weekly_once" | "weekly_twice" | "custom";
  price_car: number;
  price_bike: number;
  price_hatchback?: number;
  price_sedan?: number;
  price_suv?: number;
  price_luxury?: number;
}

export interface ComplexPlanPrice {
  apartment_id: string;
  plan_id: string;
  price_hatchback: number;
  price_sedan: number;
  price_suv: number;
  price_luxury: number;
  price_bike: number;
}

export interface Complaint {
  id: string;
  customer_id?: string;
  customer_name: string;
  details: string;
  status: "pending" | "resolved";
  date: string;
}

export interface UploadLog {
  id: string;
  timestamp: string;
  fileName: string;
  totalCount: number;
  breakdown: Record<string, number>;
}

export interface TrashItem {
  id: string;
  type: "complex" | "worker" | "customer";
  name: string;
  data: any; // snap JSON data
  deleted_at: string;
}

export interface Expense {
  id: string;
  category: "microfabric_cloths" | "buckets" | "spray_pumps" | "morning_tea" | "sunday_breakfast" | "salary" | "others";
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
}

export interface DailyServiceLog {
  id: string;
  agency_id: string;
  worker_id: string | null;
  vehicle_id: string;
  log_date: string; // YYYY-MM-DD
  status: "pending" | "washed" | "skipped" | "missed";
  reason: "owner_away" | "vehicle_not_present" | "lockout" | "bad_weather" | "other" | null;
  notes: string | null;
  marked_at: string | null;
}

export interface DetailedVehicle {
  id: string;
  licensePlate: string;
  vehicleType: "hatchback" | "sedan" | "suv" | "luxury" | "bike" | "car";
  make: string;
  model: string;
  color: string;
  planId: string;
  planName: string;
  customPrice: number | null;
  assignedWorkerId: string | null;
  assignedWorkerName: string;
  price: number;
  interiorFrequency?: number;
}

export interface DetailedCustomer {
  id: string;
  customCustomerId: string;
  name: string;
  phone: string;
  email: string;
  apartmentId: string;
  apartmentName: string;
  blockId: string;
  blockName: string;
  flatNo: string;
  parkingSlot: string;
  vehicles: DetailedVehicle[];
  overallPrice: number;
  joinDate?: string;
  status?: "active" | "left";
  leftDate?: string;
}

export interface DashboardStats {
  totalVehicles: number;
  totalComplexes: number;
  activeCleaners: number;
  mrr: string;
}

export interface InflowPayment {
  id: string;
  customer_id?: string;
  customer_name?: string;
  amount: number;
  date: string; // YYYY-MM-DD
  payment_type: "subscription" | "ad_hoc";
  status: "pending" | "paid" | "deferred"; // deferred = "customer will pay next month"
  description: string;
  vehicle_id?: string;
}

export interface InteriorCleaningRequest {
  id: string;
  customer_id: string;
  vehicle_id: string;
  request_type: "recurring" | "one_time";
  preferred_date?: string; // YYYY-MM-DD, for one-time bookings
  notes?: string;
  status: "pending" | "scheduled" | "done" | "cancelled";
  requested_at: string; // ISO timestamp
  amount: number; // ₹50 per session
  payment_id?: string; // linked InflowPayment id
}
