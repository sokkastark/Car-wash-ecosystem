"use client";

import { isSupabaseConfigured } from "@/lib/supabase";

export default function SupabaseGuard({ children }: { children: React.ReactNode }) {
  if (isSupabaseConfigured) {
    return <>{children}</>;
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      width: "100vw",
      background: "radial-gradient(circle at top, hsla(var(--primary) / 0.1) 0%, hsl(var(--bg-dark)) 80%)",
      padding: "20px",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 99999,
      color: "white",
      fontFamily: "var(--font-body)",
      textAlign: "center"
    }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: "600px",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px"
      }}>
        <div style={{
          fontSize: "4rem",
          background: "hsla(var(--warning) / 0.15)",
          borderRadius: "50%",
          width: "90px",
          height: "90px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid hsl(var(--warning))"
        }}>
          ⚠️
        </div>

        <div>
          <span style={{
            color: "hsl(var(--warning))",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontWeight: 700,
            fontSize: "0.85rem"
          }}>
            Configuration Required
          </span>
          <h1 style={{ fontSize: "2rem", marginTop: "8px" }}>Supabase Database Missing</h1>
        </div>

        <p style={{
          color: "hsl(var(--text-secondary))",
          fontSize: "1rem",
          lineHeight: "1.6",
          margin: 0
        }}>
          This application requires an active Supabase database connection to manage subscriptions, workforce rosters, and daily check-ins. Mock mode is disabled to prevent data loss.
        </p>

        <div style={{
          background: "hsla(var(--bg-dark) / 0.6)",
          border: "1px solid hsl(var(--border-muted))",
          borderRadius: "var(--radius-md)",
          padding: "20px",
          width: "100%",
          textAlign: "left",
          fontSize: "0.9rem"
        }}>
          <strong style={{ color: "white", display: "block", marginBottom: "8px" }}>How to configure:</strong>
          <ol style={{ paddingLeft: "20px", color: "hsl(var(--text-secondary))", display: "flex", flexDirection: "column", gap: "6px" }}>
            <li>Log in to your <strong>Vercel Dashboard</strong>.</li>
            <li>Go to your project <strong>Settings &gt; Environment Variables</strong>.</li>
            <li>Add the following keys matching your Supabase project:
              <ul style={{ paddingLeft: "15px", marginTop: "4px", fontFamily: "monospace", color: "hsl(var(--primary))" }}>
                <li>NEXT_PUBLIC_SUPABASE_URL</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              </ul>
            </li>
            <li>Trigger a <strong>Redeploy</strong> in Vercel to apply the changes.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
