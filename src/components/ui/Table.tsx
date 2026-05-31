import React from "react";

interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

/**
 * ISO-Standard Reusable Tabular Data Grid.
 * Under 250 lines. Supports responsive scrolling and custom headers.
 */
export default function Table({ headers, children }: TableProps) {
  return (
    <div style={{ width: "100%", overflowX: "auto", margin: "16px 0" }}>
      <table style={{
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: "0 8px",
        fontFamily: "var(--font-body)",
        fontSize: "0.95rem"
      }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th 
                key={i} 
                style={{
                  color: "hsl(var(--text-secondary))",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  padding: "12px 16px",
                  textAlign: "left"
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}
