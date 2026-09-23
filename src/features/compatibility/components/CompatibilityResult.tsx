import { Info, Lightbulb, Pencil, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BeAvatar } from "../../../components/be/BeAvatar";
import { Button } from "../../../components/ui/Button";
import { ELEMENT_VI } from "../astrology";
import { getModeConfig } from "../config/modes";
import type { AstroFacts, CompatibilityResult as Result, Nickname, ReadingSection, ScoreItem } from "../types/compatibility";
import { CategoryScores, OverallScore } from "./CompatibilityScore";
import { ResultSection } from "./ResultSection";
import { ShareButton } from "./ShareButton";

interface CompatibilityResultProps {
  result: Result;
  nameA: string;
  nameB: string;
  onNewReading: () => void;
  onEdit: () => void;
}

interface NavItem {
  id: string;
  label: string;
}

function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

function PersonBadge({ name, nickname, facts }: { name: string; nickname: Nickname; facts: AstroFacts }) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
      <p className="truncate font-display text-xl font-extrabold text-cream" title={name}>
        {name}
      </p>
      <p className="text-[13px] text-cream-dim">
        {facts.sunSign.symbol}
        {"︎"} {facts.sunSign.nameVi} · {ELEMENT_VI[facts.sunSign.element]}
        {!facts.chineseYear.uncertain && ` · tuổi ${facts.chineseYear.animal}`}
      </p>
      <p className="mt-3 text-[11px] font-semibold tracking-widest text-accent uppercase">biệt danh be đặt</p>
      <p className="font-accent text-lg leading-snug text-cream italic">“{nickname.title}”</p>
      <p className="mt-1 text-sm leading-relaxed text-cream-dim">{nickname.reason}</p>
    </div>
  );
}

