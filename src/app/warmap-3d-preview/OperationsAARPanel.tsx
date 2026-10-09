"use client";

import * as React from "react";
import { useWarMapStore } from "./WarMap3DCanvas";

interface MilestoneData {
  id: string;
  title: string;
  completed: boolean;
  nodeId: string;
}

interface WarMapNode {
  id: string;
  name: string;
  state: "neutral" | "active" | "conquered" | "at-risk" | "command";
  progress: number;
}

const MILESTONES: MilestoneData[] = [
  { id: "m1", title: "INITIAL RECON", completed: true, nodeId: "goal-1" },
  { id: "m2", title: "ASSET DEPLOYMENT", completed: true, nodeId: "goal-1" },
  { id: "m3", title: "PERIMETER ESTABLISHED", completed: true, nodeId: "goal-1" },
  { id: "m4", title: "INTEL GATHERING", completed: false, nodeId: "goal-2" },
  { id: "m5", title: "TARGET NEUTRALIZATION", completed: false, nodeId: "goal-2" },
  { id: "m6", title: "SECTOR SECURED", completed: false, nodeId: "goal-2" },
];

const FAKE_NODES: WarMapNode[] = [
  { id: "command", name: "COMMAND CENTER", state: "command", progress: 100 },
  { id: "goal-1", name: "TACTICAL PHYSICAL", state: "conquered", progress: 100 },
  { id: "goal-2", name: "DEPLOY WAR", state: "active", progress: 67 },
  { id: "goal-3", name: "REACH CODEFORCES", state: "at-risk", progress: 23 },
  { id: "goal-4", name: "MASTER SYSTEMS", state: "neutral", progress: 45 },
  { id: "goal-5", name: "INTERNATIONAL MATH", state: "neutral", progress: 12 },
  { id: "goal-6", name: "SECURE COMMS", state: "neutral", progress: 0 },
  { id: "goal-7", name: "ESTABLISH FOOTHOLD", state: "neutral", progress: 0 },
];

const LOG_CATEGORIES = ["Physical Training", "Algorithmic", "SaaS Architecture", "System Engineering"] as const;

const stateConfig = {
  command: { color: "#4DD8E8", label: "COMMAND" },
  conquered: { color: "#2ECC71", label: "SECURED" },
  active: { color: "#FFB347", label: "ACTIVE" },
  "at-risk": { color: "#FF4D5E", label: "AT RISK" },
  neutral: { color: "#6B7280", label: "PENDING" },
} as const;

