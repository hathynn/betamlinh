const TWINKLES = [
  { top: "8%", left: "14%", delay: "0s", size: 3 },
  { top: "18%", left: "82%", delay: "1.1s", size: 4 },
  { top: "42%", left: "6%", delay: "2s", size: 3 },
  { top: "64%", left: "90%", delay: "0.6s", size: 3 },
  { top: "86%", left: "30%", delay: "1.6s", size: 4 },
  { top: "30%", left: "55%", delay: "2.4s", size: 2 },
];

/** Decorative, fixed background. Hidden from assistive tech. */
export function Starfield() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="starfield absolute inset-0 opacity-70" />
      {TWINKLES.map((s, i) => (
        <span
          key={i}
          className="absolute animate-twinkle rounded-full bg-cream"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
        />
      ))}
      {/* crescent */}
      <svg className="absolute -top-10 -right-16 w-72 opacity-[0.08] sm:w-96" viewBox="0 0 100 100">
        <path d="M65 5a45 45 0 1 0 30 70A38 38 0 0 1 65 5z" fill="#e2bf73" />
      </svg>
    </div>
  );
}
