-- Migration: 20260528000001_enable_rls.sql
-- Description: Enable Row Level Security (RLS) and define access control policies for multi-tenant isolation.

-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_service_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- HELPER FUNCTIONS FOR SECURITY RULES
-- ----------------------------------------------------

-- Retrieve the active worker's agency_id from JWT phone claim
CREATE OR REPLACE FUNCTION get_auth_worker_agency_id()
RETURNS UUID AS $$
    SELECT agency_id FROM workers 
    WHERE phone = auth.jwt()->>'phone' 
      AND is_active = TRUE;
$$ LANGUAGE sql SECURITY DEFINER;

-- Retrieve the active worker's role from JWT phone claim
CREATE OR REPLACE FUNCTION get_auth_worker_role()
RETURNS VARCHAR AS $$
    SELECT role::VARCHAR FROM workers 
    WHERE phone = auth.jwt()->>'phone' 
      AND is_active = TRUE;
$$ LANGUAGE sql SECURITY DEFINER;

-- Retrieve the active customer's ID from JWT phone claim
CREATE OR REPLACE FUNCTION get_auth_customer_id()
RETURNS UUID AS $$
    SELECT id FROM customers 
    WHERE phone_number = auth.jwt()->>'phone';
$$ LANGUAGE sql SECURITY DEFINER;

-- ----------------------------------------------------
-- 1. AGENCIES POLICIES
-- ----------------------------------------------------
-- Super Admins can do everything
CREATE POLICY super_admin_all_agencies ON agencies
    FOR ALL USING (get_auth_worker_role() = 'super_admin');

-- Agency Owners and Workers can read their own agency details
CREATE POLICY read_own_agency ON agencies
    FOR SELECT USING (id = get_auth_worker_agency_id());

-- ----------------------------------------------------
-- 2. APARTMENTS POLICIES
-- ----------------------------------------------------
CREATE POLICY super_admin_all_apartments ON apartments
    FOR ALL USING (get_auth_worker_role() = 'super_admin');

CREATE POLICY agency_owners_manage_apartments ON apartments
    FOR ALL USING (
        agency_id = get_auth_worker_agency_id() 
        AND get_auth_worker_role() IN ('agency_owner', 'supervisor')
    );

CREATE POLICY workers_read_assigned_apartments ON apartments
    FOR SELECT USING (
        agency_id = get_auth_worker_agency_id()
    );

-- Customers can view the apartment they belong to
CREATE POLICY customer_read_apartment ON apartments
    FOR SELECT USING (
        id IN (SELECT apartment_id FROM customers WHERE id = get_auth_customer_id())
    );

-- ----------------------------------------------------
-- 3. BLOCKS POLICIES
-- ----------------------------------------------------
CREATE POLICY super_admin_all_blocks ON blocks
    FOR ALL USING (get_auth_worker_role() = 'super_admin');

CREATE POLICY agency_manage_blocks ON blocks
    FOR ALL USING (
        apartment_id IN (
            SELECT id FROM apartments WHERE agency_id = get_auth_worker_agency_id()
        )
        AND get_auth_worker_role() IN ('agency_owner', 'supervisor')
    );

CREATE POLICY workers_read_blocks ON blocks
    FOR SELECT USING (
        apartment_id IN (
            SELECT id FROM apartments WHERE agency_id = get_auth_worker_agency_id()
        )
    );

-- ----------------------------------------------------
-- 4. SUBSCRIPTION PLANS POLICIES
-- ----------------------------------------------------
CREATE POLICY super_admin_all_plans ON subscription_plans
    FOR ALL USING (get_auth_worker_role() = 'super_admin');

CREATE POLICY agency_owners_manage_plans ON subscription_plans
    FOR ALL USING (
        agency_id = get_auth_worker_agency_id() 
        AND get_auth_worker_role() IN ('agency_owner', 'supervisor')
    );

CREATE POLICY workers_read_plans ON subscription_plans
    FOR SELECT USING (
        agency_id = get_auth_worker_agency_id()
    );

