import type { ScoreItem } from "../types/compatibility";

/** Friendly, non-judgemental wording for a score band. */
export function scoreMood(score: number | null): string {
  if (score === null) return "Chưa đủ dữ liệu";
  if (score >= 80) return "Hợp vibe dữ lắm";
  if (score >= 65) return "Hợp có duyên";
  if (score >= 50) return "Hợp nếu chịu học nhau";
  return "Khác nhau nhiều, nhiều thứ để khám phá";
}

interface OverallScoreProps {
  score: number | null;
  label: string;
}

export function OverallScore({ score, label }: OverallScoreProps) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = score === null ? c : c - (score / 100) * c;

  return (
    <figure className="flex flex-col items-center text-center" aria-label={`${label}: ${score === null ? "chưa có điểm" : `${score} trên 100`}`}>
      <div className="relative size-40 sm:size-44">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="9" className="text-cream" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="url(#score-grad)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="score-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--accent-2)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-content-center">
          <span className="font-display text-5xl font-extrabold text-cream">{score ?? "—"}</span>
          {score !== null && <span className="text-xs text-cream-dim">/ 100</span>}
        </div>
      </div>
      <figcaption className="mt-3">
        <span className="block text-xs font-semibold tracking-widest text-cream-dim uppercase">{label}</span>
        <span className="mt-1 block font-accent text-lg text-accent italic">{scoreMood(score)}</span>
      </figcaption>
    </figure>
  );
}

interface CategoryScoresProps {
  items: { key: string; title: string; en: string; item: ScoreItem }[];
}

export function CategoryScores({ items }: CategoryScoresProps) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map(({ key, title, en, item }) => (
        <li key={key} className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <p className="font-display font-bold text-cream">{title}</p>
              <p className="text-[11px] tracking-wide text-cream-dim/80 uppercase">{en}</p>
            </div>
            <p className="font-display text-2xl font-extrabold text-accent">
              {item.score ?? "—"}
              <span className="sr-only">{item.score === null ? " chưa đủ dữ liệu" : " trên 100"}</span>
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            {item.score !== null ? (
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-1000"
                style={{ width: `${item.score}%` }}
              />
            ) : (
              <div className="h-full w-full bg-[repeating-linear-gradient(45deg,transparent_0_6px,rgb(255_255_255/0.12)_6px_12px)]" />
            )}
          </div>
          {item.analysis && <p className="mt-2.5 text-sm leading-relaxed text-cream-dim">{item.analysis}</p>}
        </li>
      ))}
    </ul>
  );
}
