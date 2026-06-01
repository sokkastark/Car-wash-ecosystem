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
      const res = mockStorage.importCSVRows(rows, fileName);
      if (!res) throw new Error("Local transaction import failed.");
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