export function CompatibilityResult({ result, nameA, nameB, onNewReading, onEdit }: CompatibilityResultProps) {
  const config = getModeConfig(result.mode);
  const sectionLabels = config.sectionLabels as Record<string, { title: string; en: string }>;
  const scoreLabels = config.scoreLabels as Record<string, { title: string; en: string }>;
  const sections = result.sections as Record<string, ReadingSection>;
  const scores = result.scores as Record<string, ScoreItem>;
  const sectionOrder = config.sectionOrder as readonly string[];
  const scoreOrder = config.scoreOrder as readonly string[];

  const nav: NavItem[] = useMemo(
    () => [
      { id: "tong-quan", label: "Tổng quan" },
      { id: "diem-so", label: "Điểm số" },
      ...sectionOrder.map((k) => ({ id: `muc-${k}`, label: sectionLabels[k].title })),
      { id: "loi-khuyen", label: "Lời khuyên" },
      { id: "loi-ket", label: "Lời kết" },
    ],
    [sectionOrder, sectionLabels],
  );
  const navIds = useMemo(() => nav.map((n) => n.id), [nav]);
  const active = useActiveSection(navIds);

  const shareText = [
    `${nameA} × ${nameB} — ${config.label} ${config.emoji}`,
    result.title,
    result.overall !== null ? `${config.scoreLabel}: ${result.overall}/100` : null,
    `“${result.openingLine}”`,
    "— be @ betamlinh · Your stars, be's tea ☕🔮",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* A. HERO */}
      <header className="glass relative overflow-hidden rounded-[2rem] p-5 sm:p-8">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-accent opacity-10 blur-3xl"
        />
        <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent px-3 py-1 font-display text-sm font-bold text-accent-ink">
                {config.label} {config.emoji}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                  result.source === "ai" ? "bg-gold/15 text-gold ring-gold/40" : "bg-white/5 text-cream-dim ring-white/20"
                }`}
              >
                {result.source === "ai" ? (
                  <>
                    <Sparkles size={13} aria-hidden="true" /> AI luận giải
                  </>
                ) : (
                  <>
                    <Info size={13} aria-hidden="true" /> Bản mẫu (mock) — chưa phải AI
                  </>
                )}
              </span>
            </div>
            <h1 className="mt-4 font-display text-3xl leading-tight font-extrabold text-cream sm:text-4xl lg:text-5xl">
              <span className="text-gradient">{nameA}</span> <span className="text-cream-dim">×</span>{" "}
              <span className="text-gradient">{nameB}</span>
            </h1>
            <p className="mt-2 font-accent text-lg text-cream-dim italic">{result.title}</p>
            <div className="mt-5 flex items-start gap-3">
              <BeAvatar mood="wink" size={52} className="shrink-0" />
              <p className="glass rounded-2xl rounded-tl-sm px-4 py-3 text-[16px] leading-relaxed text-cream">{result.openingLine}</p>
            </div>
          </div>
          <OverallScore score={result.overall} label={config.scoreLabel} />
        </div>
        <p className="relative mt-5 text-center text-xs text-cream-dim/80 lg:text-right">
          Điểm mang tính giải trí — không phải xác suất thành công, cũng không đo giá trị của ai cả.
        </p>
      </header>

      <div className="mt-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
        {/* Section navigation: horizontal chips on mobile/tablet, sticky sidebar on desktop */}
        <nav aria-label="Các phần của bản luận giải" className="relative z-20 -mx-4 mb-4 px-4 lg:mx-0 lg:mb-0 lg:px-0">
          <ul className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] lg:sticky lg:top-6 lg:flex-col lg:gap-1 lg:overflow-visible">
            {nav.map((item) => (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "location" : undefined}
                  className={`block rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors lg:rounded-xl ${
                    active === item.id
                      ? "bg-accent text-accent-ink font-semibold"
                      : "bg-white/5 text-cream-dim hover:bg-white/10 hover:text-cream lg:bg-transparent"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-5">
          {/* B. OVERVIEW + nicknames */}
          <ResultSection id="tong-quan" title="Tổng quan" subtitle={result.mode === "love" ? "Love Overview" : "Friendship Overview"}>
            <p>{result.summary}</p>
            {result.oneLiner && (
              <blockquote className="rounded-2xl border-l-4 border-gold bg-gold/[0.07] px-4 py-3">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-gold uppercase">Tóm lại một câu</p>
                <p className="mt-1 font-display text-lg leading-snug font-bold text-cream sm:text-xl">{result.oneLiner}</p>
              </blockquote>
            )}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <PersonBadge name={nameA} nickname={result.nicknames.personA} facts={result.facts.personA} />
              <PersonBadge name={nameB} nickname={result.nicknames.personB} facts={result.facts.personB} />
            </div>
          </ResultSection>

          {/* C. CATEGORY SCORES */}
          <ResultSection id="diem-so" title={config.scoreLabel} subtitle="Compatibility Score">
            <CategoryScores
              items={scoreOrder.map((k) => ({ key: k, title: scoreLabels[k].title, en: scoreLabels[k].en, item: scores[k] }))}
            />
            <p className="text-[13px] text-cream-dim">
              Điểm tổng = trung bình các tiêu chí có điểm hợp lệ, do betamlinh tự tính lại (không lấy số của AI).
            </p>
          </ResultSection>

          {/* D. DETAILED READING */}
          {sectionOrder.map((k, i) => (
            <ResultSection
              key={k}
              id={`muc-${k}`}
              index={i + 1}
              title={sectionLabels[k].title}
              subtitle={sectionLabels[k].en}
              beNote={sections[k].beNote}
              roastTitle={sections[k].roastTitle}
            >
              <p>{sections[k].content}</p>
            </ResultSection>
          ))}

          {/* E. ADVICE */}
          <ResultSection id="loi-khuyen" title="Lời khuyên của be" subtitle="Personalized Advice">
            <ol className="space-y-3">
              {result.personalizedAdvice.map((advice, i) => (
                <li key={i} className="flex gap-3 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                    <Lightbulb size={16} aria-hidden="true" />
                    <span className="sr-only">Lời khuyên {i + 1}</span>
                  </span>
                  <span>{advice}</span>
                </li>
              ))}
            </ol>
          </ResultSection>

          {/* F. CLOSING */}
          <section
            id="loi-ket"
            aria-labelledby="loi-ket-title"
            className="glass relative overflow-hidden rounded-3xl p-6 text-center sm:p-8"
          >
            <h2 id="loi-ket-title" className="sr-only">
              Lời kết từ be
            </h2>
            <BeAvatar mood="happy" size={88} className="mx-auto" animated />
            <p className="mx-auto mt-4 max-w-xl font-accent text-xl leading-relaxed text-cream italic sm:text-2xl">
              “{result.closingMessage}”
            </p>
            <p className="mt-2 font-display text-sm font-bold text-accent">— be</p>
          </section>

          {/* Limitations */}
          <aside aria-label="Giới hạn của bản luận giải" className="rounded-2xl border border-dashed border-lavender/25 p-4 text-sm leading-relaxed text-cream-dim">
            <p className="mb-1 flex items-center gap-2 font-semibold text-cream">
              <Info size={16} aria-hidden="true" /> be nói trước cho minh bạch
            </p>
            <p>{result.limitations}</p>
          </aside>

          {/* G. ACTIONS */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
            <Button onClick={onNewReading} icon={<RotateCcw size={18} aria-hidden="true" />}>
              Xem cặp mới
            </Button>
            <Button variant="secondary" onClick={onEdit} icon={<Pencil size={18} aria-hidden="true" />}>
              Sửa thông tin
            </Button>
            <ShareButton title={`betamlinh — ${nameA} × ${nameB}`} text={shareText} />
          </div>
        </div>
      </div>
    </div>
  );
}
