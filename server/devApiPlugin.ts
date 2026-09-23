import type { IncomingMessage } from "node:http";
import type { Plugin } from "vite";
import { handleReading, type ServerEnv } from "./readingHandler.ts";

const MAX_BODY_BYTES = 16 * 1024;

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer) => {
      data += chunk.toString("utf8");
      if (data.length > MAX_BODY_BYTES) {
        reject(new Error("Body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

/**
 * Serves POST /api/reading during `vite dev` / `vite preview`, using the same
 * handler as the serverless function. Env vars are server-side only.
 */
export function devApiPlugin(env: ServerEnv): Plugin {
  const middleware = async (req: IncomingMessage, res: import("node:http").ServerResponse, next: () => void) => {
    if (req.url !== "/api/reading") return next();
    const send = (status: number, payload: unknown) => {
      res.statusCode = status;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(payload));
    };
    if (req.method !== "POST") return send(405, { error: { code: "bad_request", message: "Method not allowed" } });
    try {
      const raw = await readBody(req);
      const { status, body } = await handleReading(JSON.parse(raw), env);
      send(status, body);
    } catch {
      send(400, { error: { code: "bad_request", message: "Invalid request body" } });
    }
  };

  return {
    name: "betamlinh-dev-api",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
