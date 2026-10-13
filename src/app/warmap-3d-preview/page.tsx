"use client";

import { Rajdhani, JetBrains_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { CampaignHeader } from "./CampaignHeader";
import { StaffRosterPanel } from "./StaffRosterPanel";
import { DailyOpsLogPanel } from "./DailyOpsLogPanel";
import { SystemStatusBar } from "./SystemStatusBar";

// Route-scoped fonts
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--wm-font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--wm-font-mono",
  display: "swap",
});

// Dynamic import with SSR disabled for R3F
const WarMap3DCanvas = dynamic(() => import("./WarMap3DCanvas").then((mod) => mod.WarMap3DCanvas), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100vh",
        background: "#050810",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#4DD8E8",
        fontFamily: "var(--wm-font-mono)",
        fontSize: "0.75rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      INITIALIZING TACTICAL DISPLAY...
    </div>
  ),
});

export default function WarMap3DPreviewPage() {
  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "#050810",
        overflow: "hidden",
        fontFamily: "var(--wm-font-mono)",
      }}
      className={`${rajdhani.variable} ${jetbrainsMono.variable}`}
    >
      {/* Layer 0: Full-screen R3F Canvas */}
      <WarMap3DCanvas />

      {/* Layer 10: UI Panels Container */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 10,
          display: "grid",
          gridTemplateRows: "56px 1fr 40px",
          gridTemplateColumns: "300px 1fr 380px",
          height: "100vh",
          width: "100vw",
        }}
      >
        {/* Top: Campaign Header - Layer 20 */}
        <CampaignHeader />

        {/* Left: Staff Roster - Layer 20 */}
        <StaffRosterPanel />

        {/* Center: 3D Tactical Display (Canvas handles this) */}

        {/* Right: Daily Operations Log - Layer 20 */}
        <DailyOpsLogPanel />

        {/* Bottom: System Status Bar - Layer 30 */}
        <SystemStatusBar />
      </div>
    </main>
  );
}