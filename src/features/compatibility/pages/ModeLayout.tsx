import { useEffect } from "react";
import { Navigate, Outlet, useOutletContext, useParams } from "react-router-dom";
import { getModeConfig, modeFromSlug, type AnyModeConfig } from "../config/modes";
import { useCompatibility } from "../state/CompatibilityContext";
import type { CompatibilityMode } from "../types/compatibility";

interface ModeOutletContext {
  mode: CompatibilityMode;
  config: AnyModeConfig;
}

/**
 * Every data-entry route lives under /:modeSlug, so a mode is always chosen
 * before any form can be shown. Unknown slugs go back to the homepage.
 */
export function ModeLayout() {
  const { modeSlug } = useParams();
  const mode = modeFromSlug(modeSlug);
  const { mode: selected, selectMode } = useCompatibility();

  useEffect(() => {
    if (mode && selected !== mode) selectMode(mode);
  }, [mode, selected, selectMode]);

  if (!mode) return <Navigate to="/" replace />;

  return (
    <div data-mode={mode} className="pb-6">
      <Outlet context={{ mode, config: getModeConfig(mode) } satisfies ModeOutletContext} />
    </div>
  );
}

export function useModeContext(): ModeOutletContext {
  return useOutletContext<ModeOutletContext>();
}
