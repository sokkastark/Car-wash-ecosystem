"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarLinkProps {
  href: string;
  emoji: string;
  label: string;
  active: boolean;
}

function SidebarLink({ href, emoji, label, active }: SidebarLinkProps) {
  return (
    <Link 
      href={href} 
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 18px",
        borderRadius: "var(--radius-md)",
        color: active ? "hsl(var(--primary))" : "hsl(var(--text-secondary))",
        background: active ? "hsla(var(--primary) / 0.1)" : "transparent",
        textDecoration: "none",
        fontWeight: 600,
        fontSize: "0.95rem",
        transition: "var(--transition-smooth)"
      }}
    >
      <span style={{ fontSize: "1.2rem" }}>{emoji}</span>
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";

  // Detect subdomain mode (e.g. '/' or '/complexes' without '/admin' prefix)
  const isSubdomainMode = !pathname.startsWith("/admin");
  const prefix = isSubdomainMode ? "" : "/admin";

  // Utility to determine if route is active
  const isActive = (route: string) => {
    if (isSubdomainMode) {
      if (route === "/" && pathname === "/") return true;
      if (route !== "/" && pathname.startsWith(route)) return true;
    } else {
      const fullRoute = `/admin${route === "/" ? "" : route}`;
      if (pathname === fullRoute) return true;
      if (route !== "/" && pathname.startsWith(fullRoute)) return true;
    }
    return false;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: "260px",
        background: "hsl(var(--bg-card))",
        borderRight: "1px solid hsl(var(--border-muted))",
        padding: "32px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "40px",
        flexShrink: 0
      }}>
        <div>
          <span style={{ fontSize: "0.75rem", color: "hsl(var(--primary))", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>
            SV Operations
          </span>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginTop: "4px" }}>Admin Portal</h2>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}>
          <SidebarLink href={prefix || "/"} emoji="📊" label="Dashboard" active={isActive("/")} />
          <SidebarLink href={`${prefix}/complexes`} emoji="🏢" label="Complexes" active={isActive("/complexes")} />
          <SidebarLink href={`${prefix}/customers`} emoji="🚗" label="Customers" active={isActive("/customers")} />
          <SidebarLink href={`${prefix}/workers`} emoji="👷" label="Workforce" active={isActive("/workers")} />
          <SidebarLink href={`${prefix}/finances`} emoji="💰" label="Finances & Reports" active={isActive("/finances")} />
          <SidebarLink href={`${prefix}/analytics`} emoji="📈" label="Analytics" active={isActive("/analytics")} />
          <SidebarLink href={`${prefix}/onboarding`} emoji="📁" label="Bulk Onboard" active={isActive("/onboarding")} />
          <SidebarLink href={`${prefix}/trash`} emoji="🗑" label="Trash Bin" active={isActive("/trash")} />
        </nav>

        <footer style={{ borderTop: "1px solid hsl(var(--border-muted))", paddingTop: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "hsl(var(--success))" }} />
            <span style={{ fontSize: "0.85rem", color: "hsl(var(--text-secondary))" }}>Live Database Online</span>
          </div>
        </footer>
      </aside>

      {/* Main Viewport Content */}
      <main style={{ flexGrow: 1, minWidth: 0, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
