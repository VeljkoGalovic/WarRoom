"use client";

import * as React from "react";

// Global styles injected once
if (typeof window !== "undefined" && !window.__CAMPAIGN_HEADER_STYLES_INJECTED__) {
  window.__CAMPAIGN_HEADER_STYLES_INJECTED__ = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 8px currentColor, 0 0 16px currentColor; }
      50% { opacity: 0.6; transform: scale(0.85); box-shadow: 0 0 4px currentColor, 0 0 8px currentColor; }
    }
    @keyframes progress-flow {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
    @keyframes scan-line {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;
  document.head.appendChild(style);
}

export function CampaignHeader() {
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
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60px",
        zIndex: 30,
        pointerEvents: "auto",
        display: "grid",
        gridTemplateColumns: "300px 1fr 380px",
        alignItems: "center",
        padding: "0 24px",
        background: "rgba(5, 8, 16, 0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(77, 216, 232, 0.3)",
        boxShadow: "0 2px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(77, 216, 232, 0.1)",
        fontFamily: "var(--wm-font-mono)",
        fontSize: "0.65rem",
        color: "#4DD8E8",
        letterSpacing: "0.05em",
      }}
    >
      {/* Left: System Designation */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#2ECC71",
            boxShadow: "0 0 8px #2ECC71, 0 0 16px #2ECC71",
            animation: "pulse-dot 2s ease-in-out infinite",
          }}
        />
        <div style={{
          fontFamily: "var(--wm-font-display)",
          fontSize: "0.8rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#4DD8E8",
          textShadow: "0 0 8px #4DD8E8",
        }}>
          CAMPAIGN VISUALIZER <span style={{ opacity: 0.4, margin: "0 8px" }}>—</span> 3D TACTICAL DISPLAY
        </div>
      </div>

      {/* Center: Status Badges */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
        <span
          style={{
            fontFamily: "var(--wm-font-display)",
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "5px 14px",
            borderRadius: "100px",
            background: "rgba(46, 204, 113, 0.15)",
            border: "1px solid rgba(46, 204, 113, 0.5)",
            color: "#2ECC71",
            boxShadow: "0 0 12px rgba(46, 204, 113, 0.3), inset 0 0 12px rgba(46, 204, 113, 0.1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span style={{ position: "relative", zIndex: 1 }}>ACTIVE</span>
          <span
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(90deg, transparent, rgba(46, 204, 113, 0.3), transparent)",
              backgroundSize: "200% 100%",
              animation: "scan-line 3s linear infinite",
            }}
          />
        </span>
        <span
          style={{
            fontFamily: "var(--wm-font-display)",
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "5px 14px",
            borderRadius: "100px",
            background: "rgba(77, 216, 232, 0.15)",
            border: "1px solid rgba(77, 216, 232, 0.5)",
            color: "#4DD8E8",
            boxShadow: "0 0 12px rgba(77, 216, 232, 0.3), inset 0 0 12px rgba(77, 216, 232, 0.1)",
          }}
        >
          SECURE
        </span>
      </div>

      {/* Right: System Telemetry */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", textAlign: "right" }}>
          <span style={{ opacity: 0.5, fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>UTC</span>
          <span style={{ fontWeight: 600, fontFamily: "var(--wm-font-mono)", letterSpacing: "0.1em", fontSize: "0.85rem" }}>{time}</span>
        </div>
        <div style={{ width: "1px", height: "22px", background: "rgba(77, 216, 232, 0.3)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ opacity: 0.5, fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>STABILITY</span>
          <span style={{ fontWeight: 600, color: "#2ECC71", fontFamily: "var(--wm-font-mono)", fontSize: "0.8rem" }}>99.9%</span>
        </div>
        <div style={{ width: "1px", height: "22px", background: "rgba(77, 216, 232, 0.3)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 12px", background: "rgba(77, 216, 232, 0.1)", border: "1px solid rgba(77, 216, 232, 0.3)", borderRadius: "4px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2ECC71", boxShadow: "0 0 6px #2ECC71", display: "inline-block", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
          <span style={{ fontSize: "0.55rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>TELEMETRY NOMINAL</span>
        </div>
      </div>
    </header>
  );
}