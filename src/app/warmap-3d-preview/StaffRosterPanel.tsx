"use client";

import * as React from "react";
import { useWarMapStore } from "./WarMap3DCanvas";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: "ONLINE" | "DEEP FOCUS" | "STANDBY";
  currentTask: string;
  taskProgress: number;
  avatarInitial: string;
}

const STAFF_ROSTER: StaffMember[] = [
  { id: "staff-1", name: "Kael", role: "Logistics & Infrastructure", status: "ONLINE", currentTask: "Supply chain optimization", taskProgress: 78, avatarInitial: "K" },
  { id: "staff-2", name: "Zara", role: "Strategic Analysis", status: "DEEP FOCUS", currentTask: "Threat pattern recognition", taskProgress: 45, avatarInitial: "Z" },
  { id: "staff-3", name: "Rex", role: "Tactical Training", status: "STANDBY", currentTask: "Combat readiness drills", taskProgress: 12, avatarInitial: "R" },
  { id: "staff-4", name: "Vex", role: "Cyber Operations", status: "ONLINE", currentTask: "Network penetration testing", taskProgress: 63, avatarInitial: "V" },
  { id: "staff-5", name: "Mira", role: "Intelligence & Recon", status: "DEEP FOCUS", currentTask: "Sector 7 signal analysis", taskProgress: 89, avatarInitial: "M" },
];

const statusConfig = {
  ONLINE: { color: "#2ECC71", glow: "0 0 8px #2ECC71, 0 0 16px #2ECC71" },
  "DEEP FOCUS": { color: "#FFB347", glow: "0 0 8px #FFB347, 0 0 16px #FFB347" },
  STANDBY: { color: "#4DD8E8", glow: "0 0 8px #4DD8E8, 0 0 16px #4DD8E8" },
} as const;

export function StaffRosterPanel() {
  // FIX: Select values individually to maintain stable references and prevent infinite render loops
  const selectedNodeId = useWarMapStore((s) => s.selectedNodeId);
  const setSelectedNode = useWarMapStore((s) => s.setSelectedNode);
  const setHoveredNode = useWarMapStore((s) => s.setHoveredNode);

  const [hoveredStaff, setHoveredStaff] = React.useState<string | null>(null);

  const onlineCount = STAFF_ROSTER.filter(s => s.status === "ONLINE").length;
  const focusCount = STAFF_ROSTER.filter(s => s.status === "DEEP FOCUS").length;
  const standbyCount = STAFF_ROSTER.filter(s => s.status === "STANDBY").length;

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        left: "20px",
        bottom: "56px",
        width: "340px",
        zIndex: 20,
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        background: "rgba(8, 12, 22, 0.9)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(77, 216, 232, 0.25)",
        borderRadius: "8px",
        padding: "16px",
        fontFamily: "var(--wm-font-mono)",
        color: "#4DD8E8",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(77, 216, 232, 0.1)",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "0 4px 16px",
        borderBottom: "1px solid rgba(77, 216, 232, 0.2)",
        marginBottom: "16px",
      }}>
        <div style={{
          fontFamily: "var(--wm-font-display)",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#4DD8E8",
          textShadow: "0 0 8px #4DD8E8",
        }}>
          AI PERSONNEL // TACTICAL ROSTER
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "12px", fontSize: "0.6rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2ECC71" }} />
            <span>{onlineCount} ONLINE</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FFB347" }} />
            <span>{focusCount} FOCUS</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4DD8E8" }} />
            <span>{standbyCount} STANDBY</span>
          </span>
        </div>
      </div>

      {/* Staff Cards */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
        {STAFF_ROSTER.map((staff) => {
          const config = statusConfig[staff.status];
          const isHovered = hoveredStaff === staff.id;

          return (
            <div
              key={staff.id}
              onMouseEnter={() => setHoveredStaff(staff.id)}
              onMouseLeave={() => setHoveredStaff(null)}
              style={{
                background: isHovered ? "rgba(77, 216, 232, 0.1)" : "rgba(5, 8, 16, 0.6)",
                border: `1px solid ${isHovered ? "rgba(77, 216, 232, 0.5)" : "rgba(77, 216, 232, 0.2)"}`,
                borderRadius: "6px",
                padding: "12px",
                transition: "all 0.2s ease",
                cursor: "pointer",
                boxShadow: isHovered ? `0 0 20px ${config.color}40` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                {/* Avatar */}
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${config.color}30, ${config.color}10)`,
                    border: `1px solid ${config.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--wm-font-display)",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: config.color,
                    textShadow: `0 0 8px ${config.color}`,
                    flexShrink: 0,
                    boxShadow: `inset 0 0 16px ${config.color}20, 0 0 8px ${config.color}40`,
                  }}
                >
                  {staff.avatarInitial}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <div style={{
                      fontFamily: "var(--wm-font-display)",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color: "#4DD8E8",
                    }}>
                      {staff.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.5rem",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "3px",
                        background: `${config.color}20`,
                        border: `1px solid ${config.color}`,
                        color: config.color,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {staff.status}
                    </div>
                  </div>
                  <div style={{
                    fontSize: "0.6rem",
                    color: "rgba(77, 216, 232, 0.7)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "8px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {staff.role}
                  </div>

                  {/* Task Progress */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ flex: 1, height: "4px", background: "rgba(77, 216, 232, 0.1)", borderRadius: "2px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${staff.taskProgress}%`,
                          height: "100%",
                          background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`,
                          borderRadius: "2px",
                          boxShadow: `0 0 8px ${config.color}`,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "0.6rem", fontWeight: 600, color: config.color, minWidth: "36px", textAlign: "right" }}>
                      {staff.taskProgress}%
                    </span>
                  </div>
                  <div style={{ fontSize: "0.55rem", color: "rgba(77, 216, 232, 0.5)", marginTop: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {staff.currentTask}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}