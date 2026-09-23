const GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

interface ZodiacWheelProps {
  className?: string;
  spinning?: boolean;
}

/** Decorative celestial circle with the 12 zodiac glyphs. */
export function ZodiacWheel({ className = "", spinning = true }: ZodiacWheelProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <g className={spinning ? "origin-center animate-spin-slow" : ""} style={{ transformBox: "fill-box" }}>
        <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeOpacity=".35" />
        <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" strokeOpacity=".2" strokeDasharray="1 4" />
        {GLYPHS.map((g, i) => {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x = 100 + Math.cos(angle) * 87;
          const y = 100 + Math.sin(angle) * 87;
          const lx = 100 + Math.cos(angle + Math.PI / 12) * 96;
          const ly = 100 + Math.sin(angle + Math.PI / 12) * 96;
          const ix = 100 + Math.cos(angle + Math.PI / 12) * 78;
          const iy = 100 + Math.sin(angle + Math.PI / 12) * 78;
          return (
            <g key={g}>
              <line x1={lx} y1={ly} x2={ix} y2={iy} stroke="currentColor" strokeOpacity=".25" />
              <text x={x} y={y} fontSize="11" textAnchor="middle" dominantBaseline="central" fill="currentColor" fillOpacity=".7">
                {`${g}\uFE0E`}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
