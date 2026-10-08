"use client";

import * as React from "react";
import { useWarMapStore } from "./WarMap3DCanvas";

export function BottomBar() {
  const logEntries = useWarMapStore((s) => s.logEntries);
  const [logIndex, setLogIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => setLogIndex((prev) => (prev + 1) % logEntries.length), 4000);
    return () => clearInterval(interval);
  }, [logEntries.length]);

  const visibleLogs = logEntries.slice(logIndex, logIndex + 6);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "48px",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        background: "rgba(5, 8, 16, 0.9)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(77, 216, 232, 0.25)",
        fontFamily: "monospace",
        fontSize: "0.6rem",
        color: "#4DD8E8",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
        {visibleLogs.map((log, i) => (
          <div key={log.time + log.event + i} style={{ display: "flex", gap: "12px", opacity: 1 - i * 0.12, whiteSpace: "nowrap" }}>
            <span style={{ opacity: 0.5 }}>{log.time}</span>
            <span style={{ color: "#FFB347", fontWeight: 600 }}>{log.event}</span>
            <span style={{ opacity: 0.7 }}>{log.detail}</span>
            <span style={{ opacity: 0.4, fontSize: "0.55rem" }}>[#{log.category}]</span>
          </div>
        ))}
      </div>
    </div>
  );
}