// Bespoke per-game thumbnail art. Each featured game gets its own LEGO-style
// SVG scene painted from the site palette — deterministic markup (no random
// values), so SSR and client output match byte-for-byte. The `thumb-*` CSS
// class on the thumbnail container still provides each game's sky gradient;
// this component paints the scene on top of it.

const S = {
  lime: '#b8ed39',
  green: '#1f5943',
  evergreen: '#2d6949',
  ink: '#20231e',
  orange: '#ef7b2d',
  gold: '#f2c949',
  teal: '#277e9a',
  red: '#e84f35',
  cream: '#f8f2d8',
  skin: '#f0b45d',
} as const

type num = number | string
const N = (v: num) => (typeof v === 'string' ? parseFloat(v) : v)

type BrickProps = {
  x: num
  y: num
  w: num
  h: num
  c: string
  rot?: num
}

/** A simple LEGO brick: rounded slab, bottom shade, top light, stud pins. */
function Brick({ x, y, w, h, c, rot = 0 }: BrickProps) {
  const X = N(x)
  const Y = N(y)
  const W = N(w)
  const H = N(h)
  const R = N(rot)
  const pins = Math.max(1, Math.floor(W / 16))
  return (
    <g transform={R ? `rotate(${R} ${X + W / 2} ${Y + H / 2})` : undefined}>
      <rect x={X} y={Y} width={W} height={H} rx="4.5" fill={c} />
      <rect x={X} y={Y + H - 4.5} width={W} height={4.5} rx="4.5" fill="#000" opacity=".22" />
      <rect x={X} y={Y} width={W} height={3.5} rx="3.5" fill="#fff" opacity=".28" />
      {Array.from({ length: pins }, (_, i) => (
        <circle key={`pin${i}`} cx={X + 8 + i * 16} cy={Y + H / 2} r="3.6" fill="#000" opacity=".16" />
      ))}
      {Array.from({ length: pins }, (_, i) => (
        <circle key={`pop${i}`} cx={X + 8 + i * 16} cy={Y + H / 2 - 1.2} r="3.4" fill="#fff" opacity=".38" />
      ))}
    </g>
  )
}

type FigProps = {
  x: num
  y: num
  c: string
  s?: num
  flip?: boolean
}

/** A tiny minifig silhouette: cap, head, torso, locked legs. */
function Fig({ x, y, c, s = 1, flip = false }: FigProps) {
  const X = N(x)
  const Y = N(y)
  const S_ = N(s)
  return (
    <g transform={`translate(${X} ${Y}) scale(${flip ? -S_ : S_} ${S_})`}>
      <rect x="-9" y="-10" width="18" height="8" rx="3" fill={S.ink} />
      <circle cx="0" cy="0" r="7.5" fill={S.skin} />
      <path d="M-7.5 -4.2 A 7.5 7.5 0 0 1 7.5 -4.2 L 7.5 -1.2 L -7.5 -1.2 Z" fill={S.ink} />
      <rect x="-10" y="10" width="20" height="17" rx="5" fill={c} />
      <circle cx="-10.5" cy="15" r="3.4" fill={S.lime} />
      <circle cx="10.5" cy="15" r="3.4" fill={c} />
      <rect x="-8" y="27" width="15" height="9" rx="3.5" fill={S.ink} />
    </g>
  )
}

function Ground({ h = 44, c = S.cream, y = 140 }: { h?: num; c?: string; y?: num }) {
  return <rect x="0" y={N(y)} width="328" height={N(h)} fill={c} opacity=".92" />
}

function Hangout() {
  return (
    <g>
      <circle cx="52" cy="42" r="17" fill={S.orange} />
      <circle cx="52" cy="42" r="24" fill={S.orange} opacity=".28" />
      <Ground />
      <path d="M98 56 Q 164 14 230 56 L 164 56 Z" fill={S.orange} />
      <path d="M98 56 Q 164 14 230 56" fill="none" stroke={S.ink} strokeWidth="5" />
      <rect x="162" y="54" width="4.5" height="72" rx="2.2" fill={S.ink} />
      <Brick x="104" y="118" w="120" h="24" c={S.lime} />
      <Brick x="126" y="112" w="76" h="10" c={S.gold} />
      <Fig x="86" y="86" c={S.evergreen} />
      <Fig x="242" y="86" c={S.teal} flip />
    </g>
  )
}

function BrickHunt() {
  return (
    <g>
      <Ground c={S.evergreen} y="144" />
      <Brick x="34" y="150" w="46" h="22" c={S.red} rot={-8} />
      <Brick x="118" y="152" w="46" h="22" c={S.gold} rot={6} />
      <Brick x="236" y="148" w="46" h="22" c={S.lime} rot={-3} />
      <rect x="196" y="118" width="7" height="52" rx="3.5" fill={S.ink} transform="rotate(-40 196 118)" />
      <circle cx="150" cy="74" r="40" fill={S.teal} opacity=".38" />
      <circle cx="150" cy="74" r="40" fill="none" stroke={S.ink} strokeWidth="8" />
      <path d="M128 62 a 30 30 0 0 1 34 -10" stroke="#fff" opacity=".5" strokeWidth="5" fill="none" />
      <Brick x="120" y="66" w="60" h="16" c={S.lime} />
    </g>
  )
}

