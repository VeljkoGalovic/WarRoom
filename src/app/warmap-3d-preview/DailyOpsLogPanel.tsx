"use client";

import * as React from "react";
import { useShallow } from "zustand/react/shallow";
import { useWarMapStore } from "./WarMap3DCanvas";

interface LogEntry {
  id: string,
  time: string;
  category: string;
  message: string;
  color: string;
}

declare global {
  interface Window {
    __DAILY_OPS_LOG_STYLES_INJECTED__?: boolean;
  }
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
    @keyframes corner-pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    @keyframes scan-line {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;
  document.head.appendChild(style);
}

const INITIAL_LOGS: LogEntry[] = [
  { id: "init-1", time: "06:42:13", category: "PHYSICAL", message: "Morning PT complete — 5km run, 100 pullups", color: "#2ECC71" },
  { id: "init-2", time: "07:15:00", category: "ALGORITHMIC", message: "LeetCode Daily: Two Sum (Medium) — Solved in 12min", color: "#FFB347" },
  { id: "init-3", time: "08:00:45", category: "SYSTEMS", message: "Architecture review: Auth service migration to NextAuth v5", color: "#4DD8E8" },
  { id: "init-4", time: "09:30:22", category: "PHYSICAL", message: "Gym session: Push/Pull/Legs — Week 3 Day 2", color: "#2ECC71" },
  { id: "init-5", time: "11:15:00", category: "ALGORITHMIC", message: "Codeforces Round #892 — Rating change: +24", color: "#FFB347" },
  { id: "init-6", time: "14:00:00", category: "SYSTEMS", message: "Deploy War Room v2.3 to Vercel — Build passing", color: "#4DD8E8" },
  { id: "init-7", time: "15:42:10", category: "PHYSICAL", message: "Recovery: Mobility flow + cold exposure 3min", color: "#2ECC71" },
  { id: "init-8", time: "17:20:00", category: "ALGORITHMIC", message: "Graph algorithms: Dijkstra shortest path implementation", color: "#FFB347" },
  { id: "init-9", time: "20:00:00", category: "ALGORITHMIC", message: "Dynamic programming: Knapsack optimization patterns", color: "#FFB347" },
  { id: "init-10",time: "21:30:00", category: "SYSTEMS", message: "Code review: PR #2847 merged to main branch", color: "#4DD8E8" },
];

const categoryConfig = {
  PHYSICAL: { label: "PHYSICAL", color: "#2ECC71", icon: "▲" },
  ALGORITHMIC: { label: "ALGORITHMIC", color: "#FFB347", icon: "◆" },
  SYSTEMS: { label: "SYSTEMS", color: "#4DD8E8", icon: "●" },
} as const;

// Memoized log entry - only re-renders if its specific data changes
const LogEntryItem = React.memo(function LogEntryItem({ log, index }: { log: LogEntry; index: number }) {
  const cat = categoryConfig[log.category as keyof typeof categoryConfig] || categoryConfig.SYSTEMS;

  return (
    <div
      key={log.time}
      style={{
        animation: `slide-in 0.4s ease-out ${index * 0.03}s both`,
        background: "rgba(5, 8, 16, 0.3)",
        border: "1px solid rgba(77, 216, 232, 0.08)",
        borderLeft: `3px solid ${cat.color}`,
        borderRadius: "0 6px 6px 0",
        padding: "10px 12px",
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        {/* Time & Category */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "70px", flexShrink: 0 }}>
          <div style={{
            fontFamily: "var(--wm-font-mono)",
            fontSize: "0.6rem",
            fontVariantNumeric: "tabular-nums",
            color: "rgba(77, 216, 232, 0.9)",
            fontWeight: 600,
          }}>{log.time}</div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            fontSize: "0.45rem",
            letterSpacing: "0.05em",
            padding: "1px 5px",
            background: `${cat.color}15`,
            border: `1px solid ${cat.color}30`,
            borderRadius: "2px",
            color: cat.color,
            width: "fit-content",
          }}>
            <span>{cat.icon}</span>
            {cat.label}
          </div>
        </div>

        {/* Message */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: "0.65rem",
            letterSpacing: "0.02em",
            lineHeight: 1.5,
            color: "#E2E8F0",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}>{log.message}</div>
        </div>
      </div>
    </div>
  );
});

