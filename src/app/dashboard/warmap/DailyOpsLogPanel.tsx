"use client";

import * as React from "react";
import { useShallow } from "zustand/react/shallow";
import { useWarMapStore } from "./WarMap3DCanvas";
import styles from "./DailyOpsLogPanel.module.css";

interface LogEntry {
  id: string;
  time: string;
  event: string;
  detail: string;
  category: string;
}

const categoryConfig = {
  system: { label: "SYSTEM", color: "#4DD8E8", className: "categorySystems" },
  success: { label: "SUCCESS", color: "#2ECC71", className: "categoryPhysical" },
  info: { label: "INFO", color: "#FFB347", className: "categoryAlgorithmic" },
  warning: { label: "WARNING", color: "#FF4D5E", className: "categoryWarning" },
  error: { label: "ERROR", color: "#FF4D5E", className: "categoryError" },
} as const;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Memoized log entry
const LogEntryItem = React.memo(function LogEntryItem({ log, index }: { log: LogEntry; index: number }) {
  const cat = categoryConfig[log.category as keyof typeof categoryConfig] || categoryConfig.info;

  const categoryClass = styles[cat.className];

  return (
    <div
      className={styles.logEntry}
      style={{ animation: `slide-in 0.3s ease-out ${index * 0.02}s both` }}
    >
      <div className={styles.logHeader}>
        <div className={styles.logTime}>{log.time}</div>
        <div className={`${styles.logCategory} ${categoryClass}`}>
          {cat.label}
        </div>
      </div>
      <div className={styles.logMessage}>{log.event} — {log.detail}</div>
    </div>
  );
});

// Memoized corner notches
const LogCornerNotches = React.memo(function LogCornerNotches() {
  return (
    <>
      <div className={`${styles.cornerNotch} ${styles.cornerNotchTopLeft}`} />
      <div className={`${styles.cornerNotch} ${styles.cornerNotchTopRight}`} />
      <div className={`${styles.cornerNotch} ${styles.cornerNotchBottomLeft}`} />
      <div className={`${styles.cornerNotch} ${styles.cornerNotchBottomRight}`} />
    </>
  );
});

// Memoized header
const LogHeader = React.memo(function LogHeader({ count }: { count: number }) {
  return (
    <div className={styles.header}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div className={styles.headerIcon}>◆</div>
        <div className={styles.headerTitleBlock}>
          <div className={styles.headerTitle}>DAILY OPS LOG</div>
          <div className={styles.headerSubtitle}>{count} ENTRIES RECORDED</div>
        </div>
      </div>
      <div className={styles.headerCount}>{count}</div>
    </div>
  );
});

export const DailyOpsLogPanel = React.memo(function DailyOpsLogPanel() {
  const logEntries = useWarMapStore(useShallow((s) => s.logEntries));

  // Convert store log entries to display format with IDs
  const displayLogs = React.useMemo(() => {
    return logEntries.map((log, idx) => ({
      ...log,
      id: `log-${idx}`,
    })).slice(0, 15);
  }, [logEntries]);

  return (
    <aside className={styles.aside}>
      <LogCornerNotches />
      <LogHeader count={displayLogs.length} />
      <div className={styles.logList}>
        {displayLogs.map((log, index) => (
          <LogEntryItem key={log.id} log={log} index={index} />
        ))}
      </div>
    </aside>
  );
});