-- ----------------------------------------------------
-- 5. CUSTOMERS POLICIES
-- ----------------------------------------------------
CREATE POLICY super_admin_all_customers ON customers
    FOR ALL USING (get_auth_worker_role() = 'super_admin');

CREATE POLICY agency_manage_customers ON customers
    FOR ALL USING (
        agency_id = get_auth_worker_agency_id()
        AND get_auth_worker_role() IN ('agency_owner', 'supervisor')
    );

CREATE POLICY workers_read_customers ON customers
    FOR SELECT USING (
        agency_id = get_auth_worker_agency_id()
    );

CREATE POLICY customer_read_own_profile ON customers
    FOR SELECT USING (
        id = get_auth_customer_id()
    );

CREATE POLICY customer_update_own_profile ON customers
    FOR UPDATE USING (
        id = get_auth_customer_id()
    );

-- ----------------------------------------------------
-- 6. VEHICLES POLICIES
-- ----------------------------------------------------
CREATE POLICY super_admin_all_vehicles ON vehicles
    FOR ALL USING (get_auth_worker_role() = 'super_admin');

CREATE POLICY agency_manage_vehicles ON vehicles
    FOR ALL USING (
        customer_id IN (
            SELECT id FROM customers WHERE agency_id = get_auth_worker_agency_id()
        )
        AND get_auth_worker_role() IN ('agency_owner', 'supervisor')
    );

CREATE POLICY workers_read_vehicles ON vehicles
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE agency_id = get_auth_worker_agency_id()
        )
    );

CREATE POLICY customer_manage_own_vehicles ON vehicles
    FOR ALL USING (
        customer_id = get_auth_customer_id()
    );

-- ----------------------------------------------------
-- 7. SUBSCRIPTIONS POLICIES
-- ----------------------------------------------------
CREATE POLICY super_admin_all_subscriptions ON subscriptions
    FOR ALL USING (get_auth_worker_role() = 'super_admin');

CREATE POLICY agency_manage_subscriptions ON subscriptions
    FOR ALL USING (
        plan_id IN (
            SELECT id FROM subscription_plans WHERE agency_id = get_auth_worker_agency_id()
        )
        AND get_auth_worker_role() IN ('agency_owner', 'supervisor')
    );

CREATE POLICY workers_read_subscriptions ON subscriptions
    FOR SELECT USING (
        plan_id IN (
            SELECT id FROM subscription_plans WHERE agency_id = get_auth_worker_agency_id()
        )
    );

CREATE POLICY customer_read_own_subscriptions ON subscriptions
    FOR SELECT USING (
        vehicle_id IN (
            SELECT id FROM vehicles WHERE customer_id = get_auth_customer_id()
        )
    );

-- ----------------------------------------------------
-- 8. WORKERS POLICIES
-- ----------------------------------------------------
CREATE POLICY super_admin_all_workers ON workers
    FOR ALL USING (get_auth_worker_role() = 'super_admin');

CREATE POLICY agency_owner_manage_workers ON workers
    FOR ALL USING (
        agency_id = get_auth_worker_agency_id()
        AND get_auth_worker_role() = 'agency_owner'
    );

CREATE POLICY workers_read_team ON workers
    FOR SELECT USING (
        agency_id = get_auth_worker_agency_id()
    );

-- ----------------------------------------------------
-- 9. DAILY SERVICE LOGS POLICIES
-- ----------------------------------------------------
CREATE POLICY super_admin_all_logs ON daily_service_logs
    FOR ALL USING (get_auth_worker_role() = 'super_admin');

CREATE POLICY agency_owner_manage_logs ON daily_service_logs
    FOR ALL USING (
        agency_id = get_auth_worker_agency_id()
        AND get_auth_worker_role() IN ('agency_owner', 'supervisor')
    );

CREATE POLICY workers_manage_logs ON daily_service_logs
    FOR ALL USING (
        agency_id = get_auth_worker_agency_id()
        AND get_auth_worker_role() = 'washer'
    );

CREATE POLICY customer_read_own_logs ON daily_service_logs
    FOR SELECT USING (
        vehicle_id IN (
            SELECT id FROM vehicles WHERE customer_id = get_auth_customer_id()
        )
    );
