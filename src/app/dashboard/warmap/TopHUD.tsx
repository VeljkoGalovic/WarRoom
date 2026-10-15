"use client";

import * as React from "react";
import { useShallow } from "zustand/react/shallow";
import { useWarMapStore } from "./WarMap3DCanvas";
import styles from "./TopHUD.module.css";

export function TopHUD() {
  const nodes = useWarMapStore(useShallow((s) => s.nodes));

  // Compute stats from live nodes
  const nonCommandNodes = nodes.filter(n => n.state !== "command");
  const conqueredCount = nonCommandNodes.filter(n => n.state === "conquered").length;
  const activeCount = nonCommandNodes.filter(n => n.state === "active").length;
  const threatCount = nonCommandNodes.filter(n => n.state === "at-risk").length;
  const globalProgress = nonCommandNodes.length > 0
    ? Math.round((conqueredCount / nonCommandNodes.length) * 100)
    : 0;
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