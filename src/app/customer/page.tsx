"use client";

import { useState, useEffect } from "react";
import { mockStorage, DetailedCustomer, DailyServiceLog, InteriorCleaningRequest } from "@/lib/mockStorage";
import CustomerLogin from "./components/CustomerLogin";
import CustomerBillingPanel from "./components/CustomerBillingPanel";
import CustomerSupportPanel from "./components/CustomerSupportPanel";
import "./customer.css";

export default function CustomerDashboard() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);
  const [activeTab, setActiveTab] = useState<"vehicles" | "billing" | "support">("vehicles");
  const [customerId, setCustomerId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customer, setCustomer] = useState<DetailedCustomer | null>(null);
  
  const [complaintText, setComplaintText] = useState("");
  const [complaintSuccess, setComplaintSuccess] = useState(false);
  const [activeComplaints, setActiveComplaints] = useState<any[]>([]);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [vehicleLogs, setVehicleLogs] = useState<DailyServiceLog[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [assignedWasher, setAssignedWasher] = useState<{ name: string; phone: string } | null>(null);
  const [assignedSupervisor, setAssignedSupervisor] = useState<{ name: string; phone: string } | null>(null);

  // One-time interior cleaning booking
  const [interiorRequests, setInteriorRequests] = useState<InteriorCleaningRequest[]>([]);
  const [showOneTimeBooking, setShowOneTimeBooking] = useState(false);
  const [oneTimeDate, setOneTimeDate] = useState("");
  const [oneTimeNotes, setOneTimeNotes] = useState("");
  const [oneTimeSuccess, setOneTimeSuccess] = useState(false);

  // Accordion open states
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [oneTimeOpen, setOneTimeOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeSplash(true);
      const removeTimer = setTimeout(() => {
        showSplash && setShowSplash(false);
      }, 500);
      return () => clearTimeout(removeTimer);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerId.trim()) {
      setErrorMessage("Please enter a valid Customer ID.");
      return;
    }

    const allCustomers = mockStorage.getCustomersDetailed();
    const match = allCustomers.find(
      c => c.customCustomerId.toLowerCase() === customerId.trim().toLowerCase()
    );

    if (match) {
      setCustomer(match);
      if (match.vehicles.length > 0) {
        setSelectedVehicleId(match.vehicles[0].id);
      }
      
      const complaints = mockStorage.getComplaints().filter(
        comp => comp.customer_id === match.id
      );
      setActiveComplaints(complaints);
    } else {
      setErrorMessage("No resident profile matched this ID. Please verify your ID.");
    }
  };

  useEffect(() => {
    if (customer) {
      const allLogs = mockStorage.getCustomerDailyLogs(customer.id);
      setVehicleLogs(allLogs);
      // Load interior cleaning requests for this customer
      const reqs = mockStorage.getInteriorCleaningRequests(customer.id);
      setInteriorRequests(reqs);
    }
  }, [customer]);

  useEffect(() => {
    if (customer) {
      const allPayments = mockStorage.getInflowPayments("05", "2026");
      const customerPayments = allPayments.filter(p => p.customer_id === customer.id);
      setPayments(customerPayments);
    }
  }, [customer]);

  useEffect(() => {
    if (customer) {
      // 1. Find assigned washer from the first vehicle that has an assigned worker
      const vehiclesWithWorker = customer.vehicles.filter(v => v.assignedWorkerId);
      if (vehiclesWithWorker.length > 0) {
        const workerId = vehiclesWithWorker[0].assignedWorkerId;
        const allWorkers = mockStorage.getWorkers();
        const washerObj = allWorkers.find(w => w.id === workerId);
        if (washerObj) {
          setAssignedWasher({
            name: washerObj.name,
            phone: washerObj.phone
          });
        } else {
          setAssignedWasher({
            name: vehiclesWithWorker[0].assignedWorkerName || "Assigned Cleaner",
            phone: "+918095695154"
          });
        }
      } else {
        setAssignedWasher({
          name: "Shanmugha P",
          phone: "+918095695154"
        });
      }

      // 2. Find supervisor for this apartment complex
      const allWorkers = mockStorage.getWorkers();
      const supervisorObj = allWorkers.find(
        w => w.role === "supervisor" && w.assigned_complex_ids.includes(customer.apartmentId)
      );
      if (supervisorObj) {
        setAssignedSupervisor({
          name: supervisorObj.name,
          phone: supervisorObj.phone
        });
      } else {
        // Fallback to general supervisor Sunil Rao
        const firstSupervisor = allWorkers.find(w => w.role === "supervisor") || { name: "Sunil Rao", phone: "+919876543212" };
        setAssignedSupervisor({
          name: firstSupervisor.name,
          phone: firstSupervisor.phone
        });
      }
    }
  }, [customer]);

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim() || !customer) return;

    mockStorage.submitCustomerComplaint(customer.id, complaintText);
    
    const complaints = mockStorage.getComplaints().filter(
      comp => comp.customer_id === customer.id
    );
    setActiveComplaints(complaints);

    setComplaintText("");
    setComplaintSuccess(true);
    setTimeout(() => setComplaintSuccess(false), 4000);
  };

  // 🧼 Mutate database & billing to toggle Sunday interior cleaning dynamically
  const toggleInteriorCleaning = (vehicleId: string) => {
    if (typeof window === "undefined") return;
    
    const vehiclesItem = localStorage.getItem("sv_vehicles");
    if (!vehiclesItem) return;
    
    try {
      const vehicles = JSON.parse(vehiclesItem);
      if (!Array.isArray(vehicles)) return;
      
      const index = vehicles.findIndex((v: any) => v.id === vehicleId);
      if (index === -1) return;
      
      const currentFreq = Number(vehicles[index].interior_frequency) || 0;
      const newFreq = currentFreq > 0 ? 0 : 2; // Scheduled twice a month
      
      vehicles[index].interior_frequency = newFreq;
      
      // Save back to localStorage
      localStorage.setItem("sv_vehicles", JSON.stringify(vehicles));
      
      // Recalculate and update the corresponding payment record in localStorage
      const paymentsItem = localStorage.getItem("sv_inflow_payments");
      if (paymentsItem) {
        const payments = JSON.parse(paymentsItem);
        if (Array.isArray(payments)) {
          const paymentId = `pay-${vehicleId}-2026-05`;
          const payIndex = payments.findIndex((p: any) => p.id === paymentId);
          if (payIndex !== -1) {
            const veh = vehicles[index];
            const allPlans = mockStorage.getPlans();
            const plan = allPlans.find(p => p.id === veh.plan_id);
            const isBike = veh.vehicle_type === "bike";
            const basePrice = plan ? (isBike ? plan.price_bike : plan.price_car) : 0;
            const customPriceVal = (veh.custom_price !== null && veh.custom_price !== undefined) ? Number(veh.custom_price) : null;
            const interiorPrice = (!isBike) ? newFreq * 50 : 0;
            const finalAmount = (customPriceVal !== null ? customPriceVal : basePrice) + interiorPrice;
            
            payments[payIndex].amount = finalAmount;
            
            const hasIntDesc = !isBike && newFreq > 0 ? ` + Interior ${newFreq}x` : "";
            payments[payIndex].description = `Subscription plan (${plan?.name || "Standard"})${hasIntDesc} for ${veh.license_plate}`;
            
            localStorage.setItem("sv_inflow_payments", JSON.stringify(payments));
          }
        }
      }
      
      // Update local React states to reflect calculations instantly
      if (customer) {
        const allCustomers = mockStorage.getCustomersDetailed();
        const updatedCustomer = allCustomers.find(c => c.id === customer.id);
        if (updatedCustomer) {
          setCustomer(updatedCustomer);
        }
        
        const allLogs = mockStorage.getCustomerDailyLogs(customer.id);
        setVehicleLogs(allLogs);
        
        const allPayments = mockStorage.getInflowPayments("05", "2026");
        const customerPayments = allPayments.filter(p => p.customer_id === customer.id);
        setPayments(customerPayments);
      }
    } catch (e) {
      console.error("Failed to toggle interior cleaning:", e);
    }
  };

  // 📦 Book a one-time interior cleaning
  const handleOneTimeBooking = () => {
    if (!customer || !selectedVehicleId) return;
    const selectedVeh = customer.vehicles.find(v => v.id === selectedVehicleId);
    if (!selectedVeh || selectedVeh.vehicleType === "bike") return;

    mockStorage.requestAdHocInteriorCleaning(
      customer.id,
      selectedVehicleId,
      oneTimeDate || undefined,
      oneTimeNotes || undefined
    );

    // Refresh requests and payments
    const reqs = mockStorage.getInteriorCleaningRequests(customer.id);
    setInteriorRequests(reqs);
    const allPayments = mockStorage.getInflowPayments("05", "2026");
    const customerPayments = allPayments.filter(p => p.customer_id === customer.id);
    setPayments(customerPayments);

    setOneTimeDate("");
    setOneTimeNotes("");
    setShowOneTimeBooking(false);
    setOneTimeSuccess(true);
    setTimeout(() => setOneTimeSuccess(false), 5000);
  };

  // ❌ Cancel a one-time request
  const handleCancelOneTime = (requestId: string) => {
    mockStorage.cancelInteriorCleaningRequest(requestId);
    if (customer) {
      const reqs = mockStorage.getInteriorCleaningRequests(customer.id);
      setInteriorRequests(reqs);
      const allPayments = mockStorage.getInflowPayments("05", "2026");
      const customerPayments = allPayments.filter(p => p.customer_id === customer.id);
      setPayments(customerPayments);
    }
  };

  // 🧪 Helper to get precise today's status including alternate-day roster calculation
  const getVehicleStatusForDate = (veh: any, allLogs: DailyServiceLog[]) => {
    const isAlternate = veh.planId === "plan-alternate" || veh.planName.toLowerCase().includes("alternate");
    const yesterdayLog = allLogs.find(l => l.vehicle_id === veh.id && l.log_date === "2026-05-29");
    const todayLog = allLogs.find(l => l.vehicle_id === veh.id && l.log_date === "2026-05-30");

    if (isAlternate && yesterdayLog?.status === "washed") {
      return {
        status: "roster" as const,
        reason: null,
        notes: null,
        markedAt: yesterdayLog.marked_at
      };
    }

    return {
      status: (todayLog?.status || "pending") as "pending" | "washed" | "skipped" | "missed",
      reason: todayLog?.reason || null,
      notes: todayLog?.notes || null,
      markedAt: todayLog?.marked_at || null
    };
  };

  const getAssistantMessage = (customerName: string, licensePlate: string, logInfo: any) => {
    const { status, reason } = logInfo;
    
    switch (status) {
      case "washed":
        return `Your vehicle ${licensePlate} wash is completed today! It is pristine and ready to be taken out. 🧼🚗✨`;
      
      case "skipped":
        if (reason === "vehicle_not_present") {
          return `Your car wash was skipped today because we noticed your vehicle ${licensePlate} was not in its parking spot. Don't worry, it will be washed tomorrow! ⚠️📍`;
        }
        
        const reasonLabels: Record<string, string> = {
          owner_away: "Owner Away / Vacation",
          lockout: "Lockout / Cover Protected",
          bad_weather: "Adverse Weather",
          other: "Operational Exceptions"
        };
        const reasonLabel = reasonLabels[reason || "other"] || "Operational Reason";
        
        return `We are sorry that we were not able to wash your vehicle ${licensePlate} today due to: ${reasonLabel}. Don't worry, we will catch up tomorrow! 🛠️⏳`;
        
      case "missed":
        return `We are sorry that we were not able to wash your vehicle ${licensePlate} today due to operational constraints. Don't worry, it will be washed tomorrow! 😔🔧`;
        
      case "roster":
        return `Today is a roster day! Your vehicle ${licensePlate} was washed yesterday, and it will be washed again tomorrow. 📅😴🔋`;
        
      case "pending":
      default:
        return `It seems your vehicle ${licensePlate} has not been washed yet. Don't worry, it is on our schedule list and will be caught up shortly or washed tomorrow! ⏳🚗`;
    }
  };

  const renderStatusPill = (status: "pending" | "washed" | "skipped" | "missed" | "roster") => {
    if (status === "washed") {
      return (
        <span className="status-badge washed" style={{ padding: '4px 10px', fontSize: '0.725rem' }}>
          Washed
        </span>
      );
    }
    if (status === "skipped") {
      return (
        <span className="status-badge skipped" style={{ padding: '4px 10px', fontSize: '0.725rem' }}>
          Skipped
        </span>
      );
    }
    if (status === "missed") {
      return (
        <span className="status-badge missed" style={{ padding: '4px 10px', fontSize: '0.725rem' }}>
          Missed
        </span>
      );
    }
    if (status === "roster") {
      return (
        <span className="status-badge roster" style={{
          padding: '4px 10px',
          fontSize: '0.725rem',
          background: 'rgba(168, 85, 247, 0.12)',
          color: '#a855f7',
          fontWeight: 700,
          borderRadius: '9999px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          border: '1px solid rgba(168, 85, 247, 0.25)'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7' }} />
          Roster Day
        </span>
      );
    }
    return (
      <span className="status-badge pending" style={{
        padding: '4px 10px',
        fontSize: '0.725rem',
        background: 'rgba(59, 130, 246, 0.12)',
        color: '#3b82f6',
        fontWeight: 700,
        borderRadius: '9999px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        border: '1px solid rgba(59, 130, 246, 0.25)'
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />
        Pending
      </span>
    );
  };

  if (!customer) {
    return (
      <div className="customer-theme-wrapper" style={{ minHeight: "100vh", width: "100%", padding: "20px 0", position: "relative" }}>
        {showSplash && (
          <div className={`pwa-splash ${fadeSplash ? "animate-splash-fade" : ""}`}>
            <img 
              src="/customer_welcome.png" 
              alt="SV Carwash Resident App Icon" 
              className="pwa-splash-logo"
              style={{ width: "160px", height: "160px", objectFit: "contain", borderRadius: "32px" }}
            />
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
                SV Resident Portal
              </h2>
              <span style={{ fontSize: "0.8rem", color: "#5b6df4", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginTop: "4px" }}>
                Operations & Ledger
              </span>
            </div>
            <div className="pwa-spinner" />
          </div>
        )}
        {/* Constrain login screen to native mobile dimensions */}
        <div style={{ padding: "0 16px", maxWidth: "480px", margin: "0 auto" }}>
          <CustomerLogin
            customerId={customerId}
            setCustomerId={setCustomerId}
            errorMessage={errorMessage}
            handleLogin={handleLogin}
          />
        </div>
      </div>
    );
  }

  const selectedVehicle = customer.vehicles.find(v => v.id === selectedVehicleId) || (customer.vehicles.length > 0 ? customer.vehicles[0] : null);

  return (
    <div className="customer-theme-wrapper" style={{ minHeight: "100vh", width: "100%", padding: "24px 0" }}>
      <div style={{ padding: '0 16px 100px 16px', maxWidth: '480px', margin: '0 auto' }} className="animate-fade-in">
        
        {/* Sleek Subdomain Shift Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: "0.8rem", color: "#5b6df4", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-title)" }}>
            Today's Status • May 30, 2026
          </span>
          <button 
            onClick={() => { setCustomer(null); setCustomerId(""); }}
            style={{
              background: "rgba(255, 255, 255, 0.6) !important",
              border: "1px solid rgba(158, 168, 253, 0.2) !important",
              color: "#0f172a !important",
              fontSize: "0.75rem !important",
              padding: "4px 14px !important",
              borderRadius: "9999px !important",
              cursor: "pointer",
              fontWeight: 700
            }}
          >
            Sign Out
          </button>
        </div>

        {/* Centered Profile Avatar Block - Only on Vehicles tab */}
        {activeTab === "vehicles" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px", textAlign: "center" }} className="animate-fade-in">
          <div style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #a855f7, #6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(168, 85, 247, 0.25)",
            marginBottom: "16px",
            fontSize: "3rem"
          }}>
            🚗
          </div>
          
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", margin: 0, fontFamily: "var(--font-title)", letterSpacing: "-0.02em" }}>
            {customer.name}
          </h1>
          
          <span style={{
            fontSize: "0.75rem",
            background: "rgba(91, 109, 244, 0.1)",
            color: "#5b6df4",
            padding: "4px 14px",
            borderRadius: "9999px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginTop: "8px",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}>
            👤 Premium Resident
          </span>
          
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '8px', fontWeight: 600 }}>
            🏢 {customer.apartmentName} • Block {customer.blockName} ({customer.flatNo})
          </p>
        </div>
        )}

        <main style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 🚗 VEHICLES TAB */}
          {activeTab === "vehicles" && (
            <>
              {/* Active Clickable Vehicles Cards Panel */}
              <section className="glass-panel" style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                  Select Vehicle
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {customer.vehicles.map((veh, i) => {
                    const isSelected = veh.id === selectedVehicleId;
                    const logInfo = getVehicleStatusForDate(veh, vehicleLogs);
                    
                    return (
                      <div 
                        key={veh.id} 
                        onClick={() => setSelectedVehicleId(veh.id)}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '16px',
                          borderRadius: '20px',
                          border: isSelected ? '2px solid #5b6df4' : '1px solid rgba(158, 168, 253, 0.15)',
                          background: isSelected ? 'rgba(91, 109, 244, 0.04)' : 'rgba(255, 255, 255, 0.45)',
                          cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: isSelected ? '0 8px 24px rgba(91, 109, 244, 0.08)' : 'none'
                        }}
                      >
                        <div>
                          <strong style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-title)' }}>
                            {veh.licensePlate}
                          </strong>
                          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                            {veh.make} {veh.model} — {veh.planName}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span className="status-badge washed" style={{ padding: '3px 8px', fontSize: '0.7rem' }}>Active</span>
                            {renderStatusPill(logInfo.status)}
                          </div>
                          <span style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: 700 }}>
                            ₹{veh.price}/mo
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Dynamic Operations Assistant Card - Styled matching Worker Shift Screen */}
              {selectedVehicle && (
                <section className="glass-panel animate-fade-in" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {/* Left Robot Icon */}
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #a855f7, #6366f1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    boxShadow: "0 4px 12px rgba(168, 85, 247, 0.2)",
                    flexShrink: 0
                  }}>
                    🤖
                  </div>
                  
                  {/* Right Text Block */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <strong style={{ 
                      fontSize: "0.75rem", 
                      color: "#a855f7", 
                      textTransform: "uppercase", 
                      fontWeight: 800, 
                      letterSpacing: "0.05em",
                      fontFamily: "var(--font-title)"
                    }}>
                      SV Operations Assistant
                    </strong>
                    
                    <h3 style={{ 
                      fontSize: "1.1rem", 
                      fontWeight: 800, 
                      color: "#0f172a", 
                      margin: 0,
                      fontFamily: "var(--font-title)"
                    }}>
                      Hey {customer.name.split(" ")[0]}, Good morning! ☀️
                    </h3>
                    
                    <p style={{ 
                      fontSize: "0.925rem", 
                      color: "#475569", 
                      lineHeight: "1.5", 
                      margin: 0,
                      fontWeight: 500
                    }}>
                      {getAssistantMessage(customer.name, selectedVehicle.licensePlate, getVehicleStatusForDate(selectedVehicle, vehicleLogs))}
                    </p>
                  </div>
                </section>
              )}

              {/* 🗓️ One-Time Interior Cleaning — Accordion Card */}
              {selectedVehicle && selectedVehicle.vehicleType !== "bike" && (
                <section
                  className="glass-panel animate-fade-in"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    border: oneTimeOpen ? '1.5px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(158, 168, 253, 0.15)',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => setOneTimeOpen(o => !o)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.5rem' }}>🗓️</span>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-title)' }}>
                          One-Time Interior Clean
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                          Book a single session anytime — ₹50/session
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.7rem', background: 'rgba(99,102,241,0.1)', color: '#6366f1', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700, border: '1px solid rgba(99,102,241,0.2)' }}>Ad-Hoc</span>
                      {/* Chevron */}
                      <svg
                        width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: oneTimeOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', flexShrink: 0 }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {/* Accordion Body */}
                  {oneTimeOpen && (
                    <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ height: '1px', background: 'rgba(158,168,253,0.15)', marginBottom: '2px' }} />

                      {/* Success banner */}
                      {oneTimeSuccess && (
                        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '14px', padding: '12px 16px', fontSize: '0.85rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          ✅ Your one-time interior cleaning has been booked! ₹50 has been added to your billing ledger.
                        </div>
                      )}

                      {/* Active one-time requests for this vehicle */}
                      {interiorRequests.filter(r => r.vehicle_id === selectedVehicleId && r.request_type === "one_time" && r.status !== "cancelled").length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Bookings</span>
                          {interiorRequests
                            .filter(r => r.vehicle_id === selectedVehicleId && r.request_type === "one_time" && r.status !== "cancelled")
                            .map(req => (
                              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(158,168,253,0.15)', borderRadius: '14px', padding: '12px 16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                                    {req.preferred_date ? `📅 Preferred: ${req.preferred_date}` : "📅 Date flexible"}
                                  </span>
                                  {req.notes && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.notes}</span>}
                                  <span style={{ fontSize: '0.725rem', color: '#94a3b8', fontFamily: 'monospace' }}>Booked {new Date(req.requested_at).toLocaleDateString('en-IN')}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px', borderRadius: '9999px', background: req.status === 'done' ? 'rgba(16,185,129,0.12)' : req.status === 'scheduled' ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)', color: req.status === 'done' ? '#10b981' : req.status === 'scheduled' ? '#3b82f6' : '#f59e0b', border: `1px solid ${req.status === 'done' ? 'rgba(16,185,129,0.25)' : req.status === 'scheduled' ? 'rgba(59,130,246,0.25)' : 'rgba(245,158,11,0.25)'}` }}>
                                    {req.status === 'done' ? '✔ Done' : req.status === 'scheduled' ? 'Scheduled' : 'Pending'}
                                  </span>
                                  {req.status === 'pending' && (
                                    <button onClick={() => handleCancelOneTime(req.id)} style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '9999px', padding: '2px 10px', cursor: 'pointer' }}>Cancel</button>
                                  )}
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      )}

                      {/* Booking form toggle */}
                      {!showOneTimeBooking ? (
                        <button
                          onClick={() => setShowOneTimeBooking(true)}
                          style={{ padding: '12px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1.5px dashed rgba(99,102,241,0.4)', color: '#6366f1', background: 'rgba(99,102,241,0.04)', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'var(--font-title)', width: '100%' }}
                        >
                          + Book a One-Time Interior Clean
                        </button>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(99,102,241,0.04)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(99,102,241,0.12)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.775rem', color: '#475569', fontWeight: 700 }}>Preferred Date (optional)</label>
                            <input type="date" value={oneTimeDate} onChange={(e) => setOneTimeDate(e.target.value)} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(158,168,253,0.25)', background: 'rgba(255,255,255,0.8)', color: '#0f172a', fontSize: '0.875rem', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.775rem', color: '#475569', fontWeight: 700 }}>Notes (optional)</label>
                            <input type="text" value={oneTimeNotes} onChange={(e) => setOneTimeNotes(e.target.value)} placeholder="e.g. Just returned from a trip, need full detailing" style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(158,168,253,0.25)', background: 'rgba(255,255,255,0.8)', color: '#0f172a', fontSize: '0.875rem', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleOneTimeBooking} style={{ flex: 1, padding: '11px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, border: 'none', color: 'white', background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 4px 14px rgba(99,102,241,0.25)', cursor: 'pointer', fontFamily: 'var(--font-title)' }}>✅ Confirm Booking — ₹50</button>
                            <button onClick={() => { setShowOneTimeBooking(false); setOneTimeDate(''); setOneTimeNotes(''); }} style={{ padding: '11px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(100,116,139,0.2)', color: '#64748b', background: 'rgba(100,116,139,0.06)', cursor: 'pointer' }}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* 🧼 Sunday Interior Cleaning — Accordion Card */}
              {selectedVehicle && (
                <section
                  className="glass-panel animate-fade-in"
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    border: recurringOpen ? '1.5px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(158, 168, 253, 0.15)',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  {/* Accordion Header — always visible, click to toggle */}
                  <button
                    onClick={() => setRecurringOpen(o => !o)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.5rem' }}>🧼</span>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-title)' }}>
                          Sunday Interior Cleaning
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                          Cabin vacuuming &amp; dashboard dressing
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {selectedVehicle.vehicleType === 'bike' ? (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(100,116,139,0.08)', color: '#64748b', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700 }}>N/A</span>
                      ) : selectedVehicle.interiorFrequency && selectedVehicle.interiorFrequency > 0 ? (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.12)', color: '#10b981', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700, border: '1px solid rgba(16,185,129,0.25)' }}>Active (2x/Mo)</span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700, border: '1px solid rgba(245,158,11,0.25)' }}>Not Enrolled</span>
                      )}
                      {/* Chevron */}
                      <svg
                        width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: recurringOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', flexShrink: 0 }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {/* Accordion Body */}
                  {recurringOpen && (
                    <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ height: '1px', background: 'rgba(158,168,253,0.15)', marginBottom: '2px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(255,255,255,0.45)', borderRadius: '16px', padding: '14px', border: '1px solid rgba(158,168,253,0.12)' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.9rem', marginTop: '2px' }}>📅</span>
                          <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: '1.4', margin: 0, fontWeight: 500 }}>
                            <strong>Bi-Monthly Schedule:</strong> Cabin detailing performed <strong>twice a month</strong>, scheduled on <strong>Sundays</strong>.
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.9rem', marginTop: '2px' }}>💰</span>
                          <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: '1.4', margin: 0, fontWeight: 500 }}>
                            <strong>Ledger Billing:</strong> Detailing costs exactly <strong>₹50</strong> per cleaning (₹100/mo) and is added automatically to your monthly billing ledger.
                          </p>
                        </div>
                      </div>
                      {selectedVehicle.vehicleType === 'bike' ? (
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, fontStyle: 'italic', textAlign: 'center' }}>
                          ⚠️ Sunday interior cleaning is available for cars, SUVs, and hatchbacks only.
                        </p>
                      ) : selectedVehicle.interiorFrequency && selectedVehicle.interiorFrequency > 0 ? (
                        <button
                          onClick={() => toggleInteriorCleaning(selectedVehicle.id)}
                          className="btn-secondary"
                          style={{ padding: '12px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 700, justifyContent: 'center', width: '100%', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', background: 'rgba(239,68,68,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          ❌ Cancel Interior Cleaning Request
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleInteriorCleaning(selectedVehicle.id)}
                          style={{ padding: '12px', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 700, justifyContent: 'center', width: '100%', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', color: 'white', fontFamily: 'var(--font-title)', background: 'linear-gradient(135deg, #a855f7, #6366f1)', boxShadow: '0 6px 16px rgba(168,85,247,0.25)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        >
                          ✨ Opt-In for Interior Cleaning (₹100/mo)
                        </button>
                      )}
                    </div>
                  )}
                </section>
              )}
            </>
          )}

          {/* 💳 BILLING TAB */}
          {activeTab === "billing" && (
            <CustomerBillingPanel payments={payments} customer={customer} />
          )}

          {/* 💬 SUPPORT FEEDBACK TAB */}
          {activeTab === "support" && (
            <CustomerSupportPanel 
              activeComplaints={activeComplaints}
              complaintText={complaintText}
              setComplaintText={setComplaintText}
              complaintSuccess={complaintSuccess}
              onSubmit={handleComplaintSubmit}
              customer={customer}
              assignedWasher={assignedWasher}
              assignedSupervisor={assignedSupervisor}
            />
          )}
        </main>
      </div>

      {/* Sleek Floating PWA Navigation Bottom Bar for Customer */}
      <nav className="customer-floating-nav">
        <button
          onClick={() => setActiveTab("vehicles")}
          className={`customer-tab-button ${activeTab === "vehicles" ? "active" : ""}`}
        >
          <span style={{ fontSize: "1.35rem" }}>🚗</span>
          <span>Vehicles</span>
          <div className="active-bar" />
        </button>

        <button
          onClick={() => setActiveTab("billing")}
          className={`customer-tab-button ${activeTab === "billing" ? "active" : ""}`}
        >
          <span style={{ fontSize: "1.35rem" }}>💳</span>
          <span>Billing</span>
          <div className="active-bar" />
        </button>

        <button
          onClick={() => setActiveTab("support")}
          className={`customer-tab-button ${activeTab === "support" ? "active" : ""}`}
        >
          <span style={{ fontSize: "1.35rem" }}>💬</span>
          <span>Support</span>
          <div className="active-bar" />
        </button>
      </nav>
    </div>
  );
}
