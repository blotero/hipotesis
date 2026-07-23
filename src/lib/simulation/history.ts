import type { CensusSource, SimulationPoint } from './types'

interface Anchor {
  readonly year: number
  readonly population: number
}

// Documented / official counts (Cornare, Colombian environment authorities, press).
// The founding herd (4) is well established; intermediate points are the commonly
// reported estimates, and 2026 (~200) is the current working estimate the app uses.
const GOVERNMENT_ANCHORS: readonly Anchor[] = [
  { year: 1981, population: 4 }, // founding herd, Hacienda Nápoles
  { year: 2007, population: 16 },
  { year: 2012, population: 28 },
  { year: 2019, population: 80 },
  { year: 2023, population: 169 }, // Cornare, March 2023
  { year: 2026, population: 200 }, // current working estimate
]

// Castelblanco-Martínez et al. (2023, Scientific Reports) fitted Leslie-matrix line
// (9.6%/yr, fitted to five census counts 2006–2020). Runs lower than the official
// counts; ~91 in 2022, extrapolated to ~131 in 2026 at the fitted rate.
const CASTELBLANCO_ANCHORS: readonly Anchor[] = [
  { year: 1981, population: 4 },
  { year: 2006, population: 19 },
  { year: 2014, population: 43 },
  { year: 2020, population: 76 },
  { year: 2022, population: 91 }, // fitted 2022 estimate
  { year: 2026, population: 131 }, // 91 × 1.096^4
]

const ANCHORS: Record<CensusSource, readonly Anchor[]> = {
  government: GOVERNMENT_ANCHORS,
  castelblanco: CASTELBLANCO_ANCHORS,
}

const point = (year: number, population: number): SimulationPoint => ({
  year,
  population,
  sterilizedFemales: 0,
  sterilizedMales: 0,
})

/**
 * Expands census anchors into a yearly series, interpolating geometrically between
 * anchors (constant per-year growth ratio within each segment — the natural shape
 * for a growing population, and it lands exactly on every anchor).
 */
const interpolate = (anchors: readonly Anchor[]): readonly SimulationPoint[] => {
  const points: SimulationPoint[] = []

  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]
    const b = anchors[i + 1]
    if (a === undefined || b === undefined) continue

    const span = b.year - a.year
    const ratio = b.population / a.population

    for (let y = a.year; y < b.year; y++) {
      const f = (y - a.year) / span
      points.push(point(y, a.population * ratio ** f))
    }
  }

  const last = anchors[anchors.length - 1]
  if (last !== undefined) points.push(point(last.year, last.population))

  return points
}

const SERIES: Record<CensusSource, readonly SimulationPoint[]> = {
  government: interpolate(GOVERNMENT_ANCHORS),
  castelblanco: interpolate(CASTELBLANCO_ANCHORS),
}

/** The interpolated yearly historical series for the chosen census source. */
export const getHistoricalSeries = (source: CensusSource): readonly SimulationPoint[] =>
  SERIES[source]

/** The raw anchor points for a source — useful for annotating the real data points. */
export const getCensusAnchors = (source: CensusSource): readonly Anchor[] => ANCHORS[source]
