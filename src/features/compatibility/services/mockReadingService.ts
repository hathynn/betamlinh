import {
  BRANCH_RELATION_VI,
  ELEMENT_VI,
  branchRelation,
  computeAstroFactsPair,
  elementRelation,
  modalityRelation,
  type BranchRelation,
  type ElementRelation,
} from "../astrology/index.ts";
import type {
  AstroFactsPair,
  CompatibilityRequest,
  CompatibilityResult,
  FriendshipScoreKey,
  FriendshipSectionKey,
  LoveScoreKey,
  LoveSectionKey,
  ReadingSection,
  ScoreItem,
} from "../types/compatibility.ts";
import { parseReading } from "../utils/parseResult.ts";
import { ELEMENT_TRAITS, FRIEND_NICKNAMES, LOVE_NICKNAMES, pairImage } from "./mockContent.ts";

/**
 * Template-based reading generator used when no AI backend is configured.
 * Results are clearly tagged `source: "mock"` and pass through the same
 * validator as AI output.
 */

const MOCK_DELAY_MS = 2200;

interface Ctx {
  A: string;
  B: string;
  facts: AstroFactsPair;
  rel: ElementRelation;
  sameModality: boolean;
  branch: BranchRelation;
  image: string;
}

function clamp(n: number): number {
  return Math.max(35, Math.min(95, Math.round(n)));
}

function hasElement(ctx: Ctx, el: string): boolean {
  return ctx.facts.personA.sunSign.element === el || ctx.facts.personB.sunSign.element === el;
}

const BRANCH_BONUS: Record<BranchRelation, number> = {
  "tam-hop": 8,
  "luc-hop": 7,
  same: 3,
  neutral: 0,
  "tu-hanh-xung": -4,
  "luc-xung": -7,
  unknown: 0,
};

function branchNote(ctx: Ctx, mode: "love" | "friendship"): string {
  const { personA, personB } = ctx.facts;
  switch (ctx.branch) {
    case "unknown":
      return "Về con giáp thì be chưa dám phán: có người sinh khoảng cuối tháng 1 – giữa tháng 2, chưa chắc đã qua Tết âm lịch năm đó, nên be không lấy con giáp ra để chấm.";
    case "tam-hop":
    case "luc-hop":
      return `Theo quan niệm dân gian, tuổi ${personA.chineseYear.animal} và tuổi ${personB.chineseYear.animal} thuộc nhóm ${BRANCH_RELATION_VI[ctx.branch]} — được xem là dễ ${mode === "love" ? "nâng đỡ nhau" : "hợp cạ, chơi lâu"}. Tham khảo cho vui thôi nha.`;
    case "luc-xung":
    case "tu-hanh-xung":
      return `Dân gian xếp tuổi ${personA.chineseYear.animal} với tuổi ${personB.chineseYear.animal} vào nhóm ${BRANCH_RELATION_VI[ctx.branch]}. Nghe hơi căng, nhưng “xung” ở đây chỉ là hai cách làm khác nhau thôi, chứ không phải lời nguyền gì đâu.`;
    case "same":
      return `Hai bạn cùng tuổi ${personA.chineseYear.animal}. Dân gian thì bảo cùng con giáp dễ hiểu nhau, be thì bảo dễ… cãi nhau y hệt kiểu.`;
    case "neutral":
      return `Tuổi ${personA.chineseYear.animal} và tuổi ${personB.chineseYear.animal} không hợp không xung theo dân gian — nghĩa là bảng trắng, hai bạn tự viết.`;
  }
}

