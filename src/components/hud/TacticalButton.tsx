"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { colors, sizing, typography, motion, effects, type HUDTheme } from "@/styles/hud-theme";

/**
 * TacticalButton - Tactical action button
 * All styling driven by centralized theme configuration
 */

export type TacticalButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "outline-primary"
  | "outline-secondary"
  | "outline-danger";

export type TacticalButtonSize = "sm" | "md" | "lg" | "icon";

interface TacticalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TacticalButtonVariant;
  size?: TacticalButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  theme?: Partial<HUDTheme>;
}

const variantThemeMap: Record<TacticalButtonVariant, keyof typeof colors> = {
  primary: "primary",
  secondary: "secondary",
  danger: "destructive",
  ghost: "muted",
  "outline-primary": "primary",
  "outline-secondary": "secondary",
  "outline-danger": "destructive",
};

const sizeStyles: Record<TacticalButtonSize, React.CSSProperties> = {
  sm: {
    height: sizing.button.height.sm,
    paddingLeft: sizing.button.paddingX.sm,
    paddingRight: sizing.button.paddingX.sm,
    fontSize: sizing.button.fontSize.sm,
  },
  md: {
    height: sizing.button.height.md,
    paddingLeft: sizing.button.paddingX.md,
    paddingRight: sizing.button.paddingX.md,
    fontSize: sizing.button.fontSize.md,
  },
  lg: {
    height: sizing.button.height.lg,
    paddingLeft: sizing.button.paddingX.lg,
    paddingRight: sizing.button.paddingX.lg,
    fontSize: sizing.button.fontSize.lg,
  },
  icon: {
    height: sizing.button.height.icon,
    paddingLeft: sizing.button.paddingX.icon,
    paddingRight: sizing.button.paddingX.icon,
    fontSize: sizing.button.fontSize.md,
  },
};

