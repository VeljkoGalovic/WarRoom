"use client";

import * as React from "react";
import { useShallow } from "zustand/react/shallow";
import { useWarMapStore } from "./WarMap3DCanvas";
import styles from "./SystemStatusBar.module.css";

interface LogEntry {
  time: string;
  event: string;
  detail: string;
  category: string;
}

const METRICS = [
  { id: "cpu", label: "CPU", color: "#4DD8E8", unit: "%" },
  { id: "mem", label: "MEM", color: "#FFB347", unit: "%" },
  { id: "net", label: "NET", color: "#2ECC71", unit: "MB/s" },
  { id: "gpu", label: "GPU", color: "#FF4D5E", unit: "%" },
] as const;

type MetricType = typeof METRICS[number];

// Isolated uptime component - only re-renders for uptime
function UptimeDisplay() {
  const [uptime, setUptime] = React.useState<string>("00:00:00");
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    const startTime = Date.now();
    const updateUptime = () => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000).toString().padStart(2, "0");
      const minutes = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, "0");
      const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, "0");
      setUptime(`${hours}:${minutes}:${seconds}`);
    };
    updateUptime();
    const interval = setInterval(updateUptime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) {
    return <span className={styles.uptimeDisplay} style={{ opacity: 0.5 }}>00:00:00</span>;
  }

  return <span className={styles.uptimeDisplay}>{uptime}</span>;
}

// Isolated metric display - only re-renders when its specific metric changes
function MetricDisplay({ metric, value }: { metric: MetricType; value: number }) {
  return (
    <div className={styles.metricItem}>
      <div className={styles.metricLabelWrapper}>
        <span className={styles.metricLabel} style={{ color: metric.color }}>{metric.label}</span>
        <span className={styles.metricDot} style={{ color: metric.color }} />
      </div>
      <div className={styles.metricValueWrapper}>
        <span className={styles.metricValue}>{value.toFixed(0)}</span>
        <span className={styles.metricUnit}>{metric.unit}</span>
      </div>
    </div>
  );
}

// Context to avoid prop drilling
const MetricsContext = React.createContext<Record<string, number>>({});

// Isolated metrics generator - only updates metrics state
function MetricsProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = React.useState<Record<string, number>>({
    cpu: 23,
    mem: 45,
    net: 12,
    gpu: 8,
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.min(95, Math.max(5, prev.cpu + (Math.random() - 0.5) * 8)),
        mem: Math.min(90, Math.max(10, prev.mem + (Math.random() - 0.5) * 5)),
        net: Math.min(100, Math.max(0, prev.net + (Math.random() - 0.5) * 20)),
        gpu: Math.min(80, Math.max(2, prev.gpu + (Math.random() - 0.5) * 10)),
      }));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <MetricsContext.Provider value={metrics}>
      {children}
    </MetricsContext.Provider>
  );
}

// Isolated latest log display
function LatestLogDisplay() {
  const logEntries = useWarMapStore(useShallow((s) => s.logEntries));
  const [latestLog, setLatestLog] = React.useState<LogEntry | null>(null);

  React.useEffect(() => {
    if (logEntries.length > 0) {
      setLatestLog(logEntries[0]);
    }
  }, [logEntries]);

  if (!latestLog) return null;

  const eventColor = latestLog.category === "warning" ? "#FF4D5E" :
                     latestLog.category === "success" ? "#2ECC71" : "#4DD8E8";

  return (
    <div className={styles.latestLog}>
      <span className={styles.latestLogTime}>{latestLog.time}</span>
      <span className={styles.latestLogEvent} style={{ color: eventColor }}>{latestLog.event}</span>
      <div className={styles.latestLogDetail}>
        <span className={styles.latestLogMessage}>{latestLog.detail}</span>
      </div>
    </div>
  );
}

// Memoized corner notches
const CornerNotches = React.memo(function CornerNotches() {
  return (
    <>
      <div className={`${styles.cornerNotch} ${styles.cornerNotchTopLeft}`} />
      <div className={`${styles.cornerNotch} ${styles.cornerNotchBottomLeft}`} />
      <div className={`${styles.cornerNotch} ${styles.cornerNotchTopRight}`} />
      <div className={`${styles.cornerNotch} ${styles.cornerNotchBottomRight}`} />
    </>
  );
});

// Memoized right section (version info)
const VersionInfo = React.memo(function VersionInfo() {
  return (
    <div className={styles.versionInfo}>
      <div className={styles.versionText}>v2.4.1</div>
    </div>
  );
});

// Memoized left section (system metrics)
const MetricsPanel = React.memo(function MetricsPanel() {
  const metrics = React.useContext(MetricsContext);
  return (
    <div className={styles.metricsPanel}>
      {METRICS.map((metric) => (
        <MetricDisplay key={metric.id} metric={metric} value={metrics[metric.id]} />
      ))}
    </div>
  );
});

// Memoized center section (uptime + latest log)
const CenterPanel = React.memo(function CenterPanel() {
  return (
    <div className={styles.centerPanel}>
      <div className={styles.uptimePill}>
        <span className={styles.uptimeLabel}>UPTIME</span>
        <UptimeDisplay />
      </div>
      <LatestLogDisplay />
    </div>
  );
});

// Main component with isolated re-render boundaries
export function SystemStatusBar() {
  return (
    <MetricsProvider>
      <footer className={styles.footer}>
        <CornerNotches />
        <MetricsPanel />
        <CenterPanel />
        <VersionInfo />
      </footer>
    </MetricsProvider>
  );
}