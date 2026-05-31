-- Migration: 20260528000002_cron_setup.sql
-- Description: Enable pg_cron and pg_net extensions to schedule the nightly schedule generator function.

-- Enable extensions (in Supabase, these are enabled in the pg_catalog or public schemas)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Safely unschedule if the job already exists (useful for re-runs of migrations)
SELECT cron.unschedule('generate-daily-schedule-job');

-- Schedule the nightly scheduler execution:
-- Indian Standard Time (IST) is UTC + 5:30.
-- To execute at 01:00 AM IST daily, we run it at 19:30 UTC (7:30 PM UTC of the previous day).
-- Crontab format in UTC: '30 19 * * *'
SELECT cron.schedule(
    'generate-daily-schedule-job',
    '30 19 * * *',
    $$
    SELECT net.http_post(
        -- Local Deno function endpoint in development, or resolved internally in production
        url := 'http://kong:8000/functions/v1/generate-daily-schedule',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || coalesce(current_setting('app.settings.service_role_key', true), '') || '"}'::jsonb,
        body := '{}'::jsonb
    );
    $$
);

COMMENT ON COLUMN cron.job.jobname IS 'Triggers the Deno Edge Function nightly to calculate tomorrow''s vehicle wash checklist logs.';
