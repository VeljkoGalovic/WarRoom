"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

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
}

const variantClasses: Record<TacticalButtonVariant, string> = {
  primary: "btn-tactical-primary",
  secondary: "btn-tactical-secondary",
  danger: "btn-tactical-danger",
  ghost: "btn-tactical-ghost",
  "outline-primary": "border-primary text-primary hover:bg-primary/10",
  "outline-secondary": "border-secondary text-secondary hover:bg-secondary/10",
  "outline-danger": "border-destructive text-destructive hover:bg-destructive/10",
};

const sizeClasses: Record<TacticalButtonSize, string> = {
  sm: "px-3 py-1.5 text-[0.625rem]",
  md: "px-4 py-2 text-[0.75rem]",
  lg: "px-6 py-3 text-[0.875rem]",
  icon: "p-2",
};

export const TacticalButton = React.forwardRef<HTMLButtonElement, TacticalButtonProps>(
  ({
    className,
    variant = "primary",
    size = "md",
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          "btn-tactical inline-flex items-center justify-center gap-2 font-mono uppercase tracking-wider font-semibold",
          "transition-all duration-150 ease-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "active:scale-[0.98]",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : leftIcon ? (
          <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>
        ) : null}
        <span>{children}</span>
        {!loading && rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  }
);

TacticalButton.displayName = "TacticalButton";

// Specialized button variants for common tactical actions
interface DispatchButtonProps extends Omit<TacticalButtonProps, "variant" | "leftIcon"> {
  agentName?: string;
}

export function DispatchButton({ agentName, children = "DISPATCH", ...props }: DispatchButtonProps) {
  return (
    <TacticalButton
      variant="primary"
      leftIcon={<span className="text-primary-glow">▸</span>}
      {...props}
    >
      {children} {agentName && <span className="opacity-70">→ {agentName.toUpperCase()}</span>}
    </TacticalButton>
  );
}

export function AbortButton({ children = "ABORT", ...props }: Omit<TacticalButtonProps, "variant">) {
  return (
    <TacticalButton variant="danger" {...props}>
      {children}
    </TacticalButton>
  );
}

export function StandbyButton({ children = "STANDBY", ...props }: Omit<TacticalButtonProps, "variant">) {
  return (
    <TacticalButton variant="ghost" {...props}>
      {children}
    </TacticalButton>
  );
}

export function ConfirmButton({ children = "CONFIRM", ...props }: Omit<TacticalButtonProps, "variant">) {
  return (
    <TacticalButton variant="secondary" {...props}>
      {children}
    </TacticalButton>
  );
}

// Button group for tactical action bars
interface TacticalButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function TacticalButtonGroup({ children, className, ...props }: TacticalButtonGroupProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-2 rounded-lg bg-muted/50 p-1", className)}
      role="group"
      aria-label="Tactical actions"
      {...props}
    >
      {children}
    </div>
  );
}

// Icon-only tactical button for dense toolbars
interface TacticalIconButtonProps extends Omit<TacticalButtonProps, "size" | "children"> {
  icon: React.ReactNode;
  label: string;
}

export function TacticalIconButton({ icon, label, className, ...props }: TacticalIconButtonProps) {
  return (
    <TacticalButton
      size="icon"
      variant="ghost"
      className={cn("relative", className)}
      aria-label={label}
      {...props}
    >
      {icon}
      {/* Tooltip-like label on hover */}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[0.625rem] font-mono text-foreground bg-card border border-card-border rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {label}
      </span>
    </TacticalButton>
  );
}