import type { ChineseYearFact } from "../types/compatibility.ts";

const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"] as const;
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"] as const;
export const ANIMALS = ["Chuột", "Trâu", "Hổ", "Mèo", "Rồng", "Rắn", "Ngựa", "Dê", "Khỉ", "Gà", "Chó", "Heo"] as const;

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function yearInfo(year: number) {
  const branchIndex = mod(year - 4, 12);
  return {
    canChi: `${CAN[mod(year - 4, 10)]} ${CHI[branchIndex]}`,
    animal: ANIMALS[branchIndex],
    branchIndex,
  };
}

/**
 * Lunar New Year always falls between Jan 21 and Feb 20. We don't ship a lunar
 * calendar table, so births inside that window are marked `uncertain` instead of guessed.
 */
export function getChineseYear(date: Date): ChineseYearFact {
  const year = date.getUTCFullYear();
  const md = (date.getUTCMonth() + 1) * 100 + date.getUTCDate();

  if (md < 121) return { ...yearInfo(year - 1), uncertain: false };
  if (md > 220) return { ...yearInfo(year), uncertain: false };

  return { ...yearInfo(year), uncertain: true, alternate: yearInfo(year - 1) };
}
