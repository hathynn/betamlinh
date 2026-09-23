import type {
  CompatibilityMode,
  FriendshipScoreKey,
  FriendshipSectionKey,
  LoveScoreKey,
  LoveSectionKey,
} from "../types/compatibility.ts";

export interface ModeConfig<S extends string, K extends string> {
  mode: CompatibilityMode;
  /** URL slug */
  slug: string;
  label: string;
  emoji: string;
  tagline: string;
  cardBlurb: string;
  beIntro: string;
  personALabel: string;
  personBLabel: string;
  personAHint: string;
  personBHint: string;
  scoreLabel: string;
  scoreOrder: readonly K[];
  scoreLabels: Record<K, { title: string; en: string }>;
  sectionOrder: readonly S[];
  sectionLabels: Record<S, { title: string; en: string }>;
}

export const LOVE_MODE: ModeConfig<LoveSectionKey, LoveScoreKey> = {
  mode: "love",
  slug: "tinh-iu",
  label: "tình iu",
  emoji: "💘",
  tagline: "Chemistry, rung động và mấy màn đoán ý.",
  cardBlurb: "Xem hai bạn hút nhau cỡ nào, nói chuyện có hợp tần số không, và chuyện lâu dài cần xây gì.",
  beIntro: "Ồ, vụ tình cảm hả? Kể be nghe về người thứ nhất trước nha. Hứa không kể ai nghe đâu.",
  personALabel: "Người thứ nhất",
  personBLabel: "Người thương (hoặc người đang thả thính)",
  personAHint: "Thường là bạn. Hoặc người bạn đang lén xem giùm =)))",
  personBHint: "Người kia nè. be chỉ cần tên và ngày sinh thôi, không cần số điện thoại đâu.",
  scoreLabel: "Độ hợp tình iu",
  scoreOrder: ["emotionalConnection", "communication", "attraction", "longTerm"],
  scoreLabels: {
    emotionalConnection: { title: "Kết nối cảm xúc", en: "Emotional Connection" },
    communication: { title: "Giao tiếp", en: "Communication" },
    attraction: { title: "Sức hút & chemistry", en: "Attraction & Chemistry" },
    longTerm: { title: "Nền móng lâu dài", en: "Long-term Foundations" },
  },
  sectionOrder: ["attraction", "emotional", "communication", "challenges", "longTerm"],
  sectionLabels: {
    attraction: { title: "Sức hút & chemistry", en: "Attraction & Chemistry" },
    emotional: { title: "Kết nối cảm xúc", en: "Emotional Connection" },
    communication: { title: "Giao tiếp", en: "Communication" },
    challenges: { title: "Thử thách có thể gặp", en: "Potential Challenges" },
    longTerm: { title: "Chuyện lâu dài", en: "Long-term Connection" },
  },
};

export const FRIENDSHIP_MODE: ModeConfig<FriendshipSectionKey, FriendshipScoreKey> = {
  mode: "friendship",
  slug: "be-ban",
  label: "bè bạn",
  emoji: "🫶",
  tagline: "Group chat, kèo 2 giờ sáng và ai giữ bí mật giỏi hơn.",
  cardBlurb: "Xem hai đứa là cặp bài trùng hay combo phá nhà, tin nhau tới đâu và giữ tình bạn kiểu gì.",
  beIntro: "Vụ bạn bè thì be rành lắm. Kể be nghe về người thứ nhất trong cặp bài trùng này nha.",
  personALabel: "Bạn thứ nhất",
  personBLabel: "Chiến hữu",
  personAHint: "Có thể là bạn, hoặc một nửa của bộ đôi huyền thoại nào đó.",
  personBHint: "Đứa bạn mà bạn đã share quá nhiều meme. be chỉ cần tên và ngày sinh.",
  scoreLabel: "Độ hợp bè bạn",
  scoreOrder: ["trust", "communication", "mutualSupport", "sharedConnection"],
  scoreLabels: {
    trust: { title: "Tin tưởng & thấu hiểu", en: "Trust & Understanding" },
    communication: { title: "Giao tiếp", en: "Communication" },
    mutualSupport: { title: "Hỗ trợ lẫn nhau", en: "Mutual Support" },
    sharedConnection: { title: "Độ hợp cạ", en: "Shared Connection" },
  },
  sectionOrder: ["vibe", "trust", "communication", "strengths", "boundaries", "longTerm"],
  sectionLabels: {
    vibe: { title: "Vibe của tình bạn", en: "Friendship Vibe" },
    trust: { title: "Tin tưởng & thấu hiểu", en: "Trust & Understanding" },
    communication: { title: "Giao tiếp", en: "Communication" },
    strengths: { title: "Điểm mạnh", en: "Friendship Strengths" },
    boundaries: { title: "Ranh giới & thử thách", en: "Boundaries & Challenges" },
    longTerm: { title: "Chơi với nhau lâu dài", en: "Long-term Friendship" },
  },
};

export type AnyModeConfig = typeof LOVE_MODE | typeof FRIENDSHIP_MODE;

export function getModeConfig(mode: "love"): typeof LOVE_MODE;
export function getModeConfig(mode: "friendship"): typeof FRIENDSHIP_MODE;
export function getModeConfig(mode: CompatibilityMode): AnyModeConfig;
export function getModeConfig(mode: CompatibilityMode): AnyModeConfig {
  return mode === "love" ? LOVE_MODE : FRIENDSHIP_MODE;
}

export function modeFromSlug(slug: string | undefined): CompatibilityMode | null {
  if (slug === LOVE_MODE.slug) return "love";
  if (slug === FRIENDSHIP_MODE.slug) return "friendship";
  return null;
}
