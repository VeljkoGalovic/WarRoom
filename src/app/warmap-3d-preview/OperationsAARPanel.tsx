"use client";

import * as React from "react";
import { useWarMapStore } from "./WarMap3DCanvas";

const MILESTONES = [
  { id: "m1", title: "INITIAL RECON", completed: true, nodeId: "goal-1" },
  { id: "m2", title: "ASSET DEPLOYMENT", completed: true, nodeId: "goal-1" },
  { id: "m3", title: "PERIMETER ESTABLISHED", completed: true, nodeId: "goal-1" },
  { id: "m4", title: "INTEL GATHERING", completed: false, nodeId: "goal-2" },
  { id: "m5", title: "TARGET NEUTRALIZATION", completed: false, nodeId: "goal-2" },
  { id: "m6", title: "SECTOR SECURED", completed: false, nodeId: "goal-2" },
];

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

const LOG_CATEGORIES = ["Physical Training", "Codeforces/Algorithmic", "SaaS Architecture", "System Engineering", "Strategic Analysis"] as const;

export function OperationsAARPanel() {
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
        top: "64px",
        right: 0,
        bottom: "48px",
        width: "360px",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        background: "rgba(5, 8, 16, 0.85)",
        backdropFilter: "blur(12px)",
        borderLeft: "1px solid rgba(77, 216, 232, 0.25)",
        fontFamily: "monospace",
        color: "#4DD8E8",
        overflow: "hidden",
      }}
    >
      {/* Upper Section: Mission Briefing */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid rgba(77, 216, 232, 0.15)" }}>
          <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6 }}>
            OPERATIONS BRIEFING
          </span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Active Directives */}
          <section>
            <h3 style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.5, marginBottom: "8px" }}>ACTIVE DIRECTIVES</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ padding: "10px", background: "rgba(255, 179, 71, 0.1)", border: "1px solid rgba(255, 179, 71, 0.3)", borderRadius: "4px" }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "#FFB347" }}>PRIORITY ALPHA</div>
                <div style={{ fontSize: "0.6rem", marginTop: "4px", opacity: 0.8 }}>Neutralize at-risk node: REACH CODEFORCES (23%)</div>
              </div>
              <div style={{ padding: "10px", background: "rgba(46, 204, 113, 0.1)", border: "1px solid rgba(46, 204, 113, 0.3)", borderRadius: "4px" }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 600, color: "#2ECC71" }}>PRIORITY BRAVO</div>
                <div style={{ fontSize: "0.6rem", marginTop: "4px", opacity: 0.8 }}>Maintain hyperlane integrity: DEPLOY WAR → MASTER SYSTEMS</div>
              </div>
            </div>
          </section>

          {/* Sector Intelligence */}
          <section>
            <h3 style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.5, marginBottom: "8px" }}>SECTOR INTELLIGENCE</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.6rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", opacity: 0.8 }}><span>SECTOR ALPHA</span><span style={{ color: "#4DD8E8" }}>SECURE</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", opacity: 0.8 }}><span>SECTOR BETA</span><span style={{ color: "#FFB347" }}>CONTESTED</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", opacity: 0.8 }}><span>SECTOR GAMMA</span><span style={{ color: "#2ECC71" }}>STABLE</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", opacity: 0.6 }}><span>SECTOR 7 (FOG)</span><span style={{ color: "#FF5555" }}>UNKNOWN</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", opacity: 0.6 }}><span>SECTOR 3 (FOG)</span><span style={{ color: "#FF5555" }}>UNKNOWN</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", opacity: 0.6 }}><span>SECTOR 9 (FOG)</span><span style={{ color: "#FF5555" }}>UNKNOWN</span></div>
            </div>
          </section>

          {/* Selected Node Details */}
          {selectedNode && (
            <section style={{ borderTop: "1px solid rgba(77, 216, 232, 0.15)", paddingTop: "16px" }}>
              <h3 style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.5, marginBottom: "8px" }}>SELECTED NODE</h3>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{selectedNode.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <div style={{ flex: 1, height: "4px", background: "rgba(77, 216, 232, 0.15)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${selectedNode.progress}%`, height: "100%", background: "#4DD8E8", borderRadius: "2px" }} />
                </div>
                <span style={{ fontSize: "0.6rem", fontWeight: 600 }}>{selectedNode.progress}%</span>
              </div>
              {nodeMilestones.length > 0 && (
                <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.5 }}>MILESTONES</span>
                  {nodeMilestones.map((m) => (
                    <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.6rem", opacity: m.completed ? 1 : 0.6 }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "2px", border: `1px solid ${m.completed ? "#2ECC71" : "rgba(77, 216, 232, 0.3)"}`, background: m.completed ? "#2ECC71" : "transparent" }} />
                      <span style={{ color: m.completed ? "#2ECC71" : "#4DD8E8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.title}</span>
                      {m.completed && <span style={{ fontSize: "0.5rem", fontWeight: 700, color: "#2ECC71" }}>SECURED</span>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Lower Section: AAR Logger */}
      <div style={{ borderTop: "1px solid rgba(77, 216, 232, 0.15)", padding: "16px" }}>
        <h3 style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.5, marginBottom: "12px" }}>AFTER-ACTION REPORT</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <textarea
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            placeholder="Enter daily operational log & milestone notes..."
            style={{
              minHeight: "80px",
              padding: "10px",
              background: "rgba(5, 8, 16, 0.9)",
              border: "1px solid rgba(77, 216, 232, 0.25)",
              borderRadius: "4px",
              color: "#4DD8E8",
              fontFamily: "monospace",
              fontSize: "0.65rem",
              resize: "vertical",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <select
              value={logCategory}
              onChange={(e) => setLogCategory(e.target.value as typeof LOG_CATEGORIES[0])}
              style={{
                flex: 1,
                padding: "8px 10px",
                background: "rgba(5, 8, 16, 0.9)",
                border: "1px solid rgba(77, 216, 232, 0.25)",
                borderRadius: "4px",
                color: "#4DD8E8",
                fontFamily: "monospace",
                fontSize: "0.65rem",
                outline: "none",
              }}
            >
              {LOG_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                background: "linear-gradient(90deg, #2ECC71, #4DD8E8)",
                border: "none",
                borderRadius: "4px",
                color: "#050810",
                fontFamily: "monospace",
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
            >
              TRANSMIT LOG
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}