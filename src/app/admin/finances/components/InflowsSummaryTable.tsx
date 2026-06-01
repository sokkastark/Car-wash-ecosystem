"use client";

import React, { useState } from "react";
import { InflowPayment } from "@/lib/mockStorage";
import Table from "@/components/ui/Table";

interface InflowsSummaryTableProps {
  payments: InflowPayment[];
  onUpdateStatus: (id: string, status: "pending" | "paid" | "deferred") => void;
  onDeleteAdHoc: (id: string) => void;
  month?: string;
  year?: string;
}

export default function InflowsSummaryTable({ payments, onUpdateStatus, onDeleteAdHoc, month, year }: InflowsSummaryTableProps) {
  const now = new Date();
  const currentMonthName = (month && year)
    ? new Date(Number(year), Number(month) - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (payments.length === 0) {
    return (
      <div style={{ color: "hsl(var(--text-secondary))", padding: "40px 0", textAlign: "center" }}>
        No payments recorded or generated this cycle.
      </div>
    );
  }

  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = payments.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <Table headers={["Customer / Details", "Type", "Date Logged", "Status", "Amount", "Quick Change", "Action"]}>
        {paginatedPayments.map((pay) => {
          return (
            <tr key={pay.id} style={{ borderBottom: "1px solid hsl(var(--border-muted))" }}>
              <td style={{ padding: "12px 16px" }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{pay.customer_name || "Custom Ad-Hoc Inflow"}</div>
                <div style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))", marginTop: "2px" }}>{pay.description}</div>
              </td>
              
              <td style={{ padding: "12px 16px" }}>
                <span style={{ 
                  fontSize: "0.7rem", padding: "2px 8px", borderRadius: "4px", fontWeight: 600,
                  background: pay.payment_type === "subscription" ? "#0284c720" : "#a78bfa20", 
                  color: pay.payment_type === "subscription" ? "#0284c7" : "#a78bfa"
                }}>
                  {pay.payment_type === "subscription" ? "Plan Subscription" : "Ad-Hoc Cash"}
                </span>
              </td>

              <td style={{ padding: "12px 16px", color: "hsl(var(--text-secondary))", fontSize: "0.85rem", fontFamily: "monospace" }}>
                {pay.date}
              </td>

              <td style={{ padding: "12px 16px" }}>
                <span style={{ 
                  fontSize: "0.75rem", padding: "4px 10px", borderRadius: "9999px", fontWeight: 600,
                  background: pay.status === "paid" ? "#22c55e20" : pay.status === "pending" ? "#eab30820" : "#3b82f620",
                  color: pay.status === "paid" ? "#22c55e" : pay.status === "pending" ? "#eab308" : "#3b82f6"
                }}>
                  {pay.status === "paid" ? "Paid 🟢" : pay.status === "pending" ? "Pending 🟡" : "Deferred 🔵"}
                </span>
              </td>

              <td style={{ padding: "12px 16px", fontWeight: 700, color: "hsl(var(--success))", fontSize: "0.95rem" }}>
                +₹{pay.amount.toLocaleString("en-IN")}
              </td>

              <td style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button 
                    onClick={() => onUpdateStatus(pay.id, "paid")}
                    disabled={pay.status === "paid"}
                    style={{ background: pay.status === "paid" ? "hsl(var(--bg-card))" : "none", border: "1px solid hsl(var(--success))", color: "hsl(var(--success))", fontSize: "0.7rem", padding: "3px 6px", borderRadius: "4px", cursor: pay.status === "paid" ? "not-allowed" : "pointer", opacity: pay.status === "paid" ? 0.5 : 1 }}
                    title="Mark as Paid"
                  >
                    Paid
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(pay.id, "pending")}
                    disabled={pay.status === "pending"}
                    style={{ background: pay.status === "pending" ? "hsl(var(--bg-card))" : "none", border: "1px solid hsl(var(--warning))", color: "hsl(var(--warning))", fontSize: "0.7rem", padding: "3px 6px", borderRadius: "4px", cursor: pay.status === "pending" ? "not-allowed" : "pointer", opacity: pay.status === "pending" ? 0.5 : 1 }}
                    title="Mark as Pending"
                  >
                    Pend
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(pay.id, "deferred")}
                    disabled={pay.status === "deferred"}
                    style={{ background: pay.status === "deferred" ? "hsl(var(--bg-card))" : "none", border: "1px solid #3b82f6", color: "#3b82f6", fontSize: "0.7rem", padding: "3px 6px", borderRadius: "4px", cursor: pay.status === "deferred" ? "not-allowed" : "pointer", opacity: pay.status === "deferred" ? 0.5 : 1 }}
                    title="Mark as Customer will pay next month"
                  >
                    Deferred
                  </button>
                </div>
              </td>

              <td style={{ padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {(pay.status === "pending" || pay.status === "deferred") && (
                    <button
                      onClick={() => {
                        const message = `Dear Resident, your carwash billing of ₹${pay.amount} for ${currentMonthName} is currently outstanding. Please tap here to complete your UPI payment.`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      style={{ background: "none", border: "none", color: "#25D366", fontSize: "1.2rem", cursor: "pointer", padding: "4px", display: "inline-flex", alignItems: "center" }}
                      title="Send WhatsApp Payment Reminder"
                    >
                      💬
                    </button>
                  )}
                  {pay.payment_type === "ad_hoc" && (
                    <button
                      onClick={() => onDeleteAdHoc(pay.id)}
                      style={{ background: "none", border: "none", color: "hsl(var(--danger))", fontSize: "1.1rem", cursor: "pointer", padding: "4px" }}
                      title="Delete Custom Entry"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "10px 0", borderTop: "1px solid hsl(var(--border-muted))" }}>
          <span style={{ fontSize: "0.85rem", color: "hsl(var(--text-secondary))" }}>
            Showing <b>{startIndex + 1}</b> to <b>{Math.min(startIndex + itemsPerPage, payments.length)}</b> of <b>{payments.length}</b> inflows
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: "6px 12px",
                background: "transparent",
                border: "1px solid hsl(var(--border-muted))",
                color: currentPage === 1 ? "hsl(var(--text-muted))" : "white",
                borderRadius: "var(--radius-sm)",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontSize: "0.8rem",
                fontWeight: 600
              }}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: "6px 12px",
                background: "transparent",
                border: "1px solid hsl(var(--border-muted))",
                color: currentPage === totalPages ? "hsl(var(--text-muted))" : "white",
                borderRadius: "var(--radius-sm)",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontSize: "0.8rem",
                fontWeight: 600
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
