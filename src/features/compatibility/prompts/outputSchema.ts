import { getModeConfig } from "../config/modes.ts";
import type { CompatibilityMode } from "../types/compatibility.ts";

type JsonSchema = Record<string, unknown>;

const str: JsonSchema = { type: "string" };

function object(properties: Record<string, JsonSchema>): JsonSchema {
  return { type: "object", properties, required: Object.keys(properties), additionalProperties: false };
}

/**
 * JSON Schema for the reading, per mode. Used for Claude structured outputs so
 * the response is always parseable JSON with the right keys. Range checks
 * (0–100) and the overall score are still enforced by parseReading().
 */
export function buildReadingJsonSchema(mode: CompatibilityMode): JsonSchema {
  const config = getModeConfig(mode);
  const sectionKeys = config.sectionOrder as readonly string[];
  const scoreKeys = config.scoreOrder as readonly string[];

  const nickname = object({ title: str, reason: str });
  const section = object({ roastTitle: str, content: str, beNote: str });
  const score = object({ score: { anyOf: [{ type: "integer" }, { type: "null" }] }, analysis: str });

  return object({
    title: str,
    openingLine: str,
    summary: str,
    nicknames: object({ personA: nickname, personB: nickname }),
    sections: object(Object.fromEntries(sectionKeys.map((k) => [k, section]))),
    scores: object(Object.fromEntries(scoreKeys.map((k) => [k, score]))),
    personalizedAdvice: { type: "array", items: str },
    closingMessage: str,
    oneLiner: str,
    limitations: str,
  });
}