function limitationsText(ctx: Ctx, request: CompatibilityRequest): string {
  const notes = [
    "Đây là bản luận giải MẪU (mock) do template của betamlinh tạo, chưa phải AI viết riêng.",
    "be chỉ dùng cung Mặt Trời (tính từ ngày sinh) và năm con giáp; chưa lập lá số, chưa có cung mọc, Moon sign hay vị trí hành tinh.",
  ];
  const { personA, personB } = ctx.facts;
  for (const [name, f] of [
    [request.personA.name, personA],
    [request.personB.name, personB],
  ] as const) {
    if (f.sunSign.onCusp) notes.push(`${name} sinh sát ranh giới ${f.sunSign.nameVi}/${f.sunSign.cuspWith}, cung thật có thể khác tùy giờ sinh.`);
    if (f.chineseYear.uncertain) notes.push(`Năm con giáp của ${name} chưa xác định chắc chắn vì sinh gần Tết.`);
  }
  if (personA.hasBirthTime || personB.hasBirthTime || personA.hasBirthPlace || personB.hasBirthPlace) {
    notes.push("Giờ sinh và nơi sinh đã được ghi nhận nhưng chưa được dùng để tính toán.");
  }
  notes.push("Điểm số chỉ mang tính giải trí, không phải xác suất thành công của mối quan hệ.");
  return notes.join(" ");
}

function sec(content: string, beNote?: string): ReadingSection {
  return beNote ? { content, beNote } : { content };
}

/* ------------------------------------------------------------------ */
/* LOVE                                                                */
/* ------------------------------------------------------------------ */

