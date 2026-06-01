"use client";

import { useState, useEffect } from "react";
import { 
  exportToSyncCode, 
  importFromSyncCode, 
  exportToJSONFile, 
  importFromJSONString, 
  getDatabaseStats,
  pushToSupabase,
  pullFromSupabase
} from "@/lib/mockStorage/syncEngine";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function CloudSyncCenter() {
  const [stats, setStats] = useState({ vehicles: 0, customers: 0, workers: 0, logs: 0 });
  const [syncCode, setSyncCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [lastDeviceSync, setLastDeviceSync] = useState<string | null>(null);
  const [lastCloudPush, setLastCloudPush] = useState<string | null>(null);
  const [lastCloudPull, setLastCloudPull] = useState<string | null>(null);
  
  // UI Status
  const [copied, setCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    refreshStats();
    if (typeof window !== "undefined") {
      setLastDeviceSync(localStorage.getItem("sv_last_device_sync"));
      setLastCloudPush(localStorage.getItem("sv_last_cloud_push"));
      setLastCloudPull(localStorage.getItem("sv_last_cloud_pull"));
    }
  }, []);

  const refreshStats = () => {
    setStats(getDatabaseStats());
  };

  const handleGenerateCode = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const code = exportToSyncCode();
      setSyncCode(code);
    } catch (e: any) {
      setErrorMessage("Failed to generate sync code: " + e.message);
    }
  };

  const handleCopyCode = () => {
    if (!syncCode) return;
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImportCode = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!inputCode.trim()) {
      setErrorMessage("Please paste a valid sync code.");
      return;
    }
    const success = importFromSyncCode(inputCode);
    if (success) {
      setSuccessMessage("✓ Database restored successfully! The dashboard has updated.");
      setInputCode("");
      setLastDeviceSync(new Date().toISOString());
      refreshStats();
    } else {
      setErrorMessage("❌ Invalid sync code. Please verify the copied text and try again.");
    }
  };

  const handleExportJSON = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const jsonStr = exportToJSONFile();
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `sv_database_backup_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccessMessage("✓ Database exported to JSON file successfully!");
    } catch (e: any) {
      setErrorMessage("Failed to export JSON file: " + e.message);
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = importFromJSONString(text);
        if (success) {
          setSuccessMessage("✓ Database backup file imported successfully!");
          setLastDeviceSync(new Date().toISOString());
          refreshStats();
        } else {
          setErrorMessage("❌ Failed to parse backup file. Please ensure it is a valid SV backup JSON.");
        }
      } catch (err: any) {
        setErrorMessage("❌ Error reading backup file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleCloudPush = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSyncing(true);
    try {
      const res = await pushToSupabase();
      if (res.success) {
        setSuccessMessage("✓ Database pushed to Supabase cloud successfully!");
        setLastCloudPush(new Date().toISOString());
      } else {
        // Show detailed explanation of relation missing or RLS error
        if (res.error?.includes("relation") && res.error?.includes("does not exist")) {
          setErrorMessage(
            "❌ Table Missing in Supabase: To enable cloud sync, you must create the 'client_sync_snapshots' table. Please run the SQL script below in your Supabase SQL Editor."
          );
        } else {
          setErrorMessage("❌ Cloud Push failed: " + res.error);
        }
      }
    } catch (e: any) {
      setErrorMessage("❌ Cloud Push failed: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleCloudPull = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setSyncing(true);
    try {
      const res = await pullFromSupabase();
      if (res.success) {
        if (res.hasData) {
          setSuccessMessage("✓ Database pulled from Supabase cloud and restored successfully!");
          setLastCloudPull(new Date().toISOString());
          refreshStats();
        } else {
          setSuccessMessage("ℹ️ No existing cloud sync backup found for this tenant in Supabase.");
        }
      } else {
        if (res.error?.includes("relation") && res.error?.includes("does not exist")) {
          setErrorMessage(
            "❌ Table Missing in Supabase: To pull, you must create the 'client_sync_snapshots' table first. Please run the SQL script below in your Supabase SQL editor."
          );
        } else {
          setErrorMessage("❌ Cloud Pull failed: " + res.error);
        }
      }
    } catch (e: any) {
      setErrorMessage("❌ Cloud Pull failed: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const formatTimestamp = (isoString: string | null) => {
    if (!isoString) return "Never";
    const date = new Date(isoString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ padding: "40px 24px", maxWidth: "1000px", margin: "0 auto" }}>
      <header style={{ marginBottom: "32px" }}>
        <span style={{ color: "hsl(var(--primary))", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, fontSize: "0.8rem" }}>
          Database Integrations
        </span>
        <h1 style={{ fontSize: "2.2rem", marginTop: "4px" }}>Cloud & Device Sync Center</h1>
        <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px" }}>
          Manage records across multiple devices (computers & mobile PWAs) via manual offline codes, file transfers, or real-time Supabase cloud synchronization.
        </p>
      </header>

      {/* Database Health Card */}
      <section className="glass-panel" style={{ padding: "24px", marginBottom: "30px", background: "linear-gradient(135deg, hsla(var(--primary) / 0.15), transparent)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <span>📊</span> Local Database Diagnostic Status
            </h2>
            <p style={{ color: "hsl(var(--text-secondary))", fontSize: "0.85rem", marginTop: "4px", marginBottom: 0 }}>
              Active local variables loaded inside this browser environment.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", background: "hsla(var(--bg-dark) / 0.4)", padding: "4px 10px", borderRadius: "var(--radius-sm)", border: "1px solid hsl(var(--border-muted))" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "hsl(var(--success))", alignSelf: "center" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>Mock-Database Engine Sandbox</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "20px", marginTop: "24px" }}>
          <div style={{ background: "hsla(var(--bg-dark) / 0.5)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-muted))" }}>
            <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))", textTransform: "uppercase" }}>Customers</span>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "4px" }}>{stats.customers}</div>
          </div>
          <div style={{ background: "hsla(var(--bg-dark) / 0.5)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-muted))" }}>
            <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))", textTransform: "uppercase" }}>Vehicles</span>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "4px", color: "hsl(var(--primary))" }}>{stats.vehicles}</div>
          </div>
          <div style={{ background: "hsla(var(--bg-dark) / 0.5)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-muted))" }}>
            <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))", textTransform: "uppercase" }}>Workers</span>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "4px", color: "hsl(var(--success))" }}>{stats.workers}</div>
          </div>
          <div style={{ background: "hsla(var(--bg-dark) / 0.5)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-muted))" }}>
            <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))", textTransform: "uppercase" }}>Service Logs</span>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "4px" }}>{stats.logs}</div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      {successMessage && (
        <div style={{ color: "hsl(var(--success))", background: "rgba(16, 185, 129, 0.1)", border: "1px solid hsla(var(--success) / 0.2)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "30px", fontSize: "0.95rem" }}>
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div style={{ color: "hsl(var(--danger))", background: "rgba(239, 68, 68, 0.1)", border: "1px solid hsla(var(--danger) / 0.2)", padding: "16px", borderRadius: "var(--radius-md)", marginBottom: "30px", fontSize: "0.95rem", lineHeight: "1.5" }}>
          {errorMessage}
        </div>
      )}

      {/* Sync Actions Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "30px", marginBottom: "40px" }}>
        
        {/* Manual Device-to-Device Code Sync */}
        <section className="glass-panel" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", margin: 0, display: "flex", gap: "10px", alignItems: "center" }}>
              <span>📲</span> Instant Device-to-Device Sync
            </h2>
            <p style={{ color: "hsl(var(--text-secondary))", fontSize: "0.85rem", marginTop: "4px", marginBottom: 0 }}>
              Sync your computer and mobile phone instantly without requiring cloud connections or running migrations!
            </p>
          </div>

          <div style={{ background: "hsla(var(--bg-dark) / 0.4)", border: "1px dashed hsl(var(--border-muted))", padding: "20px", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Step 1: Export from this Computer</span>
            <button 
              onClick={handleGenerateCode}
              className="btn-primary" 
              style={{ background: "hsl(var(--primary))", alignSelf: "flex-start" }}
            >
              🔄 Generate Sync Code
            </button>

            {syncCode && (
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <input 
                  type="text" 
                  value={syncCode} 
                  readOnly 
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  style={{ flexGrow: 1, padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid hsl(var(--border-muted))", background: "hsl(var(--bg-dark))", color: "hsl(var(--text-secondary))", fontSize: "0.8rem", fontFamily: "monospace" }}
                />
                <button 
                  onClick={handleCopyCode}
                  className="btn-primary" 
                  style={{ background: copied ? "hsl(var(--success))" : "hsla(var(--primary) / 0.15)", color: copied ? "white" : "hsl(var(--primary))", border: `1px solid ${copied ? "hsl(var(--success))" : "hsl(var(--primary))"}`, boxShadow: "none" }}
                >
                  {copied ? "Copied! ✓" : "Copy"}
                </button>
              </div>
            )}
            {syncCode && <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>Copy this code, send it to your phone (e.g. WhatsApp/email), and paste it in the worker portal's Sync panel!</span>}
          </div>

          <div style={{ background: "hsla(var(--bg-dark) / 0.4)", border: "1px dashed hsl(var(--border-muted))", padding: "20px", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Step 2: Import / Overwrite Database</span>
            <textarea 
              placeholder="Paste the Base64 Sync Code generated from another device here..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-sm)", border: "1px solid hsl(var(--border-muted))", background: "hsl(var(--bg-dark))", color: "white", fontSize: "0.8rem", fontFamily: "monospace", resize: "none" }}
            />
            <button 
              onClick={handleImportCode}
              className="btn-primary" 
              style={{ background: "hsl(var(--success))", alignSelf: "flex-start", boxShadow: "0 4px 14px 0 hsla(var(--success) / 0.4)" }}
            >
              📥 Overwrite & Restore Data
            </button>
          </div>

          <div style={{ fontSize: "0.8rem", color: "hsl(var(--text-muted))", borderTop: "1px solid hsl(var(--border-muted))", paddingTop: "12px", display: "flex", justifyContent: "space-between" }}>
            <span>Last Manual Local Restore:</span>
            <strong>{formatTimestamp(lastDeviceSync)}</strong>
          </div>
        </section>

        {/* Supabase Automatic Cloud Sync */}
        <section className="glass-panel" style={{ padding: "30px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h2 style={{ fontSize: "1.3rem", margin: 0, display: "flex", gap: "10px", alignItems: "center" }}>
                <span>☁️</span> Supabase Cloud Sync
              </h2>
              <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "20px", background: isSupabaseConfigured ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)", color: isSupabaseConfigured ? "hsl(var(--success))" : "hsl(var(--danger))", fontWeight: 600, border: `1px solid ${isSupabaseConfigured ? "hsl(var(--success))" : "hsl(var(--danger))"}` }}>
                {isSupabaseConfigured ? "Supabase Connected" : "Supabase Offline"}
              </span>
            </div>
            <p style={{ color: "hsl(var(--text-secondary))", fontSize: "0.85rem", marginTop: "4px", marginBottom: 0 }}>
              Backup and retrieve your entire high-fidelity database directly via Supabase! Accessible by any authorized worker device.
            </p>
          </div>

          <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "16px", justifyContent: "center", background: "hsla(var(--bg-dark) / 0.2)", padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid hsl(var(--border-muted))" }}>
            <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Cloud Sync Operations</h4>
            <p style={{ color: "hsl(var(--text-secondary))", fontSize: "0.8rem", margin: 0 }}>
              If you have executed the database migration table, push your latest local computer database to the cloud, or pull down changes made from your workers' mobile phones.
            </p>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button 
                onClick={handleCloudPush}
                disabled={syncing || !isSupabaseConfigured}
                className="btn-primary" 
                style={{ flexGrow: 1, background: "hsl(var(--primary))", opacity: isSupabaseConfigured ? 1 : 0.5 }}
              >
                {syncing ? "Pushing..." : "⬆️ Push Local to Cloud"}
              </button>
              <button 
                onClick={handleCloudPull}
                disabled={syncing || !isSupabaseConfigured}
                className="btn-primary" 
                style={{ flexGrow: 1, background: "hsl(var(--success))", opacity: isSupabaseConfigured ? 1 : 0.5 }}
              >
                {syncing ? "Pulling..." : "⬇️ Pull Cloud to Local"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8rem", color: "hsl(var(--text-muted))", borderTop: "1px solid hsl(var(--border-muted))", paddingTop: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Last Cloud Backup (Push):</span>
              <strong>{formatTimestamp(lastCloudPush)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Last Cloud Retrieval (Pull):</span>
              <strong>{formatTimestamp(lastCloudPull)}</strong>
            </div>
          </div>
        </section>

      </div>

      {/* JSON Backup Manager and SQL Migration Guide side-by-side */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "30px" }}>
        
        {/* JSON Backup Section */}
        <section className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "1.1rem", margin: 0 }}>💾 File-Based Database Backups</h3>
          <p style={{ color: "hsl(var(--text-secondary))", fontSize: "0.85rem", margin: 0 }}>
            Download complete database snapshots to your hard drive, or restore a previously saved JSON backup.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "8px" }}>
            <button 
              onClick={handleExportJSON}
              className="btn-primary" 
              style={{ background: "hsla(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary))", color: "hsl(var(--primary))", boxShadow: "none" }}
            >
              📥 Export to Backup JSON File
            </button>

            <input 
              type="file" 
              accept=".json"
              onChange={handleImportJSON}
              style={{ display: "none" }} 
              id="json-file-input"
            />
            <label htmlFor="json-file-input" className="btn-primary" style={{ cursor: "pointer", display: "inline-flex", background: "hsla(var(--success) / 0.15)", border: "1px solid hsl(var(--success))", color: "hsl(var(--success))", boxShadow: "none" }}>
              📂 Upload & Restore JSON File
            </label>
          </div>
        </section>

        {/* Supabase SQL DDL Guide */}
        <section className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>🛠 Supabase SQL Table Setup</h3>
          <p style={{ color: "hsl(var(--text-secondary))", fontSize: "0.8rem", lineHeight: "1.4", marginBottom: "12px" }}>
            To enable **Supabase Cloud Sync**, paste and run this script in your Supabase SQL Editor. This adds the sync table and configures Row-Level Security bypasses:
          </p>
          <pre style={{ display: "block", background: "hsl(var(--bg-dark))", padding: "12px", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", overflowX: "auto", color: "hsl(var(--success))", margin: 0, fontFamily: "monospace", border: "1px solid hsl(var(--border-muted))" }}>
{`CREATE TABLE IF NOT EXISTS client_sync_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE client_sync_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY allow_all_sync ON client_sync_snapshots 
    FOR ALL USING (true) WITH CHECK (true);`}
          </pre>
        </section>

      </div>
    </div>
  );
}
