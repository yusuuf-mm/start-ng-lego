/*
 * start.ng hero — "smash & snap" brick animation.
 *
 * Bricks rain in and spell start.ng, two hanging signs ("Good vibes." /
 * "Good games.") swing in on strings and smash the word, the bricks pile up
 * on the baseplate, then hop back into the word and the loop repeats.
 * Plain canvas 2D + a tiny hand-rolled physics step; no React, no three.js.
 */

export interface HeroTheme {
  red: string;
  redDeep: string;
  yellow: string;
  yellowDeep: string;
  green: string;
  greenDeep: string;
  blue: string;
  blueDeep: string;
  line: string;
  inkSoft: string;
  paperDeep: string;
}

export type HeroPhase = "build" | "hold" | "smash" | "idle" | "rebuild";

export interface BrickHeroOptions {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  stage: HTMLElement;
  theme: HeroTheme;
  reducedMotion: boolean;
  onPhase?: (phase: HeroPhase) => void;
}

export interface BrickHero {
  setTheme(theme: HeroTheme): void;
  rebuild(): void;
  destroy(): void;
}

/* ---------- feel constants ---------- */

const GRAVITY = 2600; // px/s² for flying bricks
const SWING_G = 4200; // px/s² for the pendulum signs
const SWING_DAMP = 1.5;
const HOLD_SECONDS = 1.3;
const IDLE_SECONDS = 10.5;
const SMASH_COLLAPSE_AT = 1.15;
const BOUNCE_MIN_SPEED = 360;
const MAX_STACK = 3;
const STEP = 1 / 120;

/* ---------- pixel glyphs (8 rows: ascender, x-height, descender) ---------- */

type ColorKey = "red" | "yellow" | "green" | "blue";

const GLYPHS: Record<string, string[]> = {
  s: ["....", "....", "####", "#...", "####", "...#", "####", "...."],
  t: [".#.", ".#.", "###", ".#.", ".#.", ".#.", ".##", "..."],
  a: ["....", "....", "###.", "...#", "####", "#..#", "####", "...."],
  r: ["....", "....", "#.##", "##..", "#...", "#...", "#...", "...."],
  ".": ["..", "..", "..", "..", "..", "##", "##", ".."],
  n: ["....", "....", "###.", "#..#", "#..#", "#..#", "#..#", "...."],
  g: ["....", "....", "####", "#..#", "#..#", "####", "...#", "####"],
};

const LETTERS: { ch: string; color: ColorKey }[] = [
  { ch: "s", color: "red" },
  { ch: "t", color: "yellow" },
  { ch: "a", color: "blue" },
  { ch: "r", color: "green" },
  { ch: "t", color: "red" },
  { ch: ".", color: "yellow" },
  { ch: "n", color: "green" },
  { ch: "g", color: "green" },
];

