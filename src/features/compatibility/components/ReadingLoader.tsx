import { useEffect, useState } from "react";
import { BeAvatar } from "../../../components/be/BeAvatar";
import { ZodiacWheel } from "../../../components/layout/ZodiacWheel";
import type { CompatibilityMode } from "../types/compatibility";

const LINES: Record<CompatibilityMode, string[]> = {
  love: [
    "Khoan, để tui xem qua dữ liệu của hai bạn đã. Vũ trụ hôm nay có gì muốn kể đây...",
    "Đang so nguyên tố hai cung… ồ, khúc này có mùi drama nhẹ.",
    "Đang dò xem ai là người hay seen không rep…",
    "Pha thêm ly trà, sắp xong rồi nè ☕",
  ],
  friendship: [
    "Khoan, để tui xem qua dữ liệu của hai bạn đã. Vũ trụ hôm nay có gì muốn kể đây...",
    "Đang lục lại lịch sử group chat của vũ trụ…",
    "Đang tính xem ai là người hay hủy kèo phút chót…",
    "Pha thêm ly trà, sắp xong rồi nè ☕",
  ],
};

/** Constellation points for the connecting-lines animation */
const STARS: [number, number][] = [
  [20, 70],
  [60, 30],
  [110, 50],
  [150, 20],
  [185, 60],
];

export function ReadingLoader({ mode, nameA, nameB }: { mode: CompatibilityMode; nameA: string; nameB: string }) {
  const [i, setI] = useState(0);
  const lines = LINES[mode];

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % lines.length), 2600);
    return () => clearInterval(id);
  }, [lines.length]);

  const path = STARS.map(([x, y], k) => `${k ? "L" : "M"}${x} ${y}`).join(" ");

  return (
    <div className="flex flex-col items-center text-center" role="status" aria-live="polite">
      <div className="relative grid size-64 place-items-center sm:size-80">
        <ZodiacWheel className="absolute inset-0 size-full text-accent" />
        <svg viewBox="0 0 200 200" className="absolute inset-6 animate-spin-slower text-accent-2 opacity-60" aria-hidden="true">
          <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeDasharray="2 8" />
        </svg>
        <BeAvatar mood="reading" size={120} animated />
      </div>

      <svg viewBox="0 0 205 90" className="mt-2 w-56 text-accent" aria-hidden="true">
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeOpacity=".6"
          strokeDasharray="300"
          strokeDashoffset="300"
          className="animate-draw"
        />
        {STARS.map(([x, y], k) => (
          <circle key={k} cx={x} cy={y} r="3" fill="currentColor" className="animate-twinkle" style={{ animationDelay: `${k * 0.4}s` }} />
        ))}
      </svg>

      <p className="mt-2 font-display text-lg font-bold text-cream">
        be đang đọc sao cho <span className="text-accent">{nameA}</span> & <span className="text-accent">{nameB}</span>
      </p>
      <p key={i} className="mt-2 max-w-sm animate-fade-up text-[15px] text-cream-dim">
        {lines[i]}
      </p>
    </div>
  );
}
