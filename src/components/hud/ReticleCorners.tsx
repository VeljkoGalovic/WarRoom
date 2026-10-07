"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { colors, sizing, motion } from "@/styles/hud-theme";

/**
 * ReticleCorners - Tactical corner brackets/reticles
 * Can be applied to any container for HUD framing effect
 */
export interface ReticleCornersProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Color of reticles */
  color?: string;
  /** Size of reticle arms */
  size?: number;
  /** Stroke width */
  strokeWidth?: number;
  /** Opacity */
  opacity?: number;
  /** Which corners to show */
  corners?: ("top-left" | "top-right" | "bottom-left" | "bottom-right")[];
  /** Animate on mount */
  animate?: boolean;
  className?: string;
}

export const ReticleCorners = React.forwardRef<HTMLDivElement, ReticleCornersProps>(
  (
    {
      className,
      color,
      size = 12,
      strokeWidth = 2,
      opacity = 0.6,
      corners = ["top-left", "top-right", "bottom-left", "bottom-right"],
      animate = false,
      ...props
    },
    ref
  ) => {
    const reticleColor = color || colors.hud.reticle;
    const cornerSize = `${size}px`;

    const baseCornerStyles: React.CSSProperties = {
      position: "absolute",
      width: cornerSize,
      height: cornerSize,
      border: `${strokeWidth}px solid ${reticleColor}`,
      opacity,
      pointerEvents: "none",
      transition: `all ${motion.duration.default} ${motion.easing.default}`,
      ...(animate && { animation: `${motion.animations.fadeIn} ${motion.duration.slow} ${motion.easing.easeOut}` }),
    };

    const cornerStyles: Record<string, React.CSSProperties> = {
      "top-left": {
        ...baseCornerStyles,
        top: `-${strokeWidth}px`,
        left: `-${strokeWidth}px`,
        borderRight: "none",
        borderBottom: "none",
      },
      "top-right": {
        ...baseCornerStyles,
        top: `-${strokeWidth}px`,
        right: `-${strokeWidth}px`,
        borderLeft: "none",
        borderBottom: "none",
      },
      "bottom-left": {
        ...baseCornerStyles,
        bottom: `-${strokeWidth}px`,
        left: `-${strokeWidth}px`,
        borderRight: "none",
        borderTop: "none",
      },
      "bottom-right": {
        ...baseCornerStyles,
        bottom: `-${strokeWidth}px`,
        right: `-${strokeWidth}px`,
        borderLeft: "none",
        borderTop: "none",
      },
    };

    return (
      <div ref={ref} className={cn("reticle-corners", className)} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }} {...props}>
        {corners.map((corner) => (
          <div key={corner} style={cornerStyles[corner]} aria-hidden="true" />
        ))}
      </div>
    );
  }
);

ReticleCorners.displayName = "ReticleCorners";

/**
 * ReticleCorner - Single reticle corner component
 */
export interface ReticleCornerProps extends React.HTMLAttributes<HTMLDivElement> {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  color?: string;
  size?: number;
  strokeWidth?: number;
  opacity?: number;
  className?: string;
}

export const ReticleCorner = React.forwardRef<HTMLDivElement, ReticleCornerProps>(
  ({ className, position, color, size = 12, strokeWidth = 2, opacity = 0.6, ...props }, ref) => {
    const reticleColor = color || colors.hud.reticle;
    const cornerSize = `${size}px`;

    const styles: React.CSSProperties = {
      position: "absolute",
      width: cornerSize,
      height: cornerSize,
      border: `${strokeWidth}px solid ${reticleColor}`,
      opacity,
      pointerEvents: "none",
      transition: `all ${motion.duration.default} ${motion.easing.default}`,
    };

    switch (position) {
      case "top-left":
        Object.assign(styles, { top: `-${strokeWidth}px`, left: `-${strokeWidth}px`, borderRight: "none", borderBottom: "none" });
        break;
      case "top-right":
        Object.assign(styles, { top: `-${strokeWidth}px`, right: `-${strokeWidth}px`, borderLeft: "none", borderBottom: "none" });
        break;
      case "bottom-left":
        Object.assign(styles, { bottom: `-${strokeWidth}px`, left: `-${strokeWidth}px`, borderRight: "none", borderTop: "none" });
        break;
      case "bottom-right":
        Object.assign(styles, { bottom: `-${strokeWidth}px`, right: `-${strokeWidth}px`, borderLeft: "none", borderTop: "none" });
        break;
    }

    return <div ref={ref} className={cn("reticle-corner", className)} style={styles} {...props} />;
  }
);

ReticleCorner.displayName = "ReticleCorner";

/**
 * AnimatedReticle - Reticle with active pulsing animation
 */
export interface AnimatedReticleProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const AnimatedReticle = React.forwardRef<HTMLDivElement, AnimatedReticleProps>(
  ({ className, color, size = 12, strokeWidth = 2, ...props }, ref) => {
    const reticleColor = color || colors.hud.reticle;
    const cornerSize = `${size}px`;

    const animatedStyles: React.CSSProperties = {
      position: "absolute",
      width: cornerSize,
      height: cornerSize,
      border: `${strokeWidth}px solid ${reticleColor}`,
      opacity: 0.8,
      pointerEvents: "none",
      animation: `glow ${motion.duration.slow} ease-in-out infinite alternate`,
    };

    // Keyframes for glow animation
    const styleSheet = React.useMemo(() => {
      if (typeof document === "undefined") return null;
      const style = document.createElement("style");
      style.textContent = `
        @keyframes reticle-glow {
          0% { box-shadow: 0 0 4px ${reticleColor}; opacity: 0.6; }
          100% { box-shadow: 0 0 12px ${reticleColor}, 0 0 20px ${reticleColor}; opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      return style;
    }, [reticleColor]);

    return (
      <div ref={ref} className={cn("animated-reticle", className)} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }} {...props}>
        <div style={{ ...animatedStyles, top: `-${strokeWidth}px`, left: `-${strokeWidth}px`, borderRight: "none", borderBottom: "none" }} aria-hidden="true" />
        <div style={{ ...animatedStyles, top: `-${strokeWidth}px`, right: `-${strokeWidth}px`, borderLeft: "none", borderBottom: "none" }} aria-hidden="true" />
        <div style={{ ...animatedStyles, bottom: `-${strokeWidth}px`, left: `-${strokeWidth}px`, borderRight: "none", borderTop: "none" }} aria-hidden="true" />
        <div style={{ ...animatedStyles, bottom: `-${strokeWidth}px`, right: `-${strokeWidth}px`, borderLeft: "none", borderTop: "none" }} aria-hidden="true" />
      </div>
    );
  }
);

AnimatedReticle.displayName = "AnimatedReticle";