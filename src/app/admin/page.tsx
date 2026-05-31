"use client";

import { useState, useEffect } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import { mockStorage } from "@/lib/mockStorage";
import DashboardAlertsBanner from "./components/DashboardAlertsBanner";
import DashboardOperationsFeed from "./components/DashboardOperationsFeed";

interface StatCardProps {
  label: string;
  value: string | number;
  change: string;
  color: string;
}

function StatCard({ label, value, change, color }: StatCardProps) {
  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '20px' }}>
      <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', textTransform: 'uppercase' }}>{label}</span>
      <h3 style={{ fontSize: '2rem', margin: '8px 0', color }}>{value}</h3>
      <span style={{ fontSize: '0.8rem', color: 'hsl(var(--success))', fontWeight: 600 }}>{change}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const [selectedAptId, setSelectedAptId] = useState("");
  const { 
    stats, 
    complexesProgress, 
    complaints, 
    resolveComplaint, 
    apartments, 
    refetchStats, 
    refetchComplaints,
    refetchWorkers,
    workers,
    customersDetailed
  } = useAdminData();

  // Dynamically refetch filtered stats when selected complex changes
  useEffect(() => {
    refetchStats(selectedAptId || undefined);
    refetchComplaints(selectedAptId || undefined);
    refetchWorkers(selectedAptId || undefined);
  }, [selectedAptId, refetchStats, refetchComplaints, refetchWorkers]);

  const pendingComplaints = complaints.filter(c => c.status === "pending");

  // --- Operational Alerts & System Health Computations ---
  const todayStr = new Date().toISOString().split("T")[0];
  const oldComplaintsCount = complaints.filter(
    c => c.status === "pending" && c.date < todayStr
  ).length;

  const absentWorkersCount = workers.filter(
    w => w.is_active && w.attendance_today === "absent"
  ).length;

  const allLogs = mockStorage.getDailyServiceLogs();
  const allVehicles = customersDetailed.flatMap(c => c.vehicles);

  let consecutiveSkipsCount = 0;
  allVehicles.forEach(veh => {
    const vehLogs = allLogs
      .filter(l => l.vehicle_id === veh.id)
      .sort((a, b) => b.log_date.localeCompare(a.log_date));
    if (vehLogs.length >= 3) {
      const lastThree = vehLogs.slice(0, 3);
      if (lastThree.every(l => l.status === "skipped")) {
        consecutiveSkipsCount++;
      }
    }
  });

  // --- Skipped Cleanings Today details for Live Feed ---
  const todayYM = "2026-05-30"; // Platform May 2026 cycle active date
  const todayLogs = allLogs.filter(l => l.log_date === todayYM && l.status === "skipped");
  const workerMap = new Map(workers.map(w => [w.id, w.name]));
  const vehicleMap = new Map(allVehicles.map(v => [v.id, v]));

  const skippedLogDetails = todayLogs
    .map(log => {
      const veh = vehicleMap.get(log.vehicle_id);
      const cust = veh ? customersDetailed.find(c => c.vehicles.some(v => v.id === veh.id)) : null;
      if (selectedAptId && cust?.apartmentId !== selectedAptId) return null;

      return {
        id: log.id,
        licensePlate: veh?.licensePlate || "KA-03-XX-0000",
        flatNo: cust?.flatNo || "N/A",
        apartmentName: cust?.apartmentName || "Complex",
        workerName: log.worker_id ? (workerMap.get(log.worker_id) || "Cleaner") : "Cleaner",
        reason: log.reason || "other",
        notes: log.notes,
        markedAt: log.marked_at
      };
    })
    .filter(Boolean) as any[];

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }} className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <span style={{ color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, fontSize: '0.8rem' }}>
            SV Operations Engine
          </span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '4px' }}>Admin Dashboard</h1>
        </div>

        {/* Dynamic Gated Complex Dashboard Filter Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>Filter Hub:</label>
          <select
            value={selectedAptId}
            onChange={(e) => setSelectedAptId(e.target.value)}
            style={{ padding: "10px 16px", background: "hsl(var(--bg-card))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", outline: "none", boxShadow: "var(--shadow-premium)" }}
          >
            <option value="">All Gated Complexes</option>
            {apartments.map(apt => <option key={apt.id} value={apt.id}>{apt.name}</option>)}
          </select>
        </div>
      </header>

      {/* Premium Dashboard Operational Alerts Warning Banner */}
      <DashboardAlertsBanner 
        oldComplaintsCount={oldComplaintsCount}
        absentWorkersCount={absentWorkersCount}
        consecutiveSkipsCount={consecutiveSkipsCount}
      />

      {/* Dynamic Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <StatCard label="Total Subscribed Vehicles" value={`${stats.totalVehicles} Registered`} change="Real-time subscriptions" color="white" />
        <StatCard label="Active Gated Complexes" value={`${stats.totalComplexes} Complexes`} change="Geographic hubs" color="hsl(var(--primary))" />
        <StatCard label="Field Staff Cleaners" value={`${stats.activeCleaners} Active`} change="Available on roster" color="hsl(var(--success))" />
        <StatCard label="Monthly Recurring Revenue" value={stats.mrr} change="Est. monthly pricing" color="hsl(var(--warning))" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px' }}>
        {/* 1. Real-time Complex Wash Progress Bars */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Real-time Operations Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {complexesProgress.length === 0 ? (
              <div style={{ color: 'hsl(var(--text-secondary))', padding: '40px 0', textAlign: 'center' }}>No active operations.</div>
            ) : (
              complexesProgress.map(complex => (
                <div key={complex.id} style={{ background: 'hsla(var(--bg-dark) / 0.4)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-muted))' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.95rem' }}>{complex.name}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'hsl(var(--success))', fontWeight: 600 }}>{complex.progress}% Done</span>
                  </div>
                  
                  {/* Visual Progress Bar */}
                  <div style={{ width: '100%', height: '8px', background: 'hsl(var(--border-muted))', borderRadius: '99px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ width: `${complex.progress}%`, height: '100%', background: 'hsl(var(--primary))', transition: 'var(--transition-smooth)' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                    <span>Washed: <strong>{complex.washed}</strong></span>
                    <span>Skipped: <strong>{complex.skipped}</strong></span>
                    <span>Missed: <strong>{complex.missed}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 2. Worker Skip Exceptions live feed */}
        <DashboardOperationsFeed skippedLogs={skippedLogDetails} />

        {/* 3. Actionable Complaints Feed */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Recent Complaints</span>
            {pendingComplaints.length > 0 && (
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'hsla(var(--danger) / 0.15)', color: 'hsl(var(--danger))', borderRadius: '99px', fontWeight: 600 }}>
                {pendingComplaints.length} Action Required
              </span>
            )}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {complaints.length === 0 ? (
              <div style={{ color: 'hsl(var(--text-secondary))', padding: '40px 0', textAlign: 'center' }}>No complaints filed. Excellent!</div>
            ) : (
              complaints.map(comp => (
                <div 
                  key={comp.id} 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: comp.status === 'resolved' ? 'transparent' : 'hsla(var(--border-muted) / 0.3)', borderBottom: '1px solid hsl(var(--border-muted))', borderRadius: 'var(--radius-sm)', opacity: comp.status === 'resolved' ? 0.6 : 1, transition: 'var(--transition-smooth)' }}
                >
                  <div style={{ flexGrow: 1, marginRight: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{comp.customer_name}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>{comp.date}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'block', marginTop: '2px' }}>{comp.details}</span>
                  </div>

                  {comp.status === 'pending' ? (
                    <button 
                      onClick={() => resolveComplaint(comp.id)}
                      style={{ padding: '6px 12px', background: 'hsla(var(--success) / 0.15)', border: '1px solid hsl(var(--success))', color: 'hsl(var(--success))', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition-smooth)' }}
                    >
                      Resolve
                    </button>
                  ) : (
                    <span className="status-badge washed" style={{ alignSelf: 'center' }}>Resolved</span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
