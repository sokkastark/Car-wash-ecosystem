"use client";

import { useState, useEffect } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import GrowthBarChart from "./components/GrowthBarChart";
import LeakageLedger from "./components/LeakageLedger";

export default function AnalyticsPage() {
  const { getAnalyticsData } = useAdminData();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (getAnalyticsData) {
      setData(getAnalyticsData());
    }
  }, [getAnalyticsData]);

  if (!data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div style={{ color: "hsl(var(--text-secondary))", fontSize: "1.1rem" }}>Loading analytics portal...</div>
      </div>
    );
  }

  const { planDistribution, discountLoss, growthTrend } = data;

  const totalPlans = planDistribution.total;
  const standardPct = totalPlans > 0 ? (planDistribution.standard / totalPlans) * 100 : 0;
  const customPct = totalPlans > 0 ? (planDistribution.custom / totalPlans) * 100 : 0;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }} className="animate-fade-in">
      {/* Header */}
      <header style={{ marginBottom: '40px' }}>
        <span style={{ color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, fontSize: '0.8rem' }}>
          SV Operation Engine
        </span>
        <h1 style={{ fontSize: '2.5rem', marginTop: '4px' }}>Operations Analytics</h1>
      </header>

      {/* Plan Type Allocation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
            🚗 Subscribed Fleet size
          </span>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
            {totalPlans} Registered
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
            Total vehicles active in database
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
            🛡️ Standard Complex Pricing
          </span>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'hsl(var(--success))' }}>
            {planDistribution.standard} ({Math.round(standardPct)}%)
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
            Locked to base community rates
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
            ⚙️ Custom Negotiated Prices
          </span>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>
            {planDistribution.custom} ({Math.round(customPct)}%)
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
            Ad-hoc custom pricing adjustments
          </span>
        </div>
      </div>

      {/* Growth Trends & Leak Analysis Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        
        {/* Customer Growth & Churn Trend */}
        <section className="glass-panel" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 700 }}>Customer Growth & Churn Trend</h2>
          <GrowthBarChart growthTrend={growthTrend} />
          <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#10b981" }} />
              <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))" }}>Enrolled this month</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#f43f5e" }} />
              <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-secondary))" }}>Left/Cancelled</span>
            </div>
          </div>
        </section>

        {/* Dynamic Gaps & Leaks Report */}
        <section className="glass-panel" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', fontWeight: 700 }}>Custom Discount Leak Alert</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'hsla(var(--danger) / 0.1)', border: '1px solid hsla(var(--danger) / 0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--text-secondary))' }}>
                  ⚠️ Monthly Leak Value
                </span>
                <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--danger))', margin: '4px 0' }}>
                  ₹{discountLoss.totalDiscountLoss.toLocaleString("en-IN")}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                  Revenue lost due to plan discounts
                </span>
              </div>

              <div style={{ background: 'hsla(var(--success) / 0.1)', border: '1px solid hsla(var(--success) / 0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--text-secondary))' }}>
                  ✨ Premium Gains
                </span>
                <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--success))', margin: '4px 0' }}>
                  ₹{discountLoss.totalPremiumGain.toLocaleString("en-IN")}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                  Charged over standard base rates
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--text-secondary))', display: 'block', marginBottom: '12px' }}>
                Leak breakdown by Complex
              </span>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {discountLoss.complexLoss.length === 0 ? (
                  <div style={{ fontSize: "0.8rem", color: "hsl(var(--text-muted))", padding: "10px 0" }}>
                    No complex-level discount leakages observed. Excellent margin health!
                  </div>
                ) : (
                  discountLoss.complexLoss.map((item: any, idx: number) => {
                    const pctOfTotal = discountLoss.totalDiscountLoss > 0 ? (item.loss / discountLoss.totalDiscountLoss) * 100 : 0;
                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                          <strong>{item.name}</strong>
                          <span style={{ color: 'hsl(var(--danger))', fontWeight: 600 }}>₹{item.loss.toLocaleString("en-IN")} ({Math.round(pctOfTotal)}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'hsl(var(--border-muted))', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ width: `${pctOfTotal}%`, height: '100%', background: 'hsl(var(--danger))' }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Detailed Leaked Subscriptions Table */}
      <section className="glass-panel" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', fontWeight: 700 }}>Detailed leakages ledger</h2>
        <LeakageLedger detailedDiscounts={discountLoss.detailedDiscounts} />
      </section>
    </div>
  );
}
