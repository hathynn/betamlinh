export type CompatibilityMode = "love" | "friendship";

export interface Person {
  name: string;
  /** ISO date, YYYY-MM-DD */
  birthDate: string;
  /** HH:mm, optional */
  birthTime?: string;
  birthPlace?: string;
}

export interface CompatibilityRequest {
  mode: CompatibilityMode;
  personA: Person;
  personB: Person;
}

/* ---------- Mode-specific keys ---------- */

export type LoveScoreKey = "emotionalConnection" | "communication" | "attraction" | "longTerm";
export type FriendshipScoreKey = "trust" | "communication" | "mutualSupport" | "sharedConnection";

export type LoveSectionKey = "attraction" | "emotional" | "communication" | "challenges" | "longTerm";
export type FriendshipSectionKey =
  | "vibe"
  | "trust"
  | "communication"
  | "strengths"
  | "boundaries"
  | "longTerm";

export type ScoreKeyFor<M extends CompatibilityMode> = M extends "love" ? LoveScoreKey : FriendshipScoreKey;
export type SectionKeyFor<M extends CompatibilityMode> = M extends "love"
  ? LoveSectionKey
  : FriendshipSectionKey;

/* ---------- Result ---------- */

export interface ScoreItem {
  /** 0–100, or null when there is not enough basis to score */
  score: number | null;
  analysis: string;
}

export interface Nickname {
  /** e.g. "Bình gas mini" */
  title: string;
  reason: string;
}

export interface ReadingSection {
  /** Optional roast-style "danh hiệu" heading for this section, e.g. "Chúa tể chọn quán 45 phút" */
  roastTitle?: string;
  content: string;
  /** Optional one-liner from be */
  beNote?: string;
}

export type ReadingSource = "mock" | "ai";

interface BaseResult<M extends CompatibilityMode> {
  mode: M;
  source: ReadingSource;
  title: string;
  openingLine: string;
  summary: string;
  nicknames: { personA: Nickname; personB: Nickname };
  scores: Record<ScoreKeyFor<M>, ScoreItem>;
  /** Always computed locally from valid category scores, never trusted from the model */
  overall: number | null;
  sections: Record<SectionKeyFor<M>, ReadingSection>;
  personalizedAdvice: string[];
  closingMessage: string;
  /** "Tóm lại một câu" — one punchy sentence describing the pair */
  oneLiner?: string;
  limitations: string;
  /** Facts computed by our astrology module, shown so users can see the basis */
  facts: AstroFactsPair;
}

export type LoveResult = BaseResult<"love">;
export type FriendshipResult = BaseResult<"friendship">;
export type CompatibilityResult = LoveResult | FriendshipResult;

/* ---------- Astrology facts (computed, never invented) ---------- */

export type WesternElement = "fire" | "earth" | "air" | "water";
export type Modality = "cardinal" | "fixed" | "mutable";

export interface SunSignFact {
  key: string;
  nameVi: string;
  symbol: string;
  element: WesternElement;
  modality: Modality;
  /** true when the birth date is within 1 day of a sign boundary */
  onCusp: boolean;
  /** the neighbouring sign when onCusp */
  cuspWith?: string;
}

export interface ChineseYearFact {
  /** e.g. "Giáp Tý" */
  canChi: string;
  animal: string;
  /** index 0 = Tý … 11 = Hợi */
  branchIndex: number;
  /** true when the date falls in the Jan–Feb window where Lunar New Year may not have happened yet */
  uncertain: boolean;
  /** alternate year animal when uncertain */
  alternate?: { canChi: string; animal: string; branchIndex: number };
}

export interface AstroFacts {
  sunSign: SunSignFact;
  chineseYear: ChineseYearFact;
  hasBirthTime: boolean;
  hasBirthPlace: boolean;
}

export interface AstroFactsPair {
  personA: AstroFacts;
  personB: AstroFacts;
}
