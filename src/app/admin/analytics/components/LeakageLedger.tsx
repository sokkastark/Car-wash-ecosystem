"use client";

import Table from "@/components/ui/Table";

interface DetailedDiscountItem {
  customerName: string;
  apartmentName: string;
  licensePlate: string;
  vehicleType: string;
  planName: string;
  basePrice: number;
  customPrice: number;
  loss: number;
}

interface LeakageLedgerProps {
  detailedDiscounts: DetailedDiscountItem[];
}

export default function LeakageLedger({ detailedDiscounts }: LeakageLedgerProps) {
  if (detailedDiscounts.length === 0) {
    return (
      <div style={{ color: 'hsl(var(--text-secondary))', padding: '40px 0', textAlign: 'center' }}>
        No discounted subscription allocations observed.
      </div>
    );
  }

  return (
    <Table headers={["Customer", "Complex", "Vehicle Details", "Plan type", "Standard Base Price", "Custom Assigned Rate", "Monthly Margin Leak"]}>
      {detailedDiscounts.map((leak, idx) => (
        <tr key={idx} style={{ borderBottom: "1px solid hsl(var(--border-muted))" }}>
          <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '0.9rem' }}>
            👤 {leak.customerName}
          </td>
          <td style={{ padding: '12px 16px', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
            🏢 {leak.apartmentName}
          </td>
          <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>
            🚗 <span style={{ textTransform: "uppercase", fontWeight: 700 }}>{leak.licensePlate}</span> ({leak.vehicleType})
          </td>
          <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
            <span style={{ padding: "4px 8px", background: "hsla(var(--primary) / 0.15)", color: "hsl(var(--primary))", borderRadius: "4px", fontWeight: 600 }}>
              {leak.planName}
            </span>
          </td>
          <td style={{ padding: '12px 16px', color: 'hsl(var(--text-secondary))', fontWeight: 500 }}>
            ₹{leak.basePrice.toLocaleString("en-IN")}
          </td>
          <td style={{ padding: '12px 16px', fontWeight: 600 }}>
            ₹{leak.customPrice.toLocaleString("en-IN")}
          </td>
          <td style={{ padding: '12px 16px', fontWeight: 800, color: 'hsl(var(--danger))' }}>
            -₹{leak.loss.toLocaleString("en-IN")}
          </td>
        </tr>
      ))}
    </Table>
  );
}
