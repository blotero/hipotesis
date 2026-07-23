# Hipótesis — Colombia's hippo simulator

An interactive simulator of the invasive hippopotamus population in Colombia's
Magdalena river basin. Four hippos escaped from Pablo Escobar's Hacienda Nápoles
estate in the early 1980s; with no predators and year-round water they have been
growing at roughly 9.6% a year ever since. This app lets you project that growth
to 2060 and see how management strategies — sterilization, relocation, lethal
control — bend the curve.

## What's in it

- **Population projection.** A discrete-time model, calibrated against published
  science, plotted from the founding herd through 2060.
- **Control strategies.** Toggle and tune sterilization, displacement, and lethal
  control, and watch the projection respond live.
- **Map of the basin.** The hippo population rendered as dots over the Magdalena
  river system, so density is something you see rather than read.
- **Waste impact.** Cumulative dung output translated into tangible units —
  Olympic pools, share of the Hacienda Nápoles footprint.
- **Bilingual.** Full English and Spanish copy, plus light/dark themes.

## The model

The historical phase (introduction → 2026) is **not** simulated: it is a
piecewise interpolation of documented census estimates. Two series are
selectable, since they disagree materially — official/press counts (~200 hippos
in 2026) and the peer-reviewed estimate (~131).

The projection phase (2026 → 2060) is **density-independent**: there is no
logistic carrying capacity. That follows Castelblanco-Martínez et al. (2023,
_Scientific Reports_), who fitted a Leslie matrix to five census counts, report
~9.6%/yr growth, and find "no indication that hippos will approach a carrying
capacity in the coming decades" — the basin could physically hold 20,000+. Growth
is exponential and management is the only thing that bends it, which is the whole
point of the simulator.

Every constant is sourced and annotated in `src/lib/simulation/constants.ts`.

## Getting started

Requires [Bun](https://bun.sh) on your PATH.

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
bun test           # simulation engine tests
bun run lint       # ESLint
bun run format     # Prettier
bun run build      # production build + type-check
```

## Project layout

```
src/lib/simulation/   pure-TS model: engine, constants, census history, tests
src/lib/map/          dot placement, labels, waste-cell geometry
src/lib/i18n/         en/es strings and typed translator
src/components/       simulator, map, nav, footer, about (CSS Modules)
src/app/              Next.js App Router: / (simulator) and /about
public/*.json         GeoJSON for Colombia, departments, rivers, lakes
```

Built with Next.js 16 (App Router), React 19, Recharts, and react-simple-maps.
No Tailwind, no component library — plain CSS Modules.

See [CLAUDE.md](./CLAUDE.md) for architecture notes and code conventions.
