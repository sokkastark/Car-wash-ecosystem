"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";

interface ComplexDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, address: string, city: string) => Promise<any>;
  title: string;
  submitLabel: string;
  apartment?: any; // Populate for Edit mode
}

export default function ComplexDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitLabel,
  apartment
}: ComplexDialogProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (apartment) {
        setName(apartment.name || "");
        setAddress(apartment.address || "");
        setCity(apartment.city || "Bengaluru");
      } else {
        setName("");
        setAddress("");
        setCity("Bengaluru");
      }
      setFormError(null);
    }
  }, [isOpen, apartment]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Complex name is required.");
      return;
    }

    try {
      await onSubmit(name.trim(), address.trim(), city.trim());
      onClose();
    } catch (err: any) {
      setFormError(err.message || "Operation failed.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {formError && (
          <div style={{ color: "hsl(var(--danger))", fontSize: "0.85rem" }}>
            ⚠️ {formError}
          </div>
        )}
        
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.85rem", color: "hsl(var(--text-secondary))" }}>Complex/Apartment Name *</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Prestige Shantiniketan"
            style={{ padding: "12px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.85rem", color: "hsl(var(--text-secondary))" }}>Address Info</label>
          <input 
            type="text" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            placeholder="e.g. ITPL Main Road"
            style={{ padding: "12px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "0.85rem", color: "hsl(var(--text-secondary))" }}>City</label>
          <input 
            type="text" 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
            style={{ padding: "12px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
          />
        </div>

        <button type="submit" className="btn-primary" style={{ marginTop: "8px", justifyContent: "center" }}>
          {submitLabel}
        </button>
      </form>
    </Modal>
  );
}