function buildLove(ctx: Ctx) {
  const { A, B, facts, rel, image } = ctx;
  const a = facts.personA.sunSign;
  const b = facts.personB.sunSign;
  const ta = ELEMENT_TRAITS[a.element];
  const tb = ELEMENT_TRAITS[b.element];

  const base = { same: 80, complementary: 84, mixed: 68, contrasting: 60 }[rel];
  const scores: Record<LoveScoreKey, ScoreItem> = {
    attraction: {
      score: clamp({ same: 76, complementary: 88, mixed: 72, contrasting: 78 }[rel] + (hasElement(ctx, "fire") ? 4 : 0)),
      analysis:
        rel === "contrasting"
          ? "Khác nhau nên tò mò về nhau — sức hút kiểu “trái dấu thì hút” rất rõ."
          : rel === "complementary"
            ? `Kiểu ${image}: người này làm người kia sáng lên.`
            : rel === "same"
              ? "Hút nhau vì thấy quen, như gặp đúng người cùng tần số."
              : "Có sức hút, nhưng cần thời gian để hiểu “ngôn ngữ” của nhau.",
    },
    emotionalConnection: {
      score: clamp(base + (hasElement(ctx, "water") ? 4 : 0) - (rel === "mixed" && hasElement(ctx, "air") ? 3 : 0)),
      analysis: `${A} ${ta.needs}; ${B} ${tb.needs}. Hiểu được điều đó là nửa đoạn đường.`,
    },
    communication: {
      score: clamp(base + (hasElement(ctx, "air") ? 5 : 0) + (ctx.sameModality ? -5 : 3)),
      analysis: ctx.sameModality
        ? `Cùng tính chất ${modalityWord(a.modality)} nên dễ hiểu nhau, nhưng cũng dễ cùng cố chấp.`
        : "Nhịp khác nhau nên có thể bù cho nhau, miễn là chịu nói ra thay vì bắt người kia đoán.",
    },
    longTerm: {
      score: clamp(base - 4 + BRANCH_BONUS[ctx.branch] + (hasElement(ctx, "earth") ? 4 : 0)),
      analysis:
        ctx.branch === "unknown"
          ? "Chấm dựa trên nguyên tố cung Mặt Trời; phần con giáp be bỏ qua vì chưa chắc chắn."
          : `Nguyên tố ${ELEMENT_VI[a.element]} × ${ELEMENT_VI[b.element]} cộng với quan hệ con giáp ${BRANCH_RELATION_VI[ctx.branch].toLowerCase()}.`,
    },
  };

  const sections: Record<LoveSectionKey, ReadingSection> = {
    attraction: {
      same: sec(
        `${A} và ${B} cùng nhóm nguyên tố ${ELEMENT_VI[a.element]} — ${image}. Cái hút ở đây là cảm giác quen thuộc: nói một hiểu mười, cùng nhịp, cùng kiểu ${ta.vibe}.`,
        "Nghe thì hợp đó, nhưng mà giống nhau quá thì cũng cần chút plot twist, không là yêu nhau như xem lại phim cũ.",
      ),
      complementary: sec(
        `${a.nameVi} (${ELEMENT_VI[a.element]}) gặp ${b.nameVi} (${ELEMENT_VI[b.element]}) — ${image}. ${A} mang tới năng lượng ${ta.vibe}, ${B} thì ${tb.vibe}, và hai thứ đó đang nuôi nhau chứ không dập nhau.`,
        "Chemistry có đó nha, be ngửi thấy từ đây luôn.",
      ),
      mixed: sec(
        `Đây là kiểu ${image}. ${A} ${ta.vibe}, còn ${B} ${tb.vibe}. Sức hút có, nhưng là loại cần “làm quen với nhau” chứ không phải tiếng sét ái tình ngay lập tức.`,
        "Yêu kiểu slow-burn, hợp với ai kiên nhẫn đọc hết truyện.",
      ),
      contrasting: sec(
        `${capitalize(image)}. Hai bạn khác nhau khá rõ: ${A} ${ta.vibe}, ${B} ${tb.vibe}. Chính vì khác nên tò mò, và tò mò thì hay dẫn tới rung động.`,
        "Trái dấu thì hút, vật lý nói vậy chứ tui không có nói nha.",
      ),
    }[rel],
    emotional: sec(
      `Về cảm xúc, theo biểu tượng nguyên tố thì ${A} ${ta.needs}, còn ${B} ${tb.needs}. ${
        a.element === b.element
          ? "Hai bạn cần những thứ khá giống nhau, nên dễ đồng cảm — nhưng cũng dễ cùng lúc cần được dỗ mà không ai dỗ ai."
          : "Hai nhu cầu này khác nhau, nên đừng yêu người kia theo cách mình muốn được yêu — hãy hỏi họ cần gì."
      }`,
      hasElement(ctx, "water") && hasElement(ctx, "air")
        ? "Ủa alo, một người muốn được dỗ, một người lại muốn phân tích vấn đề. Cần training giao tiếp gấp."
        : "Cảm xúc không phải đề thi trắc nghiệm, đừng bắt nhau đoán đáp án nha.",
    ),
    communication: sec(
      `${A} thường ${ta.talk}; ${B} thì ${tb.talk}. ${
        ctx.sameModality
          ? `Cả hai cùng tính chất ${modalityWord(a.modality)}, nên khi bất đồng dễ thành hai người cùng giữ quan điểm tới cùng.`
          : "Tính chất hai cung khác nhau, nên một người dễ nhường nhịp cho người kia — tận dụng điểm này khi cần hạ nhiệt."
      }`,
      "Khoan, để tui phân tích khúc này: “không sao đâu” trong tình iu thường có nghĩa là “có sao đó”.",
    ),
    challenges: sec(
      {
        same: `Thử thách lớn nhất có lẽ là… quá giống nhau. Khi cả hai cùng mệt, cùng dỗi hay cùng bận, không ai đứng ra làm người cân bằng.`,
        complementary: `Hợp thì hợp, nhưng hòa hợp dễ khiến hai bạn chủ quan. Thử thách nằm ở chỗ nhớ duy trì nỗ lực khi mọi thứ đã “quen tay”.`,
        mixed: `Nhịp độ là điểm dễ vênh: một người muốn tiến nhanh, người kia cần thêm thời gian. Không ai sai, chỉ là hai tốc độ khác nhau.`,
        contrasting: `Cách phản ứng với căng thẳng có thể trái ngược. Khi xung đột, đừng vội kết luận người kia “không hiểu mình” — có thể họ chỉ đang xử lý theo cách khác.`,
      }[rel] +
        " " +
        branchNote(ctx, "love"),
      "Vũ trụ gợi ý chỗ dễ vênh thôi, còn người làm sai vẫn phải chủ động xin lỗi nha. Đừng đổ tại Thủy nghịch hành =)))",
    ),
    longTerm: sec(
      `Để đi xa, hai bạn cần ${
        hasElement(ctx, "earth") ? "giữ được sự ổn định mà phía Đất mang lại, đồng thời đừng để nó thành nhàm chán" : "thêm một chút “đất” vào mối quan hệ: kế hoạch chung, thói quen chung, lời hứa nhỏ mà giữ được"
      }. Tử vi không quyết định được hai bạn đi tới đâu — sự tôn trọng, giao tiếp và lựa chọn mỗi ngày mới là thứ quyết định.`,
      "be không bán vé bảo hành tình iu, nhưng be tin người chịu cố thì đi được xa.",
    ),
  };

  const advice = [
    rel === "same" || ctx.sameModality
      ? "Thống nhất một “từ khóa hạ nhiệt” — khi một người nói ra thì cả hai tạm dừng 15 phút rồi mới nói tiếp."
      : "Mỗi tuần hỏi nhau một câu: “Tuần này có lúc nào anh/em/cậu thấy chưa được hiểu không?”",
    `${A} thử nói rõ điều mình cần thay vì chờ ${B} tự đoán; ${B} thì phản hồi bằng hành động cụ thể, không chỉ bằng “ok”.`,
    rel === "contrasting" || rel === "mixed"
      ? "Lên một kèo hẹn hò luân phiên: tuần này theo kiểu của người này, tuần sau theo kiểu người kia."
      : "Thử cùng làm một thứ mới chưa ai từng làm để giữ cảm giác mới mẻ.",
  ];

  const bigScore = computeOverallLocal(scores);
  return {
    title: `${a.nameVi} ${a.symbol} × ${b.nameVi} ${b.symbol}: ${image}`,
    openingLine:
      bigScore >= 78
        ? `yássss, vừa mở dữ liệu ra là be thấy có mùi chemistry rồi đó ${A} với ${B} ơi.`
        : bigScore >= 65
          ? `Ê? ${A} với ${B} nè, cặp này thú vị à nha — có chỗ hợp, có chỗ phải học nhau.`
          : `Nói thiệt nha ${A} với ${B}, cặp này không phải dạng dễ ăn, nhưng dễ ăn thì đâu có vui.`,
    summary: `${A} mang năng lượng ${ELEMENT_VI[a.element]} của ${a.nameVi} (${ta.vibe}), ${B} mang năng lượng ${ELEMENT_VI[b.element]} của ${b.nameVi} (${tb.vibe}). Theo biểu tượng chiêm tinh, đây là kiểu “${image}”. Điểm hay nằm ở cách hai bạn bù cho nhau; điểm cần để ý là cách hai bạn thể hiện và đón nhận cảm xúc.`,
    nicknames: { personA: LOVE_NICKNAMES[a.key], personB: LOVE_NICKNAMES[b.key] },
    sections,
    scores,
    personalizedAdvice: advice,
    closingMessage:
      bigScore >= 70
        ? "Vũ trụ gật đầu rồi đó, phần còn lại là hai bạn có chịu nhắn tin trước hay không thôi. be đi pha trà đây ☕"
        : "Không có cặp nào hợp 100% ngay từ đầu. Có những cặp chọn hợp nhau mỗi ngày — be mong hai bạn là kiểu đó.",
  };
}

