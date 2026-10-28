# start.ng — LEGO play edition

The start.ng v0 landing page with a playful LEGO layer layered on top of its
existing identity — same "Good vibes. Good games." hero, same warm cream
canvas, same start.ng green palette. No redesign, all motion.

- **Hero** — "Good games." sits on an extruded 3D LEGO brick plate; the two
  "oo" are animated LEGO-logo rings in warm cream + site green (click them —
  they squash). "Good vibes." stays plain like the original site.
- **Minifigures** — SVG minifigs flanking the title, waving, leaning, hopping.
- **Bricks** — the feature banner's brick stack rises on load and lifts on hover.
- Everything respects `prefers-reduced-motion`, day and night mode, desktop
  and mobile.

Built on Next.js 16 (App Router, Turbopack) + React 19 + Tailwind CSS v4.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## Build

```bash
pnpm build      # production build (Turbopack)
pnpm start      # serve the production build
```

## Deploy on Vercel

The project deploys as-is: import the repository into Vercel, and the Next.js
preset handles the rest. No environment variables required.
