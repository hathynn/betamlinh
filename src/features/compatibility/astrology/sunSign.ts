import type { Modality, SunSignFact, WesternElement } from "../types/compatibility.ts";

interface SignDef {
  key: string;
  nameVi: string;
  symbol: string;
  element: WesternElement;
  modality: Modality;
  /** start month (1-12) and day, inclusive */
  start: [number, number];
}

/**
 * Tropical zodiac by conventional date ranges. The exact Sun ingress shifts by
 * up to a day per year, which is why dates next to a boundary are flagged `onCusp`.
 */
export const SIGNS: readonly SignDef[] = [
  { key: "capricorn", nameVi: "Ma Kết", symbol: "♑\uFE0E", element: "earth", modality: "cardinal", start: [12, 22] },
  { key: "aquarius", nameVi: "Bảo Bình", symbol: "♒\uFE0E", element: "air", modality: "fixed", start: [1, 20] },
  { key: "pisces", nameVi: "Song Ngư", symbol: "♓\uFE0E", element: "water", modality: "mutable", start: [2, 19] },
  { key: "aries", nameVi: "Bạch Dương", symbol: "♈\uFE0E", element: "fire", modality: "cardinal", start: [3, 21] },
  { key: "taurus", nameVi: "Kim Ngưu", symbol: "♉\uFE0E", element: "earth", modality: "fixed", start: [4, 20] },
  { key: "gemini", nameVi: "Song Tử", symbol: "♊\uFE0E", element: "air", modality: "mutable", start: [5, 21] },
  { key: "cancer", nameVi: "Cự Giải", symbol: "♋\uFE0E", element: "water", modality: "cardinal", start: [6, 21] },
  { key: "leo", nameVi: "Sư Tử", symbol: "♌\uFE0E", element: "fire", modality: "fixed", start: [7, 23] },
  { key: "virgo", nameVi: "Xử Nữ", symbol: "♍\uFE0E", element: "earth", modality: "mutable", start: [8, 23] },
  { key: "libra", nameVi: "Thiên Bình", symbol: "♎\uFE0E", element: "air", modality: "cardinal", start: [9, 23] },
  { key: "scorpio", nameVi: "Bọ Cạp", symbol: "♏\uFE0E", element: "water", modality: "fixed", start: [10, 23] },
  { key: "sagittarius", nameVi: "Nhân Mã", symbol: "♐\uFE0E", element: "fire", modality: "mutable", start: [11, 22] },
];

function signIndexFor(month: number, day: number): number {
  const value = month * 100 + day;
  // Walk from Aquarius (Jan 20) through Sagittarius; anything else is Capricorn.
  let idx = 0;
  for (let i = 1; i < SIGNS.length; i++) {
    const [m, d] = SIGNS[i].start;
    if (value >= m * 100 + d) idx = i;
  }
  if (value >= 1222) idx = 0;
  return idx;
}

function shift(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function getSunSign(date: Date): SunSignFact {
  const idx = signIndexFor(date.getUTCMonth() + 1, date.getUTCDate());
  const prev = shift(date, -1);
  const next = shift(date, 1);
  const prevIdx = signIndexFor(prev.getUTCMonth() + 1, prev.getUTCDate());
  const nextIdx = signIndexFor(next.getUTCMonth() + 1, next.getUTCDate());
  const neighbour = prevIdx !== idx ? prevIdx : nextIdx !== idx ? nextIdx : null;
  const sign = SIGNS[idx];

  return {
    key: sign.key,
    nameVi: sign.nameVi,
    symbol: sign.symbol,
    element: sign.element,
    modality: sign.modality,
    onCusp: neighbour !== null,
    cuspWith: neighbour !== null ? SIGNS[neighbour].nameVi : undefined,
  };
}

export const ELEMENT_VI: Record<WesternElement, string> = {
  fire: "Lửa",
  earth: "Đất",
  air: "Khí",
  water: "Nước",
};

export const MODALITY_VI: Record<Modality, string> = {
  cardinal: "Tiên phong",
  fixed: "Kiên định",
  mutable: "Linh hoạt",
};
