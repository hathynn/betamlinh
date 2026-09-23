import Groq from "groq-sdk";
import type { ChatMessage } from "../../src/features/compatibility/prompts/promptBuilder.ts";
import { buildReadingJsonSchema } from "../../src/features/compatibility/prompts/outputSchema.ts";
import type { CompatibilityMode } from "../../src/features/compatibility/types/compatibility.ts";
import { ProviderError } from "./types.ts";

export interface GroqEnv {
  GROQ_API_KEY?: string;
  GROQ_MODEL?: string;
}

/**
 * Free plan (no card): ~30 req/min, 1K req/day, but only 8K tokens/min and 200K tokens/day —
 * one reading is ~7–8K tokens, so in practice about 1 reading/min and ~25/day.
 * Supports strict structured outputs.
 */
const DEFAULT_MODEL = "openai/gpt-oss-120b";
const TIMEOUT_MS = 90_000;

/** Fallback provider, used when Gemini is out of quota or unavailable. */
export async function callGroq(messages: ChatMessage[], mode: CompatibilityMode, env: GroqEnv): Promise<string> {
  if (!env.GROQ_API_KEY) throw new ProviderError("not_configured", "GROQ_API_KEY is not configured on the server");

  const model = env.GROQ_MODEL || DEFAULT_MODEL;
  const client = new Groq({ apiKey: env.GROQ_API_KEY, timeout: TIMEOUT_MS, maxRetries: 1 });

  let completion: Awaited<ReturnType<typeof client.chat.completions.create>>;
  try {
    completion = await client.chat.completions.create({
      model,
      messages,
      response_format: {
        type: "json_schema",
        json_schema: { name: "compatibility_reading", strict: true, schema: buildReadingJsonSchema(mode) },
      },
      // gpt-oss models reason before answering; low keeps tokens (and the 8K/min free limit) in check.
      ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" as const } : {}),
    });
  } catch (err) {
    // Log status only — never the key or the user's data.
    if (err instanceof Groq.APIConnectionTimeoutError) throw new ProviderError("timeout", "Groq API timed out");
    if (err instanceof Groq.RateLimitError) {
      console.error("[betamlinh] Groq API error 429 (free-plan quota / rate limit)");
      throw new ProviderError("quota_exceeded", "Groq free-plan quota exceeded");
    }
    if (err instanceof Groq.AuthenticationError) console.error("[betamlinh] Groq API error 401 (invalid API key)");
    else if (err instanceof Groq.APIError) console.error(`[betamlinh] Groq API error ${err.status ?? "?"}`);
    else console.error("[betamlinh] Groq API request failed");
    throw new ProviderError("upstream_error", "Groq API request failed");
  }

  const choice = completion.choices[0];
  if (choice?.finish_reason === "length") {
    console.error("[betamlinh] Groq output was truncated");
    throw new ProviderError("invalid_response", "Model output was truncated");
  }
  const text = choice?.message?.content;
  if (!text) throw new ProviderError("invalid_response", "Empty model response");
  return text;
}
