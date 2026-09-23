/**
 * ============================================================
 *  KIMI (Moonshot) — TẠM TẮT
 * ============================================================
 * Đang dùng Claude (xem claudeProvider.ts). Để bật lại Kimi:
 *   1. Bỏ comment khối code bên dưới.
 *   2. Trong server/readingHandler.ts, đổi `callClaude(...)` thành `callKimi(...)`
 *      và bỏ comment các biến KIMI_* trong ServerEnv.
 *   3. Thêm KIMI_* vào api/reading.ts, vite.config.ts và .env.local.
 *
 * Lưu ý khi dùng Kimi: kimi-k3 / kimi-k2.6 cố định temperature = 1.0
 * (gửi giá trị khác sẽ lỗi). kimi-k2-turbo-preview đã ngừng hoạt động.
 * Kimi không có gói miễn phí — cần nạp tối thiểu $1.
 */
export {};

// import type { ChatMessage } from "../../src/features/compatibility/prompts/promptBuilder.ts";
// import { ProviderError } from "./types.ts";
//
// export interface KimiEnv {
//   KIMI_API_KEY?: string;
//   KIMI_BASE_URL?: string;
//   KIMI_MODEL?: string;
// }
//
// const DEFAULT_MODEL = "kimi-k3";
// const TIMEOUT_MS = 90_000;
//
// function modelOptions(model: string): Record<string, unknown> {
//   if (model.startsWith("kimi-k3")) return { reasoning_effort: "low" };
//   if (model.startsWith("kimi-k2.6")) return { thinking: { type: "disabled" } };
//   return {};
// }
//
// export async function callKimi(messages: ChatMessage[], env: KimiEnv): Promise<string> {
//   if (!env.KIMI_API_KEY) throw new ProviderError("not_configured", "KIMI_API_KEY is not configured on the server");
//
//   const model = env.KIMI_MODEL || DEFAULT_MODEL;
//   const baseUrl = (env.KIMI_BASE_URL || "https://api.moonshot.ai/v1").replace(/\/$/, "");
//   const controller = new AbortController();
//   const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
//
//   try {
//     const res = await fetch(`${baseUrl}/chat/completions`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.KIMI_API_KEY}` },
//       body: JSON.stringify({
//         model,
//         messages,
//         response_format: { type: "json_object" },
//         ...modelOptions(model),
//       }),
//       signal: controller.signal,
//     });
//     if (!res.ok) {
//       const errType = await res
//         .json()
//         .then((j: { error?: { type?: string } }) => j.error?.type ?? "unknown")
//         .catch(() => "unknown");
//       console.error(`[betamlinh] Kimi API responded with status ${res.status} (${errType})`);
//       throw new ProviderError("upstream_error", `Upstream status ${res.status}`);
//     }
//     const json = (await res.json()) as { choices?: { message?: { content?: unknown } }[] };
//     const content = json.choices?.[0]?.message?.content;
//     if (typeof content !== "string") throw new ProviderError("invalid_response", "Empty model response");
//     return content;
//   } catch (err) {
//     if (err instanceof ProviderError) throw err;
//     if (err instanceof Error && err.name === "AbortError") throw new ProviderError("timeout", "Upstream timed out");
//     console.error("[betamlinh] Kimi API request failed");
//     throw new ProviderError("upstream_error", "Upstream request failed");
//   } finally {
//     clearTimeout(timer);
//   }
// }
