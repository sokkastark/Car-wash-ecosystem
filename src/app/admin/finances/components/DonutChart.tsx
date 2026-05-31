"use client";

import { useState } from "react";

const CATEGORY_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  microfabric_cloths: { label: "Microfiber Cloths", emoji: "🧼", color: "#38bdf8" },
  buckets: { label: "Buckets", emoji: "🪣", color: "#60a5fa" },
  spray_pumps: { label: "Spray Pumps", emoji: "💨", color: "#818cf8" },
  morning_tea: { label: "Morning Tea", emoji: "☕", color: "#fb923c" },
  sunday_breakfast: { label: "Sunday Breakfast", emoji: "🥞", color: "#fbbf24" },
  salary: { label: "Staff Salary", emoji: "👷", color: "#34d399" },
  others: { label: "Others", emoji: "📦", color: "#a78bfa" }
};

interface DonutChartProps {
  expensesByCategory: Record<string, number>;
  totalExpensesSum: number;
}

export default function DonutChart({ expensesByCategory, totalExpensesSum }: DonutChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  if (totalExpensesSum === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "240px", color: "hsl(var(--text-secondary))" }}>
        No expenses recorded.
      </div>
    );
  }

  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16

  const outflowDetails = Object.keys(expensesByCategory).map(cat => ({
    category: cat,
    amount: expensesByCategory[cat],
    label: CATEGORY_MAP[cat]?.label || cat,
    emoji: CATEGORY_MAP[cat]?.emoji || "📦",
    color: CATEGORY_MAP[cat]?.color || "#ffffff"
  })).filter(item => item.amount > 0);

  let accumulatedPercent = 0;
  const donutSlices = outflowDetails.map(item => {
    const percentage = totalExpensesSum > 0 ? (item.amount / totalExpensesSum) : 0;
    const strokeDasharray = `${(percentage * circumference).toFixed(2)} ${circumference.toFixed(2)}`;
    const strokeDashoffset = (-accumulatedPercent * circumference).toFixed(2);
    accumulatedPercent += percentage;
    return {
      ...item,
      percentage,
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '20px', flexWrap: 'wrap' }}>
      {/* SVG Donut */}
      <div style={{ position: 'relative', width: '180px', height: '180px' }}>
        <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
          {donutSlices.map((slice, idx) => (
            <circle
              key={idx}
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth="12"
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: "stroke-width 0.2s ease, opacity 0.2s ease",
                cursor: "pointer",
                opacity: hoveredCategory === null || hoveredCategory === slice.category ? 1 : 0.4
              }}
              onMouseEnter={() => setHoveredCategory(slice.category)}
              onMouseLeave={() => setHoveredCategory(null)}
            />
          ))}
        </svg>

        {/* Center Display */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
          {hoveredCategory ? (
            (() => {
              const hoverItem = donutSlices.find(s => s.category === hoveredCategory);
              return (
                <>
                  <div style={{ fontSize: '1.4rem' }}>{hoverItem?.emoji}</div>
                  <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {hoverItem?.label}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    ₹{hoverItem?.amount.toLocaleString("en-IN")}
                  </div>
                </>
              );
            })()
          ) : (
            <>
              <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Spent
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                ₹{totalExpensesSum.toLocaleString("en-IN")}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legends */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
        {donutSlices.map((slice, idx) => (
          <div 
            key={idx}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '12px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background: hoveredCategory === slice.category ? 'hsla(var(--border-muted) / 0.4)' : 'transparent',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={() => setHoveredCategory(slice.category)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: slice.color }} />
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                {slice.emoji} {slice.label}
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              {Math.round(slice.percentage * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
