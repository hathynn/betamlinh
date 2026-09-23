import type { ChineseYearFact, Modality, WesternElement } from "../types/compatibility.ts";

/** Symbolic relationship between two Western elements. */
export type ElementRelation = "same" | "complementary" | "mixed" | "contrasting";

export function elementRelation(a: WesternElement, b: WesternElement): ElementRelation {
  if (a === b) return "same";
  const pair = [a, b].sort().join("-");
  if (pair === "air-fire" || pair === "earth-water") return "complementary";
  if (pair === "fire-water" || pair === "air-earth") return "contrasting";
  return "mixed"; // earth-fire, air-water
}

export type ModalityRelation = "same" | "different";

export function modalityRelation(a: Modality, b: Modality): ModalityRelation {
  return a === b ? "same" : "different";
}

/** Folk (dân gian) relations between earthly branches. */
export type BranchRelation = "tam-hop" | "luc-hop" | "luc-xung" | "tu-hanh-xung" | "same" | "neutral" | "unknown";

export function branchRelation(a: ChineseYearFact, b: ChineseYearFact): BranchRelation {
  // If either year animal is uncertain (Jan 21–Feb 20 births) we refuse to guess.
  if (a.uncertain || b.uncertain) return "unknown";
  const x = a.branchIndex;
  const y = b.branchIndex;
  if (x === y) return "same";
  if (Math.abs(x - y) === 6) return "luc-xung";
  if ((x + y) % 12 === 1) return "luc-hop";
  if (x % 4 === y % 4) return "tam-hop";
  if (x % 3 === y % 3) return "tu-hanh-xung";
  return "neutral";
}

export const BRANCH_RELATION_VI: Record<BranchRelation, string> = {
  "tam-hop": "Tam hợp",
  "luc-hop": "Lục hợp",
  "luc-xung": "Lục xung",
  "tu-hanh-xung": "Tứ hành xung",
  same: "Cùng con giáp",
  neutral: "Không hợp không xung",
  unknown: "Chưa xác định được",
};
