"use client";

import React from "react";

export function cx(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

// PUBLIC_INTERFACE
export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md";
  }
) {
  /** App button component with variants and sizes. */
  const { className, variant = "primary", size = "md", ...rest } = props;

  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
  const sizes = size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm";
  const variants: Record<string, string> = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    ghost: "bg-transparent text-slate-900 hover:bg-slate-100",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return <button className={cx(base, sizes, variants[variant], className)} {...rest} />;
}

// PUBLIC_INTERFACE
export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string; error?: string }
) {
  /** Labeled input with optional hint/error. */
  const { className, label, hint, error, id, ...rest } = props;

  // Hooks must be called unconditionally.
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-800">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={cx(
          "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none",
          "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          error ? "border-red-400 focus:ring-red-400 focus:border-red-400" : "",
          className
        )}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// PUBLIC_INTERFACE
export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string }
) {
  /** Labeled textarea. */
  const { className, label, hint, id, ...rest } = props;

  // Hooks must be called unconditionally.
  const generatedId = React.useId();
  const textareaId = id ?? generatedId;

  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={textareaId} className="block text-sm font-medium text-slate-800">
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        className={cx(
          "w-full min-h-24 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none",
          "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          className
        )}
        {...rest}
      />
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

// PUBLIC_INTERFACE
export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  /** Simple card container. */
  const { className, ...rest } = props;
  return <div className={cx("rounded-xl border border-slate-200 bg-white shadow-sm", className)} {...rest} />;
}

// PUBLIC_INTERFACE
export function Badge(props: React.HTMLAttributes<HTMLSpanElement> & { tone?: "blue" | "slate" | "teal" }) {
  /** Small badge for tags/priority. */
  const { className, tone = "slate", ...rest } = props;
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-50 text-blue-700",
    teal: "bg-cyan-50 text-cyan-700",
  };
  return (
    <span
      className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", tones[tone], className)}
      {...rest}
    />
  );
}
