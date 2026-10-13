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
    @keyframes corner-pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

// Isolated time component - only this re-renders every second
function TimeDisplay() {
  const [time, setTime] = React.useState<string>("--:--:--");
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
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

  if (!isMounted) {
    return (
      <span style={{
        fontFamily: "var(--wm-font-mono)",
        fontSize: "0.6rem",
        letterSpacing: "0.1em",
        color: "#E2E8F0",
        fontVariantNumeric: "tabular-nums",
        opacity: 0.5,
      }}>--:--:--</span>
    );
  }

  return (
    <span style={{
      fontFamily: "var(--wm-font-mono)",
      fontSize: "0.6rem",
      letterSpacing: "0.1em",
      color: "#E2E8F0",
      fontVariantNumeric: "tabular-nums",
    }}>{time}</span>
  );
}

// Memoized static header content
const HeaderContent = React.memo(function HeaderContent() {
  return (
    <>
      {/* Corner notches - Left */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "24px",
        height: "24px",
        borderTop: "1px solid rgba(77, 216, 232, 0.4)",
        borderLeft: "1px solid rgba(77, 216, 232, 0.4)",
        pointerEvents: "none",
        animation: "corner-pulse 3s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "24px",
        height: "24px",
        borderBottom: "1px solid rgba(77, 216, 232, 0.4)",
        borderLeft: "1px solid rgba(77, 216, 232, 0.4)",
        pointerEvents: "none",
        animation: "corner-pulse 3s ease-in-out infinite 0.5s",
      }} />

      {/* Left: Campaign Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingLeft: "8px" }}>
        {/* Status indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#2ECC71",
            boxShadow: "0 0 8px #2ECC71, 0 0 16px #2ECC71",
            animation: "pulse-dot 2s ease-in-out infinite",
          }} />
          <span style={{
            fontFamily: "var(--wm-font-display)",
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#2ECC71",
            textShadow: "0 0 8px #2ECC71",
          }}>ACTIVE</span>
        </div>

        {/* Main title */}
        <div style={{ borderLeft: "1px solid rgba(77, 216, 232, 0.2)", paddingLeft: "16px" }}>
          <div style={{
            fontFamily: "var(--wm-font-display)",
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#E2E8F0",
            lineHeight: 1.1,
          }}>
            CAMPAIGN VISUALIZER
          </div>
          <div style={{
            fontFamily: "var(--wm-font-mono)",
            fontSize: "0.55rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#4DD8E8",
            marginTop: "2px",
            opacity: 0.8,
          }}>3D TACTICAL DISPLAY</div>
        </div>
      </div>

      {/* Center: System Status */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "24px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          background: "rgba(77, 216, 232, 0.08)",
          border: "1px solid rgba(77, 216, 232, 0.2)",
          borderRadius: "4px",
          fontFamily: "var(--wm-font-mono)",
          fontSize: "0.6rem",
          letterSpacing: "0.1em",
        }}>
          <span style={{ color: "#4DD8E8" }}>SYSTEM</span>
          <span style={{ color: "#2ECC71" }}>● NOMINAL</span>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          background: "rgba(77, 216, 232, 0.08)",
          border: "1px solid rgba(77, 216, 232, 0.2)",
          borderRadius: "4px",
          fontFamily: "var(--wm-font-mono)",
          fontSize: "0.6rem",
          letterSpacing: "0.1em",
        }}>
          <span style={{ color: "#4DD8E8" }}>SECURE</span>
          <span style={{ color: "#2ECC71" }}>● ENCRYPTED</span>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          background: "rgba(77, 216, 232, 0.08)",
          border: "1px solid rgba(77, 216, 232, 0.2)",
          borderRadius: "4px",
          fontFamily: "var(--wm-font-mono)",
          fontSize: "0.6rem",
          letterSpacing: "0.1em",
        }}>
          <span style={{ color: "#4DD8E8" }}>UTC</span>
          <TimeDisplay />
        </div>
      </div>

      {/* Right: Connection / Version */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px", paddingRight: "8px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          background: "rgba(77, 216, 232, 0.06)",
          border: "1px solid rgba(77, 216, 232, 0.15)",
          borderRadius: "4px",
        }}>
          <div style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#4DD8E8",
            boxShadow: "0 0 6px #4DD8E8",
            animation: "pulse-dot 1.5s ease-in-out infinite",
          }} />
          <span style={{
            fontFamily: "var(--wm-font-mono)",
            fontSize: "0.55rem",
            letterSpacing: "0.05em",
            color: "#4DD8E8",
          }}>LINK ESTABLISHED</span>
        </div>
        <div style={{
          fontFamily: "var(--wm-font-mono)",
          fontSize: "0.55rem",
          letterSpacing: "0.1em",
          color: "rgba(77, 216, 232, 0.5)",
        }}>v2.4.1</div>
      </div>

      {/* Corner notches - Right */}
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "24px",
        height: "24px",
        borderTop: "1px solid rgba(77, 216, 232, 0.4)",
        borderRight: "1px solid rgba(77, 216, 232, 0.4)",
        pointerEvents: "none",
        animation: "corner-pulse 3s ease-in-out infinite 0.25s",
      }} />
      <div style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        width: "24px",
        height: "24px",
        borderBottom: "1px solid rgba(77, 216, 232, 0.4)",
        borderRight: "1px solid rgba(77, 216, 232, 0.4)",
        pointerEvents: "none",
        animation: "corner-pulse 3s ease-in-out infinite 0.75s",
      }} />

      {/* Top scan line */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(77, 216, 232, 0.6), transparent)",
        animation: "scan-line 4s linear infinite",
        pointerEvents: "none",
      }} />
    </>
  );
});

// Memoized header - only re-renders if props change (none currently)
export const CampaignHeader = React.memo(function CampaignHeader() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "56px",
        zIndex: 30,
        pointerEvents: "auto",
        display: "grid",
        gridTemplateColumns: "300px 1fr 380px",
        alignItems: "center",
        padding: "0 20px",
        background: "linear-gradient(180deg, rgba(5, 8, 16, 0.85) 0%, rgba(5, 8, 16, 0.4) 100%)",
        backdropFilter: "blur(20px) saturate(150%)",
        borderBottom: "1px solid rgba(77, 216, 232, 0.25)",
        boxShadow:
          "0 4px 32px rgba(0, 0, 0, 0.6)," +
          "inset 0 1px 0 rgba(77, 216, 232, 0.08)," +
          "inset 0 -1px 0 rgba(77, 216, 232, 0.05)",
        fontFamily: "var(--wm-font-mono)",
        // Force own compositor layer to prevent WebGL canvas flicker bleed
        transform: "translateZ(0)",
        willChange: "transform",
        isolation: "isolate",
      }}
    >
      <HeaderContent />
    </header>
  );
});