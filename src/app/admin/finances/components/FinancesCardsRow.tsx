interface FinancesCardsRowProps {
  inflow: number;
  outflow: number;
  profit: number;
  isAnnualView: boolean;
  selectedYear: string;
  totalExpensesSum: number;
  pendingInflow?: number;
  deferredInflow?: number;
}

export default function FinancesCardsRow({ 
  inflow, 
  outflow, 
  profit, 
  isAnnualView, 
  selectedYear, 
  totalExpensesSum,
  pendingInflow = 0,
  deferredInflow = 0
}: FinancesCardsRowProps) {
  const totalOutstanding = pendingInflow + deferredInflow;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
      {/* 1. Cash Inflows Collected */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
          💵 {isAnnualView ? "Annual Inflow (Collected)" : "Monthly Inflow (Collected)"}
        </span>
        <h3 style={{ fontSize: '2.3rem', fontWeight: 800, color: 'hsl(var(--success))' }}>
          ₹{inflow.toLocaleString("en-IN")}
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
          {isAnnualView ? `Aggregate inflow collected for ${selectedYear}` : `Real cash received in hand`}
        </span>
      </div>

      {/* 2. Outstanding / Expected Inflows */}
      {!isAnnualView && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
            ⏳ Outstanding Inflows
          </span>
          <h3 style={{ fontSize: '2.3rem', fontWeight: 800, color: 'hsl(var(--warning))' }}>
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
            <span>• <b>₹{pendingInflow.toLocaleString("en-IN")}</b> pending collection</span>
            <span>• <b>₹{deferredInflow.toLocaleString("en-IN")}</b> deferred to next month</span>
          </div>
        </div>
      )}

      {/* 3. Cash Outflows */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
          💸 {isAnnualView ? "Annual Outflow" : "Monthly Outflow"}
        </span>
        <h3 style={{ fontSize: '2.3rem', fontWeight: 800, color: 'hsl(var(--danger))' }}>
          ₹{outflow.toLocaleString("en-IN")}
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
          {isAnnualView ? "Annual aggregated expenses & wages" : `₹${totalExpensesSum.toLocaleString("en-IN")} expenses + staff wages`}
        </span>
      </div>

      {/* 4. Operating Profitability */}
      <div className="glass-panel" style={{ 
        padding: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px',
        borderLeft: `4px solid ${profit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))'}`
      }}>
        <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
          📈 Operating Profitability
        </span>
        <h3 style={{ 
          fontSize: '2.3rem', 
          fontWeight: 800, 
          color: profit >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))' 
        }}>
          {profit >= 0 ? "+" : ""}₹{profit.toLocaleString("en-IN")}
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
          {profit >= 0 ? "Net business surplus" : "Operating cash deficit"}
        </span>
      </div>
    </div>
  );
}
