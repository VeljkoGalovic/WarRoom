/**
 * War Room HUD Theme Configuration
 *
 * Centralized design tokens for the tactical command interface.
 * All aesthetic values (colors, borders, effects, animations) live here.
 * Modify this file to completely overhaul the look and feel.
 */

import type { CSSProperties } from "react";

// ============================================================================
// COLOR PALETTE - The tactical color system
// ============================================================================

export const colors = {
  // Base layer - Obsidian slate foundations
  background: {
    base: "#030712",           // Deepest dark - main background
    elevated: "#090d16",       // Slightly elevated panels/cards
    hover: "#0f172a",          // Interactive hover states
  },

  // Text layer - High contrast readability
  foreground: {
    primary: "#e2e8f0",        // Primary text - slate-200
    muted: "#64748b",          // Secondary/muted text - slate-500
    subtle: "#334155",         // Subtle text - slate-600
    inverse: "#030712",        // Text on accent backgrounds
  },

  // Card/surface layer
  card: {
    background: "#090d16",
    foreground: "#e2e8f0",
    border: "#1e293b",         // Default card border - slate-800
  },

  // Primary accent - Amber/Gold (Command authority)
  primary: {
    base: "#f59e0b",           // Primary amber
    foreground: "#030712",     // Text on primary
    glow: "#fbbf24",           // Glow/active state
    dim: "#b45309",            // Dimmed/disabled
    subtle: "rgba(245, 158, 11, 0.1)",   // 10% opacity
    medium: "rgba(245, 158, 11, 0.2)",   // 20% opacity
    strong: "rgba(245, 158, 11, 0.3)",   // 30% opacity
  },

  // Secondary accent - Phosphor Green (Operational/Intel)
  secondary: {
    base: "#10b981",           // Phosphor green
    foreground: "#030712",     // Text on secondary
    glow: "#34d399",           // Glow/active state
    dim: "#059669",            // Dimmed/disabled
    subtle: "rgba(16, 185, 129, 0.1)",   // 10% opacity
    medium: "rgba(16, 185, 129, 0.2)",   // 20% opacity
    strong: "rgba(16, 185, 129, 0.3)",   // 30% opacity
  },

  // Destructive/Critical - Red (Threats/Alerts)
  destructive: {
    base: "#ef4444",           // Red-500
    foreground: "#fafafa",     // Text on destructive
    glow: "#f87171",           // Glow/active state
    dim: "#dc2626",            // Dimmed/disabled
    subtle: "rgba(239, 68, 68, 0.1)",
    medium: "rgba(239, 68, 68, 0.2)",
    strong: "rgba(239, 68, 68, 0.3)",
  },

  // Muted/Neutral
  muted: {
    background: "#1e293b",     // Slate-800
    foreground: "#64748b",     // Slate-500
  },

  // Border system
  border: {
    default: "#1e293b",        // Default borders - slate-800
    input: "#1e293b",          // Input borders
    ring: "#f59e0b",           // Focus ring - amber
  },

  // HUD-specific tactical colors
  hud: {
    border: "#1e293b",         // Default HUD panel border
    borderActive: "#f59e0b",   // Active/selected border
    reticle: "#f59e0b",        // Reticle corner color
    scanline: "rgba(16, 185, 129, 0.03)", // Subtle scanline overlay
  },

  // Threat level colors (semantic mapping)
  threat: {
    critical: { bg: "rgba(239, 68, 68, 0.2)", border: "#ef4444", glow: "rgba(239, 68, 68, 0.5)", text: "#f87171" },
    high: { bg: "rgba(245, 158, 11, 0.2)", border: "#f59e0b", glow: "rgba(245, 158, 11, 0.5)", text: "#fbbf24" },
    medium: { bg: "rgba(16, 185, 129, 0.2)", border: "#10b981", glow: "rgba(16, 185, 129, 0.5)", text: "#34d399" },
    low: { bg: "rgba(100, 116, 139, 0.2)", border: "#64748b", glow: "none", text: "#64748b" },
  },

  // Status colors (semantic mapping)
  status: {
    active: { bg: "rgba(16, 185, 129, 0.15)", border: "#10b981", text: "#34d399", pulse: true },
    contested: { bg: "rgba(245, 158, 11, 0.15)", border: "#f59e0b", text: "#fbbf24", pulse: true },
    blocked: { bg: "rgba(239, 68, 68, 0.15)", border: "#ef4444", text: "#f87171", pulse: false },
    complete: { bg: "rgba(16, 185, 129, 0.2)", border: "#10b981", text: "#34d399", pulse: false },
    archived: { bg: "rgba(100, 116, 139, 0.15)", border: "#64748b", text: "#64748b", pulse: false },
    standby: { bg: "rgba(100, 116, 139, 0.15)", border: "#64748b", text: "#64748b", pulse: false },
    deploying: { bg: "rgba(59, 130, 246, 0.15)", border: "#3b82f6", text: "#60a5fa", pulse: true },
    holding: { bg: "rgba(245, 158, 11, 0.15)", border: "#f59e0b", text: "#fbbf24", pulse: false },
    extracting: { bg: "rgba(168, 85, 247, 0.15)", border: "#a855f7", text: "#c084fc", pulse: true },
    "defcon-1": { bg: "rgba(239, 68, 68, 0.3)", border: "#ef4444", text: "#f87171", pulse: true },
    "defcon-2": { bg: "rgba(249, 115, 22, 0.3)", border: "#f97316", text: "#fb923c", pulse: true },
    "defcon-3": { bg: "rgba(245, 158, 11, 0.3)", border: "#f59e0b", text: "#fbbf24", pulse: false },
    "defcon-4": { bg: "rgba(234, 179, 8, 0.3)", border: "#eab308", text: "#facc15", pulse: false },
    "defcon-5": { bg: "rgba(16, 185, 129, 0.3)", border: "#10b981", text: "#34d399", pulse: false },
    "mission-complete": { bg: "rgba(16, 185, 129, 0.3)", border: "#10b981", text: "#34d399", pulse: false },
  },

  // Rank insignia colors
  rank: {
    general: "#f59e0b",
    captain: "#f59e0b",
    specialist: "#10b981",
    lieutenant: "#10b981",
    sergeant: "#ef4444",
  },
} as const;

