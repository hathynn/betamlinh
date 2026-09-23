import type { CompatibilityMode } from "../types/compatibility";
import { getModeConfig } from "./modes";

const base = (mode: CompatibilityMode) => `/${getModeConfig(mode).slug}`;

export const paths = {
  home: "/",
  personA: (mode: CompatibilityMode) => `${base(mode)}/nguoi-thu-nhat`,
  personB: (mode: CompatibilityMode) => `${base(mode)}/nguoi-thu-hai`,
  review: (mode: CompatibilityMode) => `${base(mode)}/kiem-tra`,
  reading: (mode: CompatibilityMode) => `${base(mode)}/dang-xem`,
  result: (mode: CompatibilityMode) => `${base(mode)}/ket-qua`,
};

/** Router location state used when a form is opened from the review step. */
export interface FromReviewState {
  fromReview?: boolean;
}
