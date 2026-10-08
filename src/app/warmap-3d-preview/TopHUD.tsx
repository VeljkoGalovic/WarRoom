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

const statusColor = (status: "ONLINE" | "DEEP FOCUS" | "STANDBY") =>
  status === "ONLINE" ? "#2ECC71" : status === "DEEP FOCUS" ? "#FFB347" : "#4DD8E8";

export function TopHUD() {
  const [time, setTime] = React.useState<string>("");

  React.useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
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
        height: "56px",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "rgba(5, 8, 16, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(77, 216, 232, 0.25)",
        fontFamily: "monospace",
        color: "#4DD8E8",
      }}
    >
      {/* Standard style tag instead of styled-jsx */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
      `}</style>

      {/* Left: System Title + Live Indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
        <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          TACTICAL COMMAND // SECTOR-01
        </span>
      </div>

      {/* Center: Global Progress Bar + Status Counters */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", flex: 1, justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "280px" }}>
          <div style={{ flex: 1, height: "4px", background: "rgba(77, 216, 232, 0.15)", borderRadius: "2px", overflow: "hidden", position: "relative" }}>
            <div
              style={{
                width: `${globalProgress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #2ECC71, #4DD8E8)",
                borderRadius: "2px",
                boxShadow: "0 0 8px #2ECC71",
                transition: "width 0.5s ease-out",
              }}
            />
          </div>
          <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "#2ECC71", minWidth: "40px" }}>{globalProgress}%</span>
        </div>
        <div style={{ display: "flex", gap: "16px", fontSize: "0.6rem", fontWeight: 600 }}>
          <span style={{ color: "#FFB347" }}>ACTIVE: {activeCount}</span>
          <span style={{ color: "#2ECC71" }}>SECURED: {conqueredCount}</span>
          <span style={{ color: "#FF5555" }}>THREATS: {threatCount}</span>
        </div>
      </div>

      {/* Right: Timestamp, System Health, Audio/Scanline Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.65rem" }}>
          <span style={{ opacity: 0.6 }}>LOCAL TIME</span>
          <span style={{ fontWeight: 600, fontFamily: "monospace" }}>{time}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.65rem", borderLeft: "1px solid rgba(77, 216, 232, 0.25)", paddingLeft: "16px" }}>
          <span style={{ opacity: 0.6 }}>SYS HEALTH</span>
          <span style={{ fontWeight: 600, color: "#2ECC71" }}>99.8% STABLE</span>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            background: "rgba(77, 216, 232, 0.1)",
            border: "1px solid rgba(77, 216, 232, 0.3)",
            color: "#4DD8E8",
            fontFamily: "monospace",
            fontSize: "0.55rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            cursor: "pointer",
            borderRadius: "4px",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = "rgba(77, 216, 232, 0.2)"; e.currentTarget.style.borderColor = "#4DD8E8"; }}
          onMouseOut={(e) => { e.currentTarget.style.background = "rgba(77, 216, 232, 0.1)"; e.currentTarget.style.borderColor = "rgba(77, 216, 232, 0.3)"; }}
        >
          <span>⚙</span> AUDIO / SCANLINES
        </button>
      </div>
    </div>
  );
}