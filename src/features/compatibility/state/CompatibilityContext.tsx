import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CompatibilityMode, CompatibilityResult, Person } from "../types/compatibility";

export type FlowStep = "mode" | "personA" | "personB" | "review" | "reading" | "result";
export type ReadingStatus = "idle" | "loading" | "error" | "success";

export interface FlowState {
  mode: CompatibilityMode | null;
  personA: Person | null;
  personB: Person | null;
  step: FlowStep;
  status: ReadingStatus;
  errorKind: string | null;
  result: CompatibilityResult | null;
}

interface CompatibilityContextValue extends FlowState {
  selectMode: (mode: CompatibilityMode) => void;
  setPersonA: (person: Person) => void;
  setPersonB: (person: Person) => void;
  setStep: (step: FlowStep) => void;
  startReading: () => void;
  finishReading: (result: CompatibilityResult) => void;
  failReading: (errorKind: string) => void;
  /** Clear result so the same people can be re-read after edits */
  invalidateResult: () => void;
  reset: () => void;
}

const STORAGE_KEY = "betamlinh:flow";

const INITIAL: FlowState = {
  mode: null,
  personA: null,
  personB: null,
  step: "mode",
  status: "idle",
  errorKind: null,
  result: null,
};

/**
 * Only the current flow is kept, in sessionStorage (cleared when the tab closes).
 * Nothing is persisted long-term.
 */
function load(): FlowState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    const saved = JSON.parse(raw) as Partial<FlowState>;
    // A reading that was in flight when the page reloaded is restarted, not resumed.
    const status = saved.status === "success" && saved.result ? "success" : "idle";
    return { ...INITIAL, ...saved, status, errorKind: null };
  } catch {
    return INITIAL;
  }
}

const CompatibilityContext = createContext<CompatibilityContextValue | null>(null);

export function CompatibilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FlowState>(load);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable (private mode) — flow still works in memory */
    }
  }, [state]);

  const patch = useCallback((next: Partial<FlowState>) => setState((s) => ({ ...s, ...next })), []);

  const selectMode = useCallback(
    (mode: CompatibilityMode) =>
      setState((s) => ({
        ...s,
        mode,
        step: "personA",
        // Switching mode invalidates any previous result, but keeps the people.
        ...(s.mode !== mode ? { result: null, status: "idle" as const, errorKind: null } : {}),
      })),
    [],
  );

  const value = useMemo<CompatibilityContextValue>(
    () => ({
      ...state,
      selectMode,
      setPersonA: (personA) => patch({ personA, result: null, status: "idle" }),
      setPersonB: (personB) => patch({ personB, result: null, status: "idle" }),
      setStep: (step) => patch({ step }),
      startReading: () => patch({ step: "reading", status: "loading", errorKind: null, result: null }),
      finishReading: (result) => patch({ step: "result", status: "success", result, errorKind: null }),
      failReading: (errorKind) => patch({ status: "error", errorKind }),
      invalidateResult: () => patch({ result: null, status: "idle" }),
      reset: () => {
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setState(INITIAL);
      },
    }),
    [state, patch, selectMode],
  );

  return <CompatibilityContext.Provider value={value}>{children}</CompatibilityContext.Provider>;
}

export function useCompatibility(): CompatibilityContextValue {
  const ctx = useContext(CompatibilityContext);
  if (!ctx) throw new Error("useCompatibility must be used inside CompatibilityProvider");
  return ctx;
}
