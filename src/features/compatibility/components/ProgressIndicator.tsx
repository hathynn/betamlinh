import { Check } from "lucide-react";

const STEPS = ["Chọn mode", "Người thứ nhất", "Người thứ hai", "Kiểm tra", "Kết quả"] as const;

interface ProgressIndicatorProps {
  /** 0-based index into STEPS */
  current: number;
}

export function ProgressIndicator({ current }: ProgressIndicatorProps) {
  const pct = (current / (STEPS.length - 1)) * 100;
  return (
    <nav aria-label="Tiến trình" className="w-full">
      {/* Compact (mobile) */}
      <div className="md:hidden">
        <p className="mb-2 flex items-baseline justify-between text-sm">
          <span className="font-display font-bold text-cream">{STEPS[current]}</span>
          <span className="text-cream-dim">
            Bước {current + 1}/{STEPS.length}
          </span>
        </p>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={current + 1}
          aria-valuetext={`Bước ${current + 1} trên ${STEPS.length}: ${STEPS[current]}`}
        >
          <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${Math.max(pct, 8)}%` }} />
        </div>
      </div>

      {/* Full (tablet+) */}
      <ol className="hidden items-center md:flex">
        {STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none" aria-current={active ? "step" : undefined}>
              <span className="flex items-center gap-2">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ring-1 transition-colors ${
                    done
                      ? "bg-accent text-accent-ink ring-accent"
                      : active
                        ? "bg-accent-soft text-accent ring-accent"
                        : "bg-white/5 text-cream-dim ring-white/15"
                  }`}
                >
                  {done ? <Check size={15} aria-hidden="true" /> : i + 1}
                </span>
                <span
                  className={`text-sm whitespace-nowrap ${active ? "font-semibold text-cream" : "sr-only text-cream-dim lg:not-sr-only"}`}
                >
                  {label}
                  {done && <span className="sr-only"> (đã xong)</span>}
                </span>
              </span>
              {i < STEPS.length - 1 && (
                <span aria-hidden="true" className={`mx-3 h-px flex-1 ${done ? "bg-accent/70" : "bg-white/15"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
