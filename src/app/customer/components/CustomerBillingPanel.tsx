"use client";

import React from "react";
import { DetailedCustomer, mockStorage } from "@/lib/mockStorage";

interface CustomerBillingPanelProps {
  payments: any[];
  customer: DetailedCustomer;
  month?: string;
  year?: string;
}

export default function CustomerBillingPanel({ payments, customer, month, year }: CustomerBillingPanelProps) {
  const now = new Date();
  const currentMonthName = (month && year)
    ? new Date(Number(year), Number(month) - 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const hasOutstanding = payments.some(p => p.status === 'pending' || p.status === 'deferred');

  // Calculate overall billed total for this month's payments
  const overallBilledTotal = payments.reduce((sum, p) => sum + p.amount, 0);

  // Calculate standard vs actual costs for the customer's vehicles
  let totalStandardCost = 0;
  let totalActualCost = 0;
  let hasCustomDiscount = false;

  if (customer && customer.vehicles) {
    customer.vehicles.forEach(v => {
      // Get standard plan price for this complex and vehicle type
      const standardPrice = mockStorage.getPlanPriceForComplex(customer.apartmentId, v.planId, v.vehicleType);
      const actualPrice = v.customPrice !== null ? v.customPrice : standardPrice;
      
      totalStandardCost += standardPrice;
      totalActualCost += actualPrice;
      
      if (v.customPrice !== null && v.customPrice < standardPrice) {
        hasCustomDiscount = true;
      }
    });
  }

  const discountAmount = totalStandardCost - totalActualCost;
  const discountPercentage = totalStandardCost > 0 ? ((discountAmount / totalStandardCost) * 100) : 0;

  return (
    <section className="glass-panel" style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '1rem', color: '#475569', marginBottom: '14px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>
        Billing & Invoices ({currentMonthName})
      </h2>

      {/* Overall Billed Total Card */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(91, 109, 244, 0.08) 0%, rgba(158, 168, 253, 0.18) 100%)',
          border: '1px solid rgba(91, 109, 244, 0.2)',
          borderRadius: '24px',
          padding: '24px',
          color: '#1e293b',
          marginBottom: '24px',
          boxShadow: '0 8px 30px rgba(91, 109, 244, 0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }} 
        className="animate-fade-in"
      >
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', fontWeight: 800 }}>
            Overall Billed Total
          </span>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '4px 0 0 0', color: '#5b6df4' }}>
            ₹{overallBilledTotal}
          </h3>
        </div>
        <div style={{ fontSize: '2.2rem', opacity: 0.9 }}>
          💳
        </div>
      </div>

      {/* Premium Discount & Confidentiality Card */}
      {hasCustomDiscount && (
        <div 
          style={{
            background: 'rgba(244, 63, 94, 0.03)',
            border: '1px solid rgba(244, 63, 94, 0.15)',
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 4px 15px rgba(244, 63, 94, 0.02)'
          }} 
          className="animate-fade-in"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.2rem' }}>🎁</span>
            <strong style={{ fontSize: '0.9rem', color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
              Exclusive Premium Discount Active
            </strong>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#4f46e5', margin: '0 0 14px 0', lineHeight: '1.4', fontWeight: 600 }}>
            Due to you are our premium customer we provided you this much discount: <span style={{ color: '#e11d48', fontWeight: 800 }}>{discountPercentage.toFixed(0)}%</span> (Saving <span style={{ color: '#10b981', fontWeight: 800 }}>₹{discountAmount}</span>).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Actual Plan Cost</span>
              <strong style={{ fontSize: '1.1rem', color: '#64748b', textDecoration: 'line-through' }}>₹{totalStandardCost}</strong>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
              <span style={{ fontSize: '0.7rem', color: '#059669', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Your Custom Cost</span>
              <strong style={{ fontSize: '1.1rem', color: '#059669' }}>₹{totalActualCost}</strong>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1px dashed rgba(226, 232, 240, 1)',
            borderRadius: '14px',
            padding: '14px',
            fontSize: '0.8rem',
            color: '#475569',
            lineHeight: '1.45'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '6px', color: '#b91c1c' }}>
              <span>🤫</span>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.02em' }}>Please Keep Confidential</span>
            </div>
            <p style={{ margin: '0 0 6px 0' }}>
              Please do not share the discount details to your neighbors or other residents.
            </p>
            <p style={{ margin: 0, color: '#b91c1c', fontWeight: 500 }}>
              If someone requests a discount in referral with your discount, then we have to move your discount to the new customer. Please don't blame us, and understand the business complications due to sharing the customized discount.
            </p>
          </div>
        </div>
      )}

      {payments.length === 0 ? (
        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 14px' }}>No payments logged for this month.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {payments.map((pay) => (
            <div 
              key={pay.id} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '16px', 
                background: 'rgba(255, 255, 255, 0.45)',
                border: '1px solid rgba(158, 168, 253, 0.15)',
                borderRadius: '16px'
              }}
            >
              <div style={{ maxWidth: '70%' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  {pay.payment_type === 'subscription' ? 'Subscription' : 'Ad-Hoc'}
                </span>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block', marginTop: '2px', fontWeight: 700 }}>{pay.description}</strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '4px', fontFamily: 'monospace' }}>
                  Date: {pay.date}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#5b6df4' }}>
                  ₹{pay.amount}
                </span>
                <span 
                  className={`status-badge`}
                  style={{
                    textTransform: 'capitalize',
                    fontSize: '0.75rem',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    background: pay.status === 'paid' 
                      ? 'rgba(16, 185, 129, 0.08)' 
                      : pay.status === 'deferred' 
                        ? 'rgba(245, 158, 11, 0.08)' 
                        : 'rgba(239, 68, 68, 0.08)',
                    color: pay.status === 'paid' 
                      ? '#10b981' 
                      : pay.status === 'deferred' 
                        ? '#f59e0b' 
                        : '#ef4444',
                    border: pay.status === 'paid' 
                      ? '1px solid rgba(16, 185, 129, 0.15)' 
                      : pay.status === 'deferred' 
                        ? '1px solid rgba(245, 158, 11, 0.15)' 
                        : '1px solid rgba(239, 68, 68, 0.15)'
                  }}
                >
                  {pay.status === 'deferred' ? 'deferred' : pay.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Descriptions / Legend */}
      <div style={{ 
        padding: '16px', 
        background: 'rgba(255, 255, 255, 0.35)', 
        border: '1px dashed rgba(158, 168, 253, 0.25)', 
        borderRadius: '16px',
        fontSize: '0.8rem',
        color: '#475569'
      }}>
        <strong style={{ display: 'block', marginBottom: '8px', color: '#0f172a', fontWeight: 700 }}>
          Payment Status Meanings:
        </strong>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <span style={{ color: '#ef4444', fontWeight: 800 }}>pending:</span> 
            <span>Payment has not been received yet.</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <span style={{ color: '#10b981', fontWeight: 800 }}>paid:</span> 
            <span>Payment has been successfully completed.</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <span style={{ color: '#f59e0b', fontWeight: 800 }}>deferred:</span> 
            <span>Customer will pay next month.</span>
          </li>
        </ul>
      </div>

      {/* Outstanding Payment Reminder — moved to bottom */}
      {hasOutstanding && (
        <div 
          style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.20)',
            color: '#b45309',
            padding: '16px 20px',
            borderRadius: '18px',
            marginTop: '20px',
            fontSize: '0.85rem',
            lineHeight: '1.4'
          }}
          className="animate-fade-in"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '6px' }}>
            <span>🔔</span>
            <span>Outstanding Dues Reminder</span>
          </div>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.825rem', lineHeight: '1.4' }}>
            Dear Resident, your carwash billing for <b>{currentMonthName}</b> is currently outstanding. Please tap the button below to notify your supervisor or clear your dues.
          </p>
          <button 
            onClick={() => {
              const pay = payments.find(p => p.status === 'pending' || p.status === 'deferred');
              const textMessage = `Dear Carwash Supervisor, here is my payment confirmation for ₹${pay?.amount || 0}. Please update my status in the SV Carwash ledger.`;
              window.open(`https://wa.me/?text=${encodeURIComponent(textMessage)}`, '_blank');
            }}
            style={{ 
              marginTop: '12px', 
              padding: '10px 18px', 
              fontSize: '0.8rem', 
              background: '#f59e0b', 
              border: 'none', 
              borderRadius: '9999px',
              color: 'white', 
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            💬 Notify Supervisor via WhatsApp
          </button>
        </div>
      )}
    </section>
  );
}
