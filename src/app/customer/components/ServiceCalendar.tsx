"use client";

import { DetailedCustomer, DailyServiceLog } from "@/lib/mockStorage";

interface WashDayProps {
  day: number;
  status: "washed" | "skipped" | "missed" | "none";
}

function CalendarDay({ day, status }: WashDayProps) {
  const getStyle = () => {
    if (status === "washed") {
      return { 
        background: 'rgba(16, 185, 129, 0.12)', 
        color: '#10b981', 
        border: '1px solid rgba(16, 185, 129, 0.3)' 
      };
    }
    if (status === "skipped") {
      return { 
        background: 'rgba(245, 158, 11, 0.12)', 
        color: '#f59e0b', 
        border: '1px solid rgba(245, 158, 11, 0.3)' 
      };
    }
    if (status === "missed") {
      return { 
        background: 'rgba(100, 116, 139, 0.08)', 
        color: '#64748b', 
        border: '1px dashed rgba(100, 116, 139, 0.4)' 
      };
    }
    return { 
      background: 'rgba(255, 255, 255, 0.35)', 
      color: '#94a3b8', 
      border: '1px solid rgba(158, 168, 253, 0.15)' 
    };
  };

  return (
    <div style={{
      aspectRatio: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.85rem',
      fontWeight: 700,
      borderRadius: '8px',
      ...getStyle()
    }}>
      {day}
    </div>
  );
}

interface ServiceCalendarProps {
  customer: DetailedCustomer;
  selectedVehicleId: string;
  setSelectedVehicleId: (id: string) => void;
  vehicleLogs: DailyServiceLog[];
}

export default function ServiceCalendar({
  customer,
  selectedVehicleId,
  setSelectedVehicleId,
  vehicleLogs
}: ServiceCalendarProps) {
  const getDayStatus = (day: number): "washed" | "skipped" | "missed" | "none" => {
    const dayStr = String(day).padStart(2, "0");
    const dateStr = `2026-05-${dayStr}`;
    const log = vehicleLogs.find(l => l.log_date === dateStr);
    
    if (!log) return "none";
    if (log.status === "washed") return "washed";
    if (log.status === "skipped") return "skipped";
    if (log.status === "missed") return "missed";
    return "none";
  };

  const washedCount = vehicleLogs.filter(l => l.status === "washed").length;
  const skippedCount = vehicleLogs.filter(l => l.status === "skipped").length;
  const missedCount = vehicleLogs.filter(l => l.status === "missed").length;

  return (
    <section className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: '1rem', color: '#475569', textTransform: 'uppercase', margin: 0, fontWeight: 700, letterSpacing: '0.02em' }}>
          May 2026 Wash Streak
        </h2>
        {customer.vehicles.length > 1 && (
          <select 
            value={selectedVehicleId} 
            onChange={(e) => setSelectedVehicleId(e.target.value)}
          >
            {customer.vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.licensePlate}</option>
            ))}
          </select>
        )}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '20px' }}>
        {Array.from({ length: 31 }, (_, i) => {
          const day = i + 1;
          return <CalendarDay key={day} day={day} status={getDayStatus(day)} />;
        })}
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.8rem', color: '#64748b' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981' }} />
          Washed ({washedCount})
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid #f59e0b' }} />
          Skipped ({skippedCount})
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(100, 116, 139, 0.08)', border: '1px dashed #64748b' }} />
          Missed ({missedCount})
        </span>
      </div>
    </section>
  );
}
