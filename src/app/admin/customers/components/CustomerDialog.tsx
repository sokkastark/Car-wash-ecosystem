"use client";

import { useState, useEffect } from "react";
import { mockStorage } from "@/lib/mockStorage";
import Modal from "@/components/ui/Modal";
import VehicleFormRows from "./VehicleFormRows";

interface FormVehicle {
  id?: string;
  licensePlate: string;
  vehicleType: "hatchback" | "sedan" | "suv" | "luxury" | "bike" | "car";
  make: string;
  model: string;
  color: string;
  planId: string;
  customPrice: string;
  assignedWorkerId: string;
  interiorFrequency: number;
}

interface CustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<boolean>;
  title: string;
  submitLabel: string;
  customer?: any;
  apartments: any[];
  plans: any[];
  workers: any[];
}

export default function CustomerDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  submitLabel,
  customer,
  apartments,
  plans,
  workers
}: CustomerDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [apartmentId, setApartmentId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [flatNo, setFlatNo] = useState("");
  const [parkingSlot, setParkingSlot] = useState("");
  const [vehiclesList, setVehiclesList] = useState<FormVehicle[]>([
    { licensePlate: "", vehicleType: "hatchback", make: "", model: "", color: "", planId: "", customPrice: "", assignedWorkerId: "", interiorFrequency: 0 }
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setName(customer.name || "");
        setPhone(customer.phone || "");
        setEmail(customer.email === "N/A" ? "" : (customer.email || ""));
        setApartmentId(customer.apartmentId || "");
        setBlockId(customer.blockId || "");
        setFlatNo(customer.flatNo === "N/A" ? "" : (customer.flatNo || ""));
        setParkingSlot(customer.parkingSlot || "");
        
        if (customer.vehicles && customer.vehicles.length > 0) {
          setVehiclesList(customer.vehicles.map((v: any) => ({
            id: v.id,
            licensePlate: v.licensePlate || "",
            vehicleType: v.vehicleType || "hatchback",
            make: v.make || "",
            model: v.model || "",
            color: v.color || "",
            planId: v.planId || "",
            customPrice: v.customPrice !== null ? String(v.customPrice) : "",
            assignedWorkerId: v.assignedWorkerId || "",
            interiorFrequency: Number(v.interiorFrequency) || 0
          })));
        } else {
          setVehiclesList([
            { licensePlate: "", vehicleType: "hatchback", make: "", model: "", color: "", planId: "", customPrice: "", assignedWorkerId: "", interiorFrequency: 0 }
          ]);
        }
      } else {
        setName("");
        setPhone("");
        setEmail("");
        setApartmentId("");
        setBlockId("");
        setFlatNo("");
        setParkingSlot("");
        setVehiclesList([
          { licensePlate: "", vehicleType: "hatchback", make: "", model: "", color: "", planId: "", customPrice: "", assignedWorkerId: "", interiorFrequency: 0 }
        ]);
      }
      setFormError(null);
    }
  }, [isOpen, customer]);

  const currentApt = apartments.find(a => a.id === apartmentId);
  const availableBlocks = currentApt?.blocks || [];
  const availableWorkers = workers.filter(
    w => w.role === "washer" && w.is_active && Array.isArray(w.assigned_complex_ids) && w.assigned_complex_ids.includes(apartmentId)
  );

  const handleAddVehicleRow = () => {
    setVehiclesList(prev => [
      ...prev,
      { licensePlate: "", vehicleType: "hatchback", make: "", model: "", color: "", planId: "", customPrice: "", assignedWorkerId: "", interiorFrequency: 0 }
    ]);
  };

  const handleRemoveVehicleRow = (index: number) => {
    if (vehiclesList.length === 1) return;
    setVehiclesList(prev => prev.filter((_, i) => i !== index));
  };

  const handleVehicleChange = (index: number, field: keyof FormVehicle, value: any) => {
    setVehiclesList(prev => prev.map((veh, i) => {
      if (i !== index) return veh;
      return { ...veh, [field]: value };
    }));
  };

  const getModalOverallPrice = () => {
    return vehiclesList.reduce((sum, veh) => {
      const basePrice = veh.planId 
        ? mockStorage.getPlanPriceForComplex(apartmentId, veh.planId, veh.vehicleType, plans) 
        : 0;
      const parsedCustom = parseFloat(veh.customPrice);
      const finalPrice = !isNaN(parsedCustom) ? parsedCustom : basePrice;
      const interiorPrice = veh.vehicleType !== "bike" ? (Number(veh.interiorFrequency) || 0) * 50 : 0;
      return sum + finalPrice + interiorPrice;
    }, 0);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !phone.trim() || !apartmentId || !parkingSlot.trim() || !flatNo.trim()) {
      setFormError("Please fill out all required customer fields marked with *");
      return;
    }

    for (const veh of vehiclesList) {
      if (!veh.licensePlate.trim()) {
        setFormError("Each vehicle must contain a valid license plate number.");
        return;
      }
    }

    const payload = {
      name,
      phone,
      email,
      apartmentId,
      blockId,
      flatNo,
      parkingSlot,
      vehicles: vehiclesList.map(v => ({
        id: v.id,
        licensePlate: v.licensePlate,
        vehicleType: v.vehicleType,
        make: v.make,
        model: v.model,
        color: v.color,
        planId: v.planId,
        customPrice: v.customPrice.trim() !== "" ? parseFloat(v.customPrice) : null,
        assignedWorkerId: v.assignedWorkerId || null,
        interiorFrequency: Number(v.interiorFrequency) || 0
      }))
    };

    const success = await onSubmit(payload);
    if (success) {
      onClose();
    } else {
      setFormError("Operation failed. Please verify inputs.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xlarge">
      <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {formError && (
          <div style={{ color: "hsl(var(--danger))", fontSize: "0.85rem", background: "rgba(239, 68, 68, 0.1)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid hsla(var(--danger)/0.2)" }}>
            {formError}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px", alignItems: "stretch" }}>
          {/* Personal Profile & Gated Location */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", background: "hsla(var(--bg-card) / 0.4)", border: "1px solid hsl(var(--border-muted))", padding: "20px", borderRadius: "var(--radius-lg)" }}>
            <div>
              <h4 style={{ color: "hsl(var(--primary))", marginBottom: "12px", fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>1. Personal Profile</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.8rem", color: "hsl(var(--text-secondary))" }}>Full Name *</label>
                  <input 
                    type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rohit Sharma"
                    style={{ padding: "10px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                    <label style={{ fontSize: "0.8rem", color: "hsl(var(--text-secondary))" }}>Phone Number *</label>
                    <input 
                      type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +919876543210"
                      style={{ padding: "10px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                    <label style={{ fontSize: "0.8rem", color: "hsl(var(--text-secondary))" }}>Email ID</label>
                    <input 
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. rohit@gmail.com"
                      style={{ padding: "10px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid hsl(var(--border-muted))", paddingTop: "16px" }}>
              <h4 style={{ color: "hsl(var(--primary))", marginBottom: "12px", fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>2. Gated Location</h4>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: "1 1 100%" }}>
                  <label style={{ fontSize: "0.8rem", color: "hsl(var(--text-secondary))" }}>Complex *</label>
                  <select 
                    value={apartmentId} onChange={(e) => { setApartmentId(e.target.value); setBlockId(""); }}
                    style={{ padding: "10px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                  >
                    <option value="">Choose Apartment Complex</option>
                    {apartments.map(apt => (
                      <option key={apt.id} value={apt.id}>{apt.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", color: "hsl(var(--text-secondary))" }}>Block</label>
                  <select 
                    value={blockId} onChange={(e) => setBlockId(e.target.value)}
                    style={{ padding: "10px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                    disabled={!apartmentId}
                  >
                    <option value="">N/A (No Block)</option>
                    {availableBlocks.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", color: "hsl(var(--text-secondary))" }}>Flat No *</label>
                  <input 
                    type="text" value={flatNo} onChange={(e) => setFlatNo(e.target.value)} placeholder="e.g. 102"
                    style={{ padding: "10px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                  <label style={{ fontSize: "0.8rem", color: "hsl(var(--text-secondary))" }}>Parking Slot *</label>
                  <input 
                    type="text" value={parkingSlot} onChange={(e) => setParkingSlot(e.target.value)} placeholder="e.g. A-102"
                    style={{ padding: "10px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <VehicleFormRows 
            vehiclesList={vehiclesList} apartmentId={apartmentId} plans={plans}
            availableWorkers={availableWorkers} onVehicleChange={handleVehicleChange}
            onRemoveRow={handleRemoveVehicleRow} onAddRow={handleAddVehicleRow}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid hsl(var(--border-muted))", paddingTop: "20px", marginTop: "4px", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ background: "hsla(var(--bg-card) / 0.6)", border: "1px solid hsl(var(--border-muted))", padding: "12px 24px", borderRadius: "var(--radius-md)", display: "flex", gap: "24px", alignItems: "center" }}>
            <div>
              <strong style={{ fontSize: "1rem" }}>Dynamic Monthly Total:</strong>
              <span style={{ display: "block", fontSize: "0.75rem", color: "hsl(var(--text-secondary))" }}>Sum of all vehicle subscriptions</span>
            </div>
            <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "hsl(var(--warning))" }}>
              ₹{getModalOverallPrice()}
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button 
              type="button" onClick={onClose}
              style={{ padding: "12px 24px", background: "hsl(var(--border-muted))", border: "none", color: "white", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: 600 }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: "12px 24px", borderRadius: "var(--radius-md)", justifyContent: "center" }}>
              {submitLabel}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