// ============================================================================
// SPACING & SIZING - Consistent spatial system
// ============================================================================

export const spacing = {
  // Base unit: 4px
  xs: "0.25rem",   // 4px
  sm: "0.5rem",    // 8px
  md: "1rem",      // 16px
  lg: "1.5rem",    // 24px
  xl: "2rem",      // 32px
  xxl: "3rem",     // 48px

  // Component-specific
  cardPadding: "1.5rem",        // 24px
  cardPaddingSm: "1rem",        // 16px
  cardGap: "1rem",              // 16px
  sectionGap: "2rem",           // 32px
  inlineGap: "0.5rem",          // 8px
  tightGap: "0.25rem",          // 4px
} as const;

export const sizing = {
  // Border radius
  radius: {
    none: "0",
    sm: "0.25rem",    // 4px
    md: "0.375rem",   // 6px
    lg: "0.5rem",     // 8px (default)
    xl: "0.75rem",    // 12px
    xxl: "1rem",      // 16px
    full: "9999px",   // Pills/badges
  },

  // Border widths
  borderWidth: {
    thin: "1px",
    default: "1px",
    thick: "2px",
    heavier: "3px",
  },

  // Component dimensions
  badge: {
    height: "1.5rem",       // 24px
    paddingX: "0.75rem",    // 12px
    fontSize: "0.625rem",   // 10px
    iconSize: "0.375rem",   // 6px
  },

  button: {
    height: {
      sm: "2rem",       // 32px
      md: "2.5rem",     // 40px
      lg: "3rem",       // 48px
      icon: "2.5rem",   // 40px (square)
    },
    paddingX: {
      sm: "0.75rem",    // 12px
      md: "1rem",       // 16px
      lg: "1.5rem",     // 24px
      icon: "0.625rem", // 10px
    },
    fontSize: {
      sm: "0.625rem",   // 10px
      md: "0.75rem",    // 12px
      lg: "0.875rem",   // 14px
    },
  },

  input: {
    height: "2.5rem",     // 40px
    paddingX: "0.75rem",  // 12px
    fontSize: "0.875rem", // 14px
  },

  // Node sizing for War Map
  node: {
    minSize: 60,
    baseSize: 120,
    maxSize: 200,
  },

  // Icon sizes
  icon: {
    xs: "0.75rem",    // 12px
    sm: "1rem",       // 16px
    md: "1.25rem",    // 20px
    lg: "1.5rem",     // 24px
    xl: "2rem",       // 32px
    xxl: "3rem",      // 48px
  },
} as const;

