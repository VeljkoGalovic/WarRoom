"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TerminalInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix" | "suffix"> {
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

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label htmlFor={inputId} className="block text-tactical text-primary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-foreground-muted pointer-events-none font-mono text-sm">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "input-tactical w-full",
              prefix && "pl-10",
              suffix && "pr-10",
              error && "border-destructive focus:border-destructive focus:ring-destructive/20"
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-foreground-muted pointer-events-none font-mono text-sm">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-timestamp text-destructive-glow flex items-center gap-1.5">
            <span className="text-destructive">[ERROR]</span>
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-timestamp text-foreground-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

TerminalInput.displayName = "TerminalInput";

// Textarea variant
interface TerminalTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
}

export const TerminalTextarea = React.forwardRef<HTMLTextAreaElement, TerminalTextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || `terminal-textarea-${React.useId()}`;
    const errorId = `${textareaId}-error`;
    const hintId = `${textareaId}-hint`;

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label htmlFor={textareaId} className="block text-tactical text-primary mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "input-tactical w-full min-h-[100px] resize-y font-sans",
            error && "border-destructive focus:border-destructive focus:ring-destructive/20"
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1.5 text-timestamp text-destructive-glow flex items-center gap-1.5">
            <span className="text-destructive">[ERROR]</span>
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-timestamp text-foreground-muted">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

TerminalTextarea.displayName = "TerminalTextarea";

// Quick-add input bar for rapid entry
interface QuickAddInputProps {
  onSubmit: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function QuickAddInput({ onSubmit, placeholder = "NEW TASK...", disabled = false, className }: QuickAddInputProps) {
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim() && !disabled) {
      e.preventDefault();
      onSubmit(value.trim());
      setValue("");
    }
    if (e.key === "Escape") {
      setValue("");
      inputRef.current?.blur();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="relative flex items-center">
        <span className="absolute left-3 text-primary-glow font-mono text-sm select-none">›</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="input-tactical w-full pl-8 bg-background/50 placeholder:text-foreground-muted/50"
          autoFocus
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            className="absolute right-3 text-foreground-muted hover:text-destructive-glow transition-colors"
            aria-label="Clear input"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}