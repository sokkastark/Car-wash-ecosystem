"use client";

interface GrowthTrendItem {
  month: string;
  enrolled: number;
  left: number;
}

interface GrowthBarChartProps {
  growthTrend: GrowthTrendItem[];
}

export default function GrowthBarChart({ growthTrend }: GrowthBarChartProps) {
  const maxGrowth = Math.max(...growthTrend.map((d) => Math.max(d.enrolled, d.left))) || 5;
  const scaleY = (val: number) => 200 - (val / maxGrowth) * 140;

  return (
    <div style={{ width: "100%", height: "220px" }}>
      <svg width="100%" height="100%" viewBox="0 0 600 220">
        {/* Y Grid lines */}
        <line x1="40" y1="60" x2="570" y2="60" stroke="hsla(var(--border-muted) / 0.3)" strokeDasharray="4" />
        <line x1="40" y1="130" x2="570" y2="130" stroke="hsla(var(--border-muted) / 0.3)" strokeDasharray="4" />
        <line x1="40" y1="200" x2="570" y2="200" stroke="hsla(var(--border-muted) / 0.8)" />

        {/* Grid Values */}
        <text x="35" y="64" textAnchor="end" fill="hsl(var(--text-muted))" fontSize="10">{maxGrowth}</text>
        <text x="35" y="134" textAnchor="end" fill="hsl(var(--text-muted))" fontSize="10">{Math.round(maxGrowth / 2)}</text>
        <text x="35" y="204" textAnchor="end" fill="hsl(var(--text-muted))" fontSize="10">0</text>

        {/* Monthly Bars */}
        {growthTrend.map((d, i) => {
          const startX = 65 + i * 85;
          const barW = 20;

          const enrollH = (d.enrolled / maxGrowth) * 140;
          const churnH = (d.left / maxGrowth) * 140;

          const enrollY = scaleY(d.enrolled);
          const churnY = scaleY(d.left);

          return (
            <g key={i}>
              {/* Enrollments (Green) */}
              <rect
                x={startX}
                y={enrollY}
                width={barW}
                height={enrollH}
                rx="3"
                fill="url(#greenGrad)"
                opacity="0.85"
              >
                <title>Enrolled: {d.enrolled} customers</title>
              </rect>

              {/* Churn (Red) */}
              <rect
                x={startX + barW + 4}
                y={churnY}
                width={barW}
                height={churnH}
                rx="3"
                fill="url(#pinkGrad)"
                opacity="0.85"
              >
                <title>Left/Churned: {d.left} customers</title>
              </rect>

              {/* X axis labels */}
              <text
                x={startX + barW}
                y="216"
                textAnchor="middle"
                fill="hsl(var(--text-secondary))"
                fontSize="10"
                fontWeight="500"
              >
                {d.month.split(" ")[0]}
              </text>
            </g>
          );
        })}

        {/* Gradients */}
        <defs>
          <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="pinkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
