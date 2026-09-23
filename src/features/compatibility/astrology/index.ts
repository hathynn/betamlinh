import type { AstroFacts, AstroFactsPair, CompatibilityRequest, Person } from "../types/compatibility.ts";
import { parseIsoDate } from "../utils/date.ts";
import { getChineseYear } from "./chineseZodiac.ts";
import { getSunSign } from "./sunSign.ts";

export function computeAstroFacts(person: Person): AstroFacts {
  const date = parseIsoDate(person.birthDate);
  if (!date) throw new Error("Invalid birth date");
  return {
    sunSign: getSunSign(date),
    chineseYear: getChineseYear(date),
    hasBirthTime: Boolean(person.birthTime),
    hasBirthPlace: Boolean(person.birthPlace?.trim()),
  };
}

export function computeAstroFactsPair(request: CompatibilityRequest): AstroFactsPair {
  return {
    personA: computeAstroFacts(request.personA),
    personB: computeAstroFacts(request.personB),
  };
}

export * from "./pairing.ts";
export { ELEMENT_VI, MODALITY_VI } from "./sunSign.ts";
