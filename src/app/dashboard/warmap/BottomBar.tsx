"use client";

import * as React from "react";
import { useWarMapStore } from "./WarMap3DCanvas";
import styles from "./BottomBar.module.css";

interface LogEntry {
  time: string;
  event: string;
  detail: string;
  category: string;
}

const categoryConfig = {
  "Physical Training": { color: "#2ECC71" },
  "Algorithmic": { color: "#FFB347" },
  "SaaS Architecture": { color: "#4DD8E8" },
  "System Engineering": { color: "#3FE0A0" },
  "Strategic Analysis": { color: "#FF4D5E" },
} as const;

export function BottomBar() {
  const logEntries = useWarMapStore((s) => s.logEntries);
  const [logIndex, setLogIndex] = React.useState(0);

  React.useEffect(() => {
    if (logEntries.length === 0) return;
    const interval = setInterval(() => setLogIndex((prev) => (prev + 1) % logEntries.length), 5000);
    return () => clearInterval(interval);
  }, [logEntries.length]);

  const visibleLogs = logEntries.slice(logIndex, Math.min(logIndex + 4, logEntries.length));

  return (
    <div className={styles.container}>
      {visibleLogs.map((log, i) => {
        const cat = categoryConfig[log.category as keyof typeof categoryConfig] || { color: "#4DD8E8" };
        return (
          <div
            key={`${log.time}-${log.event}-${i}`}
            className={styles.logEntry}
            style={{ opacity: 1 - i * 0.15 }}
          >
            <span className={styles.logTime}>{log.time}</span>
            <span className={styles.logEvent}>{log.event}</span>
            <span className={styles.logDetail}>{log.detail}</span>
            <span
              className={styles.logCategory}
              style={{
                background: `${cat.color}20`,
                borderColor: `${cat.color}60`,
                color: cat.color,
              }}
            >
              {log.category.toUpperCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
}