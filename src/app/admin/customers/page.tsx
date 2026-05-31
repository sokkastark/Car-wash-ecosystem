"use client";

import { useState } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import Modal from "@/components/ui/Modal";
import CustomerDialog from "./components/CustomerDialog";
import CustomersSummaryTable from "./components/CustomersSummaryTable";

export default function CustomersRegistry() {
  const { 
    customersDetailed, 
    apartments, 
    plans,
    workers,
    loading, 
    addCustomerDetailed, 
    updateCustomerDetailed, 
    deleteCustomerDetailed 
  } = useAdminData();

  // Accordion Expanded/Collapsed State
  const [expandedAptIds, setExpandedAptIds] = useState<Record<string, boolean>>({
    "b4c5d600-e102-4d1a-821b-cfc12dcd3422": true,
    "prestige-shantiniketan": true,
    "sobha-dream-acres": true
  });

  // Modal and Selection States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const toggleAccordion = (aptId: string) => {
    setExpandedAptIds(prev => ({
      ...prev,
      [aptId]: !prev[aptId]
    }));
  };

  const handleRegisterSubmit = async (payload: any) => {
    return await addCustomerDetailed(payload);
  };

  const handleEditSubmit = async (payload: any) => {
    if (!selectedCustomer) return false;
    return await updateCustomerDetailed(selectedCustomer.id, payload);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return;
    const res = await deleteCustomerDetailed(selectedCustomer.id);
    if (res) {
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
    }
  };

  return (
    <>
      <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }} className="animate-fade-in">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <span style={{ color: "hsl(var(--primary))", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, fontSize: "0.8rem" }}>
              Residents Registry
            </span>
            <h1 style={{ fontSize: "2.2rem", marginTop: "4px" }}>Customers & Subscriptions</h1>
            <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px", fontSize: "0.9rem" }}>
              Grouped complex-wise. Supports multiple vehicles, overridden custom plan prices, designated cleaners, and summary billing.
            </p>
          </div>
          <button onClick={() => { setSelectedCustomer(null); setIsAddModalOpen(true); }} className="btn-primary">
            + Register Resident
          </button>
        </header>

        {/* Complex-wise Grouped Accordions */}
        {loading && customersDetailed.length === 0 ? (
          <div style={{ color: "hsl(var(--text-secondary))", padding: "40px 0" }}>Fetching resident registries...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {apartments.map(apt => {
              const aptCustomers = customersDetailed.filter(c => c.apartmentId === apt.id);
              const isExpanded = !!expandedAptIds[apt.id];

              return (
                <section key={apt.id} className="glass-panel" style={{ overflow: "hidden" }}>
                  {/* Accordion Trigger Header */}
                  <header 
                    onClick={() => toggleAccordion(apt.id)}
                    style={{
                      padding: "20px 24px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      background: "hsla(var(--bg-card) / 0.8)",
                      borderBottom: isExpanded ? "1px solid hsl(var(--border-muted))" : "none",
                      transition: "var(--transition-smooth)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "1.35rem" }}>🏢</span>
                      <div>
                        <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{apt.name}</h2>
                        <span style={{ fontSize: "0.8rem", color: "hsl(var(--text-secondary))" }}>
                          {aptCustomers.length} Residents Registered
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: "1.2rem", transition: "var(--transition-smooth)", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>
                      ▼
                    </span>
                  </header>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div style={{ padding: "12px 24px" }}>
                      <CustomersSummaryTable 
                        customers={aptCustomers}
                        onEdit={(cust) => { setSelectedCustomer(cust); setIsEditModalOpen(true); }}
                        onDelete={(cust) => { setSelectedCustomer(cust); setIsDeleteModalOpen(true); }}
                      />
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <CustomerDialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleRegisterSubmit}
        title="Register Complex Resident"
        submitLabel="Confirm Registration"
        apartments={apartments}
        plans={plans}
        workers={workers}
      />

      {/* Edit Dialog */}
      <CustomerDialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        title="Edit Profile & Subscriptions"
        submitLabel="Confirm Edits"
        customer={selectedCustomer}
        apartments={apartments}
        plans={plans}
        workers={workers}
      />

      {/* Delete Confirmation */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Profile Termination">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
          <p style={{ color: "hsl(var(--text-secondary))", lineHeight: "1.6" }}>
            Are you sure you want to terminate the profile and all active subscriptions for **{selectedCustomer?.name}**?
          </p>
          <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid hsl(var(--warning))", padding: "12px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "hsl(var(--warning))" }}>
            🗑️ **Recycle Bin Notice**: This resident profile and all nested vehicle configurations will be archived in the **Trash Bin**. You can check the Trash Bin later to restore them.
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "10px", justifyContent: "flex-end" }}>
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              style={{ padding: "10px 18px", background: "hsl(var(--border-muted))", border: "none", borderRadius: "var(--radius-md)", color: "white", cursor: "pointer", fontWeight: 600 }}
            >
              Cancel
            </button>
            <button 
              onClick={handleDeleteConfirm}
              style={{
                padding: "10px 18px",
                background: "hsl(var(--danger))",
                border: "none",
                borderRadius: "var(--radius-md)",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
                boxShadow: "0 4px 14px 0 rgba(239, 68, 68, 0.4)"
              }}
            >
              Move to Trash
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
