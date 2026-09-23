import { computeAstroFactsPair } from "../astrology";
import type { CompatibilityRequest, CompatibilityResult } from "../types/compatibility";
import { ReadingParseError, parseReading } from "../utils/parseResult";

/**
 * Client for our own backend endpoint. The browser never talks to the AI provider
 * directly and never sees the API key — /api/reading does that server-side.
 */

export type ReadingErrorKind = "network" | "timeout" | "invalid" | "server" | "not_configured" | "quota";

export class ReadingServiceError extends Error {
  readonly kind: ReadingErrorKind;
  constructor(kind: ReadingErrorKind, message: string) {
    super(message);
    this.name = "ReadingServiceError";
    this.kind = kind;
  }
}

const CLIENT_TIMEOUT_MS = 100_000;

export async function getAiReading(request: CompatibilityRequest, signal?: AbortSignal): Promise<CompatibilityResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort("timeout"), CLIENT_TIMEOUT_MS);
  const onAbort = () => controller.abort("cancelled");
  signal?.addEventListener("abort", onAbort);

  let res: Response;
  try {
    res = await fetch("/api/reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    if (controller.signal.aborted) throw new ReadingServiceError("timeout", "Request timed out");
    throw new ReadingServiceError("network", "Network error");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    throw new ReadingServiceError("invalid", "Response is not JSON");
  }

  if (!res.ok) {
    const code = (payload as { error?: { code?: string } } | null)?.error?.code;
    if (code === "timeout") throw new ReadingServiceError("timeout", "Upstream timeout");
    if (code === "quota_exceeded") throw new ReadingServiceError("quota", "AI free quota exceeded");
    if (code === "not_configured") throw new ReadingServiceError("not_configured", "AI backend not configured");
    if (code === "invalid_response") throw new ReadingServiceError("invalid", "Model output invalid");
    throw new ReadingServiceError("server", `Server error ${res.status}`);
  }

  // Re-validate on the client: never render unchecked data, even from our own server.
  try {
    const facts = computeAstroFactsPair(request);
    return parseReading((payload as { result?: unknown }).result, request.mode, facts, "ai");
  } catch (err) {
    if (err instanceof ReadingParseError) throw new ReadingServiceError("invalid", err.message);
    throw err;
  }
}
