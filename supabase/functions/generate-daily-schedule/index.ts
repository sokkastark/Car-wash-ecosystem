// Supabase Edge Function: generate-daily-schedule
// Runtime: Deno

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Initialize Supabase client using Service Role Key to bypass RLS policies
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Parse target date from payload, defaulting to today's date in Indian Standard Time (IST)
    let targetDateStr: string;
    try {
      const payload = await req.json();
      targetDateStr = payload.target_date;
    } catch {
      targetDateStr = "";
    }

    if (!targetDateStr) {
      // Get current date in Asia/Kolkata (IST) timezone
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      targetDateStr = formatter.format(new Date()); // Outputs "YYYY-MM-DD"
    }

    const targetDate = new Date(targetDateStr);
    const dayOfWeek = targetDate.getDay(); // 0 (Sunday) to 6 (Saturday)

    console.log(`[Scheduler] Starting schedule generation for target date: ${targetDateStr} (Day of Week: ${dayOfWeek})`);

    // 3. Fetch active subscriptions, joined with vehicle, customer, and plan details
    const { data: subscriptions, error: subError } = await supabase
      .from("subscriptions")
      .select(`
        id,
        vehicle_id,
        plan_id,
        start_date,
        end_date,
        subscription_plans (
          agency_id,
          recurrence,
          recurrence_config
        ),
        vehicles (
          license_plate,
          customer_id,
          customers (
            agency_id,
            apartment_id
          )
        )
      `)
      .eq("is_active", true)
      .lte("start_date", targetDateStr)
      .or(`end_date.is.null,end_date.gte.${targetDateStr}`);

    if (subError) throw subError;
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscriptions found for this date.", target_date: targetDateStr }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log(`[Scheduler] Found ${subscriptions.length} active subscriptions to evaluate.`);

    // 4. Fetch all active workers with role 'washer' grouped by agency_id to assign them tasks
    const { data: workers, error: workerError } = await supabase
      .from("workers")
      .select("id, agency_id, name")
      .eq("role", "washer")
      .eq("is_active", true);

    if (workerError) throw workerError;

    // Create a lookup map: agency_id -> list of washers
    const agencyWasherMap: Record<string, typeof workers> = {};
    if (workers) {
      for (const w of workers) {
        if (!w.agency_id) continue;
        if (!agencyWasherMap[w.agency_id]) {
          agencyWasherMap[w.agency_id] = [];
        }
        agencyWasherMap[w.agency_id].push(w);
      }
    }

    // 5. Evaluate plans and build daily service log insertions
    const insertLogs = [];
    let scheduledCount = 0;

    for (const sub of subscriptions) {
      const plan = sub.subscription_plans;
      const vehicle = sub.vehicles;
      if (!plan || !vehicle || !vehicle.customers) continue;

      const agencyId = plan.agency_id;
      const customer = vehicle.customers;
      let shouldWash = false;

      switch (plan.recurrence) {
        case "daily":
          shouldWash = true;
          break;

        case "alternate_days": {
          const startDate = new Date(sub.start_date);
          // Calculate UTC absolute date difference
          const diffTime = Math.abs(targetDate.getTime() - startDate.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          shouldWash = (diffDays % 2 === 0);
          break;
        }

        case "weekly_once":
        case "weekly_twice": {
          const config = plan.recurrence_config as { days?: number[] };
          const scheduledDays = config?.days ?? [];
          shouldWash = scheduledDays.includes(dayOfWeek);
          break;
        }

        default:
          shouldWash = false;
      }

      if (shouldWash) {
        // Round-robin or first assigned worker strategy: assign the first active washer of the agency
        const agencyWashers = agencyWasherMap[agencyId] ?? [];
        const assignedWorkerId = agencyWashers.length > 0 ? agencyWashers[0].id : null;

        insertLogs.push({
          agency_id: agencyId,
          vehicle_id: sub.vehicle_id,
          worker_id: assignedWorkerId,
          log_date: targetDateStr,
          status: "pending",
          is_compensated: false
        });
        scheduledCount++;
      }
    }

    console.log(`[Scheduler] Evaluated subscriptions. Creating ${insertLogs.length} pending logs.`);

    // 6. Bulk UPSERT the daily service logs to maintain idempotency
    if (insertLogs.length > 0) {
      const { error: upsertError } = await supabase
        .from("daily_service_logs")
        .upsert(insertLogs, { 
          onConflict: "vehicle_id,log_date",
          ignoreDuplicates: true // Set to true to avoid overwriting worker updates if job re-runs
        });

      if (upsertError) throw upsertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        target_date: targetDateStr,
        evaluated_subscriptions: subscriptions.length,
        scheduled_washes: scheduledCount,
        inserted_rows: insertLogs.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (err) {
    console.error(`[Scheduler] Fatal error: ${err.message}`);
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
