"use client";

import * as React from "react";
import { useWarMapStore } from "./WarMap3DCanvas";

interface LogEntry {
  time: string;
  event: string;
  detail: string;
  category: string;
}

// Global styles injected once
if (typeof window !== "undefined" && !window.__BOTTOMBAR_STYLES_INJECTED__) {
  window.__BOTTOMBAR_STYLES_INJECTED__ = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

export function BottomBar() {
  const logEntries = useWarMapStore((s) => s.logEntries);
  const [logIndex, setLogIndex] = React.useState(0);

  React.useEffect(() => {
    if (logEntries.length === 0) return;
    const interval = setInterval(() => setLogIndex((prev) => (prev + 1) % logEntries.length), 5000);
    return () => clearInterval(interval);
  }, [logEntries.length]);

  const visibleLogs = logEntries.slice(logIndex, Math.min(logIndex + 4, logEntries.length));

  const categoryColors: Record<string, string> = {
    "Physical Training": "#2ECC71",
    "Algorithmic": "#FFB347",
    "SaaS Architecture": "#4DD8E8",
    "System Engineering": "#3FE0A0",
    "Strategic Analysis": "#FF4D5E",
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "56px",
        zIndex: 20,
        pointerEvents: "auto",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        background: "rgba(5, 8, 16, 0.95)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(77, 216, 232, 0.3)",
        boxShadow: "0 -2px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(77, 216, 232, 0.1)",
        fontFamily: "var(--wm-font-mono)",
        fontSize: "0.6rem",
        color: "#4DD8E8",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, overflow: "hidden" }}>
        {visibleLogs.map((log, i) => (
          <div
            key={`${log.time}-${log.event}-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "4px 0",
              whiteSpace: "nowrap",
              animation: i === 0 ? "slideIn 0.3s ease-out" : "none",
              opacity: 1 - i * 0.15,
            }}
          >
            <span style={{ opacity: 0.5, fontFamily: "var(--wm-font-display)", fontSize: "0.55rem", minWidth: "50px" }}>
              {log.time}
            </span>
            <span style={{ color: "#FFB347", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", minWidth: "120px" }}>
              {log.event}
            </span>
            <span style={{ opacity: 0.8, flex: 1 }}>
              {log.detail}
            </span>
            <span
              style={{
                fontSize: "0.5rem",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "3px",
                background: `${categoryColors[log.category] || "#4DD8E8"}20`,
                border: `1px solid ${categoryColors[log.category] || "#4DD8E8"}`,
                color: categoryColors[log.category] || "#4DD8E8",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {log.category.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}