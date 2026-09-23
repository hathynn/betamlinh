import type { ReactNode } from "react";
import { BeAvatar } from "../../../components/be/BeAvatar";
import { Award } from "lucide-react";

interface ResultSectionProps {
  id: string;
  index?: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  beNote?: string;
  /** Roast-style "danh hiệu" shown above the content */
  roastTitle?: string;
}

export function ResultSection({ id, index, title, subtitle, children, beNote, roastTitle }: ResultSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="glass animate-fade-up rounded-3xl p-5 sm:p-7">
      <header className="mb-3 flex items-baseline gap-3">
        {index !== undefined && (
          <span className="font-accent text-lg text-accent italic" aria-hidden="true">
            {String(index).padStart(2, "0")}
          </span>
        )}
        <div>
          <h2 id={`${id}-title`} className="font-display text-xl font-extrabold text-cream sm:text-2xl">
            {title}
          </h2>
          {subtitle && <p className="text-[11px] tracking-widest text-cream-dim/80 uppercase">{subtitle}</p>}
        </div>
      </header>
      {roastTitle && (
        <p className="mb-3 inline-flex max-w-full items-start gap-2 rounded-2xl bg-gold/10 px-3 py-2 ring-1 ring-gold/30">
          <Award size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
          <span>
            <span className="block text-[10px] font-semibold tracking-[0.18em] text-gold/90 uppercase">Danh hiệu</span>
            <span className="font-display text-lg leading-snug font-extrabold text-cream">“{roastTitle}”</span>
          </span>
        </p>
      )}
      <div className="max-w-prose space-y-3 text-[16px] leading-[1.75] text-cream/90">{children}</div>
      {beNote && (
        <aside className="mt-4 flex items-start gap-3 rounded-2xl bg-accent-soft p-3 ring-1 ring-accent/20" aria-label="be nhận xét">
          <BeAvatar mood="wink" size={36} className="shrink-0" />
          <p className="font-accent text-[15px] leading-relaxed text-cream italic">“{beNote}”</p>
        </aside>
      )}
    </section>
  );
}
