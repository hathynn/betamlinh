import type { ReactNode } from "react";
import { BeAvatar, type BeMood } from "../../../components/be/BeAvatar";
import { BeSpeech } from "../../../components/be/BeSpeech";
import { ProgressIndicator } from "./ProgressIndicator";

interface StepLayoutProps {
  step: number;
  modeLabel: string;
  beMessage: ReactNode;
  beMood?: BeMood;
  children: ReactNode;
}

/**
 * Shared frame for the form steps.
 * Mobile/tablet: progress → be bubble → content, one column.
 * Desktop: be sits in a sticky left column next to a width-capped form.
 */
export function StepLayout({ step, modeLabel, beMessage, beMood = "happy", children }: StepLayoutProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="mb-6">
        <ProgressIndicator current={step} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside className="lg:sticky lg:top-6 lg:self-start" aria-label="Lời nhắn từ be">
          {/* compact bubble on small screens */}
          <div className="lg:hidden">
            <BeSpeech mood={beMood} size={56}>
              {beMessage}
            </BeSpeech>
          </div>
          {/* large character on desktop */}
          <div className="hidden flex-col items-center text-center lg:flex">
            <BeAvatar mood={beMood} size={150} animated />
            <p className="mt-2 inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent ring-1 ring-accent/30">
              Mode: {modeLabel}
            </p>
            <div className="glass mt-4 rounded-2xl px-4 py-3 text-left text-[15px] leading-relaxed">
              <span className="mb-0.5 block font-display text-xs font-bold text-accent">be nói:</span>
              {beMessage}
            </div>
          </div>
        </aside>

        <div className="min-w-0 max-w-2xl">
          <p className="mb-3 inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent ring-1 ring-accent/30 lg:hidden">
            Mode: {modeLabel}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}