// Memoized corner notches
const LogCornerNotches = React.memo(function LogCornerNotches() {
  return (
    <>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "20px",
        height: "20px",
        borderTop: "1px solid rgba(77, 216, 232, 0.35)",
        borderLeft: "1px solid rgba(77, 216, 232, 0.35)",
        pointerEvents: "none",
        animation: "corner-pulse 4s ease-in-out infinite 0.5s",
      }} />
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "20px",
        height: "20px",
        borderTop: "1px solid rgba(77, 216, 232, 0.35)",
        borderRight: "1px solid rgba(77, 216, 232, 0.35)",
        pointerEvents: "none",
        animation: "corner-pulse 4s ease-in-out infinite 1.5s",
      }} />
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "20px",
        height: "20px",
        borderBottom: "1px solid rgba(77, 216, 232, 0.35)",
        borderLeft: "1px solid rgba(77, 216, 232, 0.35)",
        pointerEvents: "none",
        animation: "corner-pulse 4s ease-in-out infinite 2.5s",
      }} />
      <div style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        width: "20px",
        height: "20px",
        borderBottom: "1px solid rgba(77, 216, 232, 0.35)",
        borderRight: "1px solid rgba(77, 216, 232, 0.35)",
        pointerEvents: "none",
        animation: "corner-pulse 4s ease-in-out infinite 3.5s",
      }} />
    </>
  );
});

// Memoized header
const LogHeader = React.memo(function LogHeader({ count }: { count: number }) {
  return (
    <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(77, 216, 232, 0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          background: "linear-gradient(135deg, rgba(77, 216, 232, 0.15), rgba(77, 216, 232, 0.03))",
          border: "1px solid rgba(77, 216, 232, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--wm-font-display)",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "#4DD8E8",
        }}>◆</div>
        <div>
          <div style={{
            fontFamily: "var(--wm-font-display)",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#E2E8F0",
          }}>DAILY OPS LOG</div>
          <div style={{
            fontSize: "0.5rem",
            letterSpacing: "0.08em",
            color: "rgba(77, 216, 232, 0.6)",
            marginTop: "1px",
          }}>{count} ENTRIES RECORDED</div>
        </div>
      </div>
      {/* Filter tags */}
      <div style={{ display: "flex", gap: "4px" }}>
        {Object.entries(categoryConfig).map(([key, cfg]) => (
          <div
            key={key}
            style={{
              fontFamily: "var(--wm-font-mono)",
              fontSize: "0.45rem",
              letterSpacing: "0.05em",
              padding: "2px 6px",
              background: `${cfg.color}10`,
              border: `1px solid ${cfg.color}25`,
              borderRadius: "2px",
              color: cfg.color,
              opacity: 0.8,
            }}
          >
            {cfg.icon}
          </div>
        ))}
      </div>
    </div>
  );
});

// Memoized scan line
const ScanLine = React.memo(function ScanLine() {
  return (
    <div style={{
      position: "absolute",
      top: 0,
      right: 0,
      width: "1px",
      height: "100%",
      background: "linear-gradient(180deg, transparent, rgba(77, 216, 232, 0.3), transparent)",
      animation: "scan-line 5s linear infinite",
      pointerEvents: "none",
    }} />
  );
});

export const DailyOpsLogPanel = React.memo(function DailyOpsLogPanel() {
  const logEntries = useWarMapStore(useShallow((s) => s.logEntries));

  const allLogs = React.useMemo<LogEntry[]>(
    () => [...(logEntries as unknown as LogEntry[]), ...INITIAL_LOGS].slice(0, 15),
    [logEntries]
  );

  return (
    <aside
      style={{
        position: "fixed",
        top: "56px",
        right: 0,
        bottom: "40px",
        width: "370px",
        zIndex: 20,
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, rgba(5, 8, 16, 0.7) 0%, rgba(5, 8, 16, 0.4) 100%)",
        backdropFilter: "blur(20px) saturate(150%)",
        borderLeft: "1px solid rgba(77, 216, 232, 0.15)",
        boxShadow:
          "-4px 0 32px rgba(0, 0, 0, 0.5)," +
          "inset -1px 0 0 rgba(77, 216, 232, 0.06)," +
          "inset 1px 0 0 rgba(77, 216, 232, 0.03)",
        fontFamily: "var(--wm-font-mono)",
        // Force own compositor layer to prevent WebGL canvas flicker bleed
        transform: "translateZ(0)",
        willChange: "transform",
        isolation: "isolate",
      }}
    >
      <LogCornerNotches />
      <LogHeader count={allLogs.length} />
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {allLogs.map((log, index) => (
        <LogEntryItem key={log.id ?? `${log.time}-${index}`} log={log} index={index} />
      ))}
      </div>
      <ScanLine />
    </aside>
  );
});