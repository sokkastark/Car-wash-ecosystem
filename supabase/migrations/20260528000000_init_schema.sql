-- Migration: 20260528000000_init_schema.sql
-- Description: Initialize the schema for the multi-tenant recurring service operations database.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define reusable trigger function to automatically update "updated_at" timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. AGENCIES (Tenants)
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_agencies_updated_at
    BEFORE UPDATE ON agencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. APARTMENTS (Locations serviced by agencies)
CREATE TABLE apartments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_apartments_agency_id ON apartments(agency_id);

CREATE TRIGGER update_apartments_updated_at
    BEFORE UPDATE ON apartments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. BLOCKS (Structural segments within apartments)
CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    apartment_id UUID NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blocks_apartment_id ON blocks(apartment_id);

CREATE TRIGGER update_blocks_updated_at
    BEFORE UPDATE ON blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. SUBSCRIPTION PLANS
CREATE TYPE plan_recurrence AS ENUM ('daily', 'alternate_days', 'weekly_once', 'weekly_twice', 'custom');

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    recurrence plan_recurrence NOT NULL,
    recurrence_config JSONB DEFAULT '{}'::jsonb, -- e.g. {"days": [1, 4]} for Mon/Thu
    price_car NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    price_bike NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscription_plans_agency_id ON subscription_plans(agency_id);

CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. CUSTOMERS
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    custom_customer_id VARCHAR(50) NOT NULL, -- Human-readable, e.g., 'SV-BRG-102'
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    apartment_id UUID REFERENCES apartments(id) ON DELETE SET NULL,
    block_id UUID REFERENCES blocks(id) ON DELETE SET NULL,
    parking_slot VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_custom_id_per_agency UNIQUE (agency_id, custom_customer_id)
);

CREATE INDEX idx_customers_agency_id ON customers(agency_id);
CREATE INDEX idx_customers_apartment_id ON customers(apartment_id);
CREATE INDEX idx_customers_phone_number ON customers(phone_number);

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. VEHICLES
CREATE TYPE vehicle_type AS ENUM ('car', 'bike', 'suv', 'other');

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    license_plate VARCHAR(50) NOT NULL,
    vehicle_type vehicle_type NOT NULL,
    make_model VARCHAR(100),
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);

CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. SUBSCRIPTIONS (Links a vehicle to a subscription plan)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_vehicle_id ON subscriptions(vehicle_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. WORKERS (Washers, Supervisors, Owners)
CREATE TYPE user_role AS ENUM ('super_admin', 'agency_owner', 'supervisor', 'washer');

CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL, -- Null implies super admin
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'washer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workers_agency_id ON workers(agency_id);
CREATE INDEX idx_workers_phone ON workers(phone);

CREATE TRIGGER update_workers_updated_at
    BEFORE UPDATE ON workers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. DAILY SERVICE LOGS (Work tracking)
CREATE TYPE wash_status AS ENUM ('pending', 'washed', 'skipped', 'missed');
CREATE TYPE skip_reason AS ENUM ('owner_away', 'vehicle_not_present', 'lockout', 'bad_weather', 'other');

CREATE TABLE daily_service_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    status wash_status NOT NULL DEFAULT 'pending',
    reason skip_reason,
    notes TEXT,
    photo_url VARCHAR(512),
    marked_at TIMESTAMP WITH TIME ZONE,
    is_compensated BOOLEAN NOT NULL DEFAULT FALSE,
    compensation_for_log_id UUID REFERENCES daily_service_logs(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_vehicle_log_per_day UNIQUE (vehicle_id, log_date)
);

CREATE INDEX idx_service_logs_agency_id ON daily_service_logs(agency_id);
CREATE INDEX idx_service_logs_worker_id ON daily_service_logs(worker_id);
CREATE INDEX idx_service_logs_vehicle_id ON daily_service_logs(vehicle_id);
CREATE INDEX idx_service_logs_date ON daily_service_logs(log_date);

CREATE TRIGGER update_daily_service_logs_updated_at
    BEFORE UPDATE ON daily_service_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
