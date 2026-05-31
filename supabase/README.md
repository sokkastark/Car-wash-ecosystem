# SV Carwash Operations Platform — Supabase Local Database Guide

This directory holds the database schema migrations, RLS (Row-Level Security) security rules, and testing seed data for local development. Follow this guide to initialize and manage your local database environment.

---

## 📁 Directory Structure
```
supabase/
├── migrations/
│   ├── 20260528000000_init_schema.sql  # DDL core tables, enums, & automatic updated_at triggers
│   └── 20260528000001_enable_rls.sql    # Tenancy access-control & JWT RLS configurations
├── seed.sql                            # High-fidelity mock datasets for immediate UI testing
└── README.md                           # This guide
```

---

## ⚡ Quick Start: Running Database Locally

To get the database up and running locally, you will need **Docker** installed and the **Supabase CLI**.

### 1. Install Supabase CLI
Select the method suited to your development system:

* **Node.js (NPM - Cross-platform)**:
  ```bash
  npm install supabase --save-dev
  ```

* **Windows (Scoop)**:
  ```bash
  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
  scoop install supabase
  ```

### 2. Initialize Supabase in Project
From the root of your workspace (`z:\Learn react\SV Carwash`), initialize the Supabase configuration files:
```bash
npx supabase init
```
This command generates a `supabase/config.toml` file containing local ports and credentials.

### 3. Start Local Supabase Servers
Ensure your Docker Desktop or engine is running, then boot the local containers:
```bash
npx supabase start
```
This runs the local PostgreSQL database, Supabase Studio, authentication modules, storage buckets, and Edge function runtimes. On first run, **migrations under `supabase/migrations` are applied automatically**.

### 4. Seed and Reset the Database
To populate your tables with the test dataset from `supabase/seed.sql` and verify a clean state, run:
```bash
npx supabase db reset
```
This tears down local schemas, rebuilds them sequentially through migration files, and executes the seed transaction.

---

## 🖥 Local Ports & Dashboards

Once your containers start, the terminal will print key local URLs and secrets. Key ports include:

* **Supabase Local Studio UI**: [http://localhost:54321](http://localhost:54321) (Inspect tables, write query scripts, or manage auth emails).
* **Local Postgres Database Connection**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
* **API Gateway Port**: `http://localhost:54321` (API endpoints used by frontend portals).

---

## 🔒 Row-Level Security (RLS) Mechanics

The database utilizes Supabase's `auth.jwt()->>'phone'` metadata claim to enforce tenant boundaries:

1. **Agency Owner & Supervisor Portal**: Can perform CRUD operations across tables belonging strictly to their employee `agency_id`.
2. **Worker PWA Checklist**: Has permission to select blocks, update vehicle statuses, and log skipped reports for vehicles under their agency.
3. **Customer Portal**: Reads only their vehicle wash logs based on their registered phone number session.

### Testing RLS locally in Query Editor
To simulate query outcomes for a specific worker role in the Supabase Studio Query Editor, prepend this snippet to your queries:
```sql
-- Emulate login session for worker Rajesh (+919876543210)
SET LOCAL request.jwt.claims = '{"phone": "+919876543210"}';

-- This select will filter down to Rajesh's agency logs only
SELECT * FROM daily_service_logs;
```

---

## 🛠 Useful Queries to Validate Seed Setup

To quickly check your initialized data inside the query editor, you can run the following standard diagnostic commands:

### Verify Active Vehicle Subscriptions & Plans
```sql
SELECT 
    c.custom_customer_id, 
    c.name AS customer, 
    v.license_plate, 
    v.make_model, 
    p.name AS plan_name,
    p.recurrence
FROM subscriptions s
JOIN vehicles v ON s.vehicle_id = v.id
JOIN customers c ON v.customer_id = c.id
JOIN subscription_plans p ON s.plan_id = p.id
WHERE s.is_active = TRUE;
```

### Inspect Today's Logs (Completed vs. Skipped)
```sql
SELECT 
    l.log_date,
    c.name AS customer_name,
    v.license_plate,
    l.status,
    l.reason,
    l.notes
FROM daily_service_logs l
JOIN vehicles v ON l.vehicle_id = v.id
JOIN customers c ON v.customer_id = c.id
ORDER BY l.log_date DESC;
```
