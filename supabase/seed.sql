-- Seed Data: seed.sql
-- Description: Populates the multi-tenant recurring service operations database with initial realistic test data.

-- Start a transaction to ensure atomic execution
BEGIN;

-- 1. Insert Demo Agency (Tenant)
INSERT INTO agencies (id, name, subdomain)
VALUES (
    'a7b3c200-a299-4c4d-9051-fb18c5054992', 
    'SV Carwash', 
    'svcarwash'
) ON CONFLICT (subdomain) DO UPDATE 
SET name = EXCLUDED.name;

-- 2. Insert Apartments (Locations)
INSERT INTO apartments (id, agency_id, name, address, city)
VALUES (
    'b4c5d600-e102-4d1a-821b-cfc12dcd3422',
    'a7b3c200-a299-4c4d-9051-fb18c5054992',
    'Brigade Apartments',
    'Whitefield Main Road, Brigade Tech Park Area',
    'Bengaluru'
) ON CONFLICT DO NOTHING;

-- 3. Insert Apartment Blocks
INSERT INTO blocks (id, apartment_id, name)
VALUES 
    ('c1d2e300-fa01-44bb-8cb9-3cfdb120c1a1', 'b4c5d600-e102-4d1a-821b-cfc12dcd3422', 'Block A'),
    ('c1d2e300-fa02-44bb-8cb9-3cfdb120c1a2', 'b4c5d600-e102-4d1a-821b-cfc12dcd3422', 'Block B')
ON CONFLICT DO NOTHING;

-- 4. Insert Subscription Plans
INSERT INTO subscription_plans (id, agency_id, name, recurrence, recurrence_config, price_car, price_bike)
VALUES 
    (
        'd1e2f300-0001-44ab-b3c9-4deff111a111', 
        'a7b3c200-a299-4c4d-9051-fb18c5054992', 
        'Daily Wash - Cars Only', 
        'daily', 
        '{}'::jsonb, 
        600.00, 
        0.00
    ),
    (
        'd1e2f300-0002-44ab-b3c9-4deff111a112', 
        'a7b3c200-a299-4c4d-9051-fb18c5054992', 
        'Alternate Days - Bikes Only', 
        'alternate_days', 
        '{}'::jsonb, 
        0.00, 
        250.00
    ),
    (
        'd1e2f300-0003-44ab-b3c9-4deff111a113', 
        'a7b3c200-a299-4c4d-9051-fb18c5054992', 
        'Weekly Twice - Premium', 
        'weekly_twice', 
        '{"days": [1, 4]}'::jsonb, -- Monday & Thursday
        450.00, 
        180.00
    )
ON CONFLICT DO NOTHING;

-- 5. Insert Workers (Employing 1 Owner, 1 Supervisor, and 2 Washers)
INSERT INTO workers (id, agency_id, name, phone, role, is_active)
VALUES 
    (
        'e1f2a300-b101-4cfa-a0f1-0c58e5f10b01', 
        'a7b3c200-a299-4c4d-9051-fb18c5054992', 
        'Vijay Kumar', 
        '+919876543299', 
        'agency_owner', 
        TRUE
    ),
    (
        'e1f2a300-b102-4cfa-a0f1-0c58e5f10b02', 
        'a7b3c200-a299-4c4d-9051-fb18c5054992', 
        'Sunil Rao', 
        '+919876543212', 
        'supervisor', 
        TRUE
    ),
    (
        'e1f2a300-b104-4cfa-a0f1-0c58e5f10b04', 
        'a7b3c200-a299-4c4d-9051-fb18c5054992', 
        'Perumal S', 
        '+918825492512', 
        'washer', 
        TRUE
    ),
    (
        'e1f2a300-b103-4cfa-a0f1-0c58e5f10b03', 
        'a7b3c200-a299-4c4d-9051-fb18c5054992', 
        'Shanmugha P', 
        '+918095695154', 
        'washer', 
        TRUE
    )
ON CONFLICT (phone) DO UPDATE 
SET name = EXCLUDED.name, role = EXCLUDED.role, is_active = EXCLUDED.is_active;