/* ------------------------------------------------------------------ */
/* FRIENDSHIP                                                          */
/* ------------------------------------------------------------------ */

function buildFriendship(ctx: Ctx) {
  const { A, B, facts, rel, image } = ctx;
  const a = facts.personA.sunSign;
  const b = facts.personB.sunSign;
  const ta = ELEMENT_TRAITS[a.element];
  const tb = ELEMENT_TRAITS[b.element];

  const base = { same: 82, complementary: 84, mixed: 72, contrasting: 64 }[rel];
  const scores: Record<FriendshipScoreKey, ScoreItem> = {
    trust: {
      score: clamp(base + (hasElement(ctx, "earth") ? 4 : 0) + (hasElement(ctx, "water") ? 2 : 0) + BRANCH_BONUS[ctx.branch] / 2),
      analysis: hasElement(ctx, "earth")
        ? "Có người thuộc nhóm Đất nên tình bạn có một “cột mốc” đáng tin."
        : "Niềm tin ở đây được xây bằng việc giữ lời trong những chuyện nhỏ.",
    },
    communication: {
      score: clamp(base + (hasElement(ctx, "air") ? 6 : 0) + (ctx.sameModality ? -4 : 2)),
      analysis: ctx.sameModality
        ? "Cùng tính chất cung nên nói chuyện hợp, nhưng tranh luận thì không ai chịu thua."
        : "Mỗi người một nhịp, người này nói thì người kia có không gian nghe.",
    },
    mutualSupport: {
      score: clamp({ same: 78, complementary: 86, mixed: 76, contrasting: 72 }[rel] + (hasElement(ctx, "water") ? 3 : 0)),
      analysis:
        rel === "contrasting" || rel === "mixed"
          ? "Khác nhau nên hỗ trợ được nhau ở những chỗ người kia yếu."
          : "Hiểu nhau nhanh, biết lúc nào bạn mình cần được kéo đi ăn.",
    },
    sharedConnection: {
      score: clamp({ same: 88, complementary: 82, mixed: 68, contrasting: 60 }[rel] + BRANCH_BONUS[ctx.branch]),
      analysis:
        ctx.branch === "unknown"
          ? "Chấm theo nguyên tố cung Mặt Trời; con giáp chưa chắc nên be không tính."
          : `Nguyên tố ${ELEMENT_VI[a.element]} × ${ELEMENT_VI[b.element]}, con giáp ${BRANCH_RELATION_VI[ctx.branch].toLowerCase()}.`,
    },
  };

  const sections: Record<FriendshipSectionKey, ReadingSection> = {
    vibe: {
      same: sec(
        `${A} và ${B} cùng nhóm ${ELEMENT_VI[a.element]} — ${image}. Vibe chung là ${ta.vibe}: đi chung thấy hợp, nói chung thấy hiểu, im lặng cạnh nhau cũng không ngại.`,
        "Hai đứa giống nhau tới mức có khi order đồ uống y chang rồi quay sang nhìn nhau cười bịn.",
      ),
      complementary: sec(
        `Kiểu ${image}: một người lên ý tưởng, người còn lại bảo chốt. ${A} (${ta.vibe}) cộng ${B} (${tb.vibe}) ra một combo vừa vui vừa làm được việc.`,
        "Rất đoàn kết, chỉ mong lần này không phải chốt đơn trả góp nha.",
      ),
      mixed: sec(
        `Đây là kiểu ${image}. ${A} ${ta.vibe}, ${B} ${tb.vibe}. Chơi với nhau thì vui, nhưng lúc lên kèo sẽ có màn “đi liền” đối đầu “để tính đã”.`,
        "Group chat của hai bạn chắc có ít nhất 3 cái poll chưa ai vote.",
      ),
      contrasting: sec(
        `${capitalize(image)}. Hai bạn khác nhau khá nhiều: ${A} ${ta.vibe}, ${B} ${tb.vibe}. Nghe thì lệch, nhưng mấy tình bạn kiểu này hay là loại “mở mang tầm mắt” cho nhau.`,
        "Một đứa rủ đi bar, một đứa rủ đi thư viện. Cuối cùng đi ăn lẩu.",
      ),
    }[rel],
    trust: sec(
      `Theo biểu tượng nguyên tố, ${A} ${ta.needs}, còn ${B} ${tb.needs}. Niềm tin giữa hai bạn sẽ bền hơn khi mỗi người thấy nhu cầu đó được tôn trọng — không cần to tát, chỉ cần nhất quán.`,
      hasElement(ctx, "water")
        ? "Ai kể bí mật cho người phía Nước thì yên tâm, nhưng nhớ đừng hứa suông nha, họ nhớ đó."
        : "Giữ bí mật cho nhau là điều kiện cần. Không đem đi kể group khác là điều kiện đủ.",
    ),
    communication: sec(
      `${A} thường ${ta.talk}; ${B} thì ${tb.talk}. ${
        ctx.sameModality
          ? `Cùng tính chất ${modalityWord(a.modality)}, nên lúc tranh luận dễ thành hai đứa cùng đúng.`
          : "Khác tính chất cung, nên một đứa hay mở lời, một đứa hay chốt hạ."
      }`,
      "Seen không rep trong tình bạn không phải tội, nhưng seen xong đăng story thì hơi căng à nha.",
    ),
    strengths: sec(
      {
        same: "Điểm mạnh là sự đồng điệu: hiểu nhau nhanh, ít phải giải thích, có inside joke riêng mà người ngoài nghe không hiểu gì.",
        complementary: "Điểm mạnh là bù trừ cho nhau: người này thiếu gì người kia có, nên đi đâu cũng thấy yên tâm.",
        mixed: "Điểm mạnh là góc nhìn khác nhau: khi một đứa bế tắc, đứa kia hay có hướng mà mình chưa nghĩ tới.",
        contrasting: "Điểm mạnh là sự mới mẻ: hai bạn kéo nhau ra khỏi vùng an toàn, thử những thứ tự mình sẽ không làm.",
      }[rel],
      "Cặp này mà lập team làm bài nhóm thì giảng viên cũng phải nể.",
    ),
    boundaries: sec(
      `${
        {
          same: "Vì quá giống nhau, hai bạn dễ quên rằng người kia vẫn cần không gian riêng.",
          complementary: "Vì hợp, hai bạn dễ mặc định người kia luôn rảnh, luôn đồng ý.",
          mixed: "Khác nhịp nên chuyện thời gian và kế hoạch dễ vênh: người thích bất ngờ, người thích báo trước.",
          contrasting: "Khác cách sống nên cần nói rõ giới hạn: tiền bạc, giờ giấc, chuyện riêng tư.",
        }[rel]
      } ${branchNote(ctx, "friendship")}`,
      "Thống nhất ai giữ tiền trước chuyến đi, chứ một đứa tiêu như đại gia, một đứa mở app ngân hàng khóc thầm thì mệt lắm.",
    ),
    longTerm: sec(
      "Tình bạn lâu dài không cần gặp nhau mỗi ngày, mà cần những lần “có mặt” đúng lúc. Tử vi chỉ gợi ý vibe — còn giữ được nhau hay không là do hai bạn có chủ động hỏi han, xin lỗi và vui cho nhau khi người kia thành công.",
      "be không hứa hai bạn là bạn thân tới già, nhưng be thấy có đủ nguyên liệu rồi đó.",
    ),
  };

  const advice = [
    "Giữ một “kèo cố định” mỗi tháng — cà phê, ăn lẩu hay call 30 phút đều được, miễn là không bị hủy phút chót.",
    `${A} và ${B} thử nói với nhau một câu “cảm ơn vì đã…” cho một chuyện cụ thể gần đây. Nghe hơi sến nhưng hiệu quả bất ngờ.`,
    rel === "contrasting" || rel === "mixed" || ctx.sameModality
      ? "Khi bất đồng, ưu tiên nhắn riêng thay vì nói trong group chat. Không ai muốn drama của mình có khán giả."
      : "Chia sẻ một mục tiêu nhỏ chung (học một kỹ năng, tập thể dục, tiết kiệm cho chuyến đi) để có thêm lý do gặp nhau.",
  ];

  const bigScore = computeOverallLocal(scores);
  return {
    title: `${a.nameVi} ${a.symbol} × ${b.nameVi} ${b.symbol}: ${image}`,
    openingLine:
      bigScore >= 78
        ? `Ủa alo, ${A} với ${B} là cặp bài trùng hả? Dữ liệu nhìn hợp cạ dữ lắm nha.`
        : bigScore >= 65
          ? `Trời ơi ${A} với ${B}, tình bạn này có vibe “cãi nhau xong vẫn rủ nhau đi ăn”.`
          : `Nói thiệt nha, ${A} với ${B} là kiểu bạn khác nhau như hai thế giới — mà mấy tình bạn kiểu này hay bền bất ngờ.`,
    summary: `${A} (${a.nameVi}, ${ELEMENT_VI[a.element]}) và ${B} (${b.nameVi}, ${ELEMENT_VI[b.element]}) tạo nên một tình bạn kiểu “${image}”. Theo biểu tượng chiêm tinh, hai bạn ${
      rel === "same" || rel === "complementary" ? "dễ bắt nhịp với nhau" : "cần thêm chút thời gian để hiểu cách của nhau"
    }, và điều đáng quý nhất ở đây là mỗi người mang tới cho người kia một thứ họ không tự có.`,
    nicknames: { personA: FRIEND_NICKNAMES[a.key], personB: FRIEND_NICKNAMES[b.key] },
    sections,
    scores,
    personalizedAdvice: advice,
    closingMessage:
      bigScore >= 70
        ? "Tình bạn này có mùi trà sữa full topping. Giữ nhau kỹ nha, bạn tốt không có bán trên sàn đâu 🫶"
        : "Không cần giống nhau mới chơi được với nhau. Cần tôn trọng nhau thôi — và thỉnh thoảng trả tiền trà sữa giùm nhau.",
  };
}

