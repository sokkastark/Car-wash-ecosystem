"use client";

import React, { useState, useEffect } from "react";
import { DetailedCustomer } from "@/lib/mockStorage";
import Table from "@/components/ui/Table";

interface CustomersSummaryTableProps {
  customers: DetailedCustomer[];
  onEdit: (cust: DetailedCustomer) => void;
  onDelete: (cust: DetailedCustomer) => void;
}

export default function CustomersSummaryTable({
  customers,
  onEdit,
  onDelete
}: CustomersSummaryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [customers]);

  if (customers.length === 0) {
    return (
      <div style={{ color: "hsl(var(--text-muted))", padding: "30px 0", textAlign: "center", fontSize: "0.95rem" }}>
        No residents registered in this complex yet. Click "+ Register Resident" to add one!
      </div>
    );
  }

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = customers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <Table headers={["Flat / Name", "Phone / Email", "Parking Slot", "Vehicles Roster", "Billing Summary", "Actions"]}>
        {paginatedCustomers.map((cust, i) => (
          <tr key={`${cust.id}-${i}`} style={{ borderBottom: "1px solid hsl(var(--border-muted))" }}>
            <td style={{ padding: "16px" }}>
              <span style={{ fontSize: "0.75rem", display: "block", color: "hsl(var(--primary))", fontWeight: 600, fontFamily: "monospace" }}>
                {cust.customCustomerId}
              </span>
              <strong style={{ fontSize: "1.05rem" }}>{cust.name}</strong>
              <span style={{ display: "block", fontSize: "0.8rem", color: "hsl(var(--text-secondary))" }}>
                Flat No: <strong>{cust.flatNo}</strong> {cust.blockName !== "N/A" ? `(${cust.blockName})` : ""}
              </span>
            </td>
            <td style={{ padding: "16px", fontSize: "0.9rem" }}>
              <span style={{ display: "block" }}>{cust.phone}</span>
              <span style={{ color: "hsl(var(--text-secondary))", fontSize: "0.8rem" }}>{cust.email}</span>
            </td>
            <td style={{ padding: "16px", fontWeight: 500 }}>
              {cust.parkingSlot}
            </td>
            <td style={{ padding: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {cust.vehicles.map((veh, vIdx) => (
                  <div key={veh.id || vIdx} style={{ background: "hsla(var(--bg-dark) / 0.4)", border: "1px solid hsl(var(--border-muted))", padding: "8px 12px", borderRadius: "var(--radius-sm)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                    <div>
                      <strong style={{ fontSize: "0.9rem", fontFamily: "var(--font-title)", display: "block" }}>
                        {veh.licensePlate}
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))", textTransform: "capitalize" }}>
                        {veh.color} {veh.make} {veh.model} ({veh.vehicleType})
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span className="status-badge washed" style={{ background: "hsla(var(--primary) / 0.15)", color: "hsl(var(--primary))", fontSize: "0.7rem", padding: "2px 6px" }}>
                        {veh.planName}
                      </span>
                      <span style={{ display: "block", fontSize: "0.75rem", color: "hsl(var(--text-muted))", marginTop: "2px" }}>
                        Washer: <strong>{veh.assignedWorkerName}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </td>
            <td style={{ padding: "16px", fontWeight: 700, color: "hsl(var(--warning))", fontSize: "1.1rem" }}>
              ₹{cust.overallPrice}
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 400, color: "hsl(var(--text-muted))" }}>
                {cust.vehicles.length} Vehicle(s)
              </span>
            </td>
            <td style={{ padding: "16px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <button 
                  onClick={() => onEdit(cust)}
                  className="btn-resolve"
                  style={{
                    padding: "6px 12px",
                    background: "hsl(var(--border-muted))",
                    border: "none",
                    color: "white",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: 600
                  }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(cust)}
                  style={{
                    padding: "6px 12px",
                    background: "hsla(var(--danger) / 0.15)",
                    border: "none",
                    color: "hsl(var(--danger))",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: 600
                  }}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "10px 0", borderTop: "1px solid hsl(var(--border-muted))" }}>
          <span style={{ fontSize: "0.85rem", color: "hsl(var(--text-secondary))" }}>
            Showing <b>{startIndex + 1}</b> to <b>{Math.min(startIndex + itemsPerPage, customers.length)}</b> of <b>{customers.length}</b> residents
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
