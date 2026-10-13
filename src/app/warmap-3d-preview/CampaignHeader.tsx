"use client";

import * as React from "react";
import styles from "./CampaignHeader.module.css";

// Isolated time component - only this re-renders every second
function TimeDisplay() {
  const [time, setTime] = React.useState<string>("--:--:--");
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
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

  if (!isMounted) {
    return <span className={styles.timeDisplay} style={{ opacity: 0.5 }}>--:--:--</span>;
  }

  return <span className={styles.timeDisplay}>{time}</span>;
}

// Memoized static header content
const HeaderContent = React.memo(function HeaderContent() {
  return (
    <>
      {/* Corner notches - Left */}
      <div className={`${styles.cornerNotch} ${styles.cornerNotchTopLeft}`} />
      <div className={`${styles.cornerNotch} ${styles.cornerNotchBottomLeft}`} />

      {/* Left: Campaign Title */}
      <div className={styles.leftSection}>
        {/* Status indicator */}
        <div className={styles.statusIndicator}>
          <div className={styles.statusDot} />
          <span className={styles.statusText}>ACTIVE</span>
        </div>

        {/* Main title */}
        <div className={styles.titleBlock}>
          <div className={styles.mainTitle}>
            CAMPAIGN VISUALIZER
          </div>
          <div className={styles.subTitle}>3D TACTICAL DISPLAY</div>
        </div>
      </div>

      {/* Center: System Status */}
      <div className={styles.centerSection}>
        <div className={styles.statusPill}>
          <span className={styles.statusPillLabel}>SYSTEM</span>
          <span className={styles.statusPillValue}>● NOMINAL</span>
        </div>
        <div className={styles.statusPill}>
          <span className={styles.statusPillLabel}>SECURE</span>
          <span className={styles.statusPillValue}>● ENCRYPTED</span>
        </div>
        <div className={styles.statusPill}>
          <span className={styles.statusPillLabel}>UTC</span>
          <TimeDisplay />
        </div>
      </div>

      {/* Right: Connection / Version */}
      <div className={styles.rightSection}>
        <div className={styles.connectionPill}>
          <div className={styles.connectionDot} />
          <span className={styles.connectionText}>LINK ESTABLISHED</span>
        </div>
        <div className={styles.versionText}>v2.4.1</div>
      </div>

      {/* Corner notches - Right */}
      <div className={`${styles.cornerNotch} ${styles.cornerNotchTopRight}`} />
      <div className={`${styles.cornerNotch} ${styles.cornerNotchBottomRight}`} />

      {/* Top scan line */}
      <div className={styles.scanLine} />
    </>
  );
});

// Memoized header - only re-renders if props change (none currently)
export const CampaignHeader = React.memo(function CampaignHeader() {
  return (
    <header className={styles.header}>
      <HeaderContent />
    </header>
  );
});