-- 6. Insert Customers
INSERT INTO customers (id, agency_id, custom_customer_id, name, phone_number, email, apartment_id, block_id, parking_slot)
VALUES 
    (
        'f1a2b300-c001-49fa-a551-fb54de200aa1', 
        'a7b3c200-a299-4c4d-9051-fb18c5054992', 
        'SV-BRG-102', 
        'Amit Kumar', 
        '+919999999901', 
        'amit.kumar@gmail.com', 
        'b4c5d600-e102-4d1a-821b-cfc12dcd3422', 
        'c1d2e300-fa01-44bb-8cb9-3cfdb120c1a1', 
        'A-102'
    ),
    (
        'f1a2b300-c002-49fa-a551-fb54de200aa2', 
        'a7b3c200-a299-4c4d-9051-fb18c5054992', 
        'SV-BRG-304', 
        'Priya Sharma', 
        '+919999999902', 
        'priya.sharma@yahoo.com', 
        'b4c5d600-e102-4d1a-821b-cfc12dcd3422', 
        'c1d2e300-fa02-44bb-8cb9-3cfdb120c1a2', 
        'B-304'
    ),
    (
        'f1a2b300-c003-49fa-a551-fb54de200aa3', 
        'a7b3c200-a299-4c4d-9051-fb18c5054992', 
        'SV-BRG-505', 
        'Rahul Singh', 
        '+919999999903', 
        'rahul.singh@outlook.com', 
        'b4c5d600-e102-4d1a-821b-cfc12dcd3422', 
        'c1d2e300-fa01-44bb-8cb9-3cfdb120c1a1', 
        'A-505'
    )
ON CONFLICT (agency_id, custom_customer_id) DO UPDATE 
SET name = EXCLUDED.name, phone_number = EXCLUDED.phone_number, email = EXCLUDED.email;

-- 7. Insert Customer Vehicles
INSERT INTO vehicles (id, customer_id, license_plate, vehicle_type, make_model, color)
VALUES 
    (
        'a1b2c3d4-0001-4fa1-8234-fcba55551111', 
        'f1a2b300-c001-49fa-a551-fb54de200aa1', -- Amit Kumar
        'KA-03-MS-1111', 
        'car', 
        'Hyundai i20', 
        'White'
    ),
    (
        'a1b2c3d4-0002-4fa1-8234-fcba55552222', 
        'f1a2b300-c001-49fa-a551-fb54de200aa1', -- Amit Kumar
        'KA-03-MS-2222', 
        'bike', 
        'Honda Activa 6G', 
        'Black'
    ),
    (
        'a1b2c3d4-0003-4fa1-8234-fcba55553333', 
        'f1a2b300-c002-49fa-a551-fb54de200aa2', -- Priya Sharma
        'KA-05-AB-5555', 
        'car', 
        'Maruti Swift', 
        'Red'
    ),
    (
        'a1b2c3d4-0004-4fa1-8234-fcba55554444', 
        'f1a2b300-c003-49fa-a551-fb54de200aa3', -- Rahul Singh
        'KA-01-XY-9999', 
        'bike', 
        'KTM Duke 250', 
        'Orange'
    )
ON CONFLICT DO NOTHING;

-- 8. Insert Subscriptions (Linking Vehicles to Plans)
INSERT INTO subscriptions (id, vehicle_id, plan_id, start_date, is_active)
VALUES 
    (
        'b1c2d3e4-0001-4ab1-8932-fddba111a111', 
        'a1b2c3d4-0001-4fa1-8234-fcba55551111', -- Amit's Hyundai i20
        'd1e2f300-0001-44ab-b3c9-4deff111a111', -- Daily Wash
        '2026-05-01', 
        TRUE
    ),
    (
        'b1c2d3e4-0002-4ab1-8932-fddba111a112', 
        'a1b2c3d4-0002-4fa1-8234-fcba55552222', -- Amit's Honda Activa
        'd1e2f300-0002-44ab-b3c9-4deff111a112', -- Alternate Days
        '2026-05-01', 
        TRUE
    ),
    (
        'b1c2d3e4-0003-4ab1-8932-fddba111a113', 
        'a1b2c3d4-0003-4fa1-8234-fcba55553333', -- Priya's Maruti Swift
        'd1e2f300-0001-44ab-b3c9-4deff111a111', -- Daily Wash
        '2026-05-01', 
        TRUE
    ),
    (
        'b1c2d3e4-0004-4ab1-8932-fddba111a114', 
        'a1b2c3d4-0004-4fa1-8234-fcba55554444', -- Rahul's KTM Duke
        'd1e2f300-0002-44ab-b3c9-4deff111a112', -- Alternate Days
        '2026-05-15', 
        TRUE
    )
