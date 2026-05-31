"use client";

import Modal from "@/components/ui/Modal";

interface DeleteWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  workerName: string;
  onConfirm: () => Promise<void>;
}

export default function DeleteWorkerModal({
  isOpen,
  onClose,
  workerName,
  onConfirm
}: DeleteWorkerModalProps) {
  const handleDeleteConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to delete worker.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Employee Termination">
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "10px 0" }}>
        <p style={{ color: "hsl(var(--text-secondary))", lineHeight: "1.6" }}>
          Are you sure you want to terminate and delete **{workerName}**?
        </p>
        <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid hsl(var(--warning))", padding: "12px", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "hsl(var(--warning))" }}>
          🗑️ **Recycle Bin Notice**: This employee profile and all their assigned work roster allocations will be safely moved to the **Trash Bin**. You can check the Trash Bin later to restore them.
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "10px", justifyContent: "flex-end" }}>
          <button 
            onClick={onClose}
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
  );
}
