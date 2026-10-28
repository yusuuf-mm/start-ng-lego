import { useId } from 'react'

// A reusable SVG minifigure for the start.ng LEGO layer.
// Drawn in code (no external assets), styled to the start.ng palette:
// primary-green torso, lime accent, tan head, ink hair, blue legs.
// The waving arm group (.fig-wave) and the whole figure (.fig-lean host)
// are animated from globals.css, which also disables them for
// prefers-reduced-motion.

export function LegoMinifig({ className }: { className?: string }) {
  const uid = useId()
  const sheenId = `fig-sheen-${uid.replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <svg viewBox="0 0 100 170" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <linearGradient id={sheenId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* legs + feet */}
      <rect x="30" y="118" width="17" height="46" rx="4" fill="#2f6fb8" />
      <rect x="53" y="118" width="17" height="46" rx="4" fill="#2f6fb8" />
      <rect x="26" y="160" width="23" height="9" rx="4" fill="#24558c" />
      <rect x="51" y="160" width="23" height="9" rx="4" fill="#24558c" />
      {/* torso */}
      <rect x="22" y="68" width="56" height="54" rx="8" fill="#1f5943" />
      <rect x="22" y="68" width="56" height="54" rx="8" fill={`url(#${sheenId})`} />
      <path d="M44 84L44 106L62 95Z" fill="#d6f55c" />
      {/* left arm (resting) + waving arm */}
      <rect x="8" y="72" width="15" height="44" rx="7" fill="#1f5943" />
      <g className="fig-wave">
        <rect x="76" y="66" width="15" height="42" rx="7" fill="#1f5943" />
        <circle cx="83" cy="108" r="8" fill="#f4c542" />
      </g>
      {/* head */}
      <rect x="30" y="22" width="40" height="42" rx="12" fill="#f4b45d" />
      <rect x="30" y="22" width="40" height="42" rx="12" fill={`url(#${sheenId})`} />
      <circle cx="41" cy="42" r="3" fill="#16181a" />
      <circle cx="59" cy="42" r="3" fill="#16181a" />
      <path d="M41 52Q50 59 59 52" stroke="#16181a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* hair */}
      <path d="M27 28Q50 2 73 28L73 32L27 32Z" fill="#20231e" />
      <rect x="24" y="28" width="52" height="8" rx="4" fill="#16181a" />
    </svg>
  )
}