ON CONFLICT DO NOTHING;

-- 9. Insert Historical Daily Service Logs (For testing the dashboard analytics)
-- Let's populate logs for yesterday (May 27, 2026) and today (May 28, 2026)
INSERT INTO daily_service_logs (id, agency_id, worker_id, vehicle_id, log_date, status, reason, notes, marked_at)
VALUES 
    -- Yesterday (2026-05-27)
    (
        'c1d2e3f4-0001-4ab1-8cb9-3cfdb120f201',
        'a7b3c200-a299-4c4d-9051-fb18c5054992',
        'e1f2a300-b103-4cfa-a0f1-0c58e5f10b03', -- Rajesh (Washer)
        'a1b2c3d4-0001-4fa1-8234-fcba55551111', -- Amit's Hyundai i20
        '2026-05-27',
        'washed',
        NULL,
        'Exterior thoroughly cleaned. Checked tires.',
        '2026-05-27 07:15:00+05:30'
    ),
    (
        'c1d2e3f4-0002-4ab1-8cb9-3cfdb120f202',
        'a7b3c200-a299-4c4d-9051-fb18c5054992',
        'e1f2a300-b103-4cfa-a0f1-0c58e5f10b03', -- Rajesh
        'a1b2c3d4-0003-4fa1-8234-fcba55553333', -- Priya's Swift
        '2026-05-27',
        'washed',
        NULL,
        'Sparkling clean, mudguards cleared.',
        '2026-05-27 07:45:00+05:30'
    ),
    -- Today (2026-05-28)
    (
        'c1d2e3f4-0003-4ab1-8cb9-3cfdb120f203',
        'a7b3c200-a299-4c4d-9051-fb18c5054992',
        'e1f2a300-b103-4cfa-a0f1-0c58e5f10b03', -- Rajesh
        'a1b2c3d4-0001-4fa1-8234-fcba55551111', -- Amit's Hyundai i20
        '2026-05-28',
        'washed',
        NULL,
        'Routine dust removal, looking good.',
        '2026-05-28 07:05:00+05:30'
    ),
    (
        'c1d2e3f4-0004-4ab1-8cb9-3cfdb120f204',
        'a7b3c200-a299-4c4d-9051-fb18c5054992',
        'e1f2a300-b103-4cfa-a0f1-0c58e5f10b03', -- Rajesh
        'a1b2c3d4-0002-4fa1-8234-fcba55552222', -- Amit's Honda Activa (Scheduled today alternate days)
        '2026-05-28',
        'washed',
        NULL,
        'Dual mirrors cleaned.',
        '2026-05-28 07:20:00+05:30'
    ),
    (
        'c1d2e3f4-0005-4ab1-8cb9-3cfdb120f205',
        'a7b3c200-a299-4c4d-9051-fb18c5054992',
        'e1f2a300-b103-4cfa-a0f1-0c58e5f10b03', -- Rajesh
        'a1b2c3d4-0003-4fa1-8234-fcba55553333', -- Priya's Swift (Skip Test)
        '2026-05-28',
        'skipped',
        'owner_away',
        'Car cover is locked. Skip chosen by owner choice.',
        '2026-05-28 07:50:00+05:30'
    )
ON CONFLICT (vehicle_id, log_date) DO UPDATE 
SET status = EXCLUDED.status, reason = EXCLUDED.reason, notes = EXCLUDED.notes, marked_at = EXCLUDED.marked_at;

-- Commit the transaction successfully
COMMIT;
