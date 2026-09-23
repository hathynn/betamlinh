/**
 * Serverless function (Vercel / any Web-standard runtime): POST /api/reading
 * Set GEMINI_API_KEY (and optionally GEMINI_MODEL, plus GROQ_API_KEY / GROQ_MODEL as a fallback) in the hosting
 * provider's environment variables.
 */
import { handleReading } from "../server/readingHandler.ts";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { code: "bad_request", message: "Body must be JSON" } }, { status: 400 });
  }
  const { status, body: payload } = await handleReading(body, {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GROQ_MODEL: process.env.GROQ_MODEL,
    // ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY, // Claude tạm tắt
    // ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
    // KIMI_API_KEY: process.env.KIMI_API_KEY, // Kimi tạm tắt
    // KIMI_BASE_URL: process.env.KIMI_BASE_URL,
    // KIMI_MODEL: process.env.KIMI_MODEL,
  });
  return Response.json(payload, { status });
}
