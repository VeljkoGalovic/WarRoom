"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { colors, sizing, motion, effects, type HUDTheme } from "@/styles/hud-theme";

/**
 * TacticalCard - Core HUD panel component
 * All styling driven by centralized theme configuration
 */

export interface TacticalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant from theme */
  variant?: "default" | "active" | "elevated";
  /** Show reticle corners */
  withReticle?: boolean;
  /** Show scanline overlay */
  withScanlines?: boolean;
  /** Custom className */
  className?: string;
  /** Children content */
  children: React.ReactNode;
  /** Optional theme override for runtime theming */
  theme?: Partial<HUDTheme>;
}

export const TacticalCard = React.forwardRef<HTMLDivElement, TacticalCardProps>(
  (
    {
      className,
      variant = "default",
      withReticle = true,
      withScanlines = false,
      children,
      theme: themeOverride,
      ...props
    },
    ref
  ) => {
    // Merge theme with override
    const theme = React.useMemo(
      () => ({ ...colors, ...(themeOverride || {}) }),
      [themeOverride]
    );

    // Base styles from theme
    const baseStyles: React.CSSProperties = {
      position: "relative",
      borderRadius: sizing.radius.lg,
      overflow: "hidden",
      transition: `all ${motion.duration.default} ${motion.easing.default}`,
      backgroundColor: theme.card.background,
      border: `1px solid ${
        variant === "active"
          ? theme.hud.borderActive
          : theme.card.border
      }`,
      boxShadow:
        variant === "active"
          ? effects.shadows.glowPrimary
          : variant === "elevated"
          ? effects.shadows.lg
          : effects.shadows.none,
      backdropFilter: `blur(${effects.blur.default})`,
    };

    // Scanline overlay as pseudo-element style
    const scanlineStyle: React.CSSProperties = withScanlines
      ? {
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.05,
          backgroundImage: effects.gradients.scanline,
          zIndex: 1,
        }
      : { display: "none" };

    // Top glow border
    const topGlowStyle: React.CSSProperties = {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "1px",
      background: `linear-gradient(90deg, transparent, ${theme.hud.borderActive}, transparent)`,
      opacity: variant === "active" ? 1 : 0.5,
      pointerEvents: "none",
    };

    // Reticle corners
    const reticleCorner = (
      position: "top-left" | "top-right" | "bottom-left" | "bottom-right"
    ) => {
      const styles: React.CSSProperties = {
        position: "absolute",
        width: sizing.icon.xs,
        height: sizing.icon.xs,
        border: `${sizing.borderWidth.thick} solid ${theme.hud.reticle}`,
        opacity: 0.6,
        pointerEvents: "none",
        zIndex: 2,
      };

      switch (position) {
        case "top-left":
          return { ...styles, top: "-1px", left: "-1px", borderRight: "none", borderBottom: "none" };
        case "top-right":
          return { ...styles, top: "-1px", right: "-1px", borderLeft: "none", borderBottom: "none" };
        case "bottom-left":
          return { ...styles, bottom: "-1px", left: "-1px", borderRight: "none", borderTop: "none" };
        case "bottom-right":
          return { ...styles, bottom: "-1px", right: "-1px", borderLeft: "none", borderTop: "none" };
      }
    };

    return (
      <div ref={ref} style={baseStyles} className={cn("hud-panel", className)} {...props}>
        {/* Scanline overlay */}
        <div style={scanlineStyle} aria-hidden="true" />

        {/* Top glow border */}
        <div style={topGlowStyle} aria-hidden="true" />

        {/* Reticle corners */}
        {withReticle && (
          <>
            <div style={reticleCorner("top-left")} aria-hidden="true" />
            <div style={reticleCorner("top-right")} aria-hidden="true" />
            <div style={reticleCorner("bottom-left")} aria-hidden="true" />
            <div style={reticleCorner("bottom-right")} aria-hidden="true" />
          </>
        )}

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
      </div>
    );
  }
);

TacticalCard.displayName = "TacticalCard";

/**
 * TacticalCardHeader - Semantic header section
 */
export interface TacticalCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const TacticalCardHeader = React.forwardRef<HTMLDivElement, TacticalCardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 py-4 border-b border-card-border", className)}
      style={{ borderColor: colors.card.border }}
      {...props}
    >
      {children}
    </div>
  )
);

TacticalCardHeader.displayName = "TacticalCardHeader";

/**
 * TacticalCardTitle - Semantic title with tactical styling
 */
export interface TacticalCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const TacticalCardTitle = React.forwardRef<HTMLHeadingElement, TacticalCardTitleProps>(
  ({ className, children, size = "md", ...props }, ref) => {
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { fontSize: "0.75rem", letterSpacing: "0.1em" },
      md: { fontSize: "0.875rem", letterSpacing: "0.1em" },
      lg: { fontSize: "1rem", letterSpacing: "0.15em" },
    };

    return (
      <h3
        ref={ref}
        className={cn(
          "font-mono uppercase tracking-wider font-semibold text-foreground",
          className
        )}
        style={{ ...sizeStyles[size], color: colors.foreground.primary }}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

TacticalCardTitle.displayName = "TacticalCardTitle";

/**
 * TacticalCardContent - Content area
 */
export interface TacticalCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const TacticalCardContent = React.forwardRef<HTMLDivElement, TacticalCardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("p-6", className)} {...props}>
      {children}
    </div>
  )
);

TacticalCardContent.displayName = "TacticalCardContent";

/**
 * TacticalCardFooter - Footer section
 */
export interface TacticalCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const TacticalCardFooter = React.forwardRef<HTMLDivElement, TacticalCardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 py-4 border-t border-card-border", className)}
      style={{ borderColor: colors.card.border }}
      {...props}
    >
      {children}
    </div>
  )
);

TacticalCardFooter.displayName = "TacticalCardFooter";