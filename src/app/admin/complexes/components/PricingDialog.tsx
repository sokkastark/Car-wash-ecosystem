"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Table from "@/components/ui/Table";

interface PricingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prices: any[]) => Promise<any>;
  apartment: any;
  plans: any[];
  getComplexPlanPrices: (complexId: string) => any[];
}

export default function PricingDialog({
  isOpen,
  onClose,
  onSubmit,
  apartment,
  plans,
  getComplexPlanPrices
}: PricingDialogProps) {
  const [pricingFields, setPricingFields] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    if (isOpen && apartment) {
      const existingPrices = getComplexPlanPrices(apartment.id);
      const initialFields: Record<string, Record<string, string>> = {};
      
      plans.forEach(p => {
        initialFields[p.id] = {
          hatchback: "",
          sedan: "",
          suv: "",
          luxury: "",
          bike: ""
        };
        
        const match = existingPrices.find(ep => ep.plan_id === p.id);
        if (match) {
          initialFields[p.id] = {
            hatchback: String(match.price_hatchback),
            sedan: String(match.price_sedan),
            suv: String(match.price_suv),
            luxury: String(match.price_luxury),
            bike: String(match.price_bike)
          };
        } else {
          initialFields[p.id] = {
            hatchback: String(p.price_hatchback ?? p.price_car),
            sedan: String(p.price_sedan ?? p.price_car),
            suv: String(p.price_suv ?? p.price_car),
            luxury: String(p.price_luxury ?? p.price_car),
            bike: String(p.price_bike)
          };
        }
      });
      setPricingFields(initialFields);
    }
  }, [isOpen, apartment, plans, getComplexPlanPrices]);

  const handlePricingFieldChange = (planId: string, vehicleType: string, value: string) => {
    setPricingFields(prev => ({
      ...prev,
      [planId]: {
        ...prev[planId],
        [vehicleType]: value
      }
    }));
  };

  const handlePricingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apartment) return;
    
    const payload = plans.map(p => {
      const fields = pricingFields[p.id] || {};
      return {
        apartment_id: apartment.id,
        plan_id: p.id,
        price_hatchback: parseFloat(fields.hatchback) || p.price_hatchback || p.price_car,
        price_sedan: parseFloat(fields.sedan) || p.price_sedan || p.price_car,
        price_suv: parseFloat(fields.suv) || p.price_suv || p.price_car,
        price_luxury: parseFloat(fields.luxury) || p.price_luxury || p.price_car,
        price_bike: parseFloat(fields.bike) || p.price_bike
      };
    });
    
    await onSubmit(payload);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={apartment ? `Configure Subscription Fares: ${apartment.name}` : "Configure Complex Plan Pricing"}
      size="large"
    >
      <form onSubmit={handlePricingSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <p style={{ color: "hsl(var(--text-secondary))", fontSize: "0.9rem", lineHeight: "1.5", margin: 0 }}>
          Override baseline payment plans specifically for residents of **{apartment?.name}**. 
          Leave default prices or update them as required. All active and future customer records will instantly compute billing using these configured fares.
        </p>

        <Table headers={["Plan Description", "Hatchback (₹)", "Sedan (₹)", "SUV / MUV (₹)", "Luxury (₹)", "Bike / Two-Wheeler (₹)"]}>
          {plans.map(p => {
            const fields = pricingFields[p.id] || { hatchback: "", sedan: "", suv: "", luxury: "", bike: "" };
            return (
              <tr key={p.id} style={{ borderBottom: "1px solid hsl(var(--border-muted))" }}>
                <td style={{ padding: "14px 16px" }}>
                  <strong style={{ fontSize: "0.95rem", display: "block" }}>{p.name}</strong>
                  <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))", textTransform: "capitalize" }}>
                    Recurrence: {p.recurrence.replace("_", " ")}
                  </span>
                </td>
                {["hatchback", "sedan", "suv", "luxury", "bike"].map(vType => (
                  <td key={vType} style={{ padding: "10px 8px" }}>
                    <input 
                      type="number" 
                      value={fields[vType]} 
                      onChange={(e) => handlePricingFieldChange(p.id, vType, e.target.value)}
                      placeholder="e.g. 500"
                      min="0"
                      required
                      style={{ 
                        width: "90px", 
                        padding: "8px", 
                        background: "hsl(var(--bg-dark))", 
                        border: "1px solid hsl(var(--border-muted))", 
                        borderRadius: "var(--radius-sm)", 
                        color: "white",
                        textAlign: "center",
                        fontWeight: 600
                      }} 
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </Table>

        <div style={{ display: "flex", gap: "12px", marginTop: "10px", justifyContent: "flex-end" }}>
          <button 
            type="button"
            onClick={onClose}
            style={{ padding: "10px 18px", background: "hsl(var(--border-muted))", border: "none", borderRadius: "var(--radius-md)", color: "white", cursor: "pointer", fontWeight: 600 }}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" style={{ padding: "10px 24px", borderRadius: "var(--radius-md)" }}>
            Save Custom Fares 💾
          </button>
        </div>
      </form>
    </Modal>
  );
}
