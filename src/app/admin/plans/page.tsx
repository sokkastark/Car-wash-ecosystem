"use client";

import { useEffect, useState } from "react";
import { mockStorage, SubscriptionPlan } from "@/lib/mockStorage";

export default function PlansManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [recurrence, setRecurrence] = useState<any>("daily");
  const [priceHatchback, setPriceHatchback] = useState("");
  const [priceSedan, setPriceSedan] = useState("");
  const [priceSuv, setPriceSuv] = useState("");
  const [priceLuxury, setPriceLuxury] = useState("");
  const [priceBike, setPriceBike] = useState("");

  const [notification, setNotification] = useState<string | null>(null);

  const loadPlans = () => {
    const list = mockStorage.getPlans();
    setPlans(list);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleEditClick = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setName(plan.name);
    setRecurrence(plan.recurrence);
    setPriceHatchback(String(plan.price_hatchback ?? plan.price_car ?? 700));
    setPriceSedan(String(plan.price_sedan ?? plan.price_car ?? 850));
    setPriceSuv(String(plan.price_suv ?? plan.price_car ?? 1000));
    setPriceLuxury(String(plan.price_luxury ?? plan.price_car ?? 1200));
    setPriceBike(String(plan.price_bike ?? 350));
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleAddClick = () => {
    setSelectedPlan(null);
    setName("");
    setRecurrence("daily");
    setPriceHatchback("700");
    setPriceSedan("850");
    setPriceSuv("1000");
    setPriceLuxury("1200");
    setPriceBike("350");
    setIsAdding(true);
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const planData: SubscriptionPlan = {
      id: selectedPlan ? selectedPlan.id : `plan-${Date.now()}`,
      agency_id: selectedPlan ? selectedPlan.agency_id : "a7b3c200-a299-4c4d-9051-fb18c5054992",
      name: name.trim(),
      recurrence,
      price_car: Number(priceHatchback), // Fallback support
      price_hatchback: Number(priceHatchback),
      price_sedan: Number(priceSedan),
      price_suv: Number(priceSuv),
      price_luxury: Number(priceLuxury),
      price_bike: Number(priceBike)
    };

    if (isAdding) {
      mockStorage.addPlan(planData);
      showToast(`✓ New plan "${name}" created successfully!`);
    } else {
      mockStorage.updatePlan(planData);
      showToast(`✓ Plan "${name}" updated successfully!`);
    }

    setIsEditing(false);
    setIsAdding(false);
    setSelectedPlan(null);
    loadPlans();
  };

  const handleDeleteClick = (id: string, planName: string) => {
    if (confirm(`Are you sure you want to delete the plan "${planName}"? This action cannot be undone.`)) {
      mockStorage.deletePlan(id);
      showToast(`✓ Plan "${planName}" deleted successfully!`);
      loadPlans();
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }} className="animate-fade-in">
      
      {/* 1. Header Banner */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <span style={{ color: "hsl(var(--primary))", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, fontSize: "0.8rem" }}>
            Operational Setup
          </span>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 800, marginTop: "4px", marginBottom: "8px" }}>Subscription Plans</h1>
          <p style={{ color: "hsl(var(--text-secondary))", fontSize: "1.05rem", margin: 0 }}>
            Configure default base prices per vehicle category and adjust service wash frequencies.
          </p>
        </div>
        <button 
          onClick={handleAddClick}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>➕</span> Add New Plan
        </button>
      </header>

      {/* 2. Notifications Toast */}
      {notification && (
        <div style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          background: "hsl(var(--success))",
          color: "white",
          padding: "16px 24px",
          borderRadius: "var(--radius-md)",
          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
          fontWeight: 600,
          zIndex: 5000,
          animation: "fadeIn 0.2s ease"
        }}>
          {notification}
        </div>
      )}

      {/* 3. Business Logic Alert Block */}
      <section style={{
        background: "radial-gradient(circle at top left, hsla(var(--primary) / 0.12), transparent 80%)",
        border: "1px solid rgba(168, 85, 247, 0.2)",
        borderRadius: "var(--radius-lg)",
        padding: "24px 28px",
        marginBottom: "36px",
        display: "flex",
        alignItems: "flex-start",
        gap: "20px"
      }}>
        <div style={{ fontSize: "2.2rem" }}>💡</div>
        <div>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "white", margin: "0 0 6px 0" }}>
            Understanding "Custom Plans" & Pricing Overrides
          </h3>
          <p style={{ color: "hsl(var(--text-secondary))", fontSize: "0.95rem", lineHeight: "1.6", margin: 0 }}>
            A <strong>"Custom Plan"</strong> is dynamically detected whenever a resident's vehicle has a <strong>Custom Price Override</strong> set. 
            However, the washing services themselves (Daily, Alternate Days, or Weekly Once) run strictly under the schedule of its <strong>Main Wash Plan</strong>. 
            Always choose the correct underlying Wash Plan first to dictate worker checklist schedules, then enter custom price overrides when standard rates vary!
          </p>
        </div>
      </section>

      {/* 4. Plans Grid & Table */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        {plans.map(p => (
          <div 
            key={p.id} 
            className="glass-panel" 
            style={{ 
              padding: "28px", 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "space-between",
              border: "1px solid hsl(var(--border-muted))",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>{p.name}</h3>
                <span style={{ 
                  fontSize: "0.75rem", 
                  fontWeight: 700, 
                  textTransform: "uppercase", 
                  padding: "4px 10px", 
                  borderRadius: "9999px",
                  background: p.recurrence === "daily" ? "hsla(var(--primary) / 0.15)" : "hsla(var(--success) / 0.15)",
                  color: p.recurrence === "daily" ? "hsl(var(--primary))" : "hsl(var(--success))",
                  border: `1px solid ${p.recurrence === "daily" ? "hsla(var(--primary) / 0.3)" : "hsla(var(--success) / 0.3)"}`
                }}>
                  {p.recurrence.replace("_", " ")}
                </span>
              </div>

              {/* Pricing breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "24px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed hsla(var(--border) / 0.3)", paddingBottom: "8px" }}>
                  <span style={{ color: "hsl(var(--text-secondary))", fontSize: "0.9rem" }}>🚗 Hatchback Rate:</span>
                  <strong style={{ color: "white" }}>₹{p.price_hatchback ?? p.price_car ?? 700}/mo</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed hsla(var(--border) / 0.3)", paddingBottom: "8px" }}>
                  <span style={{ color: "hsl(var(--text-secondary))", fontSize: "0.9rem" }}>🚘 Sedan Rate:</span>
                  <strong style={{ color: "white" }}>₹{p.price_sedan ?? p.price_car ?? 850}/mo</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed hsla(var(--border) / 0.3)", paddingBottom: "8px" }}>
                  <span style={{ color: "hsl(var(--text-secondary))", fontSize: "0.9rem" }}>🚙 SUV / MUV Rate:</span>
                  <strong style={{ color: "white" }}>₹{p.price_suv ?? p.price_car ?? 1000}/mo</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed hsla(var(--border) / 0.3)", paddingBottom: "8px" }}>
                  <span style={{ color: "hsl(var(--text-secondary))", fontSize: "0.9rem" }}>✨ Luxury Rate:</span>
                  <strong style={{ color: "white" }}>₹{p.price_luxury ?? p.price_car ?? 1200}/mo</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "4px" }}>
                  <span style={{ color: "hsl(var(--text-secondary))", fontSize: "0.9rem" }}>🏍 Bike Rate:</span>
                  <strong style={{ color: "white" }}>₹{p.price_bike ?? 350}/mo</strong>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", borderTop: "1px solid hsla(var(--border) / 0.2)", paddingTop: "20px" }}>
              <button 
                onClick={() => handleEditClick(p)} 
                className="btn-secondary" 
                style={{ flex: 1, justifyContent: "center" }}
              >
                ✏️ Edit Rates
              </button>
              {/* Only allow deleting custom created plans (e.g. not plan-daily) */}
              {!["plan-daily", "plan-alternate", "plan-weekly-once"].includes(p.id) && (
                <button 
                  onClick={() => handleDeleteClick(p.id, p.name)} 
                  style={{ padding: "10px 16px", background: "hsla(var(--danger) / 0.15)", border: "1px solid hsl(var(--danger))", color: "hsl(var(--danger))", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 5. Add / Edit Modal Overlay */}
      {(isEditing || isAdding) && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 4000,
          padding: "16px"
        }} className="animate-fade-in">
          <form 
            onSubmit={handleSubmit}
            className="glass-panel" 
            style={{
              width: "100%",
              maxWidth: "520px",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxShadow: "0 20px 50px -10px rgba(168, 85, 247, 0.3)",
              animation: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
            }}
          >
            <div>
              <h3 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 6px 0" }}>
                {isAdding ? "➕ Add New Subscription Plan" : "✏️ Edit Plan Pricing Rates"}
              </h3>
              <p style={{ color: "hsl(var(--text-secondary))", fontSize: "0.9rem", margin: 0 }}>
                Configure base pricing rates for this service template. Custom price overrides can still be set individually.
              </p>
            </div>

            {/* Inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))", fontWeight: 700 }}>Plan Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Weekly Twice"
                  style={{ padding: "10px 14px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))", fontWeight: 700 }}>Wash Recurrence Frequency *</label>
                <select 
                  value={recurrence} 
                  onChange={e => setRecurrence(e.target.value as any)}
                  style={{ padding: "10px 14px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                >
                  <option value="daily">Daily Wash</option>
                  <option value="alternate_days">Alternate Days</option>
                  <option value="weekly_once">Weekly Once</option>
                  <option value="weekly_twice">Weekly Twice</option>
                  <option value="custom">Custom Recurrence</option>
                </select>
              </div>

              {/* Price Fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", borderTop: "1px solid hsla(var(--border) / 0.15)", paddingTop: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))", fontWeight: 700 }}>Hatchback Rate (₹) *</label>
                  <input 
                    type="number" 
                    value={priceHatchback} 
                    onChange={e => setPriceHatchback(e.target.value)}
                    style={{ padding: "8px 12px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))", fontWeight: 700 }}>Sedan Rate (₹) *</label>
                  <input 
                    type="number" 
                    value={priceSedan} 
                    onChange={e => setPriceSedan(e.target.value)}
                    style={{ padding: "8px 12px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))", fontWeight: 700 }}>SUV / MUV Rate (₹) *</label>
                  <input 
                    type="number" 
                    value={priceSuv} 
                    onChange={e => setPriceSuv(e.target.value)}
                    style={{ padding: "8px 12px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))", fontWeight: 700 }}>Luxury Rate (₹) *</label>
                  <input 
                    type="number" 
                    value={priceLuxury} 
                    onChange={e => setPriceLuxury(e.target.value)}
                    style={{ padding: "8px 12px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", gridColumn: "span 2" }}>
                  <label style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))", fontWeight: 700 }}>Bike / Two-Wheeler Rate (₹) *</label>
                  <input 
                    type="number" 
                    value={priceBike} 
                    onChange={e => setPriceBike(e.target.value)}
                    style={{ padding: "8px 12px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  setIsAdding(false);
                  setSelectedPlan(null);
                }} 
                className="btn-secondary" 
                style={{ flex: 1, justifyContent: "center" }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ flex: 1, justifyContent: "center" }}
              >
                {isAdding ? "Create Plan" : "Save Pricing"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
