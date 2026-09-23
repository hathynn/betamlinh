import { BRANCH_RELATION_VI, ELEMENT_VI, MODALITY_VI, branchRelation, elementRelation } from "../astrology/index.ts";
import { getModeConfig } from "../config/modes.ts";
import type { AstroFacts, AstroFactsPair, CompatibilityRequest, Person } from "../types/compatibility.ts";
import { formatDateVi } from "../utils/date.ts";
import { FRIENDSHIP_MODE_PROMPT } from "./friendshipPrompt.ts";
import { LOVE_MODE_PROMPT } from "./lovePrompt.ts";
import { BE_SYSTEM_PROMPT } from "./systemPrompt.ts";

export interface ChatMessage {
  role: "system" | "user";
  content: string;
}

function describePerson(label: string, person: Person, facts: AstroFacts): string {
  const { sunSign, chineseYear } = facts;
  const lines = [
    `## ${label}: ${person.name}`,
    `- Ngày sinh (dương lịch): ${formatDateVi(person.birthDate)}`,
    `- Giờ sinh: ${person.birthTime ?? "không cung cấp"}${person.birthTime ? " (CHƯA dùng để lập lá số)" : ""}`,
    `- Nơi sinh: ${person.birthPlace ?? "không cung cấp"}${person.birthPlace ? " (CHƯA dùng để lập lá số)" : ""}`,
    `- Cung Mặt Trời (phương Tây): ${sunSign.nameVi} ${sunSign.symbol} — nguyên tố ${ELEMENT_VI[sunSign.element]}, tính chất ${MODALITY_VI[sunSign.modality]}`,
  ];
  if (sunSign.onCusp) {
    lines.push(`  ⚠ Gần ranh giới với cung ${sunSign.cuspWith}; cần giờ/nơi sinh và ephemeris để chắc chắn — diễn giải thận trọng.`);
  }
  if (chineseYear.uncertain && chineseYear.alternate) {
    lines.push(
      `- Năm con giáp: CHƯA chắc chắn — có thể là ${chineseYear.canChi} (${chineseYear.animal}) hoặc ${chineseYear.alternate.canChi} (${chineseYear.alternate.animal}) tùy ngày Tết năm đó. Không được chọn bừa.`,
    );
  } else {
    lines.push(`- Năm con giáp (theo năm âm lịch): ${chineseYear.canChi} — tuổi ${chineseYear.animal}`);
  }
  return lines.join("\n");
}

export function describeFacts(request: CompatibilityRequest, facts: AstroFactsPair): string {
  const { personA, personB } = request;
  const a = facts.personA;
  const b = facts.personB;
  const relation = elementRelation(a.sunSign.element, b.sunSign.element);
  const relationVi = {
    same: "cùng nguyên tố",
    complementary: "bổ trợ nhau",
    mixed: "pha trộn, cần điều chỉnh",
    contrasting: "tương phản",
  }[relation];

  return [
    "# DỮ LIỆU ĐÃ TÍNH (chỉ được dùng các dữ kiện dưới đây)",
    describePerson("Người A", personA, a),
    "",
    describePerson("Người B", personB, b),
    "",
    "## Quan hệ biểu tượng",
    `- Nguyên tố cung Mặt Trời: ${ELEMENT_VI[a.sunSign.element]} × ${ELEMENT_VI[b.sunSign.element]} → ${relationVi}`,
    `- Tính chất: ${MODALITY_VI[a.sunSign.modality]} × ${MODALITY_VI[b.sunSign.modality]}`,
    `- Con giáp (dân gian): ${BRANCH_RELATION_VI[branchRelation(a.chineseYear, b.chineseYear)]}`,
    "",
    "## KHÔNG có sẵn (không được suy diễn)",
    "- Cung mọc, Moon sign, vị trí các hành tinh, nhà (houses), bát tự/tứ trụ đầy đủ, ngũ hành nạp âm, lá số tử vi.",
  ].join("\n");
}

export function buildOutputSchema(request: CompatibilityRequest): string {
  const config = getModeConfig(request.mode);
  const sections = config.sectionOrder
    .map((k) => `    "${k}": { "roastTitle": string, "content": string, "beNote": string }`)
    .join(",\n");
  const scores = config.scoreOrder.map((k) => `    "${k}": { "score": integer 0-100 | null, "analysis": string }`).join(",\n");

  return `# OUTPUT SCHEMA (JSON)
{
  "title": string,              // tiêu đề ngắn cho bản luận giải, kiểu "Cặp đôi ... "
  "openingLine": string,        // câu mở đầu từ be
  "summary": string,            // 2–4 câu tổng quan
  "nicknames": {
    "personA": { "title": string, "reason": string },
    "personB": { "title": string, "reason": string }
  },
  "sections": {
${sections}
  },
  "scores": {
${scores}
  },
  "personalizedAdvice": [string, string, string],
  "closingMessage": string,       // câu kết từ be
  "oneLiner": string,            // "Tóm lại một câu": một câu ví von lố mô tả cả cặp
  "limitations": string          // nói rõ dữ liệu nào thiếu / chưa được dùng (giọng bình thường, không đùa)
}
"roastTitle": danh hiệu bóc phốt cho section, 3–8 chữ (ví dụ "Chúa tể chọn quán 45 phút").
"content": 4–6 câu theo PHONG CÁCH BÓC PHỐT (xem hướng dẫn), nói về CẢ HAI người.
"beNote": một câu chốt ngắn của be.`;
}

export function buildReadingMessages(request: CompatibilityRequest, facts: AstroFactsPair): ChatMessage[] {
  const modePrompt = request.mode === "love" ? LOVE_MODE_PROMPT : FRIENDSHIP_MODE_PROMPT;
  return [
    { role: "system", content: BE_SYSTEM_PROMPT },
    {
      role: "user",
      content: [modePrompt, describeFacts(request, facts), buildOutputSchema(request)].join("\n\n"),
    },
  ];
}
