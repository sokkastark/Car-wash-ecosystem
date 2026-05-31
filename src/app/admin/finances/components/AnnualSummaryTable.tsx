"use client";

import Table from "@/components/ui/Table";

interface AnnualSummaryItem {
  month: string;
  inflow: number;
  outflow: number;
  profit: number;
}

interface AnnualSummaryTableProps {
  monthlyTrend: AnnualSummaryItem[];
}

export default function AnnualSummaryTable({ monthlyTrend }: AnnualSummaryTableProps) {
  return (
    <Table headers={["Month Period", "Subscription Inflow", "Staff Salaries Outflow", "Other logged items", "Total Outflow", "Operating Profit"]}>
      {monthlyTrend.map((t, idx) => {
        const profitColor = t.profit >= 0 ? "hsl(var(--success))" : "hsl(var(--danger))";
        return (
          <tr key={idx} style={{ borderBottom: "1px solid hsl(var(--border-muted))" }}>
            <td style={{ padding: '12px 16px', fontWeight: 700 }}>📅 {t.month}</td>
            <td style={{ padding: '12px 16px', color: 'hsl(var(--success))', fontWeight: 600 }}>₹{t.inflow.toLocaleString("en-IN")}</td>
            <td style={{ padding: '12px 16px', color: 'hsl(var(--text-secondary))' }}>₹1,08,000</td>
            <td style={{ padding: '12px 16px', color: 'hsl(var(--text-secondary))' }}>₹{Math.max(0, t.outflow - 108000).toLocaleString("en-IN")}</td>
            <td style={{ padding: '12px 16px', color: 'hsl(var(--danger))', fontWeight: 600 }}>₹{t.outflow.toLocaleString("en-IN")}</td>
            <td style={{ padding: '12px 16px', color: profitColor, fontWeight: 800 }}>
              {t.profit >= 0 ? "+" : ""}₹{t.profit.toLocaleString("en-IN")}
            </td>
          </tr>
        );
      })}
    </Table>
  );
}