// ============================================================================
// TYPOGRAPHY - Font system
// ============================================================================

export const typography = {
  fontFamily: {
    sans: "var(--font-geist-sans), system-ui, sans-serif",
    mono: "var(--font-geist-mono), monospace",
  },

  // Tactical text styles (uppercase, monospace, tracked)
  tactical: {
    base: {
      fontFamily: "var(--font-geist-mono), monospace",
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
      fontSize: "0.75rem",
      fontWeight: 600,
    },
    lg: {
      fontFamily: "var(--font-geist-mono), monospace",
      letterSpacing: "0.15em",
      textTransform: "uppercase" as const,
      fontSize: "0.875rem",
      fontWeight: 700,
    },
    xl: {
      fontFamily: "var(--font-geist-mono), monospace",
      letterSpacing: "0.2em",
      textTransform: "uppercase" as const,
      fontSize: "1rem",
      fontWeight: 700,
    },
  },

  // Timestamp/metadata text
  timestamp: {
    fontFamily: "var(--font-geist-mono), monospace",
    fontSize: "0.75rem",
    color: "var(--foreground-muted)",
  },

  // Standard body text
  body: {
    sm: { fontSize: "0.875rem", lineHeight: "1.5" },
    base: { fontSize: "1rem", lineHeight: "1.6" },
    lg: { fontSize: "1.125rem", lineHeight: "1.6" },
  },
} as const;

// ============================================================================
// ANIMATIONS & TRANSITIONS - Motion system
// ============================================================================

export const motion = {
  // Transition durations
  duration: {
    instant: "50ms",
    fast: "150ms",
    default: "200ms",
    slow: "300ms",
    slower: "500ms",
  },

  // Easing curves
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  },

  // Keyframe animations
  keyframes: {
    // Scanline sweep
    scanline: {
      "0%": { transform: "translateY(-100%)" },
      "100%": { transform: "translateY(100vh)" },
    },

    // Glow pulse
    glow: {
      "0%": { boxShadow: "0 0 5px var(--primary), 0 0 10px var(--primary), 0 0 15px var(--primary)" },
      "100%": { boxShadow: "0 0 10px var(--primary), 0 0 20px var(--primary), 0 0 30px var(--primary)" },
    },

    // Pulse slow (for status indicators)
    pulseSlow: {
      "0%, 100%": { opacity: 1 },
      "50%": { opacity: 0.5 },
    },

    // Slide down (for entering content)
    slideDown: {
      "0%": { opacity: 0, transform: "translateY(-10px)" },
      "100%": { opacity: 1, transform: "translateY(0)" },
    },

    // Fade in
    fadeIn: {
      "0%": { opacity: 0 },
      "100%": { opacity: 1 },
    },

    // Scale in
    scaleIn: {
      "0%": { opacity: 0, transform: "scale(0.95)" },
      "100%": { opacity: 1, transform: "scale(1)" },
    },
  },

  // Animation definitions (ready for CSS-in-JS or Tailwind)
  animations: {
    scanline: "scanline 8s linear infinite",
    glow: "glow 2s ease-in-out infinite alternate",
    pulseSlow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    slideDown: "slide-down 0.2s ease-out",
    fadeIn: "fadeIn 0.2s ease-out",
    scaleIn: "scaleIn 0.15s ease-out",
  },
} as const;

