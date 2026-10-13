"use client";

import { Rajdhani, JetBrains_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { TopHUD } from "./TopHUD";
import { BottomBar } from "./BottomBar";
import { StaffRosterPanel } from "./StaffRosterPanel";
import { DailyOpsLogPanel } from "./DailyOpsLogPanel";
import "./styles/animations.css";

// Route-scoped fonts
const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--wm-font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--wm-font-mono",
  display: "swap",
});

const WarMap3DCanvas = dynamic(
  () => import("./WarMap3DCanvas").then((mod) => mod.WarMap3DCanvas),
  {
    ssr: false,
    loading: () => (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--wm-font-mono)",
        color: "#4DD8E8",
        fontSize: "0.8rem",
        letterSpacing: "0.1em",
      }}>
        INITIALIZING TACTICAL DISPLAY...
      </div>
    ),
  },
);

export default function WarMap3DPreviewPage() {
  return (
    <main style={{ width: "100vw", height: "100vh", position: "relative", background: "#030712", overflow: "hidden" }}>
      {/* 1. The 3D Canvas contains ONLY Three.js/R3F components */}
      <WarMap3DCanvas />

      {/* 2. All HTML UI overlays sit OUTSIDE the Canvas */}
      <TopHUD />
      <StaffRosterPanel />
      <DailyOpsLogPanel />
      <BottomBar />
    </main>
  );
}