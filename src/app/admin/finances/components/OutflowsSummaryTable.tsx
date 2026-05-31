"use client";

import React, { useState } from "react";
import { Expense } from "@/lib/mockStorage";
import Table from "@/components/ui/Table";

interface OutflowsSummaryTableProps {
  expenses: Expense[];
  onEdit: (exp: Expense) => void;
  onDelete: (id: string) => void;
  categoryMap: Record<string, { label: string; emoji: string; color: string }>;
}

export default function OutflowsSummaryTable({
  expenses,
  onEdit,
  onDelete,
  categoryMap
}: OutflowsSummaryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (expenses.length === 0) {
    return (
      <div style={{ color: 'hsl(var(--text-secondary))', padding: '40px 0', textAlign: 'center' }}>
        No expenses recorded this cycle.
      </div>
    );
  }

  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = expenses.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <Table headers={["Category", "Date", "Description", "Amount", "Action"]}>
        {paginatedExpenses.map((exp) => {
          const cat = categoryMap[exp.category] || { label: exp.category, emoji: "📦", color: "#ffffff" };
          return (
            <tr key={exp.id} style={{ borderBottom: "1px solid hsl(var(--border-muted))" }}>
              <td style={{ padding: '12px 16px' }}>
                <span style={{ 
                  fontSize: '0.75rem', padding: '4px 10px', borderRadius: '9999px', fontWeight: 600,
                  background: `${cat.color}20`, color: cat.color, display: 'inline-flex', alignItems: 'center', gap: '6px'
                }}>
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </span>
              </td>
              <td style={{ padding: '12px 16px', color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>{exp.date}</td>
              <td style={{ padding: '12px 16px', fontWeight: 500, fontSize: '0.9rem' }}>{exp.description}</td>
              <td style={{ padding: '12px 16px', fontWeight: 700, color: 'hsl(var(--danger))', fontSize: '0.95rem' }}>
                -₹{exp.amount.toLocaleString("en-IN")}
              </td>
              <td style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button 
                    onClick={() => onEdit(exp)} 
                    style={{ background: 'none', border: 'none', color: 'hsl(var(--primary))', fontSize: '1rem', cursor: 'pointer', padding: '4px', marginRight: '12px' }} 
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => onDelete(exp.id)} 
                    style={{ background: 'none', border: 'none', color: 'hsl(var(--danger))', fontSize: '1rem', cursor: 'pointer', padding: '4px' }} 
                    title="Delete"
                  >
                    🗑️
                  </button>
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
            Showing <b>{startIndex + 1}</b> to <b>{Math.min(startIndex + itemsPerPage, expenses.length)}</b> of <b>{expenses.length}</b> expenses
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
