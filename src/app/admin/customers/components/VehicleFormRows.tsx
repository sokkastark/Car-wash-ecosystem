import { mockStorage } from "@/lib/mockStorage";

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

interface VehicleFormRowsProps {
  vehiclesList: FormVehicle[];
  apartmentId: string;
  plans: any[];
  availableWorkers: any[];
  onVehicleChange: (index: number, field: keyof FormVehicle, value: any) => void;
  onRemoveRow: (index: number) => void;
  onAddRow: () => void;
}

export default function VehicleFormRows({
  vehiclesList,
  apartmentId,
  plans,
  availableWorkers,
  onVehicleChange,
  onRemoveRow,
  onAddRow
}: VehicleFormRowsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "hsla(var(--bg-card) / 0.4)", border: "1px solid hsl(var(--border-muted))", padding: "20px", borderRadius: "var(--radius-lg)", maxHeight: "58vh", overflowY: "auto", paddingRight: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <h4 style={{ color: "hsl(var(--primary))", fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, margin: 0 }}>3. Vehicles & Subscriptions</h4>
        <button 
          type="button" 
          onClick={onAddRow}
          style={{ padding: "6px 12px", background: "hsla(var(--success) / 0.15)", border: "1px solid hsl(var(--success))", color: "hsl(var(--success))", borderRadius: "var(--radius-sm)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
        >
          + Add Vehicle
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {vehiclesList.map((veh, index) => (
          <div key={index} style={{ border: "1px solid hsl(var(--border-muted))", padding: "16px", borderRadius: "var(--radius-md)", background: "hsla(var(--bg-dark) / 0.3)", position: "relative" }}>
            {vehiclesList.length > 1 && (
              <button 
                type="button" 
                onClick={() => onRemoveRow(index)}
                style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "hsl(var(--danger))", fontSize: "1.2rem", cursor: "pointer" }}
              >
                &times;
              </button>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))" }}>License Plate *</label>
                <input 
                  type="text" 
                  value={veh.licensePlate} 
                  onChange={(e) => onVehicleChange(index, "licensePlate", e.target.value)} 
                  placeholder="e.g. KA-03-MS-8888"
                  style={{ padding: "8px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white", fontFamily: "monospace" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))" }}>Vehicle Type *</label>
                <select 
                  value={veh.vehicleType} 
                  onChange={(e) => onVehicleChange(index, "vehicleType", e.target.value as any)}
                  style={{ padding: "8px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                >
                  <option value="hatchback">Hatchback</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV / MUV</option>
                  <option value="luxury">Luxury</option>
                  <option value="bike">Bike / Two-Wheeler</option>
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))" }}>Make Brand</label>
                <input 
                  type="text" 
                  value={veh.make} 
                  onChange={(e) => onVehicleChange(index, "make", e.target.value)} 
                  placeholder="e.g. Hyundai"
                  style={{ padding: "8px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))" }}>Model Name</label>
                <input 
                  type="text" 
                  value={veh.model} 
                  onChange={(e) => onVehicleChange(index, "model", e.target.value)} 
                  placeholder="e.g. i20"
                  style={{ padding: "8px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))" }}>Color</label>
                <input 
                  type="text" 
                  value={veh.color} 
                  onChange={(e) => onVehicleChange(index, "color", e.target.value)} 
                  placeholder="e.g. Red"
                  style={{ padding: "8px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))" }}>Wash Plan *</label>
                <select 
                  value={veh.planId} 
                  onChange={(e) => onVehicleChange(index, "planId", e.target.value)}
                  disabled={veh.customPrice.trim() !== ""}
                  style={{ padding: "8px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white", opacity: veh.customPrice.trim() !== "" ? 0.6 : 1 }}
                >
                  <option value="">Select Plan</option>
                  {plans.map(p => {
                    const price = mockStorage.getPlanPriceForComplex(apartmentId, p.id, veh.vehicleType, plans);
                    return (
                      <option key={p.id} value={p.id}>{p.name} (₹{price})</option>
                    );
                  })}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))" }}>Custom Price Override</label>
                <input 
                  type="text" 
                  value={veh.customPrice} 
                  onChange={(e) => onVehicleChange(index, "customPrice", e.target.value)} 
                  placeholder="e.g. 500"
                  style={{ padding: "8px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "hsl(var(--warning))", fontWeight: 600 }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))" }}>Assign Washer</label>
                <select 
                  value={veh.assignedWorkerId} 
                  onChange={(e) => onVehicleChange(index, "assignedWorkerId", e.target.value)}
                  style={{ padding: "8px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                  disabled={!apartmentId}
                >
                  <option value="">Unassigned</option>
                  {availableWorkers.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              {veh.vehicleType !== "bike" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", gridColumn: "span 2" }}>
                  <label style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))" }}>🧼 Sunday Interior Cleaning</label>
                  <select 
                    value={veh.interiorFrequency} 
                    onChange={(e) => onVehicleChange(index, "interiorFrequency", Number(e.target.value))}
                    style={{ padding: "8px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white", fontSize: "0.85rem", cursor: "pointer", outline: "none" }}
                  >
                    <option value={0}>No Interior Cleaning (₹0/month)</option>
                    <option value={1}>1x Session / Month (+₹50/month)</option>
                    <option value={2}>2x Sessions / Month (+₹100/month)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
