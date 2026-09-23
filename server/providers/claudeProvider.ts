/**
 * CLAUDE (Anthropic) — TẠM TẮT (cần mua credit API; gói Claude Pro không dùng được).
 * Để bật lại: trong server/readingHandler.ts đổi `callGemini(...)` thành `callClaude(...)`,
 * bỏ comment ANTHROPIC_* trong ServerEnv, api/reading.ts, vite.config.ts và .env.local.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "../../src/features/compatibility/prompts/promptBuilder.ts";
import { buildReadingJsonSchema } from "../../src/features/compatibility/prompts/outputSchema.ts";
import type { CompatibilityMode } from "../../src/features/compatibility/types/compatibility.ts";
import { ProviderError } from "./types.ts";

export interface ClaudeEnv {
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_MODEL?: string;
}

const DEFAULT_MODEL = "claude-opus-5";
const TIMEOUT_MS = 90_000;

/** Models that support server-side refusal fallbacks and the effort setting. */
const supportsFallbacks = (model: string) => model.startsWith("claude-opus-5") || model.startsWith("claude-fable-5");
const supportsEffort = (model: string) => !model.startsWith("claude-haiku");

/**
 * Calls Claude and returns the raw JSON text of the reading.
 * The caller still validates it with parseReading() before anything is rendered.
 */
export async function callClaude(messages: ChatMessage[], mode: CompatibilityMode, env: ClaudeEnv): Promise<string> {
  if (!env.ANTHROPIC_API_KEY) throw new ProviderError("not_configured", "ANTHROPIC_API_KEY is not configured on the server");

  const model = env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, timeout: TIMEOUT_MS, maxRetries: 1 });

  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const userMessages: Anthropic.Beta.BetaMessageParam[] = messages
    .filter((m) => m.role === "user")
    .map((m) => ({ role: "user", content: m.content }));

  let response: Anthropic.Beta.BetaMessage;
  try {
    response = await client.beta.messages.create({
      model,
      max_tokens: 16000,
      system,
      messages: userMessages,
      output_config: {
        format: { type: "json_schema", schema: buildReadingJsonSchema(mode) },
        // A short creative reading doesn't need deep reasoning; low effort keeps cost and latency down.
        ...(supportsEffort(model) ? { effort: "low" as const } : {}),
      },
      // If a safety classifier declines, re-run on Anthropic's recommended fallback model.
      ...(supportsFallbacks(model) ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
    });
  } catch (err) {
    // Log the error class and status only — never the key or the user's data.
    if (err instanceof Anthropic.APIConnectionTimeoutError) throw new ProviderError("timeout", "Claude API timed out");
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("[betamlinh] Claude API: invalid API key (401)");
    } else if (err instanceof Anthropic.RateLimitError) {
      console.error("[betamlinh] Claude API: rate limited (429)");
    } else if (err instanceof Anthropic.APIError) {
      console.error(`[betamlinh] Claude API error ${err.status ?? "?"}: ${err.name}`);
    } else {
      console.error("[betamlinh] Claude API request failed");
    }
    throw new ProviderError("upstream_error", "Claude API request failed");
  }

  if (response.stop_reason === "refusal") {
    console.error(`[betamlinh] Claude declined the request (${response.stop_details?.category ?? "unknown"})`);
    throw new ProviderError("invalid_response", "Model declined the request");
  }
  if (response.stop_reason === "max_tokens") {
    console.error("[betamlinh] Claude output hit max_tokens");
    throw new ProviderError("invalid_response", "Model output was truncated");
  }

  const text = response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  if (!text) throw new ProviderError("invalid_response", "Empty model response");
  return text;
}
