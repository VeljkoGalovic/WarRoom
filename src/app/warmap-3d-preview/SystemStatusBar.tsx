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
  `;
  document.head.appendChild(style);
}

export function SystemStatusBar() {
  const logEntries = useWarMapStore((s) => s.logEntries);
  const [latestLog, setLatestLog] = React.useState<LogEntry | null>(null);

  React.useEffect(() => {
    if (logEntries.length > 0) {
      setLatestLog(logEntries[0]);
    }
  }, [logEntries]);

  const [uptime, setUptime] = React.useState<string>("00:00:00");
  React.useEffect(() => {
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

  return (
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
        alignItems: "center",
        padding: "0 24px",
        background: "rgba(5, 8, 16, 0.95)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(77, 216, 232, 0.3)",
        boxShadow: "0 -2px 20px rgba(0, 0, 0, 0.5), inset 0 -1px 0 rgba(77, 216, 232, 0.1)",
        fontFamily: "var(--wm-font-mono)",
        fontSize: "0.55rem",
        color: "#4DD8E8",
        letterSpacing: "0.05em",
      }}
    >
      {/* Left: System Resources */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <SystemMetric label="CPU" value="23%" color="#2ECC71" />
          <SystemMetric label="MEM" value="1.2/4.0GB" color="#4DD8E8" />
          <SystemMetric label="NET" value="42ms" color="#FFB347" />
          <SystemMetric label="GPU" value="67%" color="#FF4D5E" />
        </div>
      </div>

      {/* Center: Active Operation / Latest Log */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FFB347", boxShadow: "0 0 8px #FFB347", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
          <span style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#FFB347" }}>
            {latestLog ? latestLog.event : "STANDBY"}
          </span>
        </div>
        {latestLog && (
          <div style={{
            flex: 1,
            maxWidth: "400px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            opacity: 0.8,
          }}>
            <span style={{ display: "inline-block", animation: "marquee 15s linear infinite" }}>
              {latestLog.detail}
            </span>
          </div>
        )}
      </div>

      {/* Right: Version & Uptime */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.1em" }}>VERSION</span>
          <span style={{ fontWeight: 600, fontFamily: "var(--wm-font-display)", fontSize: "0.65rem", color: "#4DD8E8" }}>
            v2.3.1
          </span>
        </div>
        <div style={{ width: "1px", height: "18px", background: "rgba(77, 216, 232, 0.3)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.1em" }}>UPTIME</span>
          <span style={{ fontWeight: 600, fontFamily: "var(--wm-font-mono)", color: "#2ECC71" }}>
            {uptime}
          </span>
        </div>
        <div style={{ width: "1px", height: "18px", background: "rgba(77, 216, 232, 0.3)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "3px 10px", background: "rgba(77, 216, 232, 0.1)", border: "1px solid rgba(77, 216, 232, 0.3)", borderRadius: "3px" }}>
          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#2ECC71", boxShadow: "0 0 6px #2ECC71", display: "inline-block", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.5rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>ALL SYSTEMS NOMINAL</span>
        </div>
      </div>
    </footer>
  );
}

function SystemMetric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      <span style={{ opacity: 0.5, fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </span>
      <span style={{ fontWeight: 600, fontFamily: "var(--wm-font-mono)", fontSize: "0.65rem", color }}>
        {value}
      </span>
    </div>
  );
}