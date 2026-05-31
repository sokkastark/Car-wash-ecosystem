"use client";

import React from "react";

interface FinancesHeaderProps {
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  selectedAptId: string;
  setSelectedAptId: (id: string) => void;
  apartments: Array<{ id: string; name: string }>;
}

export default function FinancesHeader({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  selectedAptId,
  setSelectedAptId,
  apartments
}: FinancesHeaderProps) {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
      <div>
        <span style={{ color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, fontSize: '0.8rem' }}>
          SV Ledger Operations
        </span>
        <h1 style={{ fontSize: '2.5rem', marginTop: '4px' }}>Finances & Reports</h1>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Gated Complex Filter</span>
          <select
            value={selectedAptId}
            onChange={(e) => setSelectedAptId(e.target.value)}
            style={{ padding: "8px 12px", background: "hsl(var(--bg-card))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white", fontSize: "0.85rem", outline: "none", cursor: "pointer", fontWeight: 600 }}
          >
            <option value="">All Gated Complexes</option>
            {apartments.map(apt => <option key={apt.id} value={apt.id}>{apt.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Month</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: "8px 12px", background: "hsl(var(--bg-card))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white", fontSize: "0.85rem", outline: "none", cursor: "pointer" }}
          >
            <option value="all">All Months (Annual)</option>
            {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m, i) => (
              <option key={m} value={m}>{["January","February","March","April","May","June","July","August","September","October","November","December"][i]}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Year</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ padding: "8px 12px", background: "hsl(var(--bg-card))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white", fontSize: "0.85rem", outline: "none", cursor: "pointer" }}
          >
            {["2025","2026","2027"].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
    </header>
  );
}
