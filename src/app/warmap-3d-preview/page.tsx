"use client";

import { Rajdhani, JetBrains_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { TopBar, BottomBar, DetailPanel} from "./WarMap3DCanvas";
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
    <main style={{ width: "100vw", height: "100vh", position: "relative", background: "#030712", overflow: "hidden" }}>
      {/* 1. The 3D Canvas contains ONLY Three.js/R3F components */}
      <WarMap3DCanvas />

      {/* 2. All HTML UI overlays sit OUTSIDE the Canvas */}
      <TopBar />
      <BottomBar />
      <DetailPanel />
    </main>
  );
}