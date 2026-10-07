"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { colors, sizing, motion, effects, typography } from "@/styles/hud-theme";

/**
 * HUDPanel - Base tactical panel component
 * Provides consistent panel styling with reticles, scanlines, and glow effects
 */
export interface HUDPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Panel variant */
  variant?: "default" | "active" | "elevated" | "critical" | "stealth";
  /** Show reticle corners */
  reticles?: boolean;
  /** Show scanline overlay */
  scanlines?: boolean;
  /** Show top glow border */
  topGlow?: boolean;
  /** Custom className */
  className?: string;
  /** Children content */
  children: React.ReactNode;
  /** Additional CSS custom properties */
  style?: React.CSSProperties;
}

export const HUDPanel = React.forwardRef<HTMLDivElement, HUDPanelProps>(
  (
    {
      className,
      variant = "default",
      reticles = true,
      scanlines = false,
      topGlow = true,
      children,
      style,
      ...props
    },
    ref
  ) => {
    // Variant color mapping
    const variantColors: Record<string, { border: string; glow: string; bg?: string }> = {
      default: { border: colors.card.border, glow: effects.shadows.none },
      active: { border: colors.hud.borderActive, glow: effects.shadows.glowPrimary },
      elevated: { border: colors.card.border, glow: effects.shadows.lg },
      critical: { border: colors.destructive.base, glow: effects.shadows.glowDestructive },
      stealth: { border: colors.background.base, glow: effects.shadows.none, bg: colors.background.base },
    };

    const { border, glow, bg } = variantColors[variant];

    const panelStyles: React.CSSProperties = {
      position: "relative",
      backgroundColor: bg || colors.card.background,
      border: `1px solid ${border}`,
      borderRadius: sizing.radius.lg,
      backdropFilter: `blur(${effects.blur.default})`,
      boxShadow: glow,
      overflow: "hidden",
      transition: `all ${motion.duration.default} ${motion.easing.default}`,
      ...style,
    };

    // Top glow border
    const topGlowStyles: React.CSSProperties = {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "1px",
      background: `linear-gradient(90deg, transparent, ${colors.hud.borderActive}, transparent)`,
      opacity: variant === "active" || variant === "critical" ? 1 : 0.5,
      pointerEvents: "none",
      zIndex: 2,
    };

    // Scanline overlay
    const scanlineStyles: React.CSSProperties = {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      opacity: 0.05,
      backgroundImage: effects.gradients.scanline,
      backgroundSize: "100% 8px",
      animation: "scanline 8s linear infinite",
      zIndex: 1,
      borderRadius: sizing.radius.lg,
    };

    // Reticle corners
    const reticleSize = "12px";
    const reticleStroke = "2px";
    const reticleColor = variant === "critical" ? colors.destructive.base : colors.hud.reticle;

    const reticleStyles: React.CSSProperties = {
      position: "absolute",
      width: reticleSize,
      height: reticleSize,
      border: `${reticleStroke} solid ${reticleColor}`,
      opacity: 0.6,
      pointerEvents: "none",
      zIndex: 3,
      transition: `all ${motion.duration.default} ${motion.easing.default}`,
    };

    return (
      <div
        ref={ref}
        className={cn("hud-panel", className)}
        style={panelStyles}
        {...props}
      >
        {scanlines && <div style={scanlineStyles} aria-hidden="true" />}
        {topGlow && <div style={topGlowStyles} aria-hidden="true" />}
        {reticles && (
          <>
            <div style={{ ...reticleStyles, top: `-${reticleStroke}`, left: `-${reticleStroke}`, borderRight: "none", borderBottom: "none" }} aria-hidden="true" />
            <div style={{ ...reticleStyles, top: `-${reticleStroke}`, right: `-${reticleStroke}`, borderLeft: "none", borderBottom: "none" }} aria-hidden="true" />
            <div style={{ ...reticleStyles, bottom: `-${reticleStroke}`, left: `-${reticleStroke}`, borderRight: "none", borderTop: "none" }} aria-hidden="true" />
            <div style={{ ...reticleStyles, bottom: `-${reticleStroke}`, right: `-${reticleStroke}`, borderLeft: "none", borderTop: "none" }} aria-hidden="true" />
          </>
        )}
        <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
      </div>
    );
  }
);

HUDPanel.displayName = "HUDPanel";

/**
 * HUDSection - Semantic section within a panel
 */
export interface HUDSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Section title */
  title?: string;
  /** Title icon */
  icon?: React.ReactNode;
  /** Collapsible */
  collapsible?: boolean;
  /** Default expanded state */
  defaultExpanded?: boolean;
  /** ClassName */
  className?: string;
  /** Children */
  children: React.ReactNode;
}

