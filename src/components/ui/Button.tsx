import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost";

const BASE =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 font-display text-[15px] font-bold transition-[transform,background-color,box-shadow,opacity] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-ink shadow-[0_10px_30px_-12px_var(--accent)] hover:brightness-105 hover:shadow-[0_14px_36px_-12px_var(--accent)]",
  secondary: "border border-accent/50 bg-accent-soft text-cream hover:border-accent hover:bg-accent/15",
  ghost: "text-cream-dim hover:bg-white/5 hover:text-cream",
};

export function buttonClass(variant: Variant = "primary", extra = ""): string {
  return `${BASE} ${VARIANTS[variant]} ${extra}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export function Button({ variant = "primary", icon, iconRight, className = "", children, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

interface LinkButtonProps extends LinkProps {
  variant?: Variant;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export function LinkButton({ variant = "primary", icon, iconRight, className = "", children, ...rest }: LinkButtonProps) {
  return (
    <Link className={buttonClass(variant, className)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}
