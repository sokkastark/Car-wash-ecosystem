"use client";

import { useState } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import ComplexDialog from "./components/ComplexDialog";
import PricingDialog from "./components/PricingDialog";

export default function ComplexesManager() {
  const { 
    apartments, 
    plans,
    loading, 
    error, 
    addApartment, 
    updateApartment, 
    deleteApartment, 
    addBlock,
    deleteBlock,
    getComplexPlanPrices,
    saveComplexPlanPrices
  } = useAdminData();

  // Modals visibility state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteBlockModalOpen, setIsDeleteBlockModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  
  // Selected Context for Edit/Delete
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [selectedBlock, setSelectedBlock] = useState<any>(null);

  // Block Form State
  const [blockName, setBlockName] = useState("");
  const [blockFormError, setBlockFormError] = useState<string | null>(null);

  const handleRegisterSubmit = async (name: string, address: string, city: string) => {
    return await addApartment(name, address, city);
  };

  const handleEditSubmit = async (name: string, address: string, city: string) => {
    if (!selectedApt) return;
    return await updateApartment(selectedApt.id, name, address, city);
  };

  const handlePricingSubmit = async (pricesArray: any[]) => {
    if (!selectedApt) return;
    return await saveComplexPlanPrices(selectedApt.id, pricesArray);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedApt) return;
    const res = await deleteApartment(selectedApt.id);
    if (res) {
      setIsDeleteModalOpen(false);
      setSelectedApt(null);
    }
  };

  const handleDeleteBlockConfirm = async () => {
    if (!selectedBlock) return;
    const res = await deleteBlock(selectedBlock.id);
    if (res) {
      setIsDeleteBlockModalOpen(false);
      setSelectedApt(null);
      setSelectedBlock(null);
    }
  };

  const handleAddBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlockFormError(null);
    if (!blockName.trim()) {
      setBlockFormError("Block name is required.");
      return;
    }
    if (!selectedApt) return;
    try {
      await addBlock(selectedApt.id, blockName);
      setIsBlockModalOpen(false);
      setBlockName("");
      setSelectedApt(null);
    } catch (err: any) {
      setBlockFormError(err.message || "Failed to add block.");
    }
  };

  return (
    <>
      <div style={{ padding: "40px 24px", maxWidth: "1000px", margin: "0 auto" }} className="animate-fade-in">
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <span style={{ color: "hsl(var(--primary))", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, fontSize: "0.8rem" }}>
              Locations Register
            </span>
            <h1 style={{ fontSize: "2.2rem", marginTop: "4px" }}>Complexes & Gated Areas</h1>
          </div>
          <button onClick={() => { setSelectedApt(null); setIsAddModalOpen(true); }} className="btn-primary">
            Add New Complex
          </button>
        </header>

        {error && <div style={{ color: "hsl(var(--danger))", marginBottom: "20px" }}>Error loading data: {error}</div>}

        {loading && apartments.length === 0 ? (
          <div style={{ color: "hsl(var(--text-secondary))", padding: "40px 0" }}>Fetching complexes records...</div>
        ) : (
          <Table headers={["Complex Name", "City/Location", "Address", "Structural Blocks", "Actions"]}>
            {apartments.map((apt) => (
              <tr key={apt.id} style={{ borderBottom: "1px solid hsl(var(--border-muted))" }}>
                <td style={{ padding: "16px", fontWeight: 600 }}>{apt.name}</td>
                <td style={{ padding: "16px", color: "hsl(var(--text-secondary))" }}>{apt.city || "N/A"}</td>
                <td style={{ padding: "16px", color: "hsl(var(--text-secondary))", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {apt.address || "N/A"}
                </td>
                <td style={{ padding: "16px" }}>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                    {apt.blocks && apt.blocks.length > 0 ? (
                      apt.blocks.map(b => (
                        <span 
                          key={b.id} 
                          style={{ 
                            fontSize: "0.75rem", 
                            padding: "4px 8px", 
                            background: "hsl(var(--border-muted))", 
                            borderRadius: "var(--radius-sm)", 
                            color: "hsl(var(--text-secondary))",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          {b.name}
                          <button
                            onClick={() => { setSelectedApt(apt); setSelectedBlock(b); setIsDeleteBlockModalOpen(true); }}
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "hsl(var(--text-muted))",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              padding: "0 2px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              lineHeight: 1,
                              transition: "var(--transition-smooth)"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "hsl(var(--danger))"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "hsl(var(--text-muted))"}
                            title="Delete Block"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "hsl(var(--text-muted))" }}>No blocks added</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: "16px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      onClick={() => { setSelectedApt(apt); setIsBlockModalOpen(true); setBlockName(""); setBlockFormError(null); }}
                      style={{ fontSize: "0.75rem", padding: "6px 12px", background: "hsla(var(--primary) / 0.15)", border: "1px dashed hsl(var(--primary))", borderRadius: "var(--radius-sm)", color: "hsl(var(--primary))", cursor: "pointer", fontWeight: 600, transition: "var(--transition-smooth)" }}
                    >
                      + Block
                    </button>
                    <button 
                      onClick={() => { setSelectedApt(apt); setIsEditModalOpen(true); }}
                      style={{ fontSize: "0.75rem", padding: "6px 12px", background: "hsl(var(--border-muted))", border: "none", borderRadius: "var(--radius-sm)", color: "white", cursor: "pointer", fontWeight: 600 }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => { setSelectedApt(apt); setIsPricingModalOpen(true); }}
                      style={{ fontSize: "0.75rem", padding: "6px 12px", background: "hsla(var(--warning) / 0.15)", border: "1px solid hsl(var(--warning))", borderRadius: "var(--radius-sm)", color: "hsl(var(--warning))", cursor: "pointer", fontWeight: 600, transition: "var(--transition-smooth)" }}
                    >
                      ⚙️ Prices
                    </button>
                    <button 
                      onClick={() => { setSelectedApt(apt); setIsDeleteModalOpen(true); }}
                      style={{ fontSize: "0.75rem", padding: "6px 12px", background: "hsla(var(--danger) / 0.15)", border: "none", borderRadius: "var(--radius-sm)", color: "hsl(var(--danger))", cursor: "pointer", fontWeight: 600 }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>

      {/* Add Gated Complex Modal */}
      <ComplexDialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleRegisterSubmit}
        title="Register Complex"
        submitLabel="Confirm Registration"
      />

      {/* Edit Gated Complex Modal */}
      <ComplexDialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        title="Edit Complex Details"
        submitLabel="Confirm Edits"
        apartment={selectedApt}
      />

      {/* Price Overrides Settings Modal */}
      <PricingDialog
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onSubmit={handlePricingSubmit}
        apartment={selectedApt}
        plans={plans}
        getComplexPlanPrices={getComplexPlanPrices}
      />

      {/* Block Creation Modal */}
      <Modal isOpen={isBlockModalOpen} onClose={() => { setIsBlockModalOpen(false); setSelectedApt(null); setBlockName(""); setBlockFormError(null); }} title={selectedApt ? `Add Block to ${selectedApt.name}` : "Add Structural Block"}>
        <form onSubmit={handleAddBlockSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {blockFormError && <div style={{ color: "hsl(var(--danger))", fontSize: "0.85rem" }}>{blockFormError}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.85rem", color: "hsl(var(--text-secondary))" }}>Block Name / Wing</label>
            <input type="text" value={blockName} onChange={(e) => setBlockName(e.target.value)} placeholder="e.g. Block D, Tower 3, Wing B" style={{ padding: "12px", background: "hsl(var(--bg-dark))", border: "1px solid hsl(var(--border-muted))", borderRadius: "var(--radius-md)", color: "white" }} />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: "8px", justifyContent: "center" }}>
            Confirm Block Addition
          </button>
        </form>
      </Modal>

      {/* Complex Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Complex Deletion">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
          <p style={{ color: "hsl(var(--text-secondary))", lineHeight: "1.6" }}>
            Are you sure you want to delete the gated complex **{selectedApt?.name}**?
          </p>
          <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid hsl(var(--warning))", padding: "12px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "hsl(var(--warning))" }}>
            🗑️ **Recycle Bin Notice**: All structural blocks, resident rosters, and vehicle logs under this complex will be safely archived in the **Trash Bin**. You can check the Trash Bin later to restore them.
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "10px", justifyContent: "flex-end" }}>
            <button onClick={() => setIsDeleteModalOpen(false)} style={{ padding: "10px 18px", background: "hsl(var(--border-muted))", border: "none", borderRadius: "var(--radius-md)", color: "white", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
            <button onClick={handleDeleteConfirm} style={{ padding: "10px 18px", background: "hsl(var(--danger))", border: "none", borderRadius: "var(--radius-md)", color: "white", cursor: "pointer", fontWeight: 600, boxShadow: "0 4px 14px 0 rgba(239, 68, 68, 0.4)" }}>Move to Trash</button>
          </div>
        </div>
      </Modal>

      {/* Block Delete Modal */}
      <Modal isOpen={isDeleteBlockModalOpen} onClose={() => { setIsDeleteBlockModalOpen(false); setSelectedApt(null); setSelectedBlock(null); }} title="Confirm Block Deletion">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
          <p style={{ color: "hsl(var(--text-secondary))", lineHeight: "1.6" }}>
            Are you sure you want to delete the block **{selectedBlock?.name}** under **{selectedApt?.name}**?
          </p>
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid hsl(var(--danger))", padding: "12px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "hsl(var(--danger))" }}>
            ⚠️ **Relational Impact**: Any residents assigned to this block will be kept, but their assigned Block will be reset to "None".
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "10px", justifyContent: "flex-end" }}>
            <button onClick={() => { setIsDeleteBlockModalOpen(false); setSelectedApt(null); setSelectedBlock(null); }} style={{ padding: "10px 18px", background: "hsl(var(--border-muted))", border: "none", borderRadius: "var(--radius-md)", color: "white", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
            <button onClick={handleDeleteBlockConfirm} style={{ padding: "10px 18px", background: "hsl(var(--danger))", border: "none", borderRadius: "var(--radius-md)", color: "white", cursor: "pointer", fontWeight: 600, boxShadow: "0 4px 14px 0 rgba(239, 68, 68, 0.4)" }}>Delete Block</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
