/**
 * Server-only reading handler. Runs in the serverless function (api/reading.ts)
 * and in the Vite dev middleware. The API key is read from the server
 * environment here and never reaches the browser bundle.
 *
 * Providers: Gemini (geminiProvider.ts, free tier) first; if Gemini is out of quota or down and
 * GROQ_API_KEY is set, fall back to Groq (groqProvider.ts, free plan).
 * Claude (claudeProvider.ts) and Kimi (kimiProvider.ts) are kept but switched off.
 */
import { computeAstroFactsPair } from "../src/features/compatibility/astrology/index.ts";
import { buildReadingMessages } from "../src/features/compatibility/prompts/promptBuilder.ts";
import type { CompatibilityMode, CompatibilityRequest, Person } from "../src/features/compatibility/types/compatibility.ts";
import { ReadingParseError, parseReading } from "../src/features/compatibility/utils/parseResult.ts";
// import { callClaude } from "./providers/claudeProvider.ts"; // Claude tạm tắt
import { callGemini } from "./providers/geminiProvider.ts";
import { callGroq } from "./providers/groqProvider.ts";
// import { callKimi } from "./providers/kimiProvider.ts"; // Kimi tạm tắt
import { ProviderError } from "./providers/types.ts";
import { sanitizePerson, validatePerson } from "../src/features/compatibility/utils/validation.ts";

export interface ServerEnv {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  /** Optional fallback when Gemini is out of quota or unavailable */
  GROQ_API_KEY?: string;
  GROQ_MODEL?: string;
  // --- Claude (tạm tắt) ---
  // ANTHROPIC_API_KEY?: string;
  // ANTHROPIC_MODEL?: string;
  // --- Kimi (tạm tắt) ---
  // KIMI_API_KEY?: string;
  // KIMI_BASE_URL?: string;
  // KIMI_MODEL?: string;
}

export interface HandlerResponse {
  status: number;
  body: Record<string, unknown>;
}

export type ErrorCode = "bad_request" | ProviderError["code"];

const STATUS: Record<ProviderError["code"], number> = {
  not_configured: 503,
  quota_exceeded: 429,
  timeout: 504,
  upstream_error: 502,
  invalid_response: 502,
};

/** Primary-provider errors worth retrying on the fallback provider. */
const FALLBACK_ON = new Set<ProviderError["code"]>(["quota_exceeded", "upstream_error", "timeout", "not_configured"]);

async function callModel(messages: ReturnType<typeof buildReadingMessages>, mode: CompatibilityMode, env: ServerEnv) {
  try {
    return await callGemini(messages, mode, env);
    // return await callClaude(messages, mode, env); // Claude tạm tắt
    // return await callKimi(messages, env); // Kimi tạm tắt
  } catch (err) {
    if (!(err instanceof ProviderError) || !FALLBACK_ON.has(err.code) || !env.GROQ_API_KEY) throw err;
    console.error(`[betamlinh] Gemini unavailable (${err.code}), falling back to Groq`);
    return await callGroq(messages, mode, env);
  }
}

function fail(status: number, code: ErrorCode, message: string): HandlerResponse {
  return { status, body: { error: { code, message } } };
}

function readPerson(value: unknown): Person | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const str = (x: unknown) => (typeof x === "string" ? x : undefined);
  const person: Person = {
    name: str(v.name) ?? "",
    birthDate: str(v.birthDate) ?? "",
    birthTime: str(v.birthTime),
    birthPlace: str(v.birthPlace),
  };
  return Object.keys(validatePerson(person)).length === 0 ? sanitizePerson(person) : null;
}

export function readRequest(body: unknown): CompatibilityRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  const mode = b.mode === "love" || b.mode === "friendship" ? (b.mode as CompatibilityMode) : null;
  const personA = readPerson(b.personA);
  const personB = readPerson(b.personB);
  if (!mode || !personA || !personB) return null;
  return { mode, personA, personB };
}

export async function handleReading(body: unknown, env: ServerEnv): Promise<HandlerResponse> {
  const request = readRequest(body);
  if (!request) return fail(400, "bad_request", "Invalid reading request");

  const facts = computeAstroFactsPair(request);
  const messages = buildReadingMessages(request, facts);

  let content: string;
  try {
    content = await callModel(messages, request.mode, env);
  } catch (err) {
    if (err instanceof ProviderError) return fail(STATUS[err.code], err.code, err.message);
    throw err;
  }

  try {
    const result = parseReading(content, request.mode, facts, "ai");
    return { status: 200, body: { result } };
  } catch (err) {
    if (err instanceof ReadingParseError) {
      console.error(`[betamlinh] Model output rejected: ${err.message}`);
      return fail(502, "invalid_response", "Model output failed validation");
    }
    throw err;
  }
}