function Begu() {
  const rows = [
    { y: 138, x: 104, w: 120, h: 20, c: S.red, rot: 0 },
    { y: 118, x: 104, w: 120, h: 20, c: S.green, rot: -4 },
    { y: 98, x: 104, w: 120, h: 20, c: S.gold, rot: 3 },
    { y: 78, x: 104, w: 120, h: 20, c: S.teal, rot: -3 },
    { y: 58, x: 104, w: 120, h: 20, c: S.orange, rot: 4 },
    { y: 40, x: 134, w: 60, h: 18, c: S.lime, rot: 0 },
  ]
  return (
    <g>
      <Ground />
      <circle cx="288" cy="34" r="14" fill={S.cream} opacity=".55" />
      {rows.map((b, i) => <Brick key={i} {...b} />)}
    </g>
  )
}

function Ninja() {
  return (
    <g>
      <circle cx="278" cy="40" r="19" fill={S.cream} opacity=".7" />
      <Brick x="24" y="46" w="52" h="18" c={S.ink} />
      <Brick x="64" y="64" w="52" h="18" c={S.ink} />
      <Fig x="166" y="96" c={S.ink} s={1.25} />
      <rect x="152" y="88" width="22" height="4.5" rx="2.2" fill={S.red} />
      <rect x="206" y="56" width="88" height="8" rx="4" fill={S.cream} transform="rotate(-22 206 56)" />
      <Brick x="60" y="140" w="46" h="20" c={S.green} />
    </g>
  )
}

function Job() {
  return (
    <g>
      <Ground c={S.lime} y="146" h="38" />
      <rect x="142" y="70" width="52" height="14" rx="7" fill="none" stroke={S.ink} strokeWidth="6" />
      <Brick x="94" y="80" w="148" h="74" c={S.gold} />
      <rect x="94" y="108" width="148" height="8" fill={S.ink} opacity=".3" />
      <rect x="156" y="102" width="24" height="16" rx="4" fill={S.orange} />
      <circle cx="66" cy="146" r="12" fill={S.gold} />
      <circle cx="66" cy="146" r="12" fill="none" stroke={S.orange} strokeWidth="4" />
      <circle cx="262" cy="140" r="16" fill={S.lime} />
      <circle cx="262" cy="140" r="16" fill="none" stroke={S.green} strokeWidth="4" />
    </g>
  )
}

function Tetris() {
  return (
    <g>
      <Brick x="58" y="26" w="44" h="22" c={S.teal} rot={-10} />
      <Brick x="98" y="46" w="44" h="22" c={S.orange} rot={8} />
      <Brick x="196" y="22" w="44" h="22" c={S.red} rot={6} />
      <Brick x="232" y="44" w="44" h="22" c={S.teal} rot={-4} />
      <Brick x="252" y="70" w="44" h="22" c={S.lime} rot={10} />
      <Brick x="42" y="62" w="44" h="22" c={S.gold} rot={4} />
      <Brick x="140" y="128" w="46" h="20" c={S.evergreen} />
      <Brick x="102" y="142" w="46" h="20" c={S.red} />
      <Brick x="186" y="142" w="46" h="20" c={S.gold} />
      <Brick x="60" y="142" w="46" h="20" c={S.teal} />
      <Brick x="222" y="128" w="46" h="20" c={S.orange} />
    </g>
  )
}

function Zuma() {
  return (
    <g>
      <circle cx="46" cy="44" r="16" fill={S.orange} />
      <circle cx="46" cy="44" r="26" fill="none" stroke={S.orange} strokeWidth="3" opacity=".45" />
      <Ground c={S.evergreen} y="138" h="46" />
      <path d="M142 24 L 186 24 L 198 142 L 130 142 Z" fill={S.ink} />
      <rect x="130" y="104" width="68" height="6" fill={S.cream} opacity=".2" />
      <rect x="136" y="70" width="56" height="6" fill={S.cream} opacity=".2" />
      <rect x="130" y="34" width="60" height="6" fill={S.cream} opacity=".2" />
      <Brick x="76" y="132" w="46" h="18" c={S.gold} />
      <Brick x="206" y="130" w="46" h="20" c={S.lime} />
    </g>
  )
}

function Interlock() {
  return (
    <g>
      <Ground />
      <Brick x="94" y="46" w="140" h="22" c={S.lime} rot={-2} />
      <Brick x="150" y="40" w="22" h="110" c={S.red} />
      <Brick x="96" y="98" w="136" h="22" c={S.teal} />
      <Brick x="118" y="120" w="46" h="20" c={S.gold} rot={4} />
      <circle cx="248" cy="126" r="14" fill={S.orange} />
      <circle cx="248" cy="126" r="14" fill="none" stroke={S.red} strokeWidth="4" />
    </g>
  )
}

const SCENES: Record<string, () => React.ReactNode> = {
  hangout: Hangout,
  'brick-hunt': BrickHunt,
  begu: Begu,
  ninja: Ninja,
  job: Job,
  tetris: Tetris,
  zuma: Zuma,
  interlock: Interlock,
}

export function GameThumb({ art }: { art: string }) {
  const Scene = SCENES[art]
  return (
    <svg
      viewBox="0 0 328 184"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {Scene ? <Scene /> : <Brick x="120" y="82" w="88" h="20" c={S.lime} />}
    </svg>
  )
}
