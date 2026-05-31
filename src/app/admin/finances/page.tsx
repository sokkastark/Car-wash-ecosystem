"use client";

import { useState, useEffect } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import Modal from "@/components/ui/Modal";
import DonutChart from "./components/DonutChart";
import TrendBarChart from "./components/TrendBarChart";
import AddExpenseForm from "./components/AddExpenseForm";
import AddInflowForm from "./components/AddInflowForm";
import AnnualSummaryTable from "./components/AnnualSummaryTable";
import InflowsSummaryTable from "./components/InflowsSummaryTable";
import OutflowsSummaryTable from "./components/OutflowsSummaryTable";
import FinancesCardsRow from "./components/FinancesCardsRow";
import FinancesHeader from "./components/FinancesHeader";

const CATEGORY_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  microfabric_cloths: { label: "Microfiber Cloths", emoji: "🧼", color: "#38bdf8" },
  buckets: { label: "Buckets", emoji: "🪣", color: "#60a5fa" },
  spray_pumps: { label: "Spray Pumps", emoji: "💨", color: "#818cf8" },
  morning_tea: { label: "Morning Tea", emoji: "☕", color: "#fb923c" },
  sunday_breakfast: { label: "Sunday Breakfast", emoji: "🥞", color: "#fbbf24" },
  salary: { label: "Staff Salary", emoji: "👷", color: "#34d399" },
  others: { label: "Others", emoji: "📦", color: "#a78bfa" }
};

export default function FinancesPage() {
  const { 
    expenses, addExpense, updateExpense, deleteExpense, 
    payments, fetchPayments, updatePaymentStatus, addAdHocPayment, deleteAdHocPayment, markAllPaymentsPaid,
    getFinancialSummary, apartments, workers, customersDetailed 
  } = useAdminData();

  const [selectedMonth, setSelectedMonth] = useState("05");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedAptId, setSelectedAptId] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [activeLedgerTab, setActiveLedgerTab] = useState<"inflows" | "outflows">("inflows");

  // Dialog and form states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [isInflowModalOpen, setIsInflowModalOpen] = useState(false);
  const [inflowAmount, setInflowAmount] = useState("");
  const [inflowDescription, setInflowDescription] = useState("");
  const [inflowDate, setInflowDate] = useState("2026-05-01");
  const [inflowStatus, setInflowStatus] = useState<"paid" | "pending" | "deferred">("paid");

  useEffect(() => {
    if (fetchPayments) fetchPayments(selectedMonth, selectedYear);
  }, [fetchPayments, selectedMonth, selectedYear]);

  useEffect(() => {
    if (getFinancialSummary) setSummary(getFinancialSummary(selectedMonth, selectedYear));
  }, [expenses, payments, getFinancialSummary, selectedMonth, selectedYear]);

  useEffect(() => {
    setInflowDate(`${selectedYear}-${selectedMonth.padStart(2, "0")}-01`);
  }, [selectedMonth, selectedYear]);

  if (!summary) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div style={{ color: "hsl(var(--text-secondary))", fontSize: "1.1rem" }}>Loading financial portal...</div>
      </div>
    );
  }

  // Gated Complex Specific Filters & Recalculations
  const customerAptMap = new Map(customersDetailed.map(c => [c.id, c.apartmentId]));
  const selectedApt = apartments.find(a => a.id === selectedAptId);

  const filteredPayments = selectedAptId 
    ? payments.filter(p => customerAptMap.get(p.customer_id || "") === selectedAptId)
    : payments;

  const calculatedInflow = selectedAptId
    ? filteredPayments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
    : summary.inflow;

  const calculatedPending = selectedAptId
    ? filteredPayments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)
    : summary.pendingInflow;

  const calculatedDeferred = selectedAptId
    ? filteredPayments.filter(p => p.status === "deferred").reduce((sum, p) => sum + p.amount, 0)
    : summary.deferredInflow;

  const activeComplexWorkers = selectedAptId
    ? workers.filter(w => w.is_active && w.assigned_complex_ids.includes(selectedAptId))
    : workers.filter(w => w.is_active);
  const workersPayroll = activeComplexWorkers.reduce((sum, w) => sum + (w.monthly_salary || 0), 0);

  const calculatedOutflow = selectedAptId ? workersPayroll : summary.outflow;
  const calculatedProfit = calculatedInflow - calculatedOutflow;

  const totalExpensesSum = Object.values(summary.expensesByCategory).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
  const targetPrefix = `${selectedYear}-${selectedMonth.padStart(2, "0")}`;
  const filteredExpensesList = expenses.filter(exp => exp.date.startsWith(targetPrefix));
  const isAnnualView = selectedMonth === "all";

  const handleExpenseDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) await deleteExpense(id);
  };

  const handleExpenseSubmit = async (category: string, amount: number, date: string, description: string) => {
    if (editingExpense) await updateExpense(editingExpense.id, category, amount, date, description);
    else await addExpense(category, amount, date, description);
    setIsAddModalOpen(false);
    setEditingExpense(null);
  };

  const handleInflowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addAdHocPayment) {
      await addAdHocPayment(Number(inflowAmount), inflowDate, inflowDescription, inflowStatus, selectedMonth, selectedYear);
      setIsInflowModalOpen(false);
      setInflowAmount("");
      setInflowDescription("");
    }
  };

  const handlePaymentStatusChange = async (id: string, status: "pending" | "paid" | "deferred") => {
    if (updatePaymentStatus) await updatePaymentStatus(id, status, selectedMonth, selectedYear);
  };

  const handleAdHocDelete = async (id: string) => {
    if (window.confirm("Delete this custom cash inflow entry?") && deleteAdHocPayment) {
      await deleteAdHocPayment(id, selectedMonth, selectedYear);
    }
  };

  const handleMarkAllPaid = async () => {
    if (selectedAptId) {
      const pendingComplexPayments = filteredPayments.filter(p => p.status === "pending");
      if (pendingComplexPayments.length === 0) {
        window.alert("No pending subscription payments for this complex.");
        return;
      }
      if (window.confirm(`Mark all ${pendingComplexPayments.length} pending subscriptions as paid for this complex?`)) {
        for (const p of pendingComplexPayments) {
          await updatePaymentStatus(p.id, "paid", selectedMonth, selectedYear);
        }
      }
    } else {
      if (window.confirm("Mark all pending subscriptions as paid for this month?") && markAllPaymentsPaid) {
        await markAllPaymentsPaid(selectedMonth, selectedYear);
      }
    }
  };

  return (
    <>
      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }} className="animate-fade-in">
        <FinancesHeader 
          selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} selectedYear={selectedYear} setSelectedYear={setSelectedYear} selectedAptId={selectedAptId} setSelectedAptId={setSelectedAptId} apartments={apartments}
        />

        <FinancesCardsRow 
          inflow={calculatedInflow} outflow={calculatedOutflow} profit={calculatedProfit}
          isAnnualView={isAnnualView} selectedYear={selectedYear} totalExpensesSum={totalExpensesSum}
          pendingInflow={calculatedPending} deferredInflow={calculatedDeferred}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', marginBottom: '40px' }}>
          <section className="glass-panel" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 700 }}>Outflow breakdown ({isAnnualView ? "Annual" : "Monthly"})</h2>
            {selectedAptId ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "hsl(var(--text-secondary))" }}>
                📊 Consolidated staff payroll outflow for <b>{selectedApt?.name}</b> is <b>₹{calculatedOutflow.toLocaleString("en-IN")}</b>.
                <p style={{ fontSize: "0.8rem", color: "hsl(var(--text-muted))", marginTop: "10px" }}>Select "All Gated Complexes" to view comprehensive corporate expense donut charts.</p>
              </div>
            ) : (
              <DonutChart expensesByCategory={summary.expensesByCategory} totalExpensesSum={totalExpensesSum} />
            )}
          </section>

          <section className="glass-panel" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 700 }}>{isAnnualView ? "Inflow vs Outflow monthly breakdowns" : "Inflow vs Outflow trend"}</h2>
            {selectedAptId ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "hsl(var(--text-secondary))" }}>
                📈 Consolidated cash flow trend diagrams.
                <p style={{ fontSize: "0.8rem", color: "hsl(var(--text-muted))", marginTop: "10px" }}>Select "All Gated Complexes" to view comparative monthly charts.</p>
              </div>
            ) : (
              <TrendBarChart monthlyTrend={summary.monthlyTrend} />
            )}
          </section>
        </div>

        <section className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
          {isAnnualView ? (
            <>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px' }}>Monthly Ledger Summary ({selectedYear})</h2>
              <AnnualSummaryTable monthlyTrend={summary.monthlyTrend} />
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid hsl(var(--border-muted))', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button 
                    onClick={() => setActiveLedgerTab("inflows")} 
                    style={{ background: 'none', border: 'none', color: activeLedgerTab === "inflows" ? "hsl(var(--primary))" : "hsl(var(--text-secondary))", borderBottom: activeLedgerTab === "inflows" ? "2px solid hsl(var(--primary))" : "none", paddingBottom: "8px", fontWeight: 700, fontSize: "1.1rem", cursor: "pointer" }}
                  >
                    💵 Cash Inflows ({filteredPayments.length})
                  </button>
                  <button 
                    onClick={() => setActiveLedgerTab("outflows")} 
                    style={{ background: 'none', border: 'none', color: activeLedgerTab === "outflows" ? "hsl(var(--primary))" : "hsl(var(--text-secondary))", borderBottom: activeLedgerTab === "outflows" ? "2px solid hsl(var(--primary))" : "none", paddingBottom: "8px", fontWeight: 700, fontSize: "1.1rem", cursor: "pointer" }}
                  >
                    💸 Corporate Outflows ({selectedAptId ? 0 : filteredExpensesList.length})
                  </button>
                </div>
                
                <div>
                  {activeLedgerTab === "inflows" && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button 
                        onClick={handleMarkAllPaid} 
                        style={{ 
                          padding: '8px 16px', 
                          fontSize: '0.85rem', 
                          background: 'hsla(var(--success) / 0.12)',
                          border: '1px solid hsla(var(--success) / 0.4)',
                          color: 'hsl(var(--success))',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'var(--transition-smooth)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'hsla(var(--success) / 0.2)';
                          e.currentTarget.style.borderColor = 'hsl(var(--success))';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'hsla(var(--success) / 0.12)';
                          e.currentTarget.style.borderColor = 'hsla(var(--success) / 0.4)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--success))' }} />
                        Mark {selectedAptId ? "Complex" : "All"} as Paid
                      </button>
                      <button onClick={() => setIsInflowModalOpen(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        ➕ Log Custom Inflow
                      </button>
                    </div>
                  )}
                  {activeLedgerTab === "outflows" && !selectedAptId && (
                    <button onClick={() => { setEditingExpense(null); setIsAddModalOpen(true); }} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      ➕ Log Corporate Expense
                    </button>
                  )}
                </div>
              </div>

              {activeLedgerTab === "inflows" ? (
                <InflowsSummaryTable 
                  payments={filteredPayments} onUpdateStatus={handlePaymentStatusChange} onDeleteAdHoc={handleAdHocDelete} 
                />
              ) : (
                selectedAptId ? (
                  <div style={{ color: 'hsl(var(--text-secondary))', padding: '40px 0', textAlign: 'center' }}>
                    Corporate expenses are consolidations. Select "All Gated Complexes" to manage corporate outflows.
                  </div>
                ) : (
                  <OutflowsSummaryTable 
                    expenses={filteredExpensesList} onEdit={(exp) => { setEditingExpense(exp); setIsAddModalOpen(true); }} onDelete={handleExpenseDelete} categoryMap={CATEGORY_MAP}
                  />
                )
              )}
            </>
          )}
        </section>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={editingExpense ? "Edit Corporate Ledger Expense" : "Log Corporate Ledger Expense"}>
        <div style={{ padding: "10px 0" }}>
          <AddExpenseForm onAddExpense={handleExpenseSubmit} expense={editingExpense} />
        </div>
      </Modal>

      <Modal isOpen={isInflowModalOpen} onClose={() => setIsInflowModalOpen(false)} title="Log Custom Cash Inflow">
        <AddInflowForm 
          inflowAmount={inflowAmount} setInflowAmount={setInflowAmount} inflowDescription={inflowDescription} setInflowDescription={setInflowDescription} inflowDate={inflowDate} setInflowDate={setInflowDate} inflowStatus={inflowStatus} setInflowStatus={setInflowStatus} onSubmit={handleInflowSubmit} onCancel={() => setIsInflowModalOpen(false)}
        />
      </Modal>
    </>
  );
}
