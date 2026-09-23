import type { CompatibilityRequest, CompatibilityResult } from "../types/compatibility";
import { getAiReading } from "./kimiService";
import { getMockReading } from "./mockReadingService";

export type ReadingSourceSetting = "mock" | "api";

export const READING_SOURCE: ReadingSourceSetting = import.meta.env.VITE_READING_SOURCE === "api" ? "api" : "mock";

/** Single entry point for the UI. Swap sources with VITE_READING_SOURCE. */
export function fetchReading(request: CompatibilityRequest, signal?: AbortSignal): Promise<CompatibilityResult> {
  return READING_SOURCE === "api" ? getAiReading(request, signal) : getMockReading(request, signal);
}
