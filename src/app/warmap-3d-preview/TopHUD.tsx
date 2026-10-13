"use client";

import * as React from "react";
import { useWarMapStore } from "./WarMap3DCanvas";
import styles from "./TopHUD.module.css";

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

export function TopHUD() {
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
    <div className={styles.container}>
      {/* Left: System Designation */}
      <div className={styles.leftSection}>
        <div className={styles.systemStatusDot} />
        <div className={styles.systemDesignation}>
          // SECTOR-01 COMMAND NEXUS
        </div>
      </div>

      {/* Center: Global Progress Bar */}
      <div className={styles.centerSection}>
        <div className={styles.statusRow}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>ACTIVE</span>
            <span className={`${styles.statusValue} ${styles.statusValueActive}`}>{activeCount}</span>
          </div>
          <div className={styles.statusDivider} />
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>SECURED</span>
            <span className={`${styles.statusValue} ${styles.statusValueSecured}`}>{conqueredCount}</span>
          </div>
          <div className={styles.statusDivider} />
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>THREATS</span>
            <span className={`${styles.statusValue} ${styles.statusValueThreats}`}>{threatCount}</span>
          </div>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressBar}
            style={{ width: `${globalProgress}%` }}
          />
        </div>
        <div className={styles.completionText}>
          {globalProgress}% GLOBAL COMPLETION
        </div>
      </div>

      {/* Right: Timestamp, System Health, Telemetry */}
      <div className={styles.rightSection}>
        <div className={styles.timeDisplay}>
          <span className={styles.timeLabel}>UTC</span>
          <span className={styles.timeValue}>{time}</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.stabilityDisplay}>
          <span className={styles.stabilityLabel}>STABILITY</span>
          <span className={styles.stabilityValue}>99.9%</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.telemetryDisplay}>
          <span className={styles.telemetryDot} />
          <span className={styles.telemetryText}>TELEMETRY NOMINAL</span>
        </div>
      </div>
    </div>
  );
}