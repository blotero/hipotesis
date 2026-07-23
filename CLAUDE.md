# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev            # dev server (Turbopack)
bun test           # run all tests (Bun test runner)
bun test src/lib/simulation/engine.test.ts  # run a single test file
bun run lint       # ESLint (flat config)
bun run format     # Prettier --write
bun run format:check
bun run build      # production build + type-check
```

`bun` must be on PATH. If not found: `export PATH="$HOME/.bun/bin:$PATH"`.

## Architecture

**App:** Next.js 16 App Router. All pages are React Server Components by default; client-side state requires `'use client'`. Two routes: `/` (simulator) and `/about`.

**Simulation engine** (`src/lib/simulation/`): pure TypeScript, no React dependencies. Entry point is `runSimulation(strategy: ControlStrategy): SimulationResult`. The engine runs in two phases — a fixed historical phase (1985–2026, no controls) followed by a user-configured projection phase (2026–2060). `SimulationResult.historical` and `SimulationResult.projection` share year 2026 as their boundary; drop `projection[0]` when concatenating for a chart. The model is a discrete-time logistic with sex-structured births; see `engine.ts` for the formula and `constants.ts` for calibration notes.

**i18n** (`src/lib/i18n/`): locale strings live in `en.json` / `es.json` as flat dot-notation keys typed by the `TranslationKey` union in `types.ts`. Use `createTranslator(locale)` to get a typed `t(key)` function. A React context wrapping this has not been built yet — that is Session 2 work.

**Styling:** No Tailwind, no UI component library. CSS Modules (`*.module.css`) co-located with components. Build components from scratch.

**Math on /about:** the model equations are written as native MathML JSX (`src/components/about/formulas.tsx`), rendered by `Formula` / `InlineMath`. No KaTeX or MathJax — react-dom handles the MathML namespace, and `src/types/mathml.d.ts` supplies the JSX typings @types/react omits (add elements there as needed). Keep words out of the math so both locales share one formula; only the caption is translated. The formulas mirror `engine.ts` and `history.ts` — change them together. The numeric claims made in the /about prose are pinned by the `analytical properties documented on /about` tests in `engine.test.ts`.

**Tests:** co-located with source (`engine.test.ts` next to `engine.ts`). Bun's built-in runner; import from `bun:test`.

## Code conventions

- Functional style: pure functions, `const`, no mutation, no classes.
- `interface` over `type` for object shapes (ESLint enforces this).
- Explicit return types on exported functions; inferred types on expressions and arrow functions inside modules.
- `ReactElement` (not `JSX.Element` — deprecated in React 19) as the return type for page/component functions.
- All `readonly` on data types.
- `noUncheckedIndexedAccess` is on — array accesses return `T | undefined` and need guards.