// ============================================================================
// EFFECTS - Visual effects (shadows, blurs, gradients)
// ============================================================================

export const effects = {
  // Shadows
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    default: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    // Tactical glow shadows
    glowPrimary: "0 0 20px rgba(245, 158, 11, 0.15)",
    glowSecondary: "0 0 20px rgba(16, 185, 129, 0.15)",
    glowDestructive: "0 0 20px rgba(239, 68, 68, 0.15)",
    glowIntense: "0 0 30px rgba(245, 158, 11, 0.3), 0 0 60px rgba(245, 158, 11, 0.15)",
  },

  // Blur/backdrop
  blur: {
    none: "0",
    sm: "4px",
    default: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
  },

  // Gradients
  gradients: {
    // Top border glow
    topGlow: "linear-gradient(90deg, transparent, var(--hud-border-active), transparent)",
    topGlowSubtle: "linear-gradient(90deg, transparent, var(--hud-border-active), transparent)",

    // Progress fills
    progressPrimary: "linear-gradient(90deg, var(--primary), var(--secondary))",
    progressCritical: "linear-gradient(90deg, var(--destructive), var(--primary))",

    // Background patterns
    scanline: `repeating-linear-gradient(0deg, transparent, transparent 2px, var(--hud-scanline) 2px, var(--hud-scanline) 4px)`,
    grid: `linear-gradient(var(--hud-border) 1px, transparent 1px), linear-gradient(90deg, var(--hud-border) 1px, transparent 1px)`,
  },
} as const;

// ============================================================================
// Z-INDEX LAYERING - Stacking context
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
  max: 9999,
} as const;

// ============================================================================
// BREAKPOINTS - Responsive thresholds
// ============================================================================

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  xxl: "1536px",
} as const;

// ============================================================================
// COMPONENT VARIANT RECIPES - Pre-composed style combinations
// ============================================================================

