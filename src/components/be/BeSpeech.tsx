import type { ReactNode } from "react";
import { BeAvatar, type BeMood } from "./BeAvatar";

interface BeSpeechProps {
  children: ReactNode;
  mood?: BeMood;
  size?: number;
  /** stack avatar above bubble instead of side-by-side */
  stacked?: boolean;
  className?: string;
}

/** be + speech bubble. Used on every step so be's voice stays consistent. */
export function BeSpeech({ children, mood = "happy", size = 64, stacked = false, className = "" }: BeSpeechProps) {
  return (
    <div className={`flex ${stacked ? "flex-col items-center text-center" : "items-start"} gap-3 ${className}`}>
      <BeAvatar mood={mood} size={size} className="shrink-0" />
      <div
        className={`glass relative rounded-2xl ${stacked ? "" : "rounded-tl-sm"} px-4 py-3 text-[15px] leading-relaxed text-cream`}
      >
        <span className="mb-0.5 block font-display text-xs font-bold tracking-wide text-accent">be nói:</span>
        {children}
      </div>
    </div>
  );
}
