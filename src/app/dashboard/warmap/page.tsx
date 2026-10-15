"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Rajdhani, JetBrains_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { TopHUD } from "./TopHUD";
import { BottomBar } from "./BottomBar";
import { StaffRosterPanel } from "./StaffRosterPanel";
import { DailyOpsLogPanel } from "./DailyOpsLogPanel";
import { OperationsAARPanel } from "./OperationsAARPanel";
import { WarMapDataController } from "./WarMapDataController";
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

export default function WarMapPage() {
  return (
    <DashboardLayout>
      <div style={{ width: "100%", height: "100%", position: "relative", background: "#030712", overflow: "hidden" }}>
        <div className={rajdhani.variable} style={{ fontFamily: "var(--wm-font-display)" }}>
          <div className={jetbrainsMono.variable} style={{ fontFamily: "var(--wm-font-mono)" }}>
            {/* 1. The 3D Canvas contains ONLY Three.js/R3F components */}
            <WarMap3DCanvas />

            {/* 2. All HTML UI overlays sit OUTSIDE the Canvas */}
            <TopHUD />
            <StaffRosterPanel />
            <DailyOpsLogPanel />
            <OperationsAARPanel />
            <BottomBar />

            {/* 3. Data controller - invisible component that polls APIs and feeds Zustand store */}
            <WarMapDataController />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}