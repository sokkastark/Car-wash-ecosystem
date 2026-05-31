import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large" | "xlarge";
}

/**
 * ISO-Standard Reusable Dialog Overlay.
 * Under 250 lines. Features smooth slide-up animation and glass backdrop blur.
 */
export default function Modal({ isOpen, onClose, title, children, size = "medium" }: ModalProps) {
  if (!isOpen) return null;

  const maxWidths = {
    small: "400px",
    medium: "480px",
    large: "760px",
    xlarge: "1100px"
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(15, 23, 42, 0.65)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: 'center',
      zIndex: 1000,
      padding: "20px"
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: "100%",
          maxWidth: maxWidths[size],
          padding: "24px",
          background: "hsl(var(--bg-card))",
          animation: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
        }}
      >
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700 }}>{title}</h2>
          <button 
            onClick={onClose} 
            style={{
              background: "none",
              border: "none",
              color: "hsl(var(--text-secondary))",
              fontSize: "1.5rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center"
            }}
          >
            &times;
          </button>
        </header>
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
