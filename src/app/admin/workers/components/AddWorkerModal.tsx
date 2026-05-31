"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";

interface Apartment {
  id: string;
  name: string;
}

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  apartments: Apartment[];
  onAddWorker: (name: string, phone: string, role: string, assignedComplexes: string[], salary: number) => Promise<any>;
}

export default function AddWorkerModal({
  isOpen,
  onClose,
  apartments,
  onAddWorker
}: AddWorkerModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("washer");
  const [salary, setSalary] = useState("12000");
  const [assignedComplexes, setAssignedComplexes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setPhone("");
      setRole("washer");
      setSalary("12000");
      setAssignedComplexes([]);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || assignedComplexes.length === 0) {
      setError("Full name, contact phone, and at least one complex assignment are required.");
      return;
    }
    try {
      const parsedSalary = parseFloat(salary) || 0;
      await onAddWorker(name, phone, role, assignedComplexes, parsedSalary);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create worker.");
    }
  };

  const handleComplexToggle = (aptId: string) => {
    setAssignedComplexes(prev => 
      prev.includes(aptId) ? prev.filter(id => id !== aptId) : [...prev, aptId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register Workforce Cleaner">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {error && <div style={{ color: "hsl(var(--danger))", fontSize: "0.85rem" }}>{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.85rem", color: "hsl(var(--text-secondary))" }}>Employee Full Name *</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Ramesh Prasad"
            style={{ padding: "12px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
            <label style={{ fontSize: "0.85rem", color: "hsl(var(--text-secondary))" }}>Mobile Phone Number *</label>
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="e.g. +919876543210"
              style={{ padding: "12px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
            <label style={{ fontSize: "0.85rem", color: "hsl(var(--text-secondary))" }}>Assigned Shift Role</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ padding: "12px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
            >
              <option value="washer">Field Washer</option>
              <option value="supervisor">Operations Supervisor</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.85rem", color: "hsl(var(--text-secondary))" }}>Monthly Salary Base (INR) *</label>
          <input 
            type="number" 
            value={salary} 
            onChange={(e) => setSalary(e.target.value)} 
            placeholder="e.g. 15000"
            style={{ padding: "12px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "hsl(var(--warning))", fontWeight: 600 }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.85rem", color: "hsl(var(--text-secondary))" }}>Assign Gated Complexes *</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", padding: "12px", background: "hsla(var(--bg-dark) / 0.5)", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)" }}>
            {apartments.map(apt => (
              <label key={apt.id} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                <input 
                  type="checkbox" 
                  checked={assignedComplexes.includes(apt.id)}
                  onChange={() => handleComplexToggle(apt.id)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                {apt.name}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: "8px", justifyContent: "center" }}>
          Confirm Registration
        </button>
      </form>
    </Modal>
  );
}
