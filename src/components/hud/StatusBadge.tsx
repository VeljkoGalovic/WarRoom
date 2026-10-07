"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { colors, sizing, typography, motion, effects } from "@/styles/hud-theme";

/**
 * StatusBadge - Tactical status indicator
 * All styling driven by centralized theme configuration
 */

export type StatusBadgeVariant =
  | "active"
  | "contested"
  | "blocked"
  | "complete"
  | "archived"
  | "defcon-1"
  | "defcon-2"
  | "defcon-3"
  | "defcon-4"
  | "defcon-5"
  | "mission-complete"
  | "standby"
  | "deploying"
  | "holding"
  | "extracting";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusBadgeVariant;
  className?: string;
  showPulse?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

// Map variant to theme status colors
const variantThemeMap: Record<StatusBadgeVariant, keyof typeof colors.status> = {
  active: "active",
  contested: "contested",
  blocked: "blocked",
  complete: "complete",
  archived: "archived",
  "defcon-1": "defcon-1",
  "defcon-2": "defcon-2",
  "defcon-3": "defcon-3",
  "defcon-4": "defcon-4",
  "defcon-5": "defcon-5",
  "mission-complete": "mission-complete",
  standby: "standby",
  deploying: "deploying",
  holding: "holding",
  extracting: "extracting",
};

// Default icons for each variant
const defaultIcons: Partial<Record<StatusBadgeVariant, React.ReactNode>> = {
  active: (
    <span
      className="h-1.5 w-1.5 rounded-full animate-pulse"
      style={{
        backgroundColor: colors.secondary.glow,
        boxShadow: `0 0 6px ${colors.secondary.glow}`,
      }}
      aria-hidden="true"
    />
  ),
  contested: (
    <span
      className="h-1.5 w-1.5 rounded-full animate-pulse-slow"
      style={{
        backgroundColor: colors.primary.glow,
        boxShadow: `0 0 6px ${colors.primary.glow}`,
      }}
      aria-hidden="true"
    />
  ),
  blocked: (
    <span
      className="h-1.5 w-1.5 rounded-full"
      style={{
        backgroundColor: colors.destructive.glow,
        boxShadow: `0 0 6px ${colors.destructive.glow}`,
      }}
      aria-hidden="true"
    />
  ),
  complete: (
    <span
      className="h-1.5 w-1.5 rounded-full"
      style={{
        backgroundColor: colors.secondary.glow,
        boxShadow: `0 0 6px ${colors.secondary.glow}`,
      }}
      aria-hidden="true"
    />
  ),
  deploying: (
    <span
      className="h-1.5 w-1.5 rounded-full animate-pulse"
      style={{
        backgroundColor: "#60a5fa",
        boxShadow: "0 0 6px #60a5fa",
      }}
      aria-hidden="true"
    />
  ),
  extracting: (
    <span
      className="h-1.5 w-1.5 rounded-full animate-pulse"
      style={{
        backgroundColor: "#c084fc",
        boxShadow: "0 0 6px #c084fc",
      }}
      aria-hidden="true"
    />
  ),
  "defcon-1": (
    <span
      className="h-1.5 w-1.5 rounded-full animate-pulse"
      style={{
        backgroundColor: colors.destructive.glow,
        boxShadow: `0 0 8px ${colors.destructive.glow}`,
      }}
      aria-hidden="true"
    />
  ),
  "defcon-2": (
    <span
      className="h-1.5 w-1.5 rounded-full animate-pulse"
      style={{
        backgroundColor: "#fb923c",
        boxShadow: "0 0 8px #fb923c",
      }}
      aria-hidden="true"
    />
  ),
};

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    {
      className,
      variant = "active",
      showPulse,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const themeKey = variantThemeMap[variant];
    const themeStyles = colors.status[themeKey];

    // Determine if pulse should show (theme default or explicit prop)
    const shouldPulse = showPulse ?? themeStyles.pulse;

    // Build inline styles from theme
    const badgeStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: sizing.badge.height,
      padding: `${sizing.badge.height} ${sizing.badge.paddingX}`,
      fontFamily: typography.fontFamily.mono,
      fontSize: sizing.badge.fontSize,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      borderRadius: sizing.radius.full,
      border: `1px solid ${themeStyles.border}`,
      backgroundColor: themeStyles.bg,
      color: themeStyles.text,
      lineHeight: 1,
      whiteSpace: "nowrap",
      transition: `all ${motion.duration.fast} ${motion.easing.default}`,
    };

    // Add pulse animation if needed
    if (shouldPulse) {
      badgeStyles.animation = motion.animations.pulseSlow;
    }

    return (
      <span
        ref={ref}
        className={cn("badge-tactical", className)}
        style={badgeStyles}
        {...props}
      >
        {icon ?? defaultIcons[variant]}
        {children}
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

/**
 * StatusDot - Minimal status indicator (just the dot)
 */
export interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusBadgeVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
  showPulse?: boolean;
}

export const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className, variant = "active", size = "md", showPulse, ...props }, ref) => {
    const themeKey = variantThemeMap[variant];
    const themeStyles = colors.status[themeKey];
    const shouldPulse = showPulse ?? themeStyles.pulse;

    const sizeMap = {
      sm: "0.5rem",  // 8px
      md: "0.75rem", // 12px
      lg: "1rem",    // 16px
    };

    const dotStyles: React.CSSProperties = {
      width: sizeMap[size],
      height: sizeMap[size],
      borderRadius: "50%",
      backgroundColor: themeStyles.text,
      boxShadow: `0 0 8px ${themeStyles.text}`,
      flexShrink: 0,
      transition: `all ${motion.duration.fast} ${motion.easing.default}`,
      ...(shouldPulse && { animation: motion.animations.pulseSlow }),
    };

    return (
      <span ref={ref} className={cn("status-dot", className)} style={dotStyles} {...props} />
    );
  }
);

StatusDot.displayName = "StatusDot";