/* ------------------------------------------------------------------ */

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function modalityWord(m: string): string {
  return { cardinal: "tiên phong", fixed: "kiên định", mutable: "linh hoạt" }[m] ?? m;
}

function computeOverallLocal(scores: Record<string, ScoreItem>): number {
  const vals = Object.values(scores)
    .map((s) => s.score)
    .filter((s): s is number => s !== null);
  return vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : 0;
}

/** Roast-style "danh hiệu" per section and the one-line summary for the mock reading. */
function roastLines(ctx: Ctx, mode: "love" | "friendship"): { titles: Record<string, string>; oneLiner: string } {
  const { A, B, rel, image } = ctx;
  if (mode === "love") {
    return {
      titles: {
        attraction: { same: "Hai bản sao cùng tần số", complementary: "Cặp đôi đổ xăng vào lửa", mixed: "Chuyên gia yêu kiểu slow-burn", contrasting: "Cặp đôi đua xe cảm xúc" }[rel],
        emotional: "Cỗ máy đoán ý hai chiều",
        communication: "Trạm phát sóng 'không sao đâu'",
        challenges: ctx.sameModality ? "Hai chúa tể không chịu nhường" : "Chúa tể lệch múi giờ",
        longTerm: "Kỹ sư xây nhà bằng tin nhắn",
      },
      oneLiner: `Nếu phải dùng một câu để mô tả ${A} và ${B}: ${image} — ồn ào, lệch nhịp, nhưng nhìn kỹ thì hợp tới mức đáng ngờ.`,
    };
  }
  return {
    titles: {
      vibe: { same: "Hai đứa dùng chung một não", complementary: "Combo lên ý tưởng và bấm nút chốt", mixed: "Chúa tể kèo 'mai đi'", contrasting: "Cặp bài trùng từ hai hành tinh" }[rel],
      trust: "Két sắt giữ bí mật hai lớp",
      communication: "Admin group chat 99+",
      strengths: "Chuyên gia cứu bồ lúc 2 giờ sáng",
      boundaries: "Hội đồng chia bill không ai muốn đòi",
      longTerm: "Tình bạn có bảo hành dài hạn",
    },
    oneLiner: `Nếu phải dùng một câu để mô tả ${A} và ${B}: hai đứa như một group chat chỉ có hai thành viên mà vẫn 99+ tin nhắn — hỗn loạn, nhưng không ai muốn rời nhóm.`,
  };
}

