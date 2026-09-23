import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { devApiPlugin } from "./server/devApiPlugin.ts";

export default defineConfig(({ mode }) => {
  // Load ALL env vars (no prefix filter) for server-side use only.
  // Only VITE_-prefixed vars are exposed to the client bundle.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      devApiPlugin({
        GEMINI_API_KEY: env.GEMINI_API_KEY,
        GEMINI_MODEL: env.GEMINI_MODEL,
        GROQ_API_KEY: env.GROQ_API_KEY,
        GROQ_MODEL: env.GROQ_MODEL,
        // ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY, // Claude tạm tắt
        // ANTHROPIC_MODEL: env.ANTHROPIC_MODEL,
        // KIMI_API_KEY: env.KIMI_API_KEY, // Kimi tạm tắt
        // KIMI_BASE_URL: env.KIMI_BASE_URL,
        // KIMI_MODEL: env.KIMI_MODEL,
      }),
    ],
  };
});
