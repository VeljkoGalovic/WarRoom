"use client";

import * as React from "react";
import { useWarMapStore } from "./WarMap3DCanvas";

const FAKE_NODES = [
  { id: "command", name: "COMMAND CENTER", state: "command", progress: 100 },
  { id: "goal-1", name: "TACTICAL PHYSICAL", state: "conquered", progress: 100 },
  { id: "goal-2", name: "DEPLOY WAR", state: "active", progress: 67 },
  { id: "goal-3", name: "REACH CODEFORCES", state: "at-risk", progress: 23 },
  { id: "goal-4", name: "MASTER SYSTEMS", state: "neutral", progress: 45 },
  { id: "goal-5", name: "INTERNATIONAL MATH", state: "neutral", progress: 12 },
  { id: "goal-6", name: "SECURE COMMS", state: "neutral", progress: 0 },
  { id: "goal-7", name: "ESTABLISH FOOTHOLD", state: "neutral", progress: 0 },
];

const conqueredCount = FAKE_NODES.filter(n => n.state === "conquered").length;
const activeCount = FAKE_NODES.filter(n => n.state === "active").length;
const threatCount = FAKE_NODES.filter(n => n.state === "at-risk").length;
const globalProgress = Math.round((conqueredCount / (FAKE_NODES.length - 1)) * 100);

// Global styles injected once
if (typeof window !== "undefined" && !window.__TOPHUD_STYLES_INJECTED__) {
  window.__TOPHUD_STYLES_INJECTED__ = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 8px #2ECC71, 0 0 16px #2ECC71; }
      50% { opacity: 0.5; box-shadow: 0 0 4px #2ECC71, 0 0 8px #2ECC71; }
    }
    @keyframes progress-flow {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
  `;
  document.head.appendChild(style);
}

export function TopHUD() {
  const [time, setTime] = React.useState<string>("");

  React.useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString("en-GB", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "UTC"
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "64px",
        zIndex: 20,
        pointerEvents: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "rgba(5, 8, 16, 0.95)",
        borderBottom: "1px solid rgba(77, 216, 232, 0.3)",
        boxShadow: "0 2px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(77, 216, 232, 0.1)",
        fontFamily: "var(--wm-font-mono)",
        fontSize: "0.7rem",
        color: "#4DD8E8",
        letterSpacing: "0.05em",
      }}
    >
      {/* Left: System Designation */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#2ECC71",
            boxShadow: "0 0 8px #2ECC71, 0 0 16px #2ECC71",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
        <div style={{
          fontFamily: "var(--wm-font-display)",
          fontSize: "0.85rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#4DD8E8",
          textShadow: "0 0 8px #4DD8E8",
        }}>
          // SECTOR-01 COMMAND NEXUS
        </div>
      </div>

      {/* Center: Global Progress Bar */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", minWidth: "320px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", fontSize: "0.65rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ opacity: 0.6, textTransform: "uppercase" }}>ACTIVE</span>
            <span style={{ fontWeight: 600, color: "#FFB347", fontFamily: "var(--wm-font-mono)", minWidth: "28px", textAlign: "right" }}>{activeCount}</span>
          </div>
          <div style={{ width: "1px", height: "12px", background: "rgba(77, 216, 232, 0.3)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ opacity: 0.6, textTransform: "uppercase" }}>SECURED</span>
            <span style={{ fontWeight: 600, color: "#2ECC71", fontFamily: "var(--wm-font-mono)", minWidth: "28px", textAlign: "right" }}>{conqueredCount}</span>
          </div>
          <div style={{ width: "1px", height: "12px", background: "rgba(77, 216, 232, 0.3)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ opacity: 0.6, textTransform: "uppercase" }}>THREATS</span>
            <span style={{ fontWeight: 600, color: "#FF4D5E", fontFamily: "var(--wm-font-mono)", minWidth: "28px", textAlign: "right" }}>{threatCount}</span>
          </div>
        </div>
        <div style={{
          width: "100%",
          maxWidth: "400px",
          height: "6px",
          background: "rgba(77, 216, 232, 0.1)",
          border: "1px solid rgba(77, 216, 232, 0.3)",
          borderRadius: "3px",
          overflow: "hidden",
          position: "relative",
        }}>
          <div
            style={{
              width: `${globalProgress}%`,
              height: "100%",
              background: `linear-gradient(90deg, #4DD8E8, #2ECC71, #4DD8E8)`,
              backgroundSize: "200% 100%",
              animation: "progress-flow 3s linear infinite",
              borderRadius: "2px",
              boxShadow: "0 0 8px #4DD8E8",
              transition: "width 0.5s ease-out",
            }}
          />
        </div>
        <div style={{ fontFamily: "var(--wm-font-display)", fontSize: "0.75rem", fontWeight: 700, color: "#2ECC71", textShadow: "0 0 8px #2ECC71" }}>
          {globalProgress}% GLOBAL COMPLETION
        </div>
      </div>

      {/* Right: Timestamp, System Health, Telemetry */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", textAlign: "right" }}>
          <span style={{ opacity: 0.6, fontSize: "0.6rem", textTransform: "uppercase" }}>UTC</span>
          <span style={{ fontWeight: 600, fontFamily: "var(--wm-font-mono)", letterSpacing: "0.1em" }}>{time}</span>
        </div>
        <div style={{ width: "1px", height: "20px", background: "rgba(77, 216, 232, 0.3)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ opacity: 0.6, fontSize: "0.6rem", textTransform: "uppercase" }}>STABILITY</span>
          <span style={{ fontWeight: 600, color: "#2ECC71", fontFamily: "var(--wm-font-mono)" }}>99.9%</span>
        </div>
        <div style={{ width: "1px", height: "20px", background: "rgba(77, 216, 232, 0.3)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "rgba(77, 216, 232, 0.1)", border: "1px solid rgba(77, 216, 232, 0.3)", borderRadius: "4px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2ECC71", boxShadow: "0 0 6px #2ECC71", display: "inline-block" }} />
          <span style={{ fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>TELEMETRY NOMINAL</span>
        </div>
      </div>
    </div>
  );
}