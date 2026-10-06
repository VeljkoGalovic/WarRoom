"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

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
}

const variantStyles: Record<StatusBadgeVariant, string> = {
  active: "badge-tactical-active",
  contested: "badge-tactical-contested",
  blocked: "badge-tactical-blocked",
  complete: "badge-tactical-complete",
  archived: "badge-tactical-archived",
  "defcon-1": "bg-red-900/30 border-red-500 text-red-400",
  "defcon-2": "bg-orange-900/30 border-orange-500 text-orange-400",
  "defcon-3": "bg-amber-900/30 border-amber-500 text-amber-400",
  "defcon-4": "bg-yellow-900/30 border-yellow-500 text-yellow-400",
  "defcon-5": "bg-green-900/30 border-green-500 text-green-400",
  "mission-complete": "bg-green-900/30 border-green-500 text-green-400",
  standby: "bg-slate-900/30 border-slate-500 text-slate-400",
  deploying: "bg-blue-900/30 border-blue-500 text-blue-400",
  holding: "bg-amber-900/30 border-amber-500 text-amber-400",
  extracting: "bg-purple-900/30 border-purple-500 text-purple-400",
};

const variantIcons: Record<StatusBadgeVariant, React.ReactNode> = {
  active: <span className="h-1.5 w-1.5 rounded-full bg-secondary-glow animate-pulse" />,
  contested: <span className="h-1.5 w-1.5 rounded-full bg-primary-glow animate-pulse-slow" />,
  blocked: <span className="h-1.5 w-1.5 rounded-full bg-destructive-glow" />,
  complete: <span className="h-1.5 w-1.5 rounded-full bg-secondary-glow" />,
  archived: <span className="h-1.5 w-1.5 rounded-full bg-foreground-muted" />,
  "defcon-1": <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />,
  "defcon-2": <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse-slow" />,
  "defcon-3": <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />,
  "defcon-4": <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />,
  "defcon-5": <span className="h-1.5 w-1.5 rounded-full bg-green-400" />,
  "mission-complete": <span className="h-1.5 w-1.5 rounded-full bg-green-400" />,
  standby: <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />,
  deploying: <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />,
  holding: <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />,
  extracting: <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />,
};

const variantLabels: Record<StatusBadgeVariant, string> = {
  active: "ACTIVE",
  contested: "CONTESTED",
  blocked: "BLOCKED",
  complete: "MISSION COMPLETE",
  archived: "ARCHIVED",
  "defcon-1": "DEFCON 1",
  "defcon-2": "DEFCON 2",
  "defcon-3": "DEFCON 3",
  "defcon-4": "DEFCON 4",
  "defcon-5": "DEFCON 5",
  "mission-complete": "MISSION COMPLETE",
  standby: "STANDBY",
  deploying: "DEPLOYING",
  holding: "HOLDING",
  extracting: "EXTRACTING",
};

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, variant = "active", showPulse = true, icon, children, ...props }, ref) => {
    const label = children || variantLabels[variant];
    const badgeIcon = icon ?? variantIcons[variant];

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5",
          "font-mono text-[0.625rem] font-bold uppercase tracking-wider",
          "rounded-full border",
          variantStyles[variant],
          showPulse && (variant === "active" || variant === "defcon-1" || variant === "deploying" || variant === "extracting") && "animate-glow",
          className
        )}
        {...props}
      >
        {badgeIcon}
        <span>{label}</span>
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

// Compound component for status with additional info
interface StatusBadgeWithInfoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: StatusBadgeVariant;
  label?: string;
  subtext?: string;
  className?: string;
}

export function StatusBadgeWithInfo({ variant = "active", label, subtext, className, children, ...props }: StatusBadgeWithInfoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      <StatusBadge variant={variant} />
      <div className="flex flex-col">
        {label && <span className="font-mono text-xs font-bold text-foreground">{label}</span>}
        {subtext && <span className="font-mono text-[0.625rem] text-foreground-muted">{subtext}</span>}
        {children}
      </div>
    </div>
  );
}