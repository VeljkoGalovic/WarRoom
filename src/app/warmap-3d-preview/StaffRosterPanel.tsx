"use client";

import * as React from "react";
import { useShallow } from "zustand/react/shallow";
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


export {};

declare global {
  interface Window {
    __DAILY_OPS_LOG_STYLES_INJECTED__?: boolean;
    __STAFF_ROSTER_STYLES_INJECTED__?: boolean;
    // add future ones here
  }
}

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
    @keyframes corner-pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    @keyframes border-flow {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
  `;
  document.head.appendChild(style);
}

// Memoized staff card - only re-renders when hovered state changes
const StaffCard = React.memo(function StaffCard({ staff, isHovered, onHover, isSelected }: {
  staff: StaffMember;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  isSelected: boolean;
}) {
  const status = statusConfig[staff.status];

  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{
        padding: "12px",
        margin: "0 12px 12px",
        background: isHovered || isSelected
          ? "rgba(77, 216, 232, 0.08)"
          : "rgba(77, 216, 232, 0.03)",
        border: isSelected
          ? "1px solid rgba(77, 216, 232, 0.4)"
          : isHovered
          ? "1px solid rgba(77, 216, 232, 0.25)"
          : "1px solid rgba(77, 216, 232, 0.1)",
        borderRadius: "6px",
        transition: "background 0.2s, border 0.2s",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          background: `linear-gradient(135deg, ${staff.roleColor}22, ${staff.roleColor}08)`,
          border: `1px solid ${staff.roleColor}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--wm-font-display)",
          fontSize: "1rem",
          fontWeight: 700,
          color: staff.roleColor,
        }}>{staff.avatarInitial}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <div style={{
              fontFamily: "var(--wm-font-display)",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#E2E8F0",
            }}>{staff.role}</div>
            <div style={{
              fontSize: "0.5rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: status.color,
            }}>{status.label}</div>
          </div>
          <div style={{
            fontFamily: "var(--wm-font-mono)",
            fontSize: "0.55rem",
            letterSpacing: "0.05em",
            color: "rgba(77, 216, 232, 0.6)",
            marginBottom: "8px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>{staff.subtitle}</div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <div style={{
              flex: 1,
              height: "4px",
              background: "rgba(77, 216, 232, 0.1)",
              borderRadius: "2px",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${staff.taskProgress}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${staff.roleColor}, ${staff.roleColor}88)`,
                borderRadius: "2px",
                animation: "progress-flow 2s linear infinite",
              }} />
            </div>
            <span style={{
              fontFamily: "var(--wm-font-mono)",
              fontSize: "0.55rem",
              fontVariantNumeric: "tabular-nums",
              color: staff.roleColor,
              minWidth: "28px",
              textAlign: "right",
            }}>{staff.taskProgress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
});

// Memoized header
const StaffHeader = React.memo(function StaffHeader() {
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
          }}>STAFF ROSTER</div>
          <div style={{
            fontFamily: "var(--wm-font-mono)",
            fontSize: "0.55rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(77, 216, 232, 0.6)",
          }}>TACTICAL PERSONNEL</div>
        </div>
      </div>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "4px 10px",
        background: "rgba(77, 216, 232, 0.06)",
        border: "1px solid rgba(77, 216, 232, 0.15)",
        borderRadius: "3px",
        fontFamily: "var(--wm-font-mono)",
        fontSize: "0.55rem",
        letterSpacing: "0.1em",
        color: "#4DD8E8",
      }}>3 ACTIVE</div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// StaffRosterPanel  ← THIS WAS MISSING ITS OPENING
// ─────────────────────────────────────────────────────────────
export const StaffRosterPanel = React.memo(function StaffRosterPanel() {
  const selectedNodeId = useWarMapStore(useShallow((s) => s.selectedNodeId));
  const setSelectedNode = useWarMapStore(useShallow((s) => s.setSelectedNode));
  const setHoveredNode = useWarMapStore(useShallow((s) => s.setHoveredNode));
  const [hoveredStaff, setHoveredStaff] = React.useState<string | null>(null);

  return (
    <aside
      style={{
        position: "fixed",
        top: "56px",
        left: 0,
        bottom: "40px",
        width: "290px",
        zIndex: 20,
        pointerEvents: "auto",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(180deg, rgba(5, 8, 16, 0.7) 0%, rgba(5, 8, 16, 0.4) 100%)",
        backdropFilter: "blur(20px) saturate(150%)",
        borderRight: "1px solid rgba(77, 216, 232, 0.15)",
        boxShadow:
          "4px 0 32px rgba(0, 0, 0, 0.5)," +
          "inset 1px 0 0 rgba(77, 216, 232, 0.06)," +
          "inset -1px 0 0 rgba(77, 216, 232, 0.03)",
        fontFamily: "var(--wm-font-mono)",
        transform: "translateZ(0)",
        willChange: "transform",
        isolation: "isolate",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 16px 12px",
          borderBottom: "1px solid rgba(77, 216, 232, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              background:
                "linear-gradient(135deg, rgba(77, 216, 232, 0.15), rgba(77, 216, 232, 0.03))",
              border: "1px solid rgba(77, 216, 232, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--wm-font-display)",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#4DD8E8",
            }}
          >
            ◆
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--wm-font-display)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#E2E8F0",
              }}
            >
              STAFF ROSTER
            </div>
            <div
              style={{
                fontSize: "0.5rem",
                letterSpacing: "0.08em",
                color: "rgba(77, 216, 232, 0.6)",
                marginTop: "1px",
              }}
            >
              3 OPERATIVES ACTIVE
            </div>
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--wm-font-mono)",
            fontSize: "0.5rem",
            letterSpacing: "0.08em",
            padding: "2px 8px",
            background: "rgba(46, 204, 113, 0.1)",
            border: "1px solid rgba(46, 204, 113, 0.2)",
            borderRadius: "3px",
            color: "#2ECC71",
          }}
        >
          ALL SYSTEMS GO
        </div>
      </div>

      {/* Staff Cards */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {STAFF_ROSTER.map((staff) => {
          const config = statusConfig[staff.status];
          const isHovered = hoveredStaff === staff.id;

          return (
            <div
              key={staff.id}
              onMouseEnter={() => setHoveredStaff(staff.id)}
              onMouseLeave={() => setHoveredStaff(null)}
              style={{
                background: isHovered
                  ? "rgba(77, 216, 232, 0.06)"
                  : "rgba(5, 8, 16, 0.35)",
                borderTop: `1px solid ${
                  isHovered ? "rgba(77, 216, 232, 0.3)" : "rgba(77, 216, 232, 0.1)"
                }`,
                borderRight: `1px solid ${
                  isHovered ? "rgba(77, 216, 232, 0.3)" : "rgba(77, 216, 232, 0.1)"
                }`,
                borderBottom: `1px solid ${
                  isHovered ? "rgba(77, 216, 232, 0.3)" : "rgba(77, 216, 232, 0.1)"
                }`,
                borderLeft: `3px solid ${staff.roleColor}`,
                borderRadius: "0 8px 8px 0",
                padding: "12px",
                transition: "all 0.2s ease",
                cursor: "pointer",
                boxShadow: isHovered ? `0 0 20px ${staff.roleColor}15` : "none",
                position: "relative",
              }}
            >
              {/* Corner accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "16px",
                  height: "16px",
                  borderTop: `1px solid ${staff.roleColor}60`,
                  borderRight: `1px solid ${staff.roleColor}60`,
                  pointerEvents: "none",
                  opacity: isHovered ? 1 : 0.4,
                  transition: "opacity 0.2s",
                }}
              />

              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                {/* Avatar */}
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${staff.roleColor}25, ${staff.roleColor}05)`,
                    border: `1px solid ${staff.roleColor}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--wm-font-display)",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: staff.roleColor,
                    textShadow: `0 0 8px ${staff.roleColor}`,
                    flexShrink: 0,
                    boxShadow: `inset 0 0 12px ${staff.roleColor}20`,
                  }}
                >
                  {staff.avatarInitial}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      marginBottom: "4px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--wm-font-display)",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          color: "#E2E8F0",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {staff.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.5rem",
                          letterSpacing: "0.05em",
                          color: "rgba(77, 216, 232, 0.7)",
                          marginTop: "1px",
                          textTransform: "lowercase",
                        }}
                      >
                        {staff.subtitle}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.5rem",
                        letterSpacing: "0.08em",
                        padding: "2px 6px",
                        borderRadius: "2px",
                        background: `${config.color}15`,
                        border: `1px solid ${config.color}30`,
                        color: config.color,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: config.color,
                          boxShadow: config.glow,
                          animation: "pulse-dot 1.5s ease-in-out infinite",
                        }}
                      />
                      {config.label}
                    </div>
                  </div>

                  {/* Current Task */}
                  <div style={{ marginBottom: "8px" }}>
                    <div
                      style={{
                        fontSize: "0.55rem",
                        letterSpacing: "0.03em",
                        color: "rgba(226, 232, 240, 0.6)",
                        marginBottom: "4px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {staff.currentTask}
                    </div>
                    <div
                      style={{
                        height: "3px",
                        background: "rgba(77, 216, 232, 0.1)",
                        borderRadius: "2px",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: `${staff.taskProgress}%`,
                          height: "100%",
                          background: `linear-gradient(90deg, ${staff.roleColor}, ${staff.roleColor}80)`,
                          borderRadius: "2px",
                          boxShadow: `0 0 8px ${staff.roleColor}`,
                          transition: "width 0.5s ease-out",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                            backgroundSize: "200% 100%",
                            animation: "progress-flow 1.5s linear infinite",
                          }}
                        />
                      </div>
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
});