export const componentRecipes = {
  // Card variants
  card: {
    default: {
      background: colors.card.background,
      border: `1px solid ${colors.card.border}`,
      borderRadius: sizing.radius.lg,
      backdropFilter: `blur(${effects.blur.default})`,
      boxShadow: effects.shadows.none,
    },
    active: {
      background: colors.card.background,
      border: `1px solid ${colors.hud.borderActive}`,
      borderRadius: sizing.radius.lg,
      backdropFilter: `blur(${effects.blur.default})`,
      boxShadow: effects.shadows.glowPrimary,
    },
    elevated: {
      background: colors.card.background,
      border: `1px solid ${colors.card.border}`,
      borderRadius: sizing.radius.lg,
      backdropFilter: `blur(${effects.blur.default})`,
      boxShadow: effects.shadows.lg,
    },
  },

  // Button variants
  button: {
    primary: {
      border: `1px solid ${colors.primary.base}`,
      color: colors.primary.base,
      background: "transparent",
      hover: {
        background: colors.primary.subtle,
        boxShadow: `0 0 15px ${colors.primary.glow}80`,
      },
      active: {
        background: colors.primary.medium,
      },
    },
    secondary: {
      border: `1px solid ${colors.secondary.base}`,
      color: colors.secondary.base,
      background: "transparent",
      hover: {
        background: colors.secondary.subtle,
        boxShadow: `0 0 15px ${colors.secondary.glow}80`,
      },
      active: {
        background: colors.secondary.medium,
      },
    },
    danger: {
      border: `1px solid ${colors.destructive.base}`,
      color: colors.destructive.base,
      background: "transparent",
      hover: {
        background: colors.destructive.subtle,
        boxShadow: `0 0 15px ${colors.destructive.glow}80`,
      },
      active: {
        background: colors.destructive.medium,
      },
    },
    ghost: {
      border: "1px solid transparent",
      color: colors.foreground.muted,
      background: "transparent",
      hover: {
        background: colors.muted.background,
        color: colors.foreground.primary,
        borderColor: colors.border.default,
      },
    },
    outlinePrimary: {
      border: `1px solid ${colors.primary.base}`,
      color: colors.primary.base,
      background: "transparent",
      hover: {
        background: colors.primary.subtle,
      },
    },
    outlineSecondary: {
      border: `1px solid ${colors.secondary.base}`,
      color: colors.secondary.base,
      background: "transparent",
      hover: {
        background: colors.secondary.subtle,
      },
    },
    outlineDanger: {
      border: `1px solid ${colors.destructive.base}`,
      color: colors.destructive.base,
      background: "transparent",
      hover: {
        background: colors.destructive.subtle,
      },
    },
  },

  // Input variants
  input: {
    default: {
      background: colors.background.base,
      border: `1px solid ${colors.border.input}`,
      color: colors.foreground.primary,
      padding: `${spacing.sm} ${spacing.md}`,
      borderRadius: sizing.radius.lg,
      fontFamily: typography.fontFamily.mono,
      fontSize: typography.body.sm.fontSize,
      transition: `all ${motion.duration.fast} ${motion.easing.default}`,
      focus: {
        outline: "none",
        borderColor: colors.border.ring,
        boxShadow: `0 0 0 2px ${colors.primary.glow}33`,
      },
      placeholder: {
        color: colors.foreground.muted,
      },
    },
    error: {
      borderColor: colors.destructive.base,
      focus: {
        borderColor: colors.destructive.base,
        boxShadow: `0 0 0 2px ${colors.destructive.glow}33`,
      },
    },
  },

  // Badge variants (generated from status colors)
  badge: (variant: keyof typeof colors.status) => {
    const style = colors.status[variant];
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: spacing.tightGap,
      padding: `${spacing.tightGap} ${spacing.sm}`,
      fontFamily: typography.fontFamily.mono,
      fontSize: sizing.badge.fontSize,
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
      borderRadius: sizing.radius.full,
      border: `1px solid ${style.border}`,
      background: style.bg,
      color: style.text,
      ...(style.pulse && { animation: motion.animations.pulseSlow }),
    };
  },
} as const;

// ============================================================================
// UTILITY - CSS variable generation for Tailwind/runtime use
// ============================================================================

/**
 * Generates CSS custom properties for all theme tokens.
 * Use this to inject theme values into :root for Tailwind v4 or runtime theming.
 */
export function generateCSSVariables(prefix = ""): Record<string, string> {
  const vars: Record<string, string> = {};

  // Flatten colors
  function flatten(obj: any, path: string[] = []) {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = [...path, key];
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        flatten(value, newPath);
      } else {
        vars[`--${prefix}${newPath.join("-")}`] = String(value);
      }
    }
  }

  flatten(colors);
  flatten(spacing);
  flatten(sizing);
  flatten(typography);
  flatten(motion);
  flatten(effects);
  flatten(zIndex);
  flatten(breakpoints);

  return vars;
}

// ============================================================================
// THEME CONTRACT - Type-safe theme interface
// ============================================================================

export type HUDTheme = typeof colors & typeof spacing & typeof sizing & typeof typography & typeof motion & typeof effects & typeof zIndex & typeof breakpoints;

export const theme: HUDTheme = {
  ...colors,
  ...spacing,
  ...sizing,
  ...typography,
  ...motion,
  ...effects,
  ...zIndex,
  ...breakpoints,
} as HUDTheme;

export default theme;