export const TacticalButton = React.forwardRef<HTMLButtonElement, TacticalButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      theme: themeOverride,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const themeColor = variantThemeMap[variant];
    const colorPalette = colors[themeColor] as typeof colors.primary;
    const isOutline = variant.startsWith("outline-");
    const isGhost = variant === "ghost";

    // Build base styles from theme
    const baseStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      fontFamily: typography.fontFamily.mono,
      fontWeight: 600,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      borderRadius: sizing.radius.lg,
      borderWidth: sizing.borderWidth.default,
      borderStyle: "solid",
      transition: `all ${motion.duration.fast} ${motion.easing.default}`,
      cursor: isDisabled ? "not-allowed" : "pointer",
      opacity: isDisabled ? 0.5 : 1,
      width: fullWidth ? "100%" : "auto",
      ...sizeStyles[size],
    };

    // Apply variant-specific styles
    if (isGhost) {
      baseStyles.borderColor = "transparent";
      baseStyles.color = colors.foreground.muted;
      baseStyles.backgroundColor = "transparent";
    } else if (isOutline) {
      baseStyles.borderColor = colorPalette.base;
      baseStyles.color = colorPalette.base;
      baseStyles.backgroundColor = "transparent";
    } else {
      baseStyles.borderColor = colorPalette.base;
      baseStyles.color = colorPalette.base;
      baseStyles.backgroundColor = "transparent";
    }

    // Hover styles (applied via event handlers)
    const hoverStyles: React.CSSProperties = {};
    if (!isDisabled && !isGhost) {
      hoverStyles.backgroundColor = colorPalette.subtle;
      hoverStyles.boxShadow = `0 0 15px ${colorPalette.glow}80`;
    } else if (!isDisabled && isGhost) {
      hoverStyles.backgroundColor = colors.muted.background;
      hoverStyles.color = colors.foreground.primary;
      hoverStyles.borderColor = colors.border.default;
    }

    // Active styles
    const activeStyles: React.CSSProperties = {};
    if (!isGhost && !isOutline) {
      activeStyles.backgroundColor = colorPalette.medium;
    } else if (isOutline && !isGhost) {
      activeStyles.backgroundColor = colorPalette.subtle;
    }

    return (
      <button
        ref={ref}
        className={cn("tactical-button", className)}
        style={baseStyles}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        onMouseEnter={(e) => {
          if (!isDisabled) Object.assign(e.currentTarget.style, hoverStyles);
          props.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            // Reset to base styles
            if (isGhost) {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colors.foreground.muted;
              e.currentTarget.style.borderColor = "transparent";
            } else if (isOutline) {
              e.currentTarget.style.backgroundColor = "transparent";
            } else {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }
          }
          props.onMouseLeave?.(e);
        }}
        onMouseDown={(e) => {
          if (!isDisabled) Object.assign(e.currentTarget.style, activeStyles);
          props.onMouseDown?.(e);
        }}
        onMouseUp={(e) => {
          if (!isDisabled && !isGhost) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.boxShadow = `0 0 15px ${colorPalette.glow}80`;
          }
          props.onMouseUp?.(e);
        }}
        {...props}
      >
        {loading && (
          <Loader2
            className="h-4 w-4 animate-spin"
            style={{ color: isGhost ? colors.foreground.muted : colorPalette.base }}
            aria-hidden="true"
          />
        )}
        {!loading && leftIcon && (
          <span style={{ display: "flex", flexShrink: 0 }}>{leftIcon}</span>
        )}
        <span style={{ whiteSpace: "nowrap" }}>{children}</span>
        {!loading && rightIcon && (
          <span style={{ display: "flex", flexShrink: 0 }}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

TacticalButton.displayName = "TacticalButton";

/**
 * IconButton - Square icon-only button
 */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TacticalButtonVariant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
  "aria-label": string;
  children: React.ReactNode;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "ghost", size = "md", loading = false, "aria-label": ariaLabel, children, ...props }, ref) => {
    const themeColor = variantThemeMap[variant];
    const colorPalette = colors[themeColor] as typeof colors.primary;
    const isGhost = variant === "ghost";

    const sizeMap = {
      sm: { size: "2rem", iconSize: "1rem" },
      md: { size: "2.5rem", iconSize: "1.25rem" },
      lg: { size: "3rem", iconSize: "1.5rem" },
    };

    const { size: btnSize, iconSize } = sizeMap[size];

    const baseStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: btnSize,
      height: btnSize,
      borderRadius: sizing.radius.lg,
      borderWidth: sizing.borderWidth.default,
      borderStyle: "solid",
      transition: `all ${motion.duration.fast} ${motion.easing.default}`,
      cursor: loading || props.disabled ? "not-allowed" : "pointer",
      opacity: loading || props.disabled ? 0.5 : 1,
    };

    if (isGhost) {
      baseStyles.borderColor = "transparent";
      baseStyles.color = colors.foreground.muted;
      baseStyles.backgroundColor = "transparent";
    } else {
      baseStyles.borderColor = colorPalette.base;
      baseStyles.color = colorPalette.base;
      baseStyles.backgroundColor = "transparent";
    }

    const hoverStyles: React.CSSProperties = {};
    if (!props.disabled && !loading && !isGhost) {
      hoverStyles.backgroundColor = colorPalette.subtle;
      hoverStyles.boxShadow = `0 0 15px ${colorPalette.glow}80`;
    } else if (!props.disabled && !loading && isGhost) {
      hoverStyles.backgroundColor = colors.muted.background;
      hoverStyles.color = colors.foreground.primary;
      hoverStyles.borderColor = colors.border.default;
    }

    return (
      <button
        ref={ref}
        className={cn("tactical-icon-button", className)}
        style={baseStyles}
        disabled={props.disabled || loading}
        aria-busy={loading}
        aria-label={ariaLabel}
        onMouseEnter={(e) => {
          if (!props.disabled && !loading) Object.assign(e.currentTarget.style, hoverStyles);
          props.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (!props.disabled && !loading) {
            if (isGhost) {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colors.foreground.muted;
              e.currentTarget.style.borderColor = "transparent";
            } else {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }
          }
          props.onMouseLeave?.(e);
        }}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: colorPalette.base }} aria-hidden="true" />
        ) : (
          <span style={{ width: iconSize, height: iconSize, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {children}
          </span>
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

/**
 * ButtonGroup - Container for grouped buttons
 */
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, children, orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex",
        orientation === "horizontal" ? "items-center" : "items-stretch",
        className
      )}
      role="group"
      style={{
        gap: orientation === "horizontal" ? "0.5rem" : "0.375rem",
      }}
      {...props}
    >
      {children}
    </div>
  )
);

ButtonGroup.displayName = "ButtonGroup";