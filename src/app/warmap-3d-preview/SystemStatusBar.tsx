"use client";

import * as React from "react";
import { useShallow } from "zustand/react/shallow";
import { useWarMapStore } from "./WarMap3DCanvas";

interface LogEntry {
  time: string;
  event: string;
  detail: string;
  category: string;
}

// Global styles injected once
if (typeof window !== "undefined" && !window.__SYSTEM_STATUS_STYLES_INJECTED__) {
  window.__SYSTEM_STATUS_STYLES_INJECTED__ = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }
    @keyframes marquee {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
    @keyframes corner-pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    @keyframes bar-pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

const METRICS = [
  { id: "cpu", label: "CPU", color: "#4DD8E8", unit: "%" },
  { id: "mem", label: "MEM", color: "#FFB347", unit: "%" },
  { id: "net", label: "NET", color: "#2ECC71", unit: "MB/s" },
  { id: "gpu", label: "GPU", color: "#FF4D5E", unit: "%" },
] as const;

// Isolated uptime component - only re-renders for uptime
function UptimeDisplay() {
  const [uptime, setUptime] = React.useState<string>("00:00:00");
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const startTime = Date.now();
    const updateUptime = () => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000).toString().padStart(2, "0");
      const minutes = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, "0");
      const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, "0");
      setUptime(`${hours}:${minutes}:${seconds}`);
    };
    updateUptime();
    const interval = setInterval(updateUptime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) {
    return (
      <span style={{
        fontFamily: "var(--wm-font-mono)",
        fontSize: "0.55rem",
        fontVariantNumeric: "tabular-nums",
        color: "#E2E8F0",
        opacity: 0.5,
      }}>00:00:00</span>
    );
  }

  return (
    <span style={{
      fontFamily: "var(--wm-font-mono)",
      fontSize: "0.55rem",
      fontVariantNumeric: "tabular-nums",
      color: "#E2E8F0",
    }}>{uptime}</span>
  );
}

// Isolated metric display - only re-renders when its specific metric changes
function MetricDisplay({ metric, value }: { metric: typeof METRICS[0]; value: number }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 8px",
      background: "rgba(77, 216, 232, 0.04)",
      border: "1px solid rgba(77, 216, 232, 0.1)",
      borderRadius: "3px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <span style={{
          fontSize: "0.5rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          color: metric.color,
        }}>{metric.label}</span>
        <span style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: metric.color,
          boxShadow: `0 0 6px ${metric.color}`,
          animation: "pulse-dot 1s ease-in-out infinite",
        }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{
          fontFamily: "var(--wm-font-mono)",
          fontSize: "0.65rem",
          fontVariantNumeric: "tabular-nums",
          fontWeight: 600,
          color: "#E2E8F0",
          minWidth: "36px",
          textAlign: "right",
        }}>{value.toFixed(0)}</span>
        <span style={{
          fontSize: "0.5rem",
          color: "rgba(77, 216, 232, 0.6)",
        }}>{metric.unit}</span>
      </div>
    </div>
  );
}

// Isolated metrics generator - only updates metrics state
function MetricsProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = React.useState<Record<string, number>>({
    cpu: 23,
    mem: 45,
    net: 12,
    gpu: 8,
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.min(95, Math.max(5, prev.cpu + (Math.random() - 0.5) * 8)),
        mem: Math.min(90, Math.max(10, prev.mem + (Math.random() - 0.5) * 5)),
        net: Math.min(100, Math.max(0, prev.net + (Math.random() - 0.5) * 20)),
        gpu: Math.min(80, Math.max(2, prev.gpu + (Math.random() - 0.5) * 10)),
      }));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <MetricsContext.Provider value={metrics}>
      {children}
    </MetricsContext.Provider>
  );
}

// Context to avoid prop drilling
const MetricsContext = React.createContext<Record<string, number>>({});

// Isolated latest log display
function LatestLogDisplay() {
  const logEntries = useWarMapStore(useShallow((s) => s.logEntries));
  const [latestLog, setLatestLog] = React.useState<LogEntry | null>(null);

  React.useEffect(() => {
    if (logEntries.length > 0) {
      setLatestLog(logEntries[0]);
    }
  }, [logEntries]);

  if (!latestLog) return null;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "0 12px",
      background: "rgba(77, 216, 232, 0.04)",
      border: "1px solid rgba(77, 216, 232, 0.1)",
      borderRadius: "3px",
      maxWidth: "400px",
      overflow: "hidden",
    }}>
      <span style={{
        fontFamily: "var(--wm-font-mono)",
        fontSize: "0.55rem",
        fontVariantNumeric: "tabular-nums",
        color: "rgba(77, 216, 232, 0.7)",
        whiteSpace: "nowrap",
      }}>{latestLog.time}</span>
      <span style={{
        fontSize: "0.5rem",
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color: latestLog.category === "warning" ? "#FF4D5E" :
               latestLog.category === "success" ? "#2ECC71" : "#4DD8E8",
        whiteSpace: "nowrap",
      }}>{latestLog.event}</span>
      <div style={{
        flex: 1,
        minWidth: 0,
        overflow: "hidden",
      }}>
        <span style={{
          fontFamily: "var(--wm-font-mono)",
          fontSize: "0.55rem",
          color: "#E2E8F0",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "block",
        }}>{latestLog.detail}</span>
      </div>
    </div>
  );
}

