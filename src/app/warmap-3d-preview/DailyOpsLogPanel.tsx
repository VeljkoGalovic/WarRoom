"use client";

import * as React from "react";
import { useWarMapStore } from "./WarMap3DCanvas";

interface LogEntry {
  time: string;
  category: string;
  message: string;
  color: string;
}

// Global styles injected once
if (typeof window !== "undefined" && !window.__DAILY_OPS_LOG_STYLES_INJECTED__) {
  window.__DAILY_OPS_LOG_STYLES_INJECTED__ = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slide-in {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse-accent {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);
}

const INITIAL_LOGS: LogEntry[] = [
  { time: "06:42:13", category: "PHYSICAL", message: "Morning PT complete — 5km run, 100 pullups", color: "#2ECC71" },
  { time: "07:15:00", category: "ALGORITHMIC", message: "LeetCode Daily: Two Sum (Medium) — Solved in 12min", color: "#FFB347" },
  { time: "08:00:45", category: "SYSTEMS", message: "Architecture review: Auth service migration to NextAuth v5", color: "#4DD8E8" },
  { time: "09:30:22", category: "PHYSICAL", message: "Gym session: Push/Pull/Legs — Week 3 Day 2", color: "#2ECC71" },
  { time: "11:15:00", category: "ALGORITHMIC", message: "Codeforces Round #892 — Rating change: +24", color: "#FFB347" },
  { time: "14:00:00", category: "SYSTEMS", message: "Deploy War Room v2.3 to Vercel — Build passing", color: "#4DD8E8" },
  { time: "15:42:10", category: "PHYSICAL", message: "Recovery: Mobility flow + cold exposure 3min", color: "#2ECC71" },
  { time: "16:30:00", category: "ALGORITHMIC", message: "Graph algorithms study: Dijkstra + A* implementation", color: "#FFB347" },
  { time: "18:00:00", category: "SYSTEMS", message: "Database migration: Prisma schema v4.2 — Zero downtime", color: "#4DD8E8" },
  { time: "19:15:33", category: "PHYSICAL", message: "Evening ruck: 10kg / 5km — HR zone 2 maintained", color: "#2ECC71" },
];

const categoryLabels: Record<string, string> = {
  PHYSICAL: "PHYSICAL",
  ALGORITHMIC: "ALGORITHMIC",
  SYSTEMS: "SYSTEMS",
};

export function DailyOpsLogPanel() {
  const { logEntries } = useWarMapStore((s) => ({ logEntries: s.logEntries }));

  // Combine initial logs with dynamic logs from store
  const allLogs = React.useMemo(() => [...logEntries, ...INITIAL_LOGS].slice(0, 15), [logEntries]);

  return (
    <aside
      style={{
        position: "fixed",
        top: "60px",
        right: 0,
        bottom: "40px",
        width: "380px",
        zIndex: 20,
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        background: "rgba(8, 12, 22, 0.9)",
        backdropFilter: "blur(16px)",
        borderLeft: "1px solid rgba(77, 216, 232, 0.2)",
        fontFamily: "var(--wm-font-mono)",
        color: "#E8EEF4",
        overflow: "hidden",
        boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(77, 216, 232, 0.05)",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid rgba(77, 216, 232, 0.15)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}>
        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4DD8E8", boxShadow: "0 0 10px #4DD8E8" }} />
        <div style={{
          fontFamily: "var(--wm-font-display)",
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#4DD8E8",
          textShadow: "0 0 8px #4DD8E8",
        }}>
          DAILY OPERATIONS LOG
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: "0.55rem", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {allLogs.length} ENTRIES
        </div>
      </div>

      {/* Log Entries */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {allLogs.map((log, index) => (
          <div
            key={`${log.time}-${log.category}-${index}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              padding: "10px 12px",
              background: "rgba(5, 8, 16, 0.5)",
              borderLeft: `3px solid ${log.color}`,
              borderRadius: "0 6px 6px 0",
              transition: "all 0.2s ease",
              animation: `slide-in 0.3s ease-out ${index * 0.05}s both`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(77, 216, 232, 0.08)";
              e.currentTarget.style.borderLeftWidth = "4px";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(5, 8, 16, 0.5)";
              e.currentTarget.style.borderLeftWidth = "3px";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 600, fontFamily: "var(--wm-font-mono)", color: "#8B9CB3", minWidth: "55px" }}>
                {log.time}
              </span>
              <span
                style={{
                  fontSize: "0.5rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "3px",
                  background: `${log.color}20`,
                  border: `1px solid ${log.color}40`,
                  color: log.color,
                  whiteSpace: "nowrap",
                }}
              >
                {categoryLabels[log.category] || log.category}
              </span>
            </div>
            <div style={{ fontSize: "0.65rem", lineHeight: "1.5", color: "#CBD5E1", paddingLeft: "65px" }}>
              {log.message}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}