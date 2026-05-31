"use client";

import { useState } from "react";
import { useCSVParser, ParsedRow } from "@/hooks/useCSVParser";
import { useAdminData } from "@/hooks/useAdminData";
import Table from "@/components/ui/Table";

export default function BulkOnboarding() {
  const { uploadLogs, refetchUploadLogs } = useAdminData();
  const { uploading, error, parseCSVFile, uploadOnboardData } = useCSVParser();
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseError(null);
    setSuccess(false);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setParseError("Please select a valid .csv file format.");
      return;
    }

    setFile(selectedFile);
    try {
      const parsed = await parseCSVFile(selectedFile);
      setPreviewRows(parsed);
    } catch (err: any) {
      setParseError(err.message || "Failed to parse CSV file.");
      setPreviewRows([]);
      setFile(null);
    }
  };

  const handleOnboard = async () => {
    if (previewRows.length === 0 || !file) return;
    const isSuccess = await uploadOnboardData(previewRows, file.name);
    if (isSuccess) {
      setSuccess(true);
      setPreviewRows([]);
      setFile(null);
      await refetchUploadLogs();
    }
  };

  const handleDownloadTemplate = () => {
    const headers = "Complex Name,Block Name,Flat No,Customer Name,Phone,Email,Parking Slot,License Plate,Vehicle Type,Make,Model,Color,Plan Name,Custom Price,Interior Frequency,Assigned Worker\n";
    const sample1 = "Brigade Apartments,Block C,404,Rohit Sharma,+919876543322,rohit@example.com,C-404,KA-03-XX-8888,car,Sk Skoda,Kushaq,White,Daily Wash,,1,Shanmugha P\n";
    const sample2 = "Prestige Shantiniketan,Tower 2,802,Virat Kohli,+919876543333,virat@example.com,T2-802,KA-51-AB-1818,suv,Audi,Q7,Black,Daily Wash,1200,2,Perumal S\n";
    
    const csvContent = headers + sample1 + sample2;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sv_carwash_onboard_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "40px 24px", maxWidth: "1000px", margin: "0 auto" }} className="animate-fade-in">
      <header style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <span style={{ color: "hsl(var(--primary))", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, fontSize: "0.8rem" }}>
            Operations Setup
          </span>
          <h1 style={{ fontSize: "2.2rem", marginTop: "4px" }}>Bulk Onboarding Engine</h1>
          <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>
            Upload residential community sheets to dynamically register apartments, customer portfolios, and active plans.
          </p>
        </div>
        <button 
          onClick={handleDownloadTemplate} 
          className="btn-primary" 
          style={{ background: "hsla(var(--success) / 0.15)", border: "1px solid hsl(var(--success))", color: "hsl(var(--success))", boxShadow: "none" }}
        >
          📥 Download CSV Template
        </button>
      </header>

      {/* Main Upload Box & Last Upload Log side-by-side */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px", marginBottom: "40px" }}>
        {/* Upload Drag/Drop Box */}
        <section className="glass-panel" style={{ padding: "30px", textAlign: "center" }}>
          <div style={{ border: "2px dashed hsl(var(--border-muted))", padding: "40px 20px", borderRadius: "var(--radius-md)", background: "hsla(var(--bg-dark) / 0.5)" }}>
            <span style={{ fontSize: "3rem", display: "block", marginBottom: "16px" }}>📁</span>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Select customer roster CSV</h3>
            <p style={{ color: "hsl(var(--text-secondary))", fontSize: "0.85rem", marginBottom: "20px" }}>
              Ensure your file is in .csv format. (Use template for friction-free imports)
            </p>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              style={{ display: "none" }} 
              id="csv-file-input"
            />
            <label htmlFor="csv-file-input" className="btn-primary" style={{ cursor: "pointer", display: "inline-flex" }}>
              Browse Local Files
            </label>
            {file && <span style={{ display: "block", marginTop: "12px", fontSize: "0.9rem", color: "hsl(var(--success))" }}>Selected: {file.name}</span>}
          </div>
        </section>

        {/* Upload Audit Trail History Card */}
        <section className="glass-panel" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Onboarding Audit Logs</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {uploadLogs.length === 0 ? (
              <div style={{ color: "hsl(var(--text-muted))", textAlign: "center", padding: "40px 0", fontSize: "0.9rem" }}>No upload history found.</div>
            ) : (
              uploadLogs.map(log => (
                <div key={log.id} style={{ borderBottom: "1px solid hsl(var(--border-muted))", paddingBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.95rem" }}>{log.fileName}</strong>
                    <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>
                      {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.85rem", display: "block", color: "hsl(var(--success))", marginTop: "4px" }}>
                    ✓ Successfully onboarded {log.totalCount} residents
                  </span>
                  
                  {/* Complex-wise breakdown list */}
                  <div style={{ marginTop: "6px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {Object.entries(log.breakdown).map(([cName, count]) => (
                      <span key={cName} style={{ fontSize: "0.7rem", padding: "2px 6px", background: "hsl(var(--border-muted))", borderRadius: "var(--radius-sm)", color: "hsl(var(--text-secondary))" }}>
                        {cName}: <strong>{count}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Notifications Display */}
      {parseError && <div style={{ color: "hsl(var(--danger))", background: "rgba(239, 68, 68, 0.1)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "30px" }}>{parseError}</div>}
      {error && <div style={{ color: "hsl(var(--danger))", background: "rgba(239, 68, 68, 0.1)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "30px" }}>Upload failed: {error}</div>}
      {success && <div style={{ color: "hsl(var(--success))", background: "rgba(16, 185, 129, 0.1)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "30px" }}>✓ All residents, vehicles, and active plans onboarded successfully! Check your customer accordions to see them.</div>}

      {/* Parser Preview Table */}
      {previewRows.length > 0 && (
        <section className="glass-panel animate-fade-in" style={{ padding: "24px", marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "1.25rem" }}>Upload Preview ({previewRows.length} Rows Detected)</h2>
            <button 
              onClick={handleOnboard} 
              disabled={uploading}
              className="btn-primary" 
              style={{ background: "hsl(var(--success))", boxShadow: "0 4px 14px 0 hsla(var(--success) / 0.4)" }}
            >
              {uploading ? "Executing Onboard..." : "Confirm Bulk Import"}
            </button>
          </div>

          <Table headers={["Complex", "Block/Flat", "Name", "Phone", "Parking Slot", "Plate/Model", "Type", "Plan Name", "Assigned Worker"]}>
            {previewRows.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid hsl(var(--border-muted))" }}>
                <td style={{ padding: "12px", fontWeight: 600 }}>{(r as any).complexName}</td>
                <td style={{ padding: "12px" }}>
                  {r.blockName} — Flat { (r as any).flatNo }
                </td>
                <td style={{ padding: "12px", fontWeight: 600 }}>{r.customerName}</td>
                <td style={{ padding: "12px", color: "hsl(var(--text-secondary))" }}>{r.phone}</td>
                <td style={{ padding: "12px" }}>{r.parkingSlot}</td>
                <td style={{ padding: "12px", fontFamily: "monospace", fontWeight: 600 }}>{r.licensePlate}</td>
                <td style={{ padding: "12px", textTransform: "capitalize" }}>{r.vehicleType}</td>
                <td style={{ padding: "12px", color: "hsl(var(--primary))", fontWeight: 600 }}>{r.planName}</td>
                <td style={{ padding: "12px", color: "hsl(var(--success))", fontWeight: 600 }}>{r.assignedWorker || "None"}</td>
              </tr>
            ))}
          </Table>
        </section>
      )}

      {/* Format Helper Information */}
      <section className="glass-panel" style={{ padding: "24px" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "12px" }}>📋 Expected CSV Column Headers</h3>
        <p style={{ color: "hsl(var(--text-secondary))", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "14px" }}>
          To successfully parse, ensure your CSV columns exactly match the following labels (order does not matter):
        </p>
        <code style={{ display: "block", background: "hsl(var(--bg-dark))", padding: "12px", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", overflowX: "auto", color: "hsl(var(--primary))", lineHeight: "1.6" }}>
          Complex Name, Block Name, Flat No, Customer Name, Phone, Email, Parking Slot, License Plate, Vehicle Type, Make, Model, Color, Plan Name, Custom Price, Interior Frequency, Assigned Worker
        </code>
      </section>
    </div>
  );
}