export function generateMockReading(request: CompatibilityRequest): unknown {
  const facts = computeAstroFactsPair(request);
  const ctx: Ctx = {
    A: request.personA.name,
    B: request.personB.name,
    facts,
    rel: elementRelation(facts.personA.sunSign.element, facts.personB.sunSign.element),
    sameModality: modalityRelation(facts.personA.sunSign.modality, facts.personB.sunSign.modality) === "same",
    branch: branchRelation(facts.personA.chineseYear, facts.personB.chineseYear),
    image: pairImage(
      elementRelation(facts.personA.sunSign.element, facts.personB.sunSign.element),
      facts.personA.sunSign.element,
      facts.personB.sunSign.element,
    ),
  };
  const body = request.mode === "love" ? buildLove(ctx) : buildFriendship(ctx);
  const roast = roastLines(ctx, request.mode);
  const sections = Object.fromEntries(
    Object.entries(body.sections).map(([k, v]) => [k, { roastTitle: roast.titles[k], ...v }]),
  );
  return { ...body, sections, oneLiner: roast.oneLiner, limitations: limitationsText(ctx, request) };
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

export async function getMockReading(request: CompatibilityRequest, signal?: AbortSignal): Promise<CompatibilityResult> {
  await wait(MOCK_DELAY_MS, signal);
  const facts = computeAstroFactsPair(request);
  // Round-trip through JSON so the mock takes exactly the same validation path as AI output.
  return parseReading(JSON.stringify(generateMockReading(request)), request.mode, facts, "mock");
}