// Global styles injected once
if (typeof window !== "undefined" && !(window as any).__OPSAAR_STYLES_INJECTED__) {
  (window as any).__OPSAAR_STYLES_INJECTED__ = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.9); }
    }
  `;
  document.head.appendChild(style);
}

export function OperationsAARPanel() {
  // FIX: Select values individually to maintain stable references and prevent infinite render loops
  const selectedNodeId = useWarMapStore((s) => s.selectedNodeId);
  const addLogEntry = useWarMapStore((s) => s.addLogEntry);

  const [logText, setLogText] = React.useState("");
  const [logCategory, setLogCategory] = React.useState<typeof LOG_CATEGORIES[0]>("Physical Training");

  const selectedNode = FAKE_NODES.find(n => n.id === selectedNodeId);
  const nodeMilestones = MILESTONES.filter(m => m.nodeId === selectedNodeId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logText.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit" });
    addLogEntry({ time, event: "OPERATIONAL LOG", detail: logText, category: logCategory });
    setLogText("");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "20px",
        bottom: "56px",
        width: "380px",
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
          OPERATIONS BRIEFING // AAR
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Upper Half: Mission Briefing & Selected Node Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Active Directives */}
          <div style={{ background: "rgba(5, 8, 16, 0.6)", border: "1px solid rgba(77, 216, 232, 0.2)", borderRadius: "6px", padding: "12px" }}>
            <div style={{
              fontFamily: "var(--wm-font-display)",
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#4DD8E8",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FFB347", boxShadow: "0 0 8px #FFB347" }} />
              ACTIVE DIRECTIVES
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", background: "rgba(255, 179, 71, 0.1)", border: "1px solid rgba(255, 179, 71, 0.3)", borderRadius: "4px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FFB347", boxShadow: "0 0 6px #FFB347", animation: "pulse 1.5s ease-in-out infinite" }} />
                <div style={{ fontSize: "0.65rem", flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#FFB347" }}>DEPLOY WAR</div>
                  <div style={{ fontSize: "0.55rem", opacity: 0.7 }}>Sector Beta — 67% complete</div>
                </div>
                <div style={{ fontFamily: "var(--wm-font-display)", fontSize: "0.5rem", fontWeight: 700, color: "#FFB347" }}>PRIORITY</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", background: "rgba(255, 77, 94, 0.1)", border: "1px solid rgba(255, 77, 94, 0.3)", borderRadius: "4px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FF4D5E", boxShadow: "0 0 6px #FF4D5E", animation: "pulse 1s ease-in-out infinite" }} />
                <div style={{ fontSize: "0.65rem", flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#FF4D5E" }}>REACH CODEFORCES</div>
                  <div style={{ fontSize: "0.55rem", opacity: 0.7 }}>Sector Gamma — Signal degraded</div>
                </div>
                <div style={{ fontFamily: "var(--wm-font-display)", fontSize: "0.5rem", fontWeight: 700, color: "#FF4D5E" }}>CRITICAL</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", background: "rgba(46, 204, 113, 0.1)", border: "1px solid rgba(46, 204, 113, 0.3)", borderRadius: "4px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2ECC71", boxShadow: "0 0 6px #2ECC71" }} />
                <div style={{ fontSize: "0.65rem", flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#2ECC71" }}>TACTICAL PHYSICAL</div>
                  <div style={{ fontSize: "0.55rem", opacity: 0.7 }}>Sector Alpha — Secured</div>
                </div>
                <div style={{ fontFamily: "var(--wm-font-display)", fontSize: "0.5rem", fontWeight: 700, color: "#2ECC71" }}>COMPLETE</div>
              </div>
            </div>
          </div>

          {/* Selected Node Deep Dive */}
          {selectedNode && (
            <div style={{ background: "rgba(5, 8, 16, 0.6)", border: "1px solid rgba(77, 216, 232, 0.2)", borderRadius: "6px", padding: "12px" }}>
              <div style={{
                fontFamily: "var(--wm-font-display)",
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#4DD8E8",
                marginBottom: "12px",
              }}>
                NODE INTELLIGENCE: {selectedNode.name}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: stateConfig[selectedNode.state].color, boxShadow: `0 0 8px ${stateConfig[selectedNode.state].color}` }} />
                  <div style={{ fontFamily: "var(--wm-font-display)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {selectedNode.name}
                  </div>
                  <div style={{
                    fontFamily: "var(--wm-font-display)",
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "3px",
                    background: `${stateConfig[selectedNode.state].color}20`,
                    border: `1px solid ${stateConfig[selectedNode.state].color}`,
                    color: stateConfig[selectedNode.state].color,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    {stateConfig[selectedNode.state].label}
                  </div>
                </div>

                {/* Progress Ring */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <svg width="70" height="70" style={{ transform: "rotate(-90deg)" }}>
                    <circle
                      cx="35"
                      cy="35"
                      r="30"
                      fill="none"
                      stroke="rgba(77, 216, 232, 0.1)"
                      strokeWidth="5"
                    />
                    <circle
                      cx="35"
                      cy="35"
                      r="30"
                      fill="none"
                      stroke={stateConfig[selectedNode.state].color}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 30}
                      strokeDashoffset={2 * Math.PI * 30 * (1 - selectedNode.progress / 100)}
                      style={{ filter: `drop-shadow(0 0 4px ${stateConfig[selectedNode.state].color})` }}
                    />
                    <text x="35" y="38" textAnchor="middle" dominantBaseline="middle" fill="#4DD8E8" fontFamily="var(--wm-font-mono)" fontSize="12" fontWeight="700">
                      {selectedNode.progress}%
                    </text>
                  </svg>
                  <div>
                    <div style={{ fontFamily: "var(--wm-font-display)", fontSize: "0.6rem", fontWeight: 700, color: stateConfig[selectedNode.state].color, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {selectedNode.state === "conquered" ? "OPERATION COMPLETE" : selectedNode.state === "active" ? "IN PROGRESS" : selectedNode.state === "at-risk" ? "CRITICAL — INTERVENTION REQUIRED" : "AWAITING ORDERS"}
                    </div>
                    <div style={{ fontSize: "0.55rem", opacity: 0.6, marginTop: "4px" }}>
                      Progress toward sector objectives
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                {nodeMilestones.length > 0 && (
                  <div>
                    <div style={{
                      fontFamily: "var(--wm-font-display)",
                      fontSize: "0.55rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#4DD8E8",
                      marginBottom: "8px",
                    }}>
                      MILESTONES
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {nodeMilestones.map((m) => (
                        <div
                          key={m.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px 10px",
                            background: m.completed ? "rgba(46, 204, 113, 0.1)" : "transparent",
                            border: `1px solid ${m.completed ? "#2ECC71" : "rgba(77, 216, 232, 0.2)"}`,
                            borderRadius: "4px",
                            clipPath: "polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)",
                          }}
                        >
                          <div style={{
                            width: "10px", height: "10px",
                            border: `1px solid ${m.completed ? "#2ECC71" : "rgba(77, 216, 232, 0.3)"}`,
                            background: m.completed ? "#2ECC71" : "transparent",
                            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                            flexShrink: 0,
                          }} />
                          <div style={{
                            fontFamily: "var(--wm-font-mono)", fontSize: "0.65rem",
                            color: m.completed ? "#2ECC71" : "#4DD8E8",
                            opacity: m.completed ? 1 : 0.7,
                            textTransform: "uppercase", letterSpacing: "0.05em", flex: 1,
                          }}>
                            {m.title}
                          </div>
                          {m.completed && <div style={{ fontFamily: "var(--wm-font-display)", fontSize: "0.5rem", fontWeight: 700, color: "#2ECC71", letterSpacing: "0.1em" }}>SECURED</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No selection placeholder */}
          {!selectedNode && (
            <div style={{ background: "rgba(5, 8, 16, 0.6)", border: "1px solid rgba(77, 216, 232, 0.2)", borderRadius: "6px", padding: "24px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "8px", opacity: 0.3 }}>◈</div>
              <div style={{ fontFamily: "var(--wm-font-display)", fontSize: "0.7rem", color: "rgba(77, 216, 232, 0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                NO NODE SELECTED
              </div>
              <div style={{ fontSize: "0.6rem", opacity: 0.4, marginTop: "8px" }}>
                Click a node in the tactical display for intelligence
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(77, 216, 232, 0.4), transparent)",
          margin: "8px 0",
        }} />

        {/* Lower Half: AAR Logger */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{
            fontFamily: "var(--wm-font-display)",
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#4DD8E8",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4DD8E8", boxShadow: "0 0 8px #4DD8E8" }} />
            AFTER-ACTION REPORT
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Category Selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.6, fontWeight: 600 }}>
                CATEGORY
              </label>
              <select
                value={logCategory}
                onChange={(e) => setLogCategory(e.target.value as typeof LOG_CATEGORIES[0])}
                style={{
                  appearance: "none",
                  background: "rgba(5, 8, 16, 0.8)",
                  border: "1px solid rgba(77, 216, 232, 0.3)",
                  borderRadius: "4px",
                  padding: "10px 12px",
                  color: "#4DD8E8",
                  fontFamily: "var(--wm-font-mono)",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234DD8E8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: "36px",
                }}
              >
                {LOG_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Textarea */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.6, fontWeight: 600 }}>
                LOG ENTRY
              </label>
              <textarea
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                placeholder="Enter operational log entry..."
                rows={4}
                style={{
                  background: "rgba(5, 8, 16, 0.8)",
                  border: "1px solid rgba(77, 216, 232, 0.3)",
                  borderRadius: "4px",
                  padding: "12px",
                  color: "#4DD8E8",
                  fontFamily: "var(--wm-font-mono)",
                  fontSize: "0.7rem",
                  lineHeight: "1.5",
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#4DD8E8";
                  e.target.style.boxShadow = "0 0 0 2px rgba(77, 216, 232, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(77, 216, 232, 0.3)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <div style={{ fontSize: "0.55rem", opacity: 0.5, textAlign: "right" }}>
                {logText.length}/500
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!logText.trim()}
              style={{
                background: logText.trim() ? "linear-gradient(135deg, #4DD8E8, #2ECC71)" : "rgba(77, 216, 232, 0.1)",
                border: "none",
                borderRadius: "4px",
                padding: "12px 24px",
                fontFamily: "var(--wm-font-display)",
                fontSize: "0.7rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: logText.trim() ? "#050810" : "rgba(77, 216, 232, 0.4)",
                cursor: logText.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                boxShadow: logText.trim() ? "0 4px 20px rgba(77, 216, 232, 0.4)" : "none",
                marginTop: "4px",
              }}
            >
              TRANSMIT LOG
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}