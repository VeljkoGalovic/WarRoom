"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { colors, sizing, motion, effects } from "@/styles/hud-theme";

/**
 * ScanlineOverlay - Subtle CRT scanline effect
 * Can be applied to any container for tactical aesthetic
 */
export interface ScanlineOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Opacity of scanlines (0-1) */
  opacity?: number;
  /** Animation speed */
  speed?: "slow" | "normal" | "fast";
  /** Custom className */
  className?: string;
}

export const ScanlineOverlay = React.forwardRef<HTMLDivElement, ScanlineOverlayProps>(
  ({ className, opacity = 0.05, speed = "normal", ...props }, ref) => {
    const speedMap = {
      slow: "12s",
      normal: "8s",
      fast: "4s",
    };

    const overlayStyles: React.CSSProperties = {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      opacity,
      backgroundImage: effects.gradients.scanline,
      backgroundSize: "100% 8px",
      animation: `scanline ${speedMap[speed]} linear infinite`,
      zIndex: 1,
      borderRadius: "inherit",
    };

    return (
      <div ref={ref} className={cn("scanline-overlay", className)} style={overlayStyles} {...props} />
    );
  }
);

ScanlineOverlay.displayName = "ScanlineOverlay";

/**
 * Scanlines - Standalone scanline background (for full-screen effects)
 */
export interface ScanlinesProps extends React.HTMLAttributes<HTMLDivElement> {
  opacity?: number;
  speed?: "slow" | "normal" | "fast";
  className?: string;
}

export const Scanlines = React.forwardRef<HTMLDivElement, ScanlinesProps>(
  ({ className, opacity = 0.03, speed = "normal", ...props }, ref) => {
    const speedMap = {
      slow: "12s",
      normal: "8s",
      fast: "4s",
    };

    const scanlineStyles: React.CSSProperties = {
      position: "fixed",
      inset: 0,
      pointerEvents: "none",
      opacity,
      backgroundImage: effects.gradients.scanline,
      backgroundSize: "100% 8px",
      animation: `scanline ${speedMap[speed]} linear infinite`,
      zIndex: 0,
    };

    return <div ref={ref} className={cn("scanlines", className)} style={scanlineStyles} {...props} />;
  }
);

Scanlines.displayName = "Scanlines";

/**
 * GridOverlay - Tactical grid pattern overlay
 */
export interface GridOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number; // Grid cell size in px
  opacity?: number;
  color?: string;
  className?: string;
}

export const GridOverlay = React.forwardRef<HTMLDivElement, GridOverlayProps>(
  ({ className, size = 40, opacity = 0.02, color, ...props }, ref) => {
    const gridStyles: React.CSSProperties = {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      opacity,
      backgroundImage: `
        linear-gradient(${color || colors.hud.border} 1px, transparent 1px),
        linear-gradient(90deg, ${color || colors.hud.border} 1px, transparent 1px)
      `,
      backgroundSize: `${size}px ${size}px`,
      zIndex: 1,
      borderRadius: "inherit",
    };

    return <div ref={ref} className={cn("grid-overlay", className)} style={gridStyles} {...props} />;
  }
);

GridOverlay.displayName = "GridOverlay";