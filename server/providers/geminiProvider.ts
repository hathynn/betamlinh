import { ApiError, GoogleGenAI, ThinkingLevel } from "@google/genai";
import type { ChatMessage } from "../../src/features/compatibility/prompts/promptBuilder.ts";
import { buildReadingJsonSchema } from "../../src/features/compatibility/prompts/outputSchema.ts";
import type { CompatibilityMode } from "../../src/features/compatibility/types/compatibility.ts";
import { ProviderError } from "./types.ts";

export interface GeminiEnv {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
}

/** Available on the Gemini API free tier (Google AI Studio key, no billing). */
const DEFAULT_MODEL = "gemini-3.6-flash";
const TIMEOUT_MS = 90_000;

/**
 * Calls Gemini and returns the raw JSON text of the reading.
 * The caller still validates it with parseReading() before anything is rendered.
 */
export async function callGemini(messages: ChatMessage[], mode: CompatibilityMode, env: GeminiEnv): Promise<string> {
  if (!env.GEMINI_API_KEY) throw new ProviderError("not_configured", "GEMINI_API_KEY is not configured on the server");

  const model = env.GEMINI_MODEL || DEFAULT_MODEL;
  const ai = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
    httpOptions: {
      timeout: TIMEOUT_MS,
      // Free-tier models often return a transient 503 (overloaded); retry those with backoff.
      retryOptions: { attempts: 4, initialDelay: 1, maxDelay: 8, httpStatusCodes: [500, 502, 503, 504] },
    },
  });

  const systemInstruction = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const userText = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n\n");

  let response: Awaited<ReturnType<typeof ai.models.generateContent>>;
  try {
    response = await ai.models.generateContent({
      model,
      contents: userText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseJsonSchema: buildReadingJsonSchema(mode),
        // A short creative reading doesn't need deep reasoning; low keeps latency and quota use down.
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });
  } catch (err) {
    // Log status only — never the key or the user's data.
    if (err instanceof ApiError) {
      const hint: Record<number, string> = {
        400: " (bad request / key invalid)",
        403: " (project denied access — create a key in a new AI Studio project)",
        429: " (free-tier quota / rate limit)",
      };
      console.error(`[betamlinh] Gemini API error ${err.status}${hint[err.status] ?? ""}`);
      if (err.status === 429) throw new ProviderError("quota_exceeded", "Gemini free-tier quota exceeded");
      if (err.status === 504) throw new ProviderError("timeout", "Gemini API timed out");
    } else if (err instanceof Error && /timeout|aborted/i.test(err.message)) {
      throw new ProviderError("timeout", "Gemini API timed out");
    } else {
      console.error("[betamlinh] Gemini API request failed");
    }
    throw new ProviderError("upstream_error", "Gemini API request failed");
  }

  const blocked = response.promptFeedback?.blockReason;
  const finish = response.candidates?.[0]?.finishReason;
  if (blocked || (finish && finish !== "STOP")) {
    console.error(`[betamlinh] Gemini did not finish normally (${blocked ?? finish})`);
    throw new ProviderError("invalid_response", "Model output was blocked or truncated");
  }

  const text = response.text;
  if (!text) throw new ProviderError("invalid_response", "Empty model response");
  return text;
}
