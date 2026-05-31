"use client";

interface MonthlyTrendItem {
  month: string;
  inflow: number;
  outflow: number;
}

interface TrendBarChartProps {
  monthlyTrend: MonthlyTrendItem[];
}

export default function TrendBarChart({ monthlyTrend }: TrendBarChartProps) {
  // SVG Bar Chart Constants
  const trendMax = Math.max(...monthlyTrend.map((d) => Math.max(d.inflow, d.outflow))) || 10000;
  const scaleY = (val: number) => 220 - (val / trendMax) * 160; // scale to fit inside svg heights

  return (
    <div style={{ width: "100%", height: "240px" }}>
      <svg width="100%" height="100%" viewBox="0 0 600 240">
        {/* Y Grid Lines */}
        <line x1="40" y1="60" x2="570" y2="60" stroke="hsla(var(--border-muted) / 0.3)" strokeDasharray="4" />
        <line x1="40" y1="140" x2="570" y2="140" stroke="hsla(var(--border-muted) / 0.3)" strokeDasharray="4" />
        <line x1="40" y1="220" x2="570" y2="220" stroke="hsla(var(--border-muted) / 0.8)" />

        {/* Grid Legends */}
        <text x="35" y="64" textAnchor="end" fill="hsl(var(--text-muted))" fontSize="10">₹{trendMax.toLocaleString("en-IN")}</text>
        <text x="35" y="144" textAnchor="end" fill="hsl(var(--text-muted))" fontSize="10">₹{(trendMax / 2).toLocaleString("en-IN")}</text>
        <text x="35" y="224" textAnchor="end" fill="hsl(var(--text-muted))" fontSize="10">₹0</text>

        {/* Render Bars */}
        {monthlyTrend.map((data, i) => {
          const startX = 60 + i * 85;
          const barWidth = 24;

          const inflowH = (data.inflow / trendMax) * 160;
          const outflowH = (data.outflow / trendMax) * 160;

          const inflowY = scaleY(data.inflow);
          const outflowY = scaleY(data.outflow);

          return (
            <g key={i} className="bar-group">
              {/* Inflow Bar */}
              <rect
                x={startX}
                y={inflowY}
                width={barWidth}
                height={inflowH}
                rx="3"
                fill="url(#blueGrad)"
                opacity="0.85"
                style={{ cursor: "pointer", transition: "all 0.2s" }}
              >
                <title>Inflow: ₹{data.inflow.toLocaleString()}</title>
              </rect>

              {/* Outflow Bar */}
              <rect
                x={startX + barWidth + 4}
                y={outflowY}
                width={barWidth}
                height={outflowH}
                rx="3"
                fill="url(#redGrad)"
                opacity="0.85"
                style={{ cursor: "pointer", transition: "all 0.2s" }}
              >
                <title>Outflow: ₹{data.outflow.toLocaleString()}</title>
              </rect>

              {/* Month Label */}
              <text
                x={startX + barWidth}
                y="236"
                textAnchor="middle"
                fill="hsl(var(--text-secondary))"
                fontSize="10"
                fontWeight="500"
              >
                {data.month.split(" ")[0]}
              </text>
            </g>
          );
        })}

        {/* Gradients Definitions */}
        <defs>
          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
