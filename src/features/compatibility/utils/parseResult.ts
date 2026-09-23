import { getModeConfig } from "../config/modes.ts";
import type {
  AstroFactsPair,
  CompatibilityMode,
  CompatibilityResult,
  Nickname,
  ReadingSection,
  ReadingSource,
  ScoreItem,
} from "../types/compatibility.ts";

export class ReadingParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReadingParseError";
  }
}

type Json = Record<string, unknown>;

const MAX_TEXT = 2000;

function isObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, field: string, required = true): string {
  if (typeof value !== "string" || !value.trim()) {
    if (required) throw new ReadingParseError(`Missing text field: ${field}`);
    return "";
  }
  return value.trim().slice(0, MAX_TEXT);
}

/** Strip code fences / leading prose that models sometimes add, then JSON.parse. */
export function safeParseJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        /* fall through */
      }
    }
    throw new ReadingParseError("Response is not valid JSON");
  }
}

export function normalizeScore(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  if (n < 0 || n > 100) return null;
  return Math.round(n);
}

/** Overall = rounded mean of valid category scores; null when none are valid. */
export function computeOverall(items: ScoreItem[]): number | null {
  const valid = items.map((i) => i.score).filter((s): s is number => s !== null);
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((sum, s) => sum + s, 0) / valid.length);
}

function parseNickname(value: unknown, field: string): Nickname {
  if (!isObject(value)) throw new ReadingParseError(`Missing nickname: ${field}`);
  return { title: text(value.title, `${field}.title`), reason: text(value.reason, `${field}.reason`) };
}

function parseSection(value: unknown, field: string): ReadingSection {
  if (typeof value === "string") return { content: text(value, field) };
  if (!isObject(value)) throw new ReadingParseError(`Missing section: ${field}`);
  const roastTitle = text(value.roastTitle, `${field}.roastTitle`, false);
  const beNote = text(value.beNote, `${field}.beNote`, false);
  return {
    ...(roastTitle ? { roastTitle } : {}),
    content: text(value.content, `${field}.content`),
    ...(beNote ? { beNote } : {}),
  };
}

function parseScoreItem(value: unknown, field: string): ScoreItem {
  if (!isObject(value)) throw new ReadingParseError(`Missing score: ${field}`);
  const score = normalizeScore(value.score);
  const analysis = text(value.analysis, `${field}.analysis`, false);
  return {
    score,
    analysis: analysis || (score === null ? "Chưa đủ dữ liệu để be chấm tiêu chí này." : ""),
  };
}

/**
 * Validate an untrusted reading payload (AI or mock) against the schema of the
 * requested mode. Never render data that did not pass through here.
 */
export function parseReading(
  input: unknown,
  mode: CompatibilityMode,
  facts: AstroFactsPair,
  source: ReadingSource,
): CompatibilityResult {
  const data = typeof input === "string" ? safeParseJson(input) : input;
  if (!isObject(data)) throw new ReadingParseError("Reading is not an object");

  const config = getModeConfig(mode);
  if (!isObject(data.sections)) throw new ReadingParseError("Missing sections");
  if (!isObject(data.scores)) throw new ReadingParseError("Missing scores");
  if (!isObject(data.nicknames)) throw new ReadingParseError("Missing nicknames");

  const rawSections = data.sections;
  const rawScores = data.scores;

  const sections = Object.fromEntries(
    config.sectionOrder.map((key) => [key, parseSection(rawSections[key], `sections.${key}`)]),
  );
  const scores = Object.fromEntries(
    config.scoreOrder.map((key) => [key, parseScoreItem(rawScores[key], `scores.${key}`)]),
  ) as Record<string, ScoreItem>;

  if (!Array.isArray(data.personalizedAdvice)) throw new ReadingParseError("Missing advice");
  const advice = data.personalizedAdvice
    .filter((a): a is string => typeof a === "string" && a.trim().length > 0)
    .map((a) => a.trim().slice(0, MAX_TEXT))
    .slice(0, 3);
  if (advice.length === 0) throw new ReadingParseError("Advice is empty");

  const oneLiner = text(data.oneLiner, "oneLiner", false);

  const base = {
    source,
    title: text(data.title, "title"),
    openingLine: text(data.openingLine, "openingLine"),
    summary: text(data.summary, "summary"),
    nicknames: {
      personA: parseNickname(data.nicknames.personA, "nicknames.personA"),
      personB: parseNickname(data.nicknames.personB, "nicknames.personB"),
    },
    overall: computeOverall(Object.values(scores)),
    personalizedAdvice: advice,
    closingMessage: text(data.closingMessage, "closingMessage"),
    ...(oneLiner ? { oneLiner } : {}),
    limitations: text(data.limitations, "limitations", false) || "be chỉ đọc từ ngày sinh, chưa lập lá số đầy đủ.",
    facts,
  };

  // Section and score keys were read from the mode config above, so the cast is sound.
  return { ...base, mode, sections, scores } as CompatibilityResult;
}
