"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { colors, sizing, typography, motion, effects } from "@/styles/hud-theme";

/**
 * TerminalInput - Tactical form input component
 * All styling driven by centralized theme configuration
 */

export interface TerminalInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix" | "suffix"> {
  label?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: string;
  hint?: string;
  className?: string;
}

export const TerminalInput = React.forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ className, label, prefix, suffix, error, hint, id, ...props }, ref) => {
    const inputId = id || `terminal-input-${React.useId()}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const hasError = !!error;
    const hasHint = !!hint;

    // Build inline styles from theme
    const inputStyles: React.CSSProperties = {
      backgroundColor: colors.background.base,
      border: `1px solid ${hasError ? colors.destructive.base : colors.border.input}`,
      color: colors.foreground.primary,
      padding: `${sizing.input.paddingX} ${sizing.input.paddingX}`,
      borderRadius: sizing.radius.lg,
      fontFamily: typography.fontFamily.mono,
      fontSize: sizing.input.fontSize,
      height: sizing.input.height,
      width: "100%",
      transition: `all ${motion.duration.fast} ${motion.easing.default}`,
      boxSizing: "border-box",
    };

    const focusStyles: React.CSSProperties = {
      outline: "none",
      borderColor: hasError ? colors.destructive.base : colors.border.ring,
      boxShadow: `0 0 0 2px ${
        hasError ? colors.destructive.glow + "33" : colors.primary.glow + "33"
      }`,
    };

    const wrapperStyles: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      width: "100%",
    };

    const labelStyles: React.CSSProperties = {
      fontFamily: typography.fontFamily.mono,
      fontSize: "0.75rem",
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: hasError ? colors.destructive.base : colors.foreground.primary,
      marginBottom: "0.375rem",
    };

    const prefixStyles: React.CSSProperties = {
      position: "absolute",
      left: sizing.input.paddingX,
      top: "50%",
      transform: "translateY(-50%)",
      color: colors.foreground.muted,
      fontFamily: typography.fontFamily.mono,
      fontSize: sizing.input.fontSize,
      pointerEvents: "none",
      zIndex: 1,
    };

    const suffixStyles: React.CSSProperties = {
      position: "absolute",
      right: sizing.input.paddingX,
      top: "50%",
      transform: "translateY(-50%)",
      color: colors.foreground.muted,
      fontFamily: typography.fontFamily.mono,
      fontSize: sizing.input.fontSize,
      pointerEvents: "none",
      zIndex: 1,
    };

    const inputWrapperStyles: React.CSSProperties = {
      position: "relative",
      display: "flex",
      alignItems: "center",
    };

    const errorHintStyles: React.CSSProperties = {
      marginTop: "0.375rem",
      fontFamily: typography.fontFamily.mono,
      fontSize: "0.625rem",
      letterSpacing: "0.05em",
      color: hasError ? colors.destructive.glow : colors.foreground.muted,
    };

    return (
      <div className={cn("w-full", className)} style={wrapperStyles}>
        {label && (
          <label htmlFor={inputId} style={labelStyles}>
            {label}
          </label>
        )}
        <div style={inputWrapperStyles}>
          {prefix && <span style={prefixStyles}>{prefix}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "input-tactical",
              prefix && "pl-10",
              suffix && "pr-10"
            )}
            style={{
              ...inputStyles,
              paddingLeft: prefix ? "2.5rem" : sizing.input.paddingX,
              paddingRight: suffix ? "2.5rem" : sizing.input.paddingX,
            }}
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={
              hasError ? errorId : hasHint ? hintId : undefined
            }
            onFocus={(e) => {
              Object.assign(e.currentTarget.style, focusStyles);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              // Reset focus styles
              e.currentTarget.style.borderColor = hasError
                ? colors.destructive.base
                : colors.border.input;
              e.currentTarget.style.boxShadow = "none";
              props.onBlur?.(e);
            }}
            {...props}
          />
          {suffix && <span style={suffixStyles}>{suffix}</span>}
        </div>
        {hasError && (
          <p id={errorId} style={errorHintStyles} role="alert">
            {error}
          </p>
        )}
        {hasHint && !hasError && (
          <p id={hintId} style={errorHintStyles}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

TerminalInput.displayName = "TerminalInput";

/**
 * TerminalTextarea - Tactical textarea component
 */
export interface TerminalTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "prefix" | "suffix"> {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  rows?: number;
}

export const TerminalTextarea = React.forwardRef<HTMLTextAreaElement, TerminalTextareaProps>(
  ({ className, label, error, hint, id, rows = 4, ...props }, ref) => {
    const textareaId = id || `terminal-textarea-${React.useId()}`;
    const errorId = `${textareaId}-error`;
    const hintId = `${textareaId}-hint`;
    const hasError = !!error;
    const hasHint = !!hint;

    const textareaStyles: React.CSSProperties = {
      backgroundColor: colors.background.base,
      border: `1px solid ${hasError ? colors.destructive.base : colors.border.input}`,
      color: colors.foreground.primary,
      padding: `${sizing.input.paddingX} ${sizing.input.paddingX}`,
      borderRadius: sizing.radius.lg,
      fontFamily: typography.fontFamily.mono,
      fontSize: sizing.input.fontSize,
      minHeight: `${parseFloat(sizing.input.height) * rows}px`,
      width: "100%",
      transition: `all ${motion.duration.fast} ${motion.easing.default}`,
      boxSizing: "border-box",
      resize: "vertical",
      lineHeight: 1.5,
    };

    const focusStyles: React.CSSProperties = {
      outline: "none",
      borderColor: hasError ? colors.destructive.base : colors.border.ring,
      boxShadow: `0 0 0 2px ${
        hasError ? colors.destructive.glow + "33" : colors.primary.glow + "33"
      }`,
    };

    const wrapperStyles: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      width: "100%",
    };

    const labelStyles: React.CSSProperties = {
      fontFamily: typography.fontFamily.mono,
      fontSize: "0.75rem",
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: hasError ? colors.destructive.base : colors.foreground.primary,
      marginBottom: "0.375rem",
    };

    const errorHintStyles: React.CSSProperties = {
      marginTop: "0.375rem",
      fontFamily: typography.fontFamily.mono,
      fontSize: "0.625rem",
      letterSpacing: "0.05em",
      color: hasError ? colors.destructive.glow : colors.foreground.muted,
    };

    return (
      <div className={cn("w-full", className)} style={wrapperStyles}>
        {label && (
          <label htmlFor={textareaId} style={labelStyles}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn("input-tactical")}
          style={textareaStyles}
          aria-invalid={hasError ? "true" : "false"}
          aria-describedby={
            hasError ? errorId : hasHint ? hintId : undefined
          }
          onFocus={(e) => {
            Object.assign(e.currentTarget.style, focusStyles);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = hasError
              ? colors.destructive.base
              : colors.border.input;
            e.currentTarget.style.boxShadow = "none";
            props.onBlur?.(e);
          }}
          {...props}
        />
        {hasError && (
          <p id={errorId} style={errorHintStyles} role="alert">
            {error}
          </p>
        )}
        {hasHint && !hasError && (
          <p id={hintId} style={errorHintStyles}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

TerminalTextarea.displayName = "TerminalTextarea";

/**
 * QuickAddInput - Specialized input for quick-add patterns
 */
export interface QuickAddInputProps extends TerminalInputProps {
  onAdd: (value: string) => void;
  addLabel?: string;
  disabled?: boolean;
}

export const QuickAddInput = React.forwardRef<HTMLInputElement, QuickAddInputProps>(
  ({ className, onAdd, addLabel = "ADD", disabled = false, ...props }, ref) => {
    const [value, setValue] = React.useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && value.trim() && !disabled) {
        e.preventDefault();
        onAdd(value.trim());
        setValue("");
      }
      props.onKeyDown?.(e);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onAdd(value.trim());
        setValue("");
      }
    };

    return (
      <form onSubmit={handleSubmit} className={cn("w-full", className)}>
        <TerminalInput
          ref={ref}
          {...props}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          suffix={
            <button
              type="submit"
              disabled={!value.trim() || disabled}
              className="btn-tactical btn-tactical-primary px-3 py-1.5 text-[0.625rem]"
              style={{
                minHeight: "auto",
                opacity: value.trim() && !disabled ? 1 : 0.5,
                pointerEvents: value.trim() && !disabled ? "auto" : "none",
              }}
            >
              {addLabel}
            </button>
          }
        />
      </form>
    );
  }
);

QuickAddInput.displayName = "QuickAddInput";