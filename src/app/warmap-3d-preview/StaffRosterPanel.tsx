"use client";

import * as React from "react";
import { useWarMapStore } from "./WarMap3DCanvas";

const STAFF_ROSTER = [
  { id: "staff-1", name: "Kael", role: "Logistics & Infrastructure", status: "ONLINE" as const, currentTask: "Supply chain optimization", taskProgress: 78 },
  { id: "staff-2", name: "Zara", role: "Strategic Analysis", status: "DEEP FOCUS" as const, currentTask: "Threat pattern recognition", taskProgress: 45 },
  { id: "staff-3", name: "Rex", role: "Tactical Training & Physical Readiness", status: "STANDBY" as const, currentTask: "Combat readiness drills", taskProgress: 12 },
  { id: "staff-4", name: "Vex", role: "Cyber Operations", status: "ONLINE" as const, currentTask: "Network penetration testing", taskProgress: 63 },
  { id: "staff-5", name: "Mira", role: "Intelligence & Recon", status: "DEEP FOCUS" as const, currentTask: "Sector 7 signal analysis", taskProgress: 89 },
];

const statusColor = (status: "ONLINE" | "DEEP FOCUS" | "STANDBY") =>
  status === "ONLINE" ? "#2ECC71" : status === "DEEP FOCUS" ? "#FFB347" : "#4DD8E8";

export function StaffRosterPanel() {
  const selectedNodeId = useWarMapStore((s) => s.selectedNodeId);
  const setSelectedNode = useWarMapStore((s) => s.setSelectedNode);
  const [hoveredStaff, setHoveredStaff] = React.useState<string | null>(null);

  return (
    <div
      style={{
        position: "fixed",
        top: "64px",
        left: 0,
        bottom: "48px",
        width: "320px",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        background: "rgba(5, 8, 16, 0.85)",
        backdropFilter: "blur(12px)",
        borderRight: "1px solid rgba(77, 216, 232, 0.25)",
        fontFamily: "monospace",
        color: "#4DD8E8",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "16px", borderBottom: "1px solid rgba(77, 216, 232, 0.15)" }}>
        <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6 }}>
          AI PERSONNEL // COMMAND ROSTER
        </span>
      </div>

      {/* Staff List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {STAFF_ROSTER.map((staff) => (
          <div
            key={staff.id}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "12px",
              marginBottom: "8px",
              background: hoveredStaff === staff.id ? "rgba(77, 216, 232, 0.1)" : "rgba(77, 216, 232, 0.05)",
              border: `1px solid ${hoveredStaff === staff.id ? "#4DD8E8" : "rgba(77, 216, 232, 0.15)"}`,
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={() => {}}
            onMouseEnter={() => setHoveredStaff(staff.id)}
            onMouseLeave={() => setHoveredStaff(null)}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${statusColor(staff.status)}20, transparent)`,
                  border: `1px solid ${statusColor(staff.status)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: statusColor(staff.status),
                }}
              >
                {staff.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{staff.name}</div>
                <div style={{ fontSize: "0.55rem", opacity: 0.6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{staff.role}</div>
              </div>
              <span
                style={{
                  fontSize: "0.5rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "3px",
                  background: `${statusColor(staff.status)}20`,
                  border: `1px solid ${statusColor(staff.status)}`,
                  color: statusColor(staff.status),
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {staff.status}
              </span>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.55rem", marginBottom: "4px", opacity: 0.7 }}>
                <span>CURRENT TASK</span>
                <span>{staff.taskProgress}%</span>
              </div>
              <div style={{ height: "3px", background: "rgba(77, 216, 232, 0.15)", borderRadius: "1.5px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${staff.taskProgress}%`,
                    height: "100%",
                    background: statusColor(staff.status),
                    borderRadius: "1.5px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <div style={{ fontSize: "0.55rem", opacity: 0.6, marginTop: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {staff.currentTask}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}