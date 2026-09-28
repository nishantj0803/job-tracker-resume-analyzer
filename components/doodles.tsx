/*
 * Hand-drawn-look doodle set for empty states and accents.
 * Simple geometric shapes only: fills are pastel illustration colors,
 * strokes are ink. Never used for chrome or icons.
 */

interface DoodleProps {
  className?: string;
}

export function SunDoodle({ className = "h-16 w-16" }: DoodleProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI) / 4;
        const x1 = 32 + Math.cos(angle) * 20;
        const y1 = 32 + Math.sin(angle) * 20;
        const x2 = 32 + Math.cos(angle) * 27;
        const y2 = 32 + Math.sin(angle) * 27;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#141414"
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={32} cy={32} r={14} fill="#FFB800" stroke="#141414" strokeWidth={3} />
    </svg>
  );
}

export function FlowerDoodle({ className = "h-16 w-16" }: DoodleProps) {
  const petals = Array.from({ length: 6 });
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      {petals.map((_, i) => {
        const angle = (i * Math.PI) / 3;
        const cx = 32 + Math.cos(angle) * 13;
        const cy = 32 + Math.sin(angle) * 13;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={8}
            ry={11}
            fill="#FFFDF7"
            stroke="#141414"
            strokeWidth={2.5}
            transform={`rotate(${(angle * 180) / Math.PI + 90} ${cx} ${cy})`}
          />
        );
      })}
      <circle cx={32} cy={32} r={8} fill="#F15A5A" stroke="#141414" strokeWidth={2.5} />
    </svg>
  );
}

export function RainbowDoodle({ className = "h-16 w-16" }: DoodleProps) {
  return (
    <svg viewBox="0 0 64 40" fill="none" className={className} aria-hidden>
      <path d="M6 36 A26 26 0 0 1 58 36" stroke="#F15A5A" strokeWidth={7} strokeLinecap="round" />
      <path d="M14 36 A18 18 0 0 1 50 36" stroke="#FFB800" strokeWidth={7} strokeLinecap="round" />
      <path d="M22 36 A10 10 0 0 1 42 36" stroke="#7FBFAE" strokeWidth={7} strokeLinecap="round" />
    </svg>
  );
}

export function SparkleDoodle({ className = "h-10 w-10" }: DoodleProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 1 L14.2 9.8 L23 12 L14.2 14.2 L12 23 L9.8 14.2 L1 12 L9.8 9.8 Z"
        fill="#FFB800"
        stroke="#141414"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloudDoodle({ className = "h-16 w-16" }: DoodleProps) {
  return (
    <svg viewBox="0 0 72 44" fill="none" className={className} aria-hidden>
      <path
        d="M14 36 a10 10 0 0 1 2-19.8 A14 14 0 0 1 43 8 a12 12 0 0 1 17 11.4 A9 9 0 0 1 58 36 Z"
        fill="#FFFDF7"
        stroke="#141414"
        strokeWidth={3}
        strokeLinejoin="round"
      />
    </svg>
  );
}
