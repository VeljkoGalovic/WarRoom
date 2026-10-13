"use client";

import * as React from "react";
import { useWarMapStore } from "./WarMap3DCanvas";

interface StaffMember {
  id: string;
  role: string;
  name: string;
  subtitle: string;
  status: "ONLINE" | "DEEP FOCUS" | "STANDBY";
  currentTask: string;
  taskProgress: number;
  avatarInitial: string;
  roleColor: string;
}

const STAFF_ROSTER: StaffMember[] = [
  { id: "staff-1", role: "LOGISTICS", name: "KAEL", subtitle: "AI Logistics", status: "ONLINE", currentTask: "Supply chain optimization", taskProgress: 78, avatarInitial: "K", roleColor: "#2ECC71" },
  { id: "staff-2", role: "STRATEGY", name: "ZARA", subtitle: "AI Tactical", status: "DEEP FOCUS", currentTask: "Threat pattern recognition", taskProgress: 45, avatarInitial: "Z", roleColor: "#FFB347" },
  { id: "staff-3", role: "TRAINING", name: "REX", subtitle: "AI Training", status: "STANDBY", currentTask: "Combat readiness drills", taskProgress: 12, avatarInitial: "R", roleColor: "#4DD8E8" },
];

const statusConfig = {
  ONLINE: { label: "ONLINE", color: "#2ECC71", glow: "0 0 8px #2ECC71, 0 0 16px #2ECC71" },
  "DEEP FOCUS": { label: "DEEP FOCUS", color: "#FFB347", glow: "0 0 8px #FFB347, 0 0 16px #FFB347" },
  STANDBY: { label: "STANDBY", color: "#4DD8E8", glow: "0 0 8px #4DD8E8, 0 0 16px #4DD8E8" },
} as const;

// Global styles injected once
if (typeof window !== "undefined" && !window.__STAFF_ROSTER_STYLES_INJECTED__) {
  window.__STAFF_ROSTER_STYLES_INJECTED__ = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }
    @keyframes progress-flow {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
  `;
  document.head.appendChild(style);
}

export function StaffRosterPanel() {
  const { selectedNodeId, setSelectedNode, setHoveredNode } = useWarMapStore(
    (s) => ({ selectedNodeId: s.selectedNodeId, setSelectedNode: s.setSelectedNode, setHoveredNode: s.setHoveredNode })
  );
  const [hoveredStaff, setHoveredStaff] = React.useState<string | null>(null);

  return (
    <aside
      style={{
        position: "fixed",
        top: "60px",
        left: 0,
        bottom: "40px",
        width: "300px",
        zIndex: 20,
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        background: "rgba(8, 12, 22, 0.9)",
        backdropFilter: "blur(16px)",
        borderRight: "1px solid rgba(77, 216, 232, 0.2)",
        fontFamily: "var(--wm-font-mono)",
        color: "#E8EEF4",
        overflow: "hidden",
        boxShadow: "8px 0 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(77, 216, 232, 0.05)",
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
          STAFF ROSTER
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: "0.55rem", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          {STAFF_ROSTER.length} OPERATIVES
        </div>
      </div>

      {/* Staff Cards */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {STAFF_ROSTER.map((staff) => {
          const config = statusConfig[staff.status];
          const isHovered = hoveredStaff === staff.id;

          return (
            <div
              key={staff.id}
              onMouseEnter={() => setHoveredStaff(staff.id)}
              onMouseLeave={() => setHoveredStaff(null)}
              style={{
                background: isHovered ? "rgba(77, 216, 232, 0.08)" : "rgba(5, 8, 16, 0.5)",
                border: `1px solid ${isHovered ? "rgba(77, 216, 232, 0.4)" : "rgba(77, 216, 232, 0.15)"}`,
                borderLeft: `3px solid ${staff.roleColor}`,
                borderRadius: "0 8px 8px 0",
                padding: "14px",
                transition: "all 0.2s ease",
                cursor: "pointer",
                boxShadow: isHovered ? `0 0 24px ${staff.roleColor}20` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                {/* Avatar */}
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${staff.roleColor}30, ${staff.roleColor}05)`,
                    border: `1px solid ${staff.roleColor}60`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--wm-font-display)",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: staff.roleColor,
                    textShadow: `0 0 8px ${staff.roleColor}`,
                    flexShrink: 0,
                    boxShadow: `inset 0 0 16px ${staff.roleColor}20, 0 0 12px ${staff.roleColor}30`,
                  }}
                >
                  {staff.avatarInitial}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Role Label */}
                  <div style={{
                    fontFamily: "var(--wm-font-display)",
                    fontSize: "0.5rem",
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: staff.roleColor,
                    marginBottom: "2px",
                  }}>
                    {staff.role}
                  </div>
                  {/* Name */}
                  <div style={{
                    fontFamily: "var(--wm-font-display)",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    color: "#FFFFFF",
                    marginBottom: "1px",
                  }}>
                    {staff.name}
                  </div>
                  {/* Subtitle */}
                  <div style={{
                    fontSize: "0.55rem",
                    opacity: 0.6,
                    color: "#8B9CB3",
                    marginBottom: "8px",
                  }}>
                    {staff.subtitle}
                  </div>
                  {/* Status */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <span
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: config.color,
                        boxShadow: config.glow,
                        animation: config.status === "ONLINE" ? "pulse-dot 1.5s ease-in-out infinite" : "none",
                      }}
                    />
                    <span style={{
                      fontFamily: "var(--wm-font-display)",
                      fontSize: "0.55rem",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: config.color,
                    }}>
                      {config.label}
                    </span>
                  </div>
                  {/* Current Task with Progress */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.6rem", opacity: 0.8, color: "#CBD5E1" }}>
                        {staff.currentTask}
                      </span>
                      <span style={{ fontSize: "0.6rem", fontWeight: 600, fontFamily: "var(--wm-font-mono)", color: staff.roleColor }}>
                        {staff.taskProgress}%
                      </span>
                    </div>
                    <div style={{ height: "3px", background: "rgba(77, 216, 232, 0.1)", borderRadius: "2px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${staff.taskProgress}%`,
                          height: "100%",
                          background: `linear-gradient(90deg, ${staff.roleColor}, ${staff.roleColor}80)`,
                          borderRadius: "2px",
                          boxShadow: `0 0 8px ${staff.roleColor}`,
                          backgroundSize: "200% 100%",
                          animation: "progress-flow 2s linear infinite",
                          transition: "width 0.5s ease-out",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}