// Memoized corner notches
const CornerNotches = React.memo(function CornerNotches() {
  return (
    <>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "16px",
        height: "16px",
        borderTop: "1px solid rgba(77, 216, 232, 0.35)",
        borderLeft: "1px solid rgba(77, 216, 232, 0.35)",
        pointerEvents: "none",
        animation: "corner-pulse 3s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "16px",
        height: "16px",
        borderBottom: "1px solid rgba(77, 216, 232, 0.35)",
        borderLeft: "1px solid rgba(77, 216, 232, 0.35)",
        pointerEvents: "none",
        animation: "corner-pulse 3s ease-in-out infinite 1.5s",
      }} />
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "16px",
        height: "16px",
        borderTop: "1px solid rgba(77, 216, 232, 0.35)",
        borderRight: "1px solid rgba(77, 216, 232, 0.35)",
        pointerEvents: "none",
        animation: "corner-pulse 3s ease-in-out infinite 0.75s",
      }} />
      <div style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        width: "16px",
        height: "16px",
        borderBottom: "1px solid rgba(77, 216, 232, 0.35)",
        borderRight: "1px solid rgba(77, 216, 232, 0.35)",
        pointerEvents: "none",
        animation: "corner-pulse 3s ease-in-out infinite 2.25s",
      }} />
    </>
  );
});

// Memoized right section (version info)
const VersionInfo = React.memo(function VersionInfo() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      paddingRight: "8px",
    }}>
      <div style={{
        fontFamily: "var(--wm-font-mono)",
        fontSize: "0.55rem",
        letterSpacing: "0.1em",
        color: "rgba(77, 216, 232, 0.5)",
      }}>v2.4.1</div>
    </div>
  );
});

// Memoized left section (system metrics)
const MetricsPanel = React.memo(function MetricsPanel() {
  const metrics = React.useContext(MetricsContext);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingLeft: "8px" }}>
      {METRICS.map((metric) => (
        <MetricDisplay key={metric.id} metric={metric} value={metrics[metric.id]} />
      ))}
    </div>
  );
});

// Memoized center section (uptime + latest log)
const CenterPanel = React.memo(function CenterPanel() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "24px" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "4px 12px",
        background: "rgba(77, 216, 232, 0.06)",
        border: "1px solid rgba(77, 216, 232, 0.15)",
        borderRadius: "3px",
      }}>
        <span style={{
          fontFamily: "var(--wm-font-mono)",
          fontSize: "0.55rem",
          letterSpacing: "0.1em",
          color: "#4DD8E8",
        }}>UPTIME</span>
        <UptimeDisplay />
      </div>
      <LatestLogDisplay />
    </div>
  );
});

// Main component with isolated re-render boundaries
export function SystemStatusBar() {
  return (
    <MetricsProvider>
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40px",
          zIndex: 30,
          pointerEvents: "auto",
          display: "grid",
          gridTemplateColumns: "300px 1fr 380px",
          gridColumn: "1 / -1",
          alignItems: "center",
          padding: "0 20px",
          background: "linear-gradient(0deg, rgba(5, 8, 16, 0.9) 0%, rgba(5, 8, 16, 0.5) 100%)",
          backdropFilter: "blur(20px) saturate(150%)",
          borderTop: "1px solid rgba(77, 216, 232, 0.2)",
          boxShadow:
            "0 -4px 32px rgba(0, 0, 0, 0.6)," +
            "inset 0 1px 0 rgba(77, 216, 232, 0.08)," +
            "inset 0 -1px 0 rgba(77, 216, 232, 0.05)",
          fontFamily: "var(--wm-font-mono)",
          // Force own compositor layer to prevent WebGL canvas flicker bleed
          transform: "translateZ(0)",
          willChange: "transform",
          isolation: "isolate",
        }}
      >
        <CornerNotches />
        <MetricsPanel />
        <CenterPanel />
        <VersionInfo />
      </footer>
    </MetricsProvider>
  );
}