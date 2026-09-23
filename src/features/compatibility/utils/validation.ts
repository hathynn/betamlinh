import type { Person } from "../types/compatibility.ts";
import { parseIsoDate, todayIso } from "./date.ts";

export type PersonField = keyof Person;
export type PersonErrors = Partial<Record<PersonField, string>>;

export const NAME_MAX = 40;
export const PLACE_MAX = 80;
export const MIN_YEAR = 1900;

export function validatePerson(person: Person): PersonErrors {
  const errors: PersonErrors = {};
  const name = person.name.trim();

  if (!name) errors.name = "be cần biết gọi người này là gì nè, nickname cũng được.";
  else if (name.length > NAME_MAX) errors.name = `Tên dài quá, gọn lại dưới ${NAME_MAX} ký tự giúp be nha.`;

  if (!person.birthDate) {
    errors.birthDate = "Thiếu ngày sinh thì be chịu, vũ trụ cũng chịu luôn.";
  } else {
    const date = parseIsoDate(person.birthDate);
    if (!date) errors.birthDate = "Ngày sinh này hơi lạ, kiểm tra lại giúp be nha.";
    else if (date.getUTCFullYear() < MIN_YEAR) errors.birthDate = `be chỉ đọc được từ năm ${MIN_YEAR} trở đi thôi.`;
    else if (person.birthDate > todayIso()) errors.birthDate = "Ủa alo, người này chưa ra đời mà? Chọn lại ngày sinh nha.";
  }

  if (person.birthTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(person.birthTime)) {
    errors.birthTime = "Giờ sinh chưa đúng định dạng giờ:phút.";
  }

  if (person.birthPlace && person.birthPlace.trim().length > PLACE_MAX) {
    errors.birthPlace = `Nơi sinh gọn lại dưới ${PLACE_MAX} ký tự nha.`;
  }

  return errors;
}

export function isPersonValid(person: Person | null | undefined): person is Person {
  return Boolean(person) && Object.keys(validatePerson(person as Person)).length === 0;
}

export function sanitizePerson(person: Person): Person {
  return {
    name: person.name.trim(),
    birthDate: person.birthDate,
    birthTime: person.birthTime || undefined,
    birthPlace: person.birthPlace?.trim() || undefined,
  };
}
