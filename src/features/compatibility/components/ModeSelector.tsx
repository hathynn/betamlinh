import { ArrowRight, HeartHandshake, Users } from "lucide-react";
import { FRIENDSHIP_MODE, LOVE_MODE, type AnyModeConfig } from "../config/modes";
import type { CompatibilityMode } from "../types/compatibility";

interface ModeSelectorProps {
  onSelect: (mode: CompatibilityMode) => void;
}

const MODE_ICON = { love: HeartHandshake, friendship: Users } as const;

function ModeCard({ config, onSelect }: { config: AnyModeConfig; onSelect: () => void }) {
  const Icon = MODE_ICON[config.mode];
  return (
    <li data-mode={config.mode} className="list-none">
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Chọn chế độ ${config.label}: ${config.tagline}`}
        className="group glass relative flex h-full w-full flex-col overflow-hidden rounded-3xl p-5 text-left transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-accent/60 sm:p-6"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 size-44 rounded-full bg-accent opacity-15 blur-2xl transition-opacity group-hover:opacity-25"
        />
        <span className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent ring-1 ring-accent/30">
            <Icon size={22} aria-hidden="true" />
          </span>
          <span className="font-display text-2xl font-extrabold text-accent sm:text-[28px]">
            {config.label} <span aria-hidden="true">{config.emoji}</span>
          </span>
        </span>
        <span className="mt-3 block font-accent text-[15px] text-cream italic">{config.tagline}</span>
        <span className="mt-2 block text-[15px] leading-relaxed text-cream-dim">{config.cardBlurb}</span>
        <span className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full bg-accent px-5 font-display text-[15px] font-bold text-accent-ink transition group-hover:gap-3">
          Xem {config.label}
          <ArrowRight size={18} aria-hidden="true" />
        </span>
      </button>
    </li>
  );
}

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" aria-label="Chọn chế độ xem">
      <ModeCard config={LOVE_MODE} onSelect={() => onSelect("love")} />
      <ModeCard config={FRIENDSHIP_MODE} onSelect={() => onSelect("friendship")} />
    </ul>
  );
}