export const HUDSection = React.forwardRef<HTMLDivElement, HUDSectionProps>(
  ({ className, title, icon, collapsible = false, defaultExpanded = true, children, ...props }, ref) => {
    const [expanded, setExpanded] = React.useState(defaultExpanded);

    const sectionStyles: React.CSSProperties = {
      borderBottom: `1px solid ${colors.card.border}`,
      transition: `all ${motion.duration.fast} ${motion.easing.default}`,
    };

    const headerStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "1rem 1.5rem",
      cursor: collapsible ? "pointer" : "default",
      userSelect: "none",
    };

    const titleStyles: React.CSSProperties = {
      fontFamily: typography.fontFamily.mono,
      fontSize: "0.75rem",
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: colors.foreground.primary,
    };

    const contentStyles: React.CSSProperties = {
      padding: "1rem 1.5rem",
      overflow: "hidden",
      transition: `all ${motion.duration.default} ${motion.easing.easeOut}`,
      opacity: expanded ? 1 : 0,
      maxHeight: expanded ? "none" : 0,
    };

    return (
      <section ref={ref} className={cn("hud-section", className)} style={sectionStyles} {...props}>
        {(title || collapsible) && (
          <header style={headerStyles} onClick={() => collapsible && setExpanded(!expanded)}>
            {icon && <span style={{ color: colors.primary.base }}>{icon}</span>}
            {title && <h3 style={titleStyles}>{title}</h3>}
            {collapsible && (
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: typography.fontFamily.mono,
                  fontSize: "0.625rem",
                  color: colors.foreground.muted,
                  transition: `transform ${motion.duration.fast} ${motion.easing.default}`,
                  transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
                }}
              >
                ▸
              </span>
            )}
          </header>
        )}
        <div style={contentStyles}>{expanded && children}</div>
      </section>
    );
  }
);

HUDSection.displayName = "HUDSection";

/**
 * HUDContent - Main content area with consistent padding
 */
export interface HUDContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  /** Padding size */
  padding?: "none" | "sm" | "md" | "lg";
}

export const HUDContent = React.forwardRef<HTMLDivElement, HUDContentProps>(
  ({ className, children, padding = "md", ...props }, ref) => {
    const paddingMap = {
      none: "0",
      sm: "1rem",
      md: "1.5rem",
      lg: "2rem",
    };

    const contentStyles: React.CSSProperties = {
      padding: paddingMap[padding],
    };

    return (
      <div ref={ref} className={cn("hud-content", className)} style={contentStyles} {...props}>
        {children}
      </div>
    );
  }
);

HUDContent.displayName = "HUDContent";

/**
 * HUDHeader - Panel header with title and actions
 */
export interface HUDHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  status?: { variant: string; label: string };
  className?: string;
}

export const HUDHeader = React.forwardRef<HTMLDivElement, HUDHeaderProps>(
  ({ className, title, subtitle, icon, actions, status, ...props }, ref) => {
    const headerStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
      padding: "1.5rem",
      borderBottom: `1px solid ${colors.card.border}`,
      flexWrap: "wrap",
    };

    const titleStyles: React.CSSProperties = {
      fontFamily: typography.fontFamily.mono,
      fontSize: "0.875rem",
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: colors.foreground.primary,
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    };

    const subtitleStyles: React.CSSProperties = {
      fontFamily: typography.fontFamily.mono,
      fontSize: "0.625rem",
      color: colors.foreground.muted,
      marginTop: "0.25rem",
    };

    const statusStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.375rem",
      padding: "0.25rem 0.75rem",
      fontFamily: typography.fontFamily.mono,
      fontSize: "0.625rem",
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      borderRadius: sizing.radius.full,
    };

    return (
      <header ref={ref} className={cn("hud-header", className)} style={headerStyles} {...props}>
        <div style={titleStyles}>
          {icon && <span style={{ color: colors.primary.base, fontSize: "1rem" }}>{icon}</span>}
          {title}
        </div>
        {subtitle && <div style={subtitleStyles}>{subtitle}</div>}
        {status && (
          <span
            style={{
              ...statusStyles,
              backgroundColor: colors.status[status.variant as keyof typeof colors.status]?.bg || colors.status.active.bg,
              borderColor: colors.status[status.variant as keyof typeof colors.status]?.border || colors.status.active.border,
              color: colors.status[status.variant as keyof typeof colors.status]?.text || colors.status.active.text,
            }}
          >
            {status.label}
          </span>
        )}
        {actions && <div style={{ display: "flex", gap: "0.5rem" }}>{actions}</div>}
      </header>
    );
  }
);

HUDHeader.displayName = "HUDHeader";