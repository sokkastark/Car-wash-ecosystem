"use client";

import { useState, useEffect } from "react";

const CATEGORY_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  microfabric_cloths: { label: "Microfiber Cloths", emoji: "🧼", color: "#38bdf8" },
  buckets: { label: "Buckets", emoji: "🪣", color: "#60a5fa" },
  spray_pumps: { label: "Spray Pumps", emoji: "💨", color: "#818cf8" },
  morning_tea: { label: "Morning Tea", emoji: "☕", color: "#fb923c" },
  sunday_breakfast: { label: "Sunday Breakfast", emoji: "🥞", color: "#fbbf24" },
  salary: { label: "Staff Salary", emoji: "👷", color: "#34d399" },
  others: { label: "Others", emoji: "📦", color: "#a78bfa" }
};

interface AddExpenseFormProps {
  onAddExpense: (category: string, amount: number, date: string, description: string) => Promise<any>;
  expense?: any | null;
}

export default function AddExpenseForm({ onAddExpense, expense }: AddExpenseFormProps) {
  const [category, setCategory] = useState("microfabric_cloths");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with expense prop (for editing)
  useEffect(() => {
    if (expense) {
      setCategory(expense.category || "microfabric_cloths");
      setAmount(String(expense.amount || ""));
      setDate(expense.date || "");
      setDescription(expense.description || "");
      setFormError("");
    } else {
      setCategory("microfabric_cloths");
      setAmount("");
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
      setDescription("");
      setFormError("");
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!amount || Number(amount) <= 0) {
      setFormError("Please enter a valid amount greater than 0");
      return;
    }
    if (!date) {
      setFormError("Please select a date");
      return;
    }
    if (!description.trim()) {
      setFormError("Please enter a description");
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddExpense(category, Number(amount), date, description.trim());
      if (!expense) {
        // Reset form fields only when adding new
        setAmount("");
        setDescription("");
        const today = new Date().toISOString().split("T")[0];
        setDate(today);
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to record expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>
          Expense Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: "10px 12px",
            background: "hsl(var(--bg-dark))",
            border: "1px solid hsl(var(--border-muted))",
            borderRadius: "var(--radius-md)",
            color: "white",
            fontSize: "0.9rem",
            cursor: "pointer",
            outline: "none"
          }}
        >
          {Object.keys(CATEGORY_MAP).map(key => (
            <option key={key} value={key}>
              {CATEGORY_MAP[key].emoji} {CATEGORY_MAP[key].label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>
            Amount (₹)
          </label>
          <input
            type="number"
            placeholder="e.g. 1500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              padding: "10px 12px",
              background: "hsl(var(--bg-dark))",
              border: "1px solid stroke",
              borderColor: "hsl(var(--border-muted))",
              borderRadius: "var(--radius-md)",
              color: "white",
              fontSize: "0.9rem",
              outline: "none"
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              padding: "10px 12px",
              background: "hsl(var(--bg-dark))",
              border: "1px solid stroke",
              borderColor: "hsl(var(--border-muted))",
              borderRadius: "var(--radius-md)",
              color: "white",
              fontSize: "0.9rem",
              outline: "none"
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>
          Description
        </label>
        <input
          type="text"
          placeholder="e.g. Microfiber cloths pack of 50"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            padding: "10px 12px",
            background: "hsl(var(--bg-dark))",
            border: "1px solid stroke",
            borderColor: "hsl(var(--border-muted))",
            borderRadius: "var(--radius-md)",
            color: "white",
            fontSize: "0.9rem",
            outline: "none"
          }}
        />
      </div>

      {formError && (
        <span style={{ color: "hsl(var(--danger))", fontSize: "0.8rem", fontWeight: 600 }}>
          ⚠️ {formError}
        </span>
      )}

      <button
        type="submit"
        className="btn-primary"
        disabled={isSubmitting}
        style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
      >
        {isSubmitting ? "💾 Saving..." : (expense ? "💾 Save Changes" : "💾 Record Expense")}
      </button>
    </form>
  );
}
