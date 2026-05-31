"use client";

import { useEffect, useState } from "react";

interface PortalCardProps {
  title: string;
  emoji: string;
  description: string;
  url: string;
  colorVar: string;
}

function PortalCard({ title, emoji, description, url, colorVar }: PortalCardProps) {
  return (
    <a href={url} className="glass-panel animate-fade-in" style={{ textDecoration: 'none', display: 'block', padding: '24px' }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{emoji}</div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: `hsl(${colorVar})` }}>{title}</h2>
      <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px' }}>
        {description}
      </p>
      <span className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', background: `hsl(${colorVar})`, boxShadow: `0 4px 14px 0 hsla(${colorVar} / 0.4)` }}>
        Access Portal
      </span>
    </a>
  );
}

export default function HomeRouter() {
  const [baseDomain, setBaseDomain] = useState("aura360studio.com");
  const [isLocal, setIsLocal] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
        setBaseDomain(window.location.host); // Keep port e.g. "localhost:3000"
        setIsLocal(true);
      } else {
        setBaseDomain("aura360studio.com");
        setIsLocal(false);
      }
    }
  }, []);

  const getPortalUrl = (sub: string) => {
    return isLocal ? `http://${sub}.${baseDomain}` : `https://${sub}.${baseDomain}`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '40px 20px',
      background: 'radial-gradient(circle at top, hsla(var(--primary) / 0.08) 0%, transparent 60%)'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '60px' }} className="animate-fade-in">
        <span style={{ color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, fontSize: '0.8rem' }}>
          Operations Gateway
        </span>
        <h1 style={{ fontSize: '3rem', marginTop: '8px', marginBottom: '16px' }}>SV Carwash Platform</h1>
        <p style={{ color: 'hsl(var(--text-secondary))', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Welcome to the multi-tenant operations network. Choose a starting portal below to begin operations.
        </p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '30px',
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <PortalCard
          title="Admin Dashboard"
          emoji="🛠"
          description="Manage apartment listings, user subscriptions, shift rosters, employee worker lists, and financial payment summaries."
          url={getPortalUrl("cwadmin")}
          colorVar="var(--primary)"
        />
        <PortalCard
          title="Worker Checklist"
          emoji="👷"
          description="Frictionless swipe checklist for washers. Optimized for low-end mobile viewports, wet hands, and basement offline execution."
          url={getPortalUrl("cwworker")}
          colorVar="var(--success)"
        />
        <PortalCard
          title="Customer Portal"
          emoji="🚗"
          description="Low-friction customer panel. View direct cleaning logs, active car/bike subscriptions, and submit operational feedback."
          url={getPortalUrl("cwcustomer")}
          colorVar="var(--warning)"
        />
      </div>
    </div>
  );
}
