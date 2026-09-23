import { AlertCircle } from "lucide-react";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  icon?: ReactNode;
}

/** Labelled input with hint + inline error (icon + text, never colour alone). */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, required, hint, error, icon, id, className = "", ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-cream">
        {label}
        {required ? (
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">bắt buộc</span>
        ) : (
          <span className="text-[11px] font-normal text-cream-dim/80">(không bắt buộc)</span>
        )}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-cream-dim/70" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`block min-h-13 w-full rounded-2xl border bg-midnight/60 py-3 pr-4 text-base text-cream placeholder:text-cream-dim/50 transition-colors outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 ${
            icon ? "pl-11" : "pl-4"
          } ${error ? "border-danger" : "border-lavender/20 hover:border-lavender/40"}`}
          {...rest}
        />
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-[13px] text-cream-dim/80">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium text-danger">
          <AlertCircle size={16} className="mt-px shrink-0" aria-hidden="true" />
          <span>
            <span className="sr-only">Lỗi: </span>
            {error}
          </span>
        </p>
      )}
    </div>
  );
});
