export type BeMood = "happy" | "wink" | "thinking" | "reading" | "oops";

interface BeAvatarProps {
  mood?: BeMood;
  size?: number;
  className?: string;
  /** gentle float animation (disabled automatically by prefers-reduced-motion) */
  animated?: boolean;
}

/**
 * Placeholder illustration of be — a Gen Z astrologer with a star-pinned bun,
 * round gold glasses and a moon hoodie. Swap this component's SVG for real
 * artwork later; the props API (mood/size) can stay the same.
 */
export function BeAvatar({ mood = "happy", size = 120, className = "", animated = false }: BeAvatarProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`${animated ? "animate-float" : ""} ${className}`}
      role="img"
      aria-label={`be — ${MOOD_LABEL[mood]}`}
    >
      <defs>
        <radialGradient id="be-bg" cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#3a3590" />
          <stop offset="100%" stopColor="#171a45" />
        </radialGradient>
        <linearGradient id="be-hoodie" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8f7ff0" />
          <stop offset="100%" stopColor="#5d4fc4" />
        </linearGradient>
        <clipPath id="be-clip">
          <circle cx="60" cy="60" r="58" />
        </clipPath>
      </defs>

      <circle cx="60" cy="60" r="58" fill="url(#be-bg)" />
      <circle cx="60" cy="60" r="57" fill="none" stroke="#e2bf73" strokeOpacity=".5" strokeWidth="1.5" strokeDasharray="2 5" />

      <g clipPath="url(#be-clip)">
        {/* tiny stars */}
        <path d="M18 30l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="#e2bf73" />
        <circle cx="98" cy="26" r="1.3" fill="#fff" opacity=".8" />
        <circle cx="104" cy="52" r="1" fill="#fff" opacity=".6" />

        {/* hoodie */}
        <path d="M22 120c2-22 18-34 38-34s36 12 38 34z" fill="url(#be-hoodie)" />
        <path d="M48 88c3 6 21 6 24 0" stroke="#3b2f8f" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M63 104a6 6 0 1 1-4-10 4.6 4.6 0 0 0 4 10z" fill="#f8f0e3" />

        {/* neck */}
        <rect x="53" y="76" width="14" height="12" rx="5" fill="#e9c4a6" />

        {/* hair back */}
        <path d="M32 58c0-20 12-32 28-32s28 12 28 32c0 10-3 18-6 22H38c-3-4-6-12-6-22z" fill="#2b1f55" />
        {/* bun + star pin */}
        <circle cx="60" cy="22" r="10" fill="#2b1f55" />
        <path d="M71 14l1.6 3.6 3.9.5-2.9 2.6.8 3.9-3.4-2-3.4 2 .8-3.9-2.9-2.6 3.9-.5z" fill="#e2bf73" />

        {/* face */}
        <ellipse cx="60" cy="58" rx="21" ry="23" fill="#f3d4b8" />
        {/* bangs */}
        <path d="M38 52c4-14 14-20 24-20 9 0 17 5 20 16-7-5-15-6-22-3-6 3-13 5-22 7z" fill="#2b1f55" />

        {/* cheeks */}
        <ellipse cx="46" cy="66" rx="4" ry="2.4" fill="#f29fb0" opacity=".7" />
        <ellipse cx="74" cy="66" rx="4" ry="2.4" fill="#f29fb0" opacity=".7" />

        <Eyes mood={mood} />
        {/* glasses */}
        <g fill="none" stroke="#e2bf73" strokeWidth="1.8">
          <circle cx="50" cy="58" r="7" />
          <circle cx="70" cy="58" r="7" />
          <path d="M57 58h6" />
        </g>
        <Brows mood={mood} />
        <Mouth mood={mood} />

        {/* moon earring */}
        <path d="M39 70a3 3 0 1 0 2 5 2.3 2.3 0 0 1-2-5z" fill="#e2bf73" />
      </g>
    </svg>
  );
}

const MOOD_LABEL: Record<BeMood, string> = {
  happy: "đang cười",
  wink: "đang nháy mắt",
  thinking: "đang suy nghĩ",
  reading: "đang đọc sao",
  oops: "hơi bối rối",
};

function Eyes({ mood }: { mood: BeMood }) {
  const ink = "#1e1640";
  switch (mood) {
    case "wink":
      return (
        <g>
          <circle cx="50" cy="58" r="2.4" fill={ink} />
          <path d="M66.5 58.5q3.5-3 7 0" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "reading":
      return (
        <g stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M46.5 58q3.5 3 7 0" />
          <path d="M66.5 58q3.5 3 7 0" />
        </g>
      );
    case "thinking":
      return (
        <g fill={ink}>
          <circle cx="51.5" cy="56" r="2.4" />
          <circle cx="71.5" cy="56" r="2.4" />
        </g>
      );
    default:
      return (
        <g fill={ink}>
          <circle cx="50" cy="58" r="2.6" />
          <circle cx="70" cy="58" r="2.6" />
          <circle cx="51" cy="57" r=".8" fill="#fff" />
          <circle cx="71" cy="57" r=".8" fill="#fff" />
        </g>
      );
  }
}

function Brows({ mood }: { mood: BeMood }) {
  const common = { stroke: "#2b1f55", strokeWidth: 2, fill: "none", strokeLinecap: "round" as const };
  if (mood === "oops")
    return (
      <g {...common}>
        <path d="M44 48l9 2" />
        <path d="M76 48l-9 2" />
      </g>
    );
  if (mood === "thinking")
    return (
      <g {...common}>
        <path d="M44 48q5-3 10 0" />
        <path d="M66 46q5-2 10 1" />
      </g>
    );
  return null;
}

function Mouth({ mood }: { mood: BeMood }) {
  const common = { stroke: "#7a2d45", strokeWidth: 2, fill: "none", strokeLinecap: "round" as const };
  switch (mood) {
    case "thinking":
      return <ellipse cx="62" cy="72" rx="2.5" ry="2" fill="#7a2d45" />;
    case "oops":
      return <path d="M53 73q3.5-3 7 0t7 0" {...common} />;
    case "reading":
      return <path d="M55 71q5 3 10 0" {...common} />;
    default:
      return <path d="M52 70q8 7 16 0" {...common} fill="#fff" fillOpacity=".9" />;
  }
}