/* ---------- tiny helpers ---------- */

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return [128, 128, 128];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(hex: string, target: string, t: number) {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  const c = a.map((v, i) => Math.round(lerp(v, b[i] ?? 0, t)));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/* ---------- sprites ---------- */

interface Sprite {
  img: HTMLCanvasElement;
  w: number; // css px
  h: number;
  ax: number; // anchor, css px
  ay: number;
}

function makeCanvas(w: number, h: number, dpr: number) {
  const c = document.createElement("canvas");
  c.width = Math.ceil(w * dpr);
  c.height = Math.ceil(h * dpr);
  const ctx = c.getContext("2d")!;
  ctx.scale(dpr, dpr);
  return { c, ctx };
}

function brickSprite(cell: number, base: string, deep: string, dpr: number): Sprite {
  const pad = cell * 0.4;
  const studH = cell * 0.17;
  const studW = cell * 0.52;
  const bh = cell * 0.8;
  const w = cell + pad * 2;
  const h = bh + studH + pad * 2;
  const { c, ctx } = makeCanvas(w, h, dpr);
  const x = pad;
  const top = pad + studH;
  const r = cell * 0.13;

  // soft drop shadow
  ctx.save();
  ctx.shadowColor = "rgba(20, 22, 18, 0.24)";
  ctx.shadowBlur = cell * 0.22;
  ctx.shadowOffsetY = cell * 0.12;
  roundRect(ctx, x, top, cell, bh, r);
  ctx.fillStyle = deep;
  ctx.fill();
  ctx.restore();

  // body + shading bands
  roundRect(ctx, x, top, cell, bh, r);
  ctx.fillStyle = base;
  ctx.fill();
  ctx.save();
  roundRect(ctx, x, top, cell, bh, r);
  ctx.clip();
  ctx.fillStyle = mix(base, "#ffffff", 0.22);
  ctx.fillRect(x, top, cell, bh * 0.2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
  ctx.fillRect(x, top + bh * 0.8, cell, bh * 0.2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
  ctx.fillRect(x + cell * 0.1, top + bh * 0.3, cell * 0.06, bh * 0.38);
  ctx.restore();
  roundRect(ctx, x + 0.5, top + 0.5, cell - 1, bh - 1, r);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
  ctx.lineWidth = Math.max(1, cell * 0.035);
  ctx.stroke();

  // stud: cylinder side, then lit top
  const cx = x + cell / 2;
  const ry = studW * 0.2;
  ctx.fillStyle = mix(base, "#000000", 0.14);
  ctx.beginPath();
  ctx.ellipse(cx, top + ry * 0.4, studW / 2, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - studW / 2, top - studH + ry * 0.4, studW, studH);
  ctx.fillStyle = mix(base, "#ffffff", 0.18);
  ctx.beginPath();
  ctx.ellipse(cx, top - studH + ry * 0.4, studW / 2, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.beginPath();
  ctx.ellipse(cx - studW * 0.16, top - studH + ry * 0.25, studW * 0.14, ry * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  return { img: c, w, h, ax: x + cell / 2, ay: top + bh / 2 };
}

interface TagMetrics {
  w: number;
  h: number;
  gap: number; // ring centre to face top
  fs: number;
}

function tagSprite(text: string, fs: number, bg: string, deep: string, fg: string, line: string, dpr: number) {
  const m = document.createElement("canvas").getContext("2d")!;
  m.font = `700 ${fs}px Fredoka, "Trebuchet MS", sans-serif`;
  const tm = m.measureText(text);
  const w = tm.width + fs * 0.68;
  const h = fs * 1.3;
  const pad = fs * 0.45;
  const ringR = fs * 0.075;
  const ringCY = pad * 0.5 + ringR;
  const gap = fs * 0.2;
  const top = ringCY + gap;
  const edge = fs * 0.09;
  const W = w + pad * 2;
  const H = top + h + edge + pad;
  const { c, ctx } = makeCanvas(W, H, dpr);
  const x = pad;
  const r = fs * 0.13;

  // shadow + deep edge
  ctx.save();
  ctx.shadowColor = "rgba(32, 35, 30, 0.3)";
  ctx.shadowBlur = fs * 0.24;
  ctx.shadowOffsetY = fs * 0.16;
  roundRect(ctx, x, top + edge, w, h, r);
  ctx.fillStyle = deep;
  ctx.fill();
  ctx.restore();

  // studs along the top
  const studW = fs * 0.16;
  const studH = fs * 0.075;
  const spacing = fs * 0.28;
  const n = Math.max(2, Math.floor((w - fs * 0.6) / spacing) + 1);
  const span = (n - 1) * spacing;
  for (let i = 0; i < n; i++) {
    const sx = x + w / 2 - span / 2 + i * spacing;
    ctx.fillStyle = mix(bg, "#000000", 0.12);
    ctx.fillRect(sx - studW / 2, top - studH, studW, studH + 2);
    ctx.fillStyle = mix(bg, "#ffffff", 0.2);
    ctx.beginPath();
    ctx.ellipse(sx, top - studH, studW / 2, studW * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // face
  roundRect(ctx, x, top, w, h, r);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.save();
  roundRect(ctx, x, top, w, h, r);
  ctx.clip();
  ctx.fillStyle = "rgba(255, 255, 255, 0.36)";
  ctx.fillRect(x, top, w, fs * 0.055);
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(x, top + h - fs * 0.075, w, fs * 0.075);
  ctx.restore();

  // eyelet + ring the string ties to
  ctx.strokeStyle = line;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1.5, fs * 0.032);
  ctx.beginPath();
  ctx.moveTo(x + w / 2, ringCY + ringR);
  ctx.lineTo(x + w / 2, top + fs * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + w / 2, ringCY, ringR, 0, Math.PI * 2);
  ctx.stroke();

  // label
  ctx.font = `700 ${fs}px Fredoka, "Trebuchet MS", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const asc = m.measureText("Gd").actualBoundingBoxAscent || fs * 0.72;
  const mid = top + fs * 0.16 + (h - fs * 0.25) / 2;
  ctx.fillStyle = fg;
  ctx.fillText(text, x + w / 2, mid + asc / 2 - fs * 0.02);

  const sprite: Sprite = { img: c, w: W, h: H, ax: x + w / 2, ay: ringCY };
  const metrics: TagMetrics = { w, h: h + edge, gap, fs };
  return { sprite, metrics };
}

/* ---------- simulation types ---------- */

type BrickState = "drop" | "word" | "fly" | "rest" | "hop";

interface Brick {
  key: string; // sprite key
  gx: number; // grid col
  gy: number; // grid row (0 = top)
  tx: number;
  ty: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  va: number;
  state: BrickState;
  t: number;
  delay: number;
  x0: number;
  y0: number;
  a0: number;
  tFall: number;
  hopDur: number;
  arc: number;
  spins: number;
  col: number;
  level: number;
  restA: number;
  squash: number;
  cool: number;
}

interface Tag {
  text: string;
  color: "yellow" | "red";
  side: -1 | 1;
  sprite: Sprite | null;
  m: TagMetrics;
  px: number;
  py: number;
  restX: number;
  restY: number; // face centre at rest
  L: number;
  Lrest: number;
  Lfrom: number;
  Lv: number;
  theta: number;
  omega: number;
  alpha: number;
  psi: number;
  psiV: number;
  psiRest: number;
  visible: boolean;
  mode: "hidden" | "enter" | "hang" | "retract";
  t: number;
  delay: number;
  hit: boolean;
  grabbed: boolean;
  grabOff: number;
  grabLen: number;
  phase: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  color: string;
}

/* ---------- engine ---------- */

export function createBrickHero(opts: BrickHeroOptions): BrickHero {
  const { canvas, host, stage, onPhase } = opts;
  const ctx = canvas.getContext("2d")!;
  let theme = opts.theme;
  const reduced = opts.reducedMotion;
  const pointerFine = window.matchMedia("(pointer: fine)").matches;

  let W = 0;
  let H = 0;
  let dpr = 1;
  let cell = 24;
  let rowH = 19;
  let floorY = 0;
  let heights: number[] = [];
  let bricks: Brick[] = [];
  let particles: Particle[] = [];
  const sprites = new Map<string, Sprite>();
  const tags: Tag[] = [makeTag("Good vibes.", "yellow", -1, -0.028), makeTag("Good games.", "red", 1, 0.021)];

  let phase: HeroPhase = "build";
  let phaseT = 0;
  let simTime = 0;
  let shake = 0;
  let lastInteract = -99;
  let interacted = false;
  let hintAlpha = 0;
  let running = false;
  let inView = true;
  let raf = 0;
  let last = 0;
  let acc = 0;
  let destroyed = false;
  let ready = false;

  const pointer = { x: 0, y: 0, vx: 0, vy: 0, inside: false, t: 0, id: -1 };

  function makeTag(text: string, color: "yellow" | "red", side: -1 | 1, psiRest: number): Tag {
    return {
      text,
      color,
      side,
      sprite: null,
      m: { w: 0, h: 0, gap: 0, fs: 0 },
      px: 0,
      py: 0,
      restX: 0,
      restY: 0,
      L: 0,
      Lrest: 0,
      Lfrom: 0,
      Lv: 0,
      theta: 0,
      omega: 0,
      alpha: 0,
      psi: psiRest,
      psiV: 0,
      psiRest,
      visible: false,
      mode: "hidden",
      t: 0,
      delay: 0,
      hit: false,
      grabbed: false,
      grabOff: 0,
      grabLen: 0,
      phase: Math.random() * Math.PI * 2,
    };
  }

  function setPhase(p: HeroPhase) {
    phase = p;
    phaseT = 0;
    onPhase?.(p);
  }

  /* ----- layout ----- */

  function measure() {
    const r = host.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    return {
      W: Math.round(r.width),
      H: Math.round(r.height),
      sx: s.left - r.left,
      sy: s.top - r.top,
      sw: s.width,
      sh: s.height,
    };
  }

  let stageBox = { sx: 0, sy: 0, sw: 0, sh: 0 };

  function buildSprites() {
    sprites.clear();
    const pal: Record<ColorKey, [string, string]> = {
      red: [theme.red, theme.redDeep],
      yellow: [theme.yellow, theme.yellowDeep],
      green: [theme.green, theme.greenDeep],
      blue: [theme.blue, theme.blueDeep],
    };
    (Object.keys(pal) as ColorKey[]).forEach((k) => {
      const [base, deep] = pal[k];
      sprites.set(`${k}:0`, brickSprite(cell, base, deep, dpr));
      sprites.set(`${k}:1`, brickSprite(cell, mix(base, "#ffffff", 0.12), deep, dpr));
      sprites.set(`${k}:2`, brickSprite(cell, mix(base, "#000000", 0.1), deep, dpr));
    });
    tags.forEach((tag) => {
      const isY = tag.color === "yellow";
      const { sprite, metrics } = tagSprite(
        tag.text,
        tag.m.fs || 60,
        isY ? theme.yellow : theme.red,
        isY ? theme.yellowDeep : theme.redDeep,
        isY ? "#20231e" : "#f9f5e8",
        theme.line,
        dpr,
      );
      tag.sprite = sprite;
      tag.m = metrics;
    });
  }

  /** Word targets for the current stage. Returns per-brick grid + target positions. */
  function wordTargets() {
    const { sx, sy, sw, sh } = stageBox;
    const narrow = sw < 620;
    const lines = narrow ? [LETTERS.slice(0, 5), LETTERS.slice(5)] : [LETTERS];
    const colsOf = (line: typeof LETTERS) =>
      line.reduce((n, l) => n + (GLYPHS[l.ch]?.[0]?.length ?? 0), 0) + (line.length - 1);
    const maxCols = Math.max(...lines.map(colsOf));
    const lineStep = narrow ? 5.7 : 0; // rows between line tops (lines share empty rows)
    const totalRows = 8 + lineStep * (lines.length - 1);
    cell = Math.floor(clamp(Math.min((sw * 0.94) / maxCols, (sh * 0.78) / (totalRows * 0.8)), 8, 32));
    rowH = cell * 0.8;

    // vertical extents actually filled (row 0 is mostly empty)
    const firstRow = 0;
    const lastRow = narrow ? 7 + lineStep : 7;
    const blockH = (lastRow - firstRow + 1) * rowH;
    const top = sy + sh / 2 - blockH / 2 - firstRow * rowH;

    const out: { gx: number; gy: number; tx: number; ty: number; color: ColorKey; letter: number }[] = [];
    let letterIdx = 0;
    lines.forEach((line, li) => {
      const cols = colsOf(line);
      const left = sx + sw / 2 - (cols * cell) / 2;
      let col = 0;
      line.forEach((l) => {
        const g = GLYPHS[l.ch]!;
        const gw = g[0]!.length;
        g.forEach((row, ry) => {
          for (let cx = 0; cx < gw; cx++) {
            if (row[cx] !== "#") continue;
            const gx = col + cx;
            const gy = ry + li * lineStep;
            out.push({
              gx: gx + li * 100,
              gy,
              tx: left + (gx + 0.5) * cell,
              ty: top + (gy + 0.5) * rowH,
              color: l.color,
              letter: letterIdx,
            });
          }
        });
        col += gw + 1;
        letterIdx++;
      });
    });
    return out;
  }

  function layoutTags() {
    const { sx, sy, sw, sh } = stageBox;
    const narrow = sw < 620;
    let fs = narrow ? Math.max(30, sw * 0.112) : Math.min(100, sw * 0.088);
    // keep the wider sign inside the viewport
    const probe = document.createElement("canvas").getContext("2d")!;
    probe.font = `700 ${fs}px Fredoka, "Trebuchet MS", sans-serif`;
    const widest = probe.measureText("Good games.").width + fs * 0.68;
    if (widest > W - 28) fs *= (W - 28) / widest;
    tags.forEach((t) => (t.m.fs = fs));
    buildSprites();

    const tw = Math.max(tags[0]!.m.w, tags[1]!.m.w);
    const d = Math.max(0, Math.min(tw * 0.28, (W - tw) / 2 - 14));
    const cx = sx + sw / 2;
    const cy = sy + sh / 2;
    const gapY = fs * 0.1;
    const pivotY = -Math.max(140, H * 0.14);
    tags.forEach((t, i) => {
      const dir = i === 0 ? -1 : 1;
      t.restX = cx + dir * d;
      t.restY = cy + dir * (t.m.h / 2 + gapY / 2);
      t.px = t.restX;
      t.py = pivotY;
      t.Lrest = t.restY - (t.m.gap + t.m.h / 2) - pivotY;
      if (t.mode === "hang") t.L = t.Lrest;
    });
  }

  function resize(force = false) {
    const m = measure();
    if (m.W < 10 || m.H < 10) return;
    const widthChanged = Math.abs(m.W - W) > 40;
    W = m.W;
    H = m.H;
    stageBox = { sx: m.sx, sy: m.sy, sw: m.sw, sh: m.sh };
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    floorY = H - 4;

    if (!ready) return;
    if (force || widthChanged || bricks.length === 0) {
      layoutTags();
      resetWord();
      if (!force) fastForward();
    } else {
      layoutTags();
      const targets = wordTargets();
      buildSprites();
      bricks.forEach((b, i) => {
        const tgt = targets[i];
        if (!tgt) return;
        b.tx = tgt.tx;
        b.ty = tgt.ty;
        if (b.state === "word") {
          b.x = b.tx;
          b.y = b.ty;
        }
      });
    }
    draw();
  }

  /** Fresh bricks, raining in from above, plus hidden signs. */
  function resetWord() {
    const targets = wordTargets();
    buildSprites();
    heights = new Array(Math.ceil(W / cell) + 1).fill(0);
    particles = [];
    const maxGx = Math.max(...targets.map((t) => t.gx % 100));
    bricks = targets.map((tgt) => {
      const startY = -rand(60, 320);
      const startX = tgt.tx + rand(-50, 50);
      const fromBottom = 7 - tgt.gy;
      const lineShift = tgt.gx >= 100 ? 0.45 : 0;
      const b: Brick = {
        key: `${tgt.color}:${Math.floor(Math.random() * 3)}`,
        gx: tgt.gx,
        gy: tgt.gy,
        tx: tgt.tx,
        ty: tgt.ty,
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        a: rand(-0.8, 0.8),
        va: 0,
        state: "drop",
        t: 0,
        delay: ((tgt.gx % 100) / Math.max(1, maxGx)) * 1.05 + fromBottom * 0.035 + rand(0, 0.06) + lineShift,
        x0: startX,
        y0: startY,
        a0: 0,
        tFall: Math.sqrt((2 * (tgt.ty - startY)) / 3400),
        hopDur: 0,
        arc: 0,
        spins: 0,
        col: 0,
        level: 0,
        restA: 0,
        squash: 0,
        cool: 0,
      };
      b.a0 = b.a;
      return b;
    });
    tags.forEach((t) => {
      t.mode = "hidden";
      t.visible = false;
      t.grabbed = false;
    });
    setPhase("build");
  }

  /* ----- phase transitions ----- */

  function startSmash() {
    setPhase("smash");
    tags.forEach((t, i) => {
      t.mode = "enter";
      t.visible = true;
      t.t = 0;
      t.delay = i * 0.2;
      t.theta = t.side * 1.4;
      t.omega = 0;
      t.psi = t.psiRest;
      t.psiV = 0;
      t.Lfrom = t.Lrest * 0.22;
      t.L = t.Lfrom;
      t.Lv = 0;
      t.hit = false;
    });
  }

  function startRebuild() {
    setPhase("rebuild");
    heights.fill(0);
    tags.forEach((t) => {
      t.mode = "retract";
      t.t = 0;
      t.Lfrom = t.L;
      t.grabbed = false;
    });
    bricks.forEach((b) => {
      b.state = "hop";
      b.t = 0;
      b.x0 = b.x;
      b.y0 = b.y;
      b.a0 = b.a;
      const dist = Math.hypot(b.tx - b.x, b.ty - b.y);
      b.hopDur = clamp(0.55 + dist / 1800, 0.55, 0.95);
      b.arc = 90 + dist * 0.28;
      b.spins = Math.round(rand(-1, 1)) * Math.PI * 2;
      b.delay = 0.35 + (7 - b.gy) * 0.05 + ((b.gx % 100) * 0.014) + rand(0, 0.08);
      b.vx = b.vy = b.va = 0;
    });
  }

  /* ----- physics ----- */

  function tagPose(t: Tag) {
    const ex = t.px + t.L * Math.sin(t.theta);
    const ey = t.py + t.L * Math.cos(t.theta);
    const rot = -t.theta + t.psi;
    const off = t.m.gap + t.m.h / 2;
    return { ex, ey, rot, cx: ex - Math.sin(rot) * off, cy: ey + Math.cos(rot) * off };
  }

  function toLocal(t: Tag, x: number, y: number) {
    const p = tagPose(t);
    const dx = x - p.cx;
    const dy = y - p.cy;
    const c = Math.cos(-p.rot);
    const s = Math.sin(-p.rot);
    return { lx: dx * c - dy * s, ly: dx * s + dy * c, pose: p };
  }

  function unstack(b: Brick) {
    if (b.state !== "rest") return;
    const col = b.col;
    const lvl = b.level;
    heights[col] = Math.min(heights[col] ?? 0, lvl);
    for (const o of bricks) {
      if (o !== b && o.state === "rest" && o.col === col && o.level > lvl) {
        o.state = "fly";
        o.vx = rand(-20, 20);
        o.vy = 0;
      }
    }
  }

  function launch(b: Brick, vx: number, vy: number) {
    unstack(b);
    b.state = "fly";
    b.vx = vx;
    b.vy = vy;
    b.va = rand(-11, 11);
    b.cool = 0.12;
  }

  function puff(x: number, y: number, n: number) {
    for (let i = 0; i < n && particles.length < 70; i++) {
      const life = rand(0.35, 0.7);
      particles.push({
        x,
        y,
        vx: rand(-160, 160),
        vy: rand(-260, -40),
        life,
        max: life,
        r: rand(1.5, 4) * (cell / 24),
        color: Math.random() < 0.5 ? theme.paperDeep : theme.yellow,
      });
    }
  }

  function stepTags(dt: number) {
    for (const t of tags) {
      if (!t.visible) continue;
      t.t += dt;
      if (t.mode === "enter") {
        if (t.t < t.delay) continue;
        const k = clamp((t.t - t.delay) / 0.42, 0, 1);
        const prevL = t.L;
        t.L = lerp(t.Lfrom, t.Lrest, easeOutCubic(k));
        t.Lv = (t.L - prevL) / dt;
        if (k >= 1) {
          t.mode = "hang";
          t.Lv = 0;
        }
      } else if (t.mode === "hang") {
        // elastic string: pull a sign down to bash the pile, let go and it boings back
        let target = t.Lrest;
        if (t.grabbed) {
          const dist = Math.hypot(pointer.x - t.px, pointer.y - t.py);
          target = clamp(dist - t.grabLen, t.Lrest * 0.55, t.Lrest * 1.9);
        }
        t.Lv += (95 * (target - t.L) - 9 * t.Lv) * dt;
        t.L += t.Lv * dt;
      } else if (t.mode === "retract") {
        const k = clamp(t.t / 0.6, 0, 1);
        const prevL = t.L;
        t.L = lerp(t.Lfrom, t.Lfrom * 0.08, easeInCubic(k));
        t.Lv = (t.L - prevL) / dt;
        if (k >= 1) {
          t.visible = false;
          t.mode = "hidden";
          continue;
        }
      }

      let alpha = -(SWING_G / Math.max(60, t.L)) * Math.sin(t.theta);
      const damp = t.mode === "retract" ? 7 : SWING_DAMP;
      alpha -= damp * t.omega;
      if (t.mode === "hang" && !reduced) alpha += 0.16 * Math.sin(simTime * 1.25 + t.phase);
      if (t.grabbed) {
        const target = clamp(Math.atan2(pointer.x - t.px, pointer.y - t.py) - t.grabOff, -1.45, 1.45);
        alpha += 170 * (target - t.theta) - 16 * t.omega;
      }
      t.alpha = alpha;
      t.omega += alpha * dt;
      t.theta += t.omega * dt;

      // the sign wobbles on its ring a little behind the swing
      const psiAcc = -60 * (t.psi - t.psiRest) - 5 * t.psiV - alpha * 0.32;
      t.psiV += psiAcc * dt;
      t.psi = clamp(t.psi + t.psiV * dt, -0.6, 0.6);

      if (t.mode !== "hidden") collideTag(t);
    }
  }

  function collideTag(t: Tag) {
    const pose = tagPose(t);
    const hw = t.m.w / 2 + cell * 0.45;
    const hh = t.m.h / 2 + cell * 0.45;
    const reach = Math.hypot(hw, hh);
    for (const b of bricks) {
      if (b.state === "drop" || b.state === "hop") continue;
      if (Math.abs(b.x - pose.cx) > reach || Math.abs(b.y - pose.cy) > reach) continue;
      const { lx, ly } = toLocal(t, b.x, b.y);
      if (Math.abs(lx) > hw || Math.abs(ly) > hh) continue;
      // velocity of the sign at this point (rotation about pivot + string reel)
      const rx = b.x - t.px;
      const ry = b.y - t.py;
      const len = Math.hypot(rx, ry) || 1;
      const vx = t.omega * ry + (t.Lv * rx) / len;
      const vy = -t.omega * rx + (t.Lv * ry) / len;
      const speed = Math.hypot(vx, vy);

      // push out along the shallower axis (in sign space)
      const penX = hw - Math.abs(lx);
      const penY = hh - Math.abs(ly);
      const c = Math.cos(pose.rot);
      const s = Math.sin(pose.rot);
      let nx: number;
      let ny: number;
      if (penX < penY) {
        const sx = Math.sign(lx) || 1;
        nx = c * sx;
        ny = s * sx;
      } else {
        const sy = Math.sign(ly) || 1;
        nx = -s * sy;
        ny = c * sy;
      }
      const pen = Math.min(penX, penY);

      if (speed > 60 && b.cool <= 0) {
        const wasStill = b.state !== "fly";
        launch(b, vx * 1.15 + nx * 120 + rand(-70, 70), Math.min(vy, 0) * 0.9 + ny * 80 - rand(160, 460));
        if (wasStill) puff(b.x, b.y, 1);
        if (!t.hit && t.mode !== "retract") {
          t.hit = true;
          shake = Math.max(shake, 0.22);
          puff(b.x, b.y, 6);
        }
      } else if (b.state === "fly") {
        b.x += nx * pen;
        b.y += ny * pen;
      }
    }
  }

  function settle(b: Brick) {
    const n = heights.length;
    const c0 = clamp(Math.floor(b.x / cell), 0, n - 1);
    let best = c0;
    let bestScore = Infinity;
    for (let c = c0 - 2; c <= c0 + 2; c++) {
      if (c < 0 || c >= n) continue;
      const h = heights[c] ?? 0;
      const score = h + Math.abs(c - c0) * 0.7 + (h >= MAX_STACK ? 10 : 0);
      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }
    b.state = "rest";
    b.col = best;
    b.level = heights[best] ?? 0;
    heights[best] = b.level + 1;
    const quarter = Math.PI / 2;
    b.restA = Math.round(b.a / quarter) * quarter + rand(-0.07, 0.07);
    b.vx = b.vy = b.va = 0;
    b.squash = 1;
  }

  function stepBricks(dt: number) {
    const restH = rowH * 0.94;
    for (const b of bricks) {
      b.cool = Math.max(0, b.cool - dt);
      b.squash = Math.max(0, b.squash - dt * 7);
      switch (b.state) {
        case "drop": {
          b.t += dt;
          const e = b.t - b.delay;
          if (e <= 0) break;
          if (e < b.tFall) {
            const k = e / b.tFall;
            b.y = b.y0 + 0.5 * 3400 * e * e;
            b.x = lerp(b.x0, b.tx, easeOutCubic(k));
            b.a = b.a0 * (1 - k);
          } else {
            const bt = e - b.tFall;
            const hop = Math.abs(Math.sin(bt * Math.PI * 6)) * rowH * 0.28 * Math.exp(-bt * 9);
            b.x = b.tx;
            b.y = b.ty - hop;
            b.a = 0;
            if (bt < 0.02) b.squash = 1;
            if (bt > 0.38) {
              b.state = "word";
              b.y = b.ty;
            }
          }
          break;
        }
        case "word":
          b.x = b.tx;
          b.y = b.ty;
          break;
        case "hop": {
          b.t += dt;
          const e = b.t - b.delay;
          if (e <= 0) break;
          const k = clamp(e / b.hopDur, 0, 1);
          const ke = easeOutCubic(k);
          b.x = lerp(b.x0, b.tx, ke);
          b.y = lerp(b.y0, b.ty, k) - b.arc * 4 * k * (1 - k);
          b.a = lerp(b.a0, 0, ke) + b.spins * (1 - ke);
          if (k >= 1) {
            b.state = "word";
            b.x = b.tx;
            b.y = b.ty;
            b.a = 0;
            b.squash = 1;
          }
          break;
        }
        case "rest": {
          const tx = (b.col + 0.5) * cell;
          const ty = floorY - (b.level + 0.5) * restH;
          const k = Math.min(1, dt * 16);
          b.x += (tx - b.x) * k;
          b.y += (ty - b.y) * k;
          b.a += (b.restA - b.a) * k;
          break;
        }
        case "fly": {
          b.vy += GRAVITY * dt;
          b.vx *= Math.exp(-0.35 * dt);
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.a += b.va * dt;
          const r = cell * 0.5;
          if (b.x < r) {
            b.x = r;
            b.vx = Math.abs(b.vx) * 0.45;
          } else if (b.x > W - r) {
            b.x = W - r;
            b.vx = -Math.abs(b.vx) * 0.45;
          }
          const col = clamp(Math.floor(b.x / cell), 0, heights.length - 1);
          const restY = floorY - ((heights[col] ?? 0) + 0.5) * restH;
          if (b.y >= restY && b.vy > 0) {
            if (b.vy > BOUNCE_MIN_SPEED) {
              b.y = restY;
              b.vy = -b.vy * 0.3;
              b.vx *= 0.7;
              b.va = b.va * 0.5 + rand(-4, 4);
              b.squash = 0.7;
            } else {
              settle(b);
            }
          }
          break;
        }
      }
    }
  }

  function stepPointer() {
    if (!pointer.inside || reduced) return;
    const speed = Math.hypot(pointer.vx, pointer.vy);
    if (speed < 420 || performance.now() / 1000 - pointer.t > 0.08) return;
    const R = cell * 1.15;
    for (const b of bricks) {
      if (b.state === "drop" || b.state === "hop" || b.cool > 0) continue;
      if (Math.abs(b.x - pointer.x) > R || Math.abs(b.y - pointer.y) > R) continue;
      launch(b, pointer.vx * 0.55 + rand(-60, 60), Math.min(pointer.vy * 0.4, 0) - rand(220, 420));
      markInteract();
    }
  }

  function markInteract() {
    lastInteract = simTime;
    interacted = true;
  }

  function step(dt: number) {
    simTime += dt;
    phaseT += dt;
    shake = Math.max(0, shake - dt);

    if (phase === "build" || phase === "rebuild") {
      if (phase === "rebuild" || phaseT > 0.2) {
        const done = bricks.every((b) => b.state === "word");
        if (done) setPhase("hold");
      }
    } else if (phase === "hold") {
      if (phaseT > HOLD_SECONDS) startSmash();
    } else if (phase === "smash") {
      if (phaseT > SMASH_COLLAPSE_AT) {
        for (const b of bricks) if (b.state === "word") launch(b, rand(-90, 90), rand(-260, 0));
      }
      if (phaseT > 1.6) setPhase("idle");
    } else if (phase === "idle") {
      const grabbed = tags.some((t) => t.grabbed);
      if (!reduced && !grabbed && phaseT > IDLE_SECONDS && simTime - lastInteract > 4) startRebuild();
    }

    stepTags(dt);
    stepBricks(dt);
    stepPointer();

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]!;
      p.life -= dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      p.vy += 900 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    const wantHint = pointerFine && phase === "idle" && phaseT > 1.4 && !interacted;
    hintAlpha = clamp(hintAlpha + (wantHint ? dt * 1.5 : -dt * 3), 0, 1);
  }

  function fastForward() {
    // Jump to the settled "signs hanging, bricks on the plate" state.
    let guard = 0;
    while (phase !== "idle" && guard < 3000) {
      step(STEP);
      guard++;
    }
    for (let i = 0; i < 360; i++) step(STEP);
    particles = [];
    shake = 0;
    hintAlpha = 0;
    if (phase === "idle") phaseT = Math.min(phaseT, 3);
  }

  /* ----- drawing ----- */

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (shake > 0) {
      const k = shake / 0.22;
      ctx.translate(Math.sin(simTime * 90) * 5 * k, Math.cos(simTime * 77) * 3 * k);
    }

    // strings + signs
    for (const t of tags) {
      if (!t.visible || !t.sprite) continue;
      const p = tagPose(t);
      ctx.strokeStyle = theme.line;
      ctx.lineWidth = Math.max(1.5, t.m.fs * 0.028);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(t.px, t.py);
      ctx.lineTo(p.ex, p.ey);
      ctx.stroke();
      ctx.save();
      ctx.translate(p.ex, p.ey);
      ctx.rotate(p.rot);
      ctx.drawImage(t.sprite.img, -t.sprite.ax, -t.sprite.ay, t.sprite.w, t.sprite.h);
      ctx.restore();
    }

    // bricks, back to front (lower ones first so studs tuck under the row above)
    const order = bricks.slice().sort((a, b) => b.y - a.y);
    for (const b of order) {
      if (b.state === "drop" && b.t < b.delay) continue;
      if (b.state === "hop" && b.t < b.delay && b.y > H + 40) continue;
      const s = sprites.get(b.key);
      if (!s) continue;
      if (b.y < -s.h || b.y > H + s.h) continue;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.a);
      if (b.squash > 0) ctx.scale(1 + b.squash * 0.1, 1 - b.squash * 0.14);
      ctx.drawImage(s.img, -s.ax, -s.ay, s.w, s.h);
      ctx.restore();
    }

    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const red = tags[1]!;
    if (hintAlpha > 0.01 && red.visible) {
      const p = tagPose(red);
      ctx.globalAlpha = hintAlpha * 0.85;
      ctx.fillStyle = theme.inkSoft;
      ctx.font = `700 ${Math.max(10, Math.round(red.m.fs * 0.13))}px "Space Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText("↑ GRAB A SIGN & GIVE IT A SWING", p.cx, p.cy + red.m.h / 2 + red.m.fs * 0.42);
      ctx.globalAlpha = 1;
    }
  }

  /* ----- loop ----- */

  function frame(now: number) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    acc += dt;
    while (acc >= STEP) {
      step(STEP);
      acc -= STEP;
    }
    draw();
    raf = requestAnimationFrame(frame);
  }

  function updateRunning() {
    const should = ready && !reduced && inView && document.visibilityState === "visible" && !destroyed;
    if (should && !running) {
      running = true;
      last = performance.now();
      acc = 0;
      raf = requestAnimationFrame(frame);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }

  /* ----- input ----- */

  function local(e: PointerEvent) {
    const r = host.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function tagAt(x: number, y: number) {
    for (let i = tags.length - 1; i >= 0; i--) {
      const t = tags[i]!;
      if (!t.visible || t.mode === "retract") continue;
      const { lx, ly } = toLocal(t, x, y);
      if (Math.abs(lx) <= t.m.w / 2 + 6 && Math.abs(ly) <= t.m.h / 2 + 6) return t;
    }
    return null;
  }

  const onMove = (e: PointerEvent) => {
    const p = local(e);
    const now = performance.now() / 1000;
    const dtp = Math.max(1 / 240, now - pointer.t);
    if (pointer.inside) {
      pointer.vx = lerp(pointer.vx, (p.x - pointer.x) / dtp, 0.5);
      pointer.vy = lerp(pointer.vy, (p.y - pointer.y) / dtp, 0.5);
    }
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.t = now;
    pointer.inside = true;
    if (e.pointerType === "mouse") {
      const grabbing = tags.some((t) => t.grabbed);
      const over = grabbing || (!isInteractive(e.target) && tagAt(p.x, p.y));
      host.style.cursor = grabbing ? "grabbing" : over ? "grab" : "";
    }
  };

  const isInteractive = (target: EventTarget | null) =>
    target instanceof Element && !!target.closest("a, button, input, [role='button']");

  const onDown = (e: PointerEvent) => {
    if (reduced || isInteractive(e.target)) return;
    const p = local(e);
    const t = tagAt(p.x, p.y);
    if (!t) return;
    markInteract();
    if (e.pointerType === "mouse") {
      e.preventDefault();
      t.grabbed = true;
      t.grabOff = Math.atan2(p.x - t.px, p.y - t.py) - t.theta;
      t.grabLen = Math.hypot(p.x - t.px, p.y - t.py) - t.L;
      pointer.id = e.pointerId;
      host.style.cursor = "grabbing";
      try {
        host.setPointerCapture(e.pointerId);
      } catch {
        /* capture is best-effort */
      }
    } else {
      // tap: shove the sign away from the finger
      const pose = tagPose(t);
      t.omega += (p.x < pose.cx ? 1 : -1) * 2.4;
    }
  };

  const onUp = (e: PointerEvent) => {
    if (e.pointerId !== pointer.id) return;
    tags.forEach((t) => (t.grabbed = false));
    pointer.id = -1;
    host.style.cursor = "";
    try {
      host.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const onLeave = () => {
    pointer.inside = false;
    if (!tags.some((t) => t.grabbed)) host.style.cursor = "";
  };

  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerdown", onDown);
  host.addEventListener("pointerup", onUp);
  host.addEventListener("pointercancel", onUp);
  host.addEventListener("pointerleave", onLeave);

  const ro = new ResizeObserver(() => resize());
  ro.observe(host);
  const io = new IntersectionObserver(
    ([entry]) => {
      inView = !!entry?.isIntersecting;
      updateRunning();
    },
    { threshold: 0 },
  );
  io.observe(host);
  const onVis = () => updateRunning();
  document.addEventListener("visibilitychange", onVis);

  /* ----- boot: wait for the display font so the signs render in Fredoka ----- */

  const fontsReady = Promise.race([
    Promise.all([
      document.fonts?.load('700 80px "Fredoka"'),
      document.fonts?.load('700 12px "Space Mono"'),
    ]).catch(() => undefined),
    new Promise((r) => setTimeout(r, 1600)),
  ]);

  fontsReady.then(() => {
    if (destroyed) return;
    ready = true;
    resize(true);
    if (reduced) {
      fastForward();
      draw();
    }
    updateRunning();
  });

  return {
    setTheme(next) {
      theme = next;
      if (!ready) return;
      buildSprites();
      draw();
    },
    rebuild() {
      if (!ready || reduced) return;
      if (phase === "idle" || phase === "smash") {
        markInteract();
        lastInteract = -99;
        startRebuild();
      }
    },
    destroy() {
      destroyed = true;
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      host.removeEventListener("pointerleave", onLeave);
      host.style.cursor = "";
    },
  };
}
