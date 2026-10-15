"use client";

import * as React from "react";
import { useWarMapStore } from "./WarMap3DCanvas";
import styles from "./OperationsAARPanel.module.css";

interface WarMapNode {
  id: string;
  name: string;
  state: "neutral" | "active" | "conquered" | "at-risk" | "command";
  progress: number;
  connections: string[];
  sectorId: string;
}

interface MilestoneData {
  id: string;
  title: string;
  completed: boolean;
  nodeId: string;
}

const LOG_CATEGORIES = ["Physical Training", "Algorithmic", "SaaS Architecture", "System Engineering"] as const;

const stateConfig = {
  command: { color: "#4DD8E8", label: "COMMAND" },
  conquered: { color: "#2ECC71", label: "SECURED" },
  active: { color: "#FFB347", label: "ACTIVE" },
  "at-risk": { color: "#FF4D5E", label: "AT RISK" },
  neutral: { color: "#6B7280", label: "PENDING" },
} as const;

export function OperationsAARPanel() {
  // FIX: Select values individually to maintain stable references and prevent infinite render loops
  const selectedNodeId = useWarMapStore((s) => s.selectedNodeId);
  const addLogEntry = useWarMapStore((s) => s.addLogEntry);
  const nodes = useWarMapStore((s) => s.nodes);

  const [logText, setLogText] = React.useState("");
  const [logCategory, setLogCategory] = React.useState<typeof LOG_CATEGORIES[0]>("Physical Training");

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const nodeMilestones = React.useMemo(() => {
    if (!selectedNode) return [];
    // For now, derive milestones from node state
    // In Phase 2, we'll add an API endpoint for milestones
    const milestones: MilestoneData[] = [];

    if (selectedNode.state === "conquered") {
      milestones.push(
        { id: "m1", title: "INITIAL RECON", completed: true, nodeId: selectedNode.id },
        { id: "m2", title: "ASSET DEPLOYMENT", completed: true, nodeId: selectedNode.id },
        { id: "m3", title: "PERIMETER ESTABLISHED", completed: true, nodeId: selectedNode.id },
      );
    } else if (selectedNode.state === "active") {
      milestones.push(
        { id: "m1", title: "INITIAL RECON", completed: true, nodeId: selectedNode.id },
        { id: "m2", title: "ASSET DEPLOYMENT", completed: true, nodeId: selectedNode.id },
        { id: "m3", title: "PERIMETER ESTABLISHED", completed: false, nodeId: selectedNode.id },
      );
    } else if (selectedNode.state === "at-risk") {
      milestones.push(
        { id: "m1", title: "INTEL GATHERING", completed: false, nodeId: selectedNode.id },
        { id: "m2", title: "TARGET NEUTRALIZATION", completed: false, nodeId: selectedNode.id },
        { id: "m3", title: "SECTOR SECURED", completed: false, nodeId: selectedNode.id },
      );
    }
    return milestones;
  }, [selectedNode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logText.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit" });
    addLogEntry({ time, event: "OPERATIONAL LOG", detail: logText, category: logCategory });
    setLogText("");
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          OPERATIONS BRIEFING // AAR
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        {/* Upper Half: Mission Briefing & Selected Node Details */}
        <div className={styles.upperHalf}>
          {/* Active Directives */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <span
                className={styles.panelTitleDot}
                style={{ background: "#FFB347", boxShadow: "0 0 8px #FFB347" }}
              />
              ACTIVE DIRECTIVES
            </div>
            <div className={styles.directiveList}>
              <div className={`${styles.directiveItem} ${styles.directiveItemPriority}`}>
                <div
                  className={styles.directiveDot}
                  style={{ color: "#FFB347" }}
                />
                <div className={styles.directiveInfo}>
                  <div className={styles.directiveTitle} style={{ color: "#FFB347" }}>DEPLOY WAR</div>
                  <div className={styles.directiveSubtitle}>Sector Beta — 67% complete</div>
                </div>
                <div className={styles.directiveBadge} style={{ color: "#FFB347" }}>PRIORITY</div>
              </div>
              <div className={`${styles.directiveItem} ${styles.directiveItemCritical}`}>
                <div
                  className={`${styles.directiveDot} ${styles.directiveDotCritical}`}
                  style={{ color: "#FF4D5E" }}
                />
                <div className={styles.directiveInfo}>
                  <div className={styles.directiveTitle} style={{ color: "#FF4D5E" }}>REACH CODEFORCES</div>
                  <div className={styles.directiveSubtitle}>Sector Gamma — Signal degraded</div>
                </div>
                <div className={styles.directiveBadge} style={{ color: "#FF4D5E" }}>CRITICAL</div>
              </div>
              <div className={`${styles.directiveItem} ${styles.directiveItemComplete}`}>
                <div
                  className={`${styles.directiveDot} ${styles.directiveDotComplete}`}
                  style={{ color: "#2ECC71" }}
                />
                <div className={styles.directiveInfo}>
                  <div className={styles.directiveTitle} style={{ color: "#2ECC71" }}>TACTICAL PHYSICAL</div>
                  <div className={styles.directiveSubtitle}>Sector Alpha — Secured</div>
                </div>
                <div className={styles.directiveBadge} style={{ color: "#2ECC71" }}>COMPLETE</div>
              </div>
            </div>
          </div>

          {/* Selected Node Deep Dive */}
          {selectedNode && (
            <div className={styles.panel}>
              <div className={styles.nodeIntelHeader}>
                NODE INTELLIGENCE: {selectedNode.name}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className={styles.nodeIntelRow}>
                  <div
                    className={styles.nodeStateDot}
                    style={{ background: stateConfig[selectedNode.state].color }}
                  />
                  <div className={styles.nodeName} style={{ color: stateConfig[selectedNode.state].color }}>
                    {selectedNode.name}
                  </div>
                  <div
                    className={styles.nodeStateBadge}
                    style={{
                      background: `${stateConfig[selectedNode.state].color}20`,
                      border: `1px solid ${stateConfig[selectedNode.state].color}`,
                      color: stateConfig[selectedNode.state].color,
                    }}
                  >
                    {stateConfig[selectedNode.state].label}
                  </div>
                </div>

                {/* Progress Ring */}
                <div className={styles.progressRingContainer}>
                  <svg width="70" height="70" className={styles.progressRingSvg}>
                    <circle
                      cx="35"
                      cy="35"
                      r="30"
                      className={styles.progressRingBg}
                    />
                    <circle
                      cx="35"
                      cy="35"
                      r="30"
                      className={styles.progressRingFg}
                      style={{
                        stroke: stateConfig[selectedNode.state].color,
                        strokeDasharray: 2 * Math.PI * 30,
                        strokeDashoffset: 2 * Math.PI * 30 * (1 - selectedNode.progress / 100),
                      }}
                    />
                    <text x="35" y="38" textAnchor="middle" dominantBaseline="middle" className={styles.progressRingText}>
                      {selectedNode.progress}%
                    </text>
                  </svg>
                  <div className={styles.progressInfo}>
                    <div className={styles.progressStatus} style={{ color: stateConfig[selectedNode.state].color }}>
                      {selectedNode.state === "conquered" ? "OPERATION COMPLETE" :
                       selectedNode.state === "active" ? "IN PROGRESS" :
                       selectedNode.state === "at-risk" ? "CRITICAL — INTERVENTION REQUIRED" : "AWAITING ORDERS"}
                    </div>
                    <div className={styles.progressDesc}>
                      Progress toward sector objectives
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                {nodeMilestones.length > 0 && (
                  <div>
                    <div className={styles.milestonesHeader}>
                      MILESTONES
                    </div>
                    <div className={styles.milestonesList}>
                      {nodeMilestones.map((m) => (
                        <div
                          key={m.id}
                          className={`${styles.milestoneItem} ${m.completed ? styles.milestoneCompleted : styles.milestonePending}`}
                        >
                          <div
                            className={`${styles.milestoneIcon} ${m.completed ? "" : styles.milestoneIconPending}`}
                            style={{
                              color: m.completed ? "#2ECC71" : "rgba(77, 216, 232, 0.3)",
                              background: m.completed ? "#2ECC71" : "transparent",
                            }}
                          />
                          <div
                            className={`${styles.milestoneText} ${m.completed ? styles.milestoneCompletedText : styles.milestonePendingText}`}
                          >
                            {m.title}
                          </div>
                          {m.completed && <div className={styles.milestoneBadge}>SECURED</div>}
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
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>◈</div>
              <div className={styles.placeholderTitle}>
                NO NODE SELECTED
              </div>
              <div className={styles.placeholderDesc}>
                Click a node in the tactical display for intelligence
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Lower Half: AAR Logger */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className={styles.aarHeader}>
            <span className={styles.aarHeaderDot} />
            AFTER-ACTION REPORT
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Category Selector */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                CATEGORY
              </label>
              <select
                value={logCategory}
                onChange={(e) => setLogCategory(e.target.value as typeof LOG_CATEGORIES[0])}
                className={styles.formSelect}
              >
                {LOG_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Textarea */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                LOG ENTRY
              </label>
              <textarea
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                placeholder="Enter operational log entry..."
                rows={4}
                className={styles.formTextarea}
              />
              <div className={styles.charCount}>
                {logText.length}/500
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!logText.trim()}
              className={`${styles.submitButton} ${logText.trim() ? styles.submitButtonEnabled : styles.submitButtonDisabled}`}
            >
              SUBMIT LOG
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}