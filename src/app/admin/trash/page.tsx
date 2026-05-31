"use client";

import { useState } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";

export default function TrashBinManager() {
  const { trashItems, restoreItem, purgeItemPermanently, loading } = useAdminData();

  // Dialog safety states
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const openPurgeModal = (item: any) => {
    setSelectedItem(item);
    setIsPurgeModalOpen(true);
  };

  const handlePurgeConfirm = async () => {
    if (!selectedItem) return;
    const res = await purgeItemPermanently(selectedItem.id);
    if (res) {
      setIsPurgeModalOpen(false);
      setSelectedItem(null);
    }
  };

  const getEntityTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      complex: "Apartment Complex",
      worker: "Staff Cleaner",
      customer: "Resident Profile"
    };
    return map[type] || "Database Record";
  };

  const getEntityTypeColor = (type: string) => {
    const map: Record<string, string> = {
      complex: "hsl(var(--primary))",
      worker: "hsl(var(--success))",
      customer: "hsl(var(--warning))"
    };
    return map[type] || "white";
  };

  return (
    <div style={{ padding: "40px 24px", maxWidth: "1000px", margin: "0 auto" }} className="animate-fade-in">
      <header style={{ marginBottom: "32px" }}>
        <span style={{ color: "hsl(var(--danger))", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, fontSize: "0.8rem" }}>
          Recycle Console
        </span>
        <h1 style={{ fontSize: "2.2rem", marginTop: "4px" }}>🗑️ Operations Trash Bin</h1>
        <p style={{ color: "hsl(var(--text-secondary))", marginTop: "4px", fontSize: "0.9rem" }}>
          Accidents happen! Items deleted across Complexes, Workforce, or Customer rosters are archived here. You can restore them fully with their blocks/vehicles intact or destroy them forever.
        </p>
      </header>

      {loading && trashItems.length === 0 ? (
        <div style={{ color: "hsl(var(--text-secondary))", padding: "40px 0" }}>Fetching archived registries...</div>
      ) : (
        <div>
          {trashItems.length === 0 ? (
            <section className="glass-panel" style={{ padding: "60px 20px", textAlign: "center" }}>
              <span style={{ fontSize: "3.5rem", display: "block", marginBottom: "16px" }}>🗑️</span>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", color: "hsl(var(--text-secondary))" }}>Trash Bin is empty</h3>
              <p style={{ color: "hsl(var(--text-muted))", fontSize: "0.85rem" }}>
                No archived complexes, workers, or customers are currently in the Recycle Bin.
              </p>
            </section>
          ) : (
            <Table headers={["Archived Item", "Record Type", "Deleted On", "Actions"]}>
              {trashItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid hsl(var(--border-muted))" }}>
                  <td style={{ padding: "16px" }}>
                    <strong style={{ fontSize: "1.05rem" }}>{item.name}</strong>
                    <span style={{ display: "block", fontSize: "0.75rem", color: "hsl(var(--text-muted))" }}>
                      ID: {item.id}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{
                      fontSize: "0.75rem",
                      padding: "4px 8px",
                      background: "hsla(var(--bg-dark) / 0.5)",
                      borderRadius: "var(--radius-sm)",
                      color: getEntityTypeColor(item.type),
                      border: "1px solid",
                      borderColor: getEntityTypeColor(item.type),
                      fontWeight: 600
                    }}>
                      {getEntityTypeLabel(item.type)}
                    </span>
                  </td>
                  <td style={{ padding: "16px", color: "hsl(var(--text-secondary))", fontSize: "0.9rem" }}>
                    {new Date(item.deleted_at).toLocaleDateString()} at {new Date(item.deleted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => restoreItem(item.id)}
                        style={{
                          padding: "6px 12px",
                          background: "hsla(var(--success) / 0.15)",
                          border: "none",
                          color: "hsl(var(--success))",
                          borderRadius: "var(--radius-sm)",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          transition: "var(--transition-smooth)"
                        }}
                      >
                        Restore
                      </button>
                      <button 
                        onClick={() => openPurgeModal(item)}
                        style={{
                          padding: "6px 12px",
                          background: "hsla(var(--danger) / 0.15)",
                          border: "none",
                          color: "hsl(var(--danger))",
                          borderRadius: "var(--radius-sm)",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          transition: "var(--transition-smooth)"
                        }}
                      >
                        Purge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      )}

      {/* Permanent Purge Warning Modal */}
      <Modal isOpen={isPurgeModalOpen} onClose={() => setIsPurgeModalOpen(false)} title="Confirm Permanent Destruction">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
          <p style={{ color: "hsl(var(--text-secondary))", lineHeight: "1.6" }}>
            Are you sure you want to permanently destroy and purge **{selectedItem?.name}** from local storage?
          </p>
          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid hsl(var(--danger))", padding: "12px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "hsl(var(--danger))" }}>
            🚨 **Permanent Purge**: This will erase all relational blocks, rosters, and vehicle billing items permanently from browser memory. **This action cannot be undone!**
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "10px", justifyContent: "flex-end" }}>
            <button 
              onClick={() => setIsPurgeModalOpen(false)}
              style={{
                padding: "10px 18px",
                background: "hsl(var(--border-muted))",
                border: "none",
                borderRadius: "var(--radius-md)",
                color: "white",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handlePurgeConfirm}
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
              Purge Permanently
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
