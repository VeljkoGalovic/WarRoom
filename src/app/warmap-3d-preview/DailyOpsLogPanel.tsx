"use client";

import * as React from "react";
import { useShallow } from "zustand/react/shallow";
import { useWarMapStore } from "./WarMap3DCanvas";
import styles from "./DailyOpsLogPanel.module.css";

interface LogEntry {
  id: string,
  time: string;
  category: string;
  message: string;
  color: string;
}

const INITIAL_LOGS: LogEntry[] = [
  { id: "init-1", time: "06:42:13", category: "PHYSICAL", message: "Morning PT complete — 5km run, 100 pullups", color: "#2ECC71" },
  { id: "init-2", time: "07:15:00", category: "ALGORITHMIC", message: "LeetCode Daily: Two Sum (Medium) — Solved in 12min", color: "#FFB347" },
  { id: "init-3", time: "08:00:45", category: "SYSTEMS", message: "Architecture review: Auth service migration to NextAuth v5", color: "#4DD8E8" },
  { id: "init-4", time: "09:30:22", category: "PHYSICAL", message: "Gym session: Push/Pull/Legs — Week 3 Day 2", color: "#2ECC71" },
  { id: "init-5", time: "11:15:00", category: "ALGORITHMIC", message: "Codeforces Round #892 — Rating change: +24", color: "#FFB347" },
  { id: "init-6", time: "14:00:00", category: "SYSTEMS", message: "Deploy War Room v2.3 to Vercel — Build passing", color: "#4DD8E8" },
  { id: "init-7", time: "15:42:10", category: "PHYSICAL", message: "Recovery: Mobility flow + cold exposure 3min", color: "#2ECC71" },
  { id: "init-8", time: "17:20:00", category: "ALGORITHMIC", message: "Graph algorithms: Dijkstra shortest path implementation", color: "#FFB347" },
  { id: "init-9", time: "20:00:00", category: "ALGORITHMIC", message: "Dynamic programming: Knapsack optimization patterns", color: "#FFB347" },
  { id: "init-10", time: "21:30:00", category: "SYSTEMS", message: "Code review: PR #2847 merged to main branch", color: "#4DD8E8" },
];

const categoryConfig = {
  PHYSICAL: { label: "PHYSICAL", color: "#2ECC71", className: "categoryPhysical" },
  ALGORITHMIC: { label: "ALGORITHMIC", color: "#FFB347", className: "categoryAlgorithmic" },
  SYSTEMS: { label: "SYSTEMS", color: "#4DD8E8", className: "categorySystems" },
} as const;

// Memoized log entry
const LogEntryItem = React.memo(function LogEntryItem({ log, index }: { log: LogEntry; index: number }) {
  const cat = categoryConfig[log.category as keyof typeof categoryConfig] || categoryConfig.SYSTEMS;

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
      <div className={styles.logMessage}>{log.message}</div>
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

  // Combine initial logs with dynamic logs from store
  const allLogs = React.useMemo(() => [...logEntries, ...INITIAL_LOGS].slice(0, 15), [logEntries]);

  return (
    <aside className={styles.aside}>
      <LogCornerNotches />
      <LogHeader count={allLogs.length} />
      <div className={styles.logList}>
        {allLogs.map((log, index) => (
          <LogEntryItem key={`${log.id}-${index}`} log={log} index={index} />
        ))}
      </div>
    </aside>
  );
});