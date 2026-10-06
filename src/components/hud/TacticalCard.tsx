"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TacticalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "active" | "elevated";
  withReticle?: boolean;
  withScanlines?: boolean;
  className?: string;
}

export const TacticalCard = React.forwardRef<HTMLDivElement, TacticalCardProps>(
  ({ className, variant = "default", withReticle = true, withScanlines = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-lg bg-card border backdrop-blur-sm transition-all duration-200",
          "overflow-hidden",
          variant === "default" && "border-card-border",
          variant === "active" && "border-hud-border-active shadow-[0_0_20px_rgba(245,158,11,0.15)]",
          variant === "elevated" && "border-card-border shadow-lg shadow-black/30",
          withScanlines && "before:content-[''] before:absolute before:inset-0 before:bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,var(--hud-scanline)_2px,var(--hud-scanline)_4px)] before:pointer-events-none before:opacity-50",
          className
        )}
        {...props}
      >
        {/* Top glow border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-hud-border-active to-transparent opacity-50" />

        {/* Reticle corners */}
        {withReticle && (
          <>
            <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-hud-reticle opacity-60" />
            <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t-2 border-r-2 border-hud-reticle opacity-60" />
            <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b-2 border-l-2 border-hud-reticle opacity-60" />
            <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-2 border-r-2 border-hud-reticle opacity-60" />
          </>
        )}

        <div className="relative p-6">{children}</div>
      </div>
    );
  }
);

TacticalCard.displayName = "TacticalCard";

interface TacticalCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const TacticalCardHeader = React.forwardRef<HTMLDivElement, TacticalCardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mb-4 flex items-center justify-between gap-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TacticalCardHeader.displayName = "TacticalCardHeader";

interface TacticalCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
}

export const TacticalCardTitle = React.forwardRef<HTMLHeadingElement, TacticalCardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("text-tactical-lg text-foreground", className)}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

TacticalCardTitle.displayName = "TacticalCardTitle";

interface TacticalCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

export const TacticalCardDescription = React.forwardRef<HTMLParagraphElement, TacticalCardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-foreground-muted", className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

TacticalCardDescription.displayName = "TacticalCardDescription";

interface TacticalCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const TacticalCardContent = React.forwardRef<HTMLDivElement, TacticalCardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {children}
      </div>
    );
  }
);

TacticalCardContent.displayName = "TacticalCardContent";

interface TacticalCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const TacticalCardFooter = React.forwardRef<HTMLDivElement, TacticalCardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mt-4 flex items-center gap-3 border-t border-card-border pt-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TacticalCardFooter.displayName = "TacticalCardFooter";