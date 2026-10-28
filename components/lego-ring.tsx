// The segmented LEGO ring used for the "oo" of "Good games." — a faithful
// port of the standalone prototype's ring() generator, so the proven
// geometry, 10-segment brick ring, glossy studs, hop animation and
// click-squash response all stay intact. Colors cycle through the
// start.ng palette: two colors only — warm cream (#fcfcf9) and site green,
// alternating per segment so both O's read as LEGO-logo discs on the lime
// plate. Both O's are identical (the k index only staggers the hop).
// a staggered hop delay (k*0.18s).

import type { CSSProperties, MouseEvent, ReactNode } from 'react'

const COLORS = ['#fcfcf9', '#1f5943']

const darker = (hex: string) =>
  '#' + [1, 3, 5]
    .map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * 0.66).toString(16).padStart(2, '0'))
    .join('')

const STEP = (Math.PI * 2) / 10

// Coordinates are serialized to fixed decimals so SSR and client markup
// agree byte-for-byte (avoids React hydration mismatches from libm diffs).
const point = (angle: number, radius: number): [string, string] => [
  (50 + radius * Math.cos(angle)).toFixed(2),
  (48 + radius * Math.sin(angle)).toFixed(2),
]

function segment(a0: number, a1: number, outer: number, inner: number) {
  const [x1, y1] = point(a0, outer)
  const [x2, y2] = point(a1, outer)
  const [x3, y3] = point(a1, inner)
  const [x4, y4] = point(a0, inner)
  const arc = (r: number, sweep: number) => `A${r} ${r} 0 0 ${sweep} `
  return `M${x1} ${y1}${arc(outer, 1)}${x2} ${y2}L${x3} ${y3}${arc(inner, 0)}${x4} ${y4}Z`
}

type RingProps = {
  /** Ring index — offsets the hop animation and shifts the color cycle */
  k: number
  /** Click squash handler from app/page.tsx */
  onClick?: (event: MouseEvent<SVGSVGElement>) => void
}

export function LegoRing({ k, onClick }: RingProps) {
  const sides: ReactNode[] = []
  const top: ReactNode[] = []

  for (let i = 0; i < 10; i++) {
    const color = COLORS[i % COLORS.length]
    const a0 = i * STEP + 0.03
    const a1 = (i + 1) * STEP - 0.03
    const mid = (a0 + a1) / 2
    const d = segment(a0, a1, 47, 19)
    const [sx, sy] = point(mid, 33)

    sides.push(
      <path key={`side-${i}`} d={d} fill={darker(color)} transform="translate(0 7)" />,
    )
    top.push(
      <g key={`top-${i}`}>
        <path d={d} fill={color} />
        <path d={d} fill="url(#ring-sheen)" />
        <circle cx={sx} cy={sy} r="8.5" fill={darker(color)} />
        <circle cx={sx} cy={(Number(sy) - 2).toFixed(1)} r="8.5" fill={color} />
        <circle cx={sx} cy={(Number(sy) - 2).toFixed(1)} r="8.5" fill="url(#ring-gloss)" />
      </g>,
    )
  }

  return (
    <svg
      className="lego-ring"
      viewBox="0 0 100 106"
      aria-hidden="true"
      focusable="false"
      onClick={onClick}
      style={{ '--d': `${(k * 0.18).toFixed(2)}s` } as CSSProperties}
    >
      <ellipse cx="50" cy="101" rx="38" ry="4.5" fill="#20231e" opacity=".14" />
      {sides}
      {top}
    </svg>
  )
}

/**
 * Shared gradient defs for the rings. Rendered once near the top of the
 * page; every ring references these ids.
 */
export function RingDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="ring-gloss" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#fff" stopOpacity=".75" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".08" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </radialGradient>
        <linearGradient id="ring-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
