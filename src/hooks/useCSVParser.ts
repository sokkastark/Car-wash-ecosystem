import { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { mockStorage } from "@/lib/mockStorage";

export interface ParsedRow {
  customerName: string;
  phone: string;
  email: string;
  blockName: string;
  parkingSlot: string;
  licensePlate: string;
  vehicleType: "car" | "bike" | "suv";
  makeModel: string;
  color: string;
  planName: string;
  complexName?: string;
  flatNo?: string;
  make?: string;
  model?: string;
  customPrice?: string;
  assignedWorker?: string;
  interiorFrequency?: number;
}

const DEMO_AGENCY_ID = "a7b3c200-a299-4c4d-9051-fb18c5054992"; // From seed.sql
const DEMO_APARTMENT_ID = "b4c5d600-e102-4d1a-821b-cfc12dcd3422"; // From seed.sql

/**
 * ISO-Standard Custom Hook for client-side CSV Parsing & Onboarding transactions.
 * Under 250 lines. Handles both Supabase cloud DB and Local Mock DB.
 */
export function useCSVParser() {
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: Simple CSV Line Parser
  const parseCSVFile = (file: File): Promise<ParsedRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
          if (lines.length < 2) throw new Error("The CSV file must contain a header and at least one row.");

          // Read header indices
          const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
          const rows: ParsedRow[] = [];

          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(",").map(c => c.trim());
            if (cols.length < headers.length) continue;

            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = cols[index];
            });

            // Map variables into structural format
            rows.push({
              customerName: row["customer name"] || row["name"] || "",
              phone: row["phone"] || row["phone number"] || "",
              email: row["email"] || "",
              blockName: row["block name"] || row["block"] || "",
              parkingSlot: row["parking slot"] || row["slot"] || "",
              licensePlate: row["license plate"] || row["plate"] || "",
              vehicleType: (row["vehicle type"] || row["type"] || "car").toLowerCase() as any,
              makeModel: row["make model"] || row["model"] || "",
              color: row["color"] || "",
              planName: row["plan name"] || row["plan"] || "",
              complexName: row["complex name"] || row["complex"] || "",
              flatNo: row["flat no"] || row["flat"] || "",
              make: row["make"] || "",
              model: row["model"] || "",
              customPrice: row["custom price"] || "",
              assignedWorker: row["assigned worker"] || row["assigned_worker"] || row["cleaner"] || row["worker"] || "",
              interiorFrequency: parseInt(row["interior frequency"] || row["interior_frequency"] || "0", 10) || 0
            });
          }
          resolve(rows);
        } catch (err: any) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read the file."));
      reader.readAsText(file);
    });
  };

  const uploadOnboardData = async (rows: ParsedRow[], fileName: string) => {
    setUploading(true);
    setError(null);
    try {
      if (isSupabaseConfigured) {
        // 1. Fetch available blocks & subscription plans for mapping
        const { data: blocks } = await supabase.from("blocks").select("id, name").eq("apartment_id", DEMO_APARTMENT_ID);
        const { data: plans } = await supabase.from("subscription_plans").select("id, name").eq("agency_id", DEMO_AGENCY_ID);

        const blockMap = new Map(blocks?.map(b => [b.name.toLowerCase(), b.id]));
        const planMap = new Map(plans?.map(p => [p.name.toLowerCase(), p.id]));

        for (const row of rows) {
          // Find matching references
          const blockId = blockMap.get(row.blockName.toLowerCase()) || null;
          const planId = planMap.get(row.planName.toLowerCase()) || plans?.[0]?.id; // Default fallback to first plan

          if (!planId) throw new Error(`Subscription plan "${row.planName}" not found. Verify plan names.`);

          // 2. Generate a custom client-facing ID
          const cleanPhoneSuffix = row.phone.slice(-4);
          const customId = `SV-BRG-${row.parkingSlot.replace("-", "")}-${cleanPhoneSuffix}`;

          // 3. Insert customer
          const { data: custData, error: custErr } = await supabase
            .from("customers")
            .insert([{
              agency_id: DEMO_AGENCY_ID,
              custom_customer_id: customId,
              name: row.customerName,
              phone_number: row.phone,
              email: row.email || null,
              apartment_id: DEMO_APARTMENT_ID,
              block_id: blockId,
              parking_slot: row.parkingSlot
            }])
            .select();

          if (custErr) throw custErr;
          const customerId = custData[0].id;

          // 4. Insert vehicle
          const { data: vehData, error: vehErr } = await supabase
            .from("vehicles")
            .insert([{
              customer_id: customerId,
              license_plate: row.licensePlate,
              vehicle_type: row.vehicleType,
              make_model: row.makeModel,
              color: row.color
            }])
            .select();

          if (vehErr) throw vehErr;
          const vehicleId = vehData[0].id;

          // 5. Create active subscription
          const { error: subErr } = await supabase
            .from("subscriptions")
            .insert([{
              vehicle_id: vehicleId,
              plan_id: planId,
              start_date: new Date().toISOString().split("T")[0],
              is_active: true
            }]);

          if (subErr) throw subErr;
        }
      } else {
        const res = mockStorage.importCSVRows(rows, fileName);
        if (!res) throw new Error("Local transaction import failed.");
      }
      return true;
    } catch (err: any) {
      console.error("[useCSVParser] Transaction failed:", err);
      setError(err.message);
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    parsing,
    uploading,
    error,
    parseCSVFile,
    uploadOnboardData
  };
}
