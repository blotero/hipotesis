import { describe, expect, it } from 'bun:test'
import { computeWasteImpact, getNoControlStrategy, runSimulation } from './engine'
import {
  CURRENT_YEAR,
  GROSS_BIRTH_RATE,
  INITIAL_POPULATION,
  INITIAL_YEAR,
  MILESTONE_POPULATION,
  NATURAL_DEATH_RATE,
  PROJECTION_END_YEAR,
  PROJECTION_NET_GROWTH_RATE,
} from './constants'
import type { ControlStrategy, SimulationPoint } from './types'

const findYear = (points: readonly SimulationPoint[], year: number): SimulationPoint => {
  const point = points.find((p) => p.year === year)
  if (point === undefined) throw new Error(`Year ${year} not found in simulation output`)
  return point
}

// ---------------------------------------------------------------------------
// Historical phase
// ---------------------------------------------------------------------------

describe('historical phase (no controls)', () => {
  const { historical } = runSimulation(getNoControlStrategy())

  it('starts at the introduction year with the founding population', () => {
    const first = historical[0]
    expect(first).toBeDefined()
    expect(first?.year).toBe(INITIAL_YEAR)
    expect(first?.population).toBe(INITIAL_POPULATION)
  })

  it('ends at year 2026', () => {
    const last = historical[historical.length - 1]
    expect(last?.year).toBe(CURRENT_YEAR)
  })

  it('has one point per year from introduction to 2026 inclusive', () => {
    expect(historical.length).toBe(CURRENT_YEAR - INITIAL_YEAR + 1)
  })

  // Historical phase is interpolated census data (history.ts), anchored to the
  // documented ~200 individuals in 2026 for the default (government) source.
  it('lands on the ~200 census anchor at 2026 (government default)', () => {
    const point = findYear(historical, CURRENT_YEAR)
    expect(point.population).toBeGreaterThanOrEqual(195)
    expect(point.population).toBeLessThanOrEqual(205)
  })

  it('follows the Castelblanco baseline (~131 in 2026) when selected', () => {
    const { historical: castelblanco } = runSimulation(getNoControlStrategy(), 'castelblanco')
    const point = findYear(castelblanco, CURRENT_YEAR)
    expect(point.population).toBeGreaterThanOrEqual(126)
    expect(point.population).toBeLessThanOrEqual(136)
  })

  it('grows monotonically from introduction to 2026', () => {
    for (let i = 1; i < historical.length; i++) {
      const prev = historical[i - 1]
      const curr = historical[i]
      if (prev !== undefined && curr !== undefined) {
        expect(curr.population).toBeGreaterThan(prev.population)
      }
    }
  })

  it('sterilized counts are zero throughout historical phase', () => {
    for (const point of historical) {
      expect(point.sterilizedFemales).toBe(0)
      expect(point.sterilizedMales).toBe(0)
    }
  })
})

// ---------------------------------------------------------------------------
// No-control projection (baseline)
// ---------------------------------------------------------------------------

describe('no-control projection (baseline)', () => {
  const { projection } = runSimulation(getNoControlStrategy())

  it('starts at year 2026 (handoff point)', () => {
    expect(projection[0]?.year).toBe(CURRENT_YEAR)
  })

  it('ends at year 2060', () => {
    expect(projection[projection.length - 1]?.year).toBe(PROJECTION_END_YEAR)
  })

  it('has 35 data points (2026–2060 inclusive)', () => {
    expect(projection.length).toBe(PROJECTION_END_YEAR - CURRENT_YEAR + 1)
  })

  it('crosses the 1,500 milestone before 2060 without controls', () => {
    const point = findYear(projection, 2060)
    expect(point.population).toBeGreaterThanOrEqual(MILESTONE_POPULATION)
  })

  // Density-independent: each no-control step multiplies by ~(1 + net rate), with no
  // carrying-capacity term slowing growth as the population rises.
  it('grows at the net rate each year (no density dependence)', () => {
    for (let i = 1; i < projection.length; i++) {
      const prev = projection[i - 1]
      const curr = projection[i]
      if (prev !== undefined && curr !== undefined) {
        const ratio = curr.population / prev.population
        expect(ratio).toBeCloseTo(1 + PROJECTION_NET_GROWTH_RATE, 5)
      }
    }
  })
})

// ---------------------------------------------------------------------------
// Lethal control
// ---------------------------------------------------------------------------

describe('lethal control', () => {
  const aggressiveStrategy: ControlStrategy = {
    lethalControl: { enabled: true, individualsPerYear: 50 },
    sterilization: { enabled: false, malesPerYear: 0, femalesPerYear: 0 },
    displacement: { enabled: false, individualsPerYear: 0 },
  }

  const { projection: baseline } = runSimulation(getNoControlStrategy())
  const { projection: withLethal } = runSimulation(aggressiveStrategy)

  it('produces lower population than baseline at every year after 2026', () => {
    for (let i = 1; i < withLethal.length; i++) {
      const b = baseline[i]
      const l = withLethal[i]
      if (b !== undefined && l !== undefined) {
        expect(l.population).toBeLessThan(b.population)
      }
    }
  })

  it('population never goes below zero', () => {
    for (const point of withLethal) {
      expect(point.population).toBeGreaterThanOrEqual(0)
    }
  })
})

// ---------------------------------------------------------------------------
// Sterilization
// ---------------------------------------------------------------------------

describe('sterilization', () => {
  const sterilizationStrategy: ControlStrategy = {
    lethalControl: { enabled: false, individualsPerYear: 0 },
    sterilization: { enabled: true, malesPerYear: 12, femalesPerYear: 8 },
    displacement: { enabled: false, individualsPerYear: 0 },
  }

  const { projection: baseline } = runSimulation(getNoControlStrategy())
  const { projection: withSterilization } = runSimulation(sterilizationStrategy)

  it('produces lower population than baseline at year 2060', () => {
    const baselineFinal = baseline[baseline.length - 1]
    const sterileFinal = withSterilization[withSterilization.length - 1]
    if (baselineFinal !== undefined && sterileFinal !== undefined) {
      expect(sterileFinal.population).toBeLessThan(baselineFinal.population)
    }
  })

  it('sterilized female count grows over time', () => {
    const point2030 = findYear(withSterilization, 2030)
    expect(point2030.sterilizedFemales).toBeGreaterThan(0)
  })

  it('sterilized females never exceed half the population', () => {
    for (const point of withSterilization) {
      expect(point.sterilizedFemales).toBeLessThanOrEqual(point.population / 2 + 0.001)
    }
  })

  it('sterilized males are tracked and grow', () => {
    const point2030 = findYear(withSterilization, 2030)
    expect(point2030.sterilizedMales).toBeGreaterThan(0)
  })

  it('sterilized males never exceed half the population', () => {
    for (const point of withSterilization) {
      expect(point.sterilizedMales).toBeLessThanOrEqual(point.population / 2 + 0.001)
    }
  })
})

// ---------------------------------------------------------------------------
// Displacement
// ---------------------------------------------------------------------------

describe('displacement', () => {
  const displacementStrategy: ControlStrategy = {
    lethalControl: { enabled: false, individualsPerYear: 0 },
    sterilization: { enabled: false, malesPerYear: 0, femalesPerYear: 0 },
    displacement: { enabled: true, individualsPerYear: 8 },
  }

  const { projection: baseline } = runSimulation(getNoControlStrategy())
  const { projection: withDisplacement } = runSimulation(displacementStrategy)

  it('produces lower population than baseline at year 2060', () => {
    const baselineFinal = baseline[baseline.length - 1]
    const displacedFinal = withDisplacement[withDisplacement.length - 1]
    if (baselineFinal !== undefined && displacedFinal !== undefined) {
      expect(displacedFinal.population).toBeLessThan(baselineFinal.population)
    }
  })

  it('population never goes below zero', () => {
    for (const point of withDisplacement) {
      expect(point.population).toBeGreaterThanOrEqual(0)
    }
  })
})

// ---------------------------------------------------------------------------
// Combined strategy
// ---------------------------------------------------------------------------

describe('combined strategy (lethal + sterilization + displacement)', () => {
  const combined: ControlStrategy = {
    lethalControl: { enabled: true, individualsPerYear: 50 },
    sterilization: { enabled: true, malesPerYear: 12, femalesPerYear: 8 },
    displacement: { enabled: true, individualsPerYear: 8 },
  }

  const lethalOnly: ControlStrategy = {
    lethalControl: { enabled: true, individualsPerYear: 50 },
    sterilization: { enabled: false, malesPerYear: 0, femalesPerYear: 0 },
    displacement: { enabled: false, individualsPerYear: 0 },
  }

  const { projection: withCombined } = runSimulation(combined)
  const { projection: withLethalOnly } = runSimulation(lethalOnly)

  it('combined strategy yields lower or equal population vs lethal-only at 2060', () => {
    const combinedFinal = withCombined[withCombined.length - 1]
    const lethalFinal = withLethalOnly[withLethalOnly.length - 1]
    if (combinedFinal !== undefined && lethalFinal !== undefined) {
      expect(combinedFinal.population).toBeLessThanOrEqual(lethalFinal.population)
    }
  })

  it('population never goes negative', () => {
    for (const point of withCombined) {
      expect(point.population).toBeGreaterThanOrEqual(0)
    }
  })
})

// ---------------------------------------------------------------------------
// Structural invariants
// ---------------------------------------------------------------------------

describe('structural invariants', () => {
  it('historical and projection share year 2026 as boundary', () => {
    const { historical, projection } = runSimulation(getNoControlStrategy())
    expect(historical[historical.length - 1]?.year).toBe(projection[0]?.year)
    expect(historical[historical.length - 1]?.year).toBe(CURRENT_YEAR)
  })

  it('does not throw with no controls', () => {
    expect(() => runSimulation(getNoControlStrategy())).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// Analytical properties documented on /about
//
// The About page states these as consequences of the model's equations. They are
// pinned here so the page cannot silently drift from the engine: if a constant or
// the recurrence changes, these fail and the copy has to be revised with them.
// ---------------------------------------------------------------------------

describe('analytical properties documented on /about', () => {
  const sterilizeFemales = (femalesPerYear: number): ControlStrategy => ({
    lethalControl: { enabled: false, individualsPerYear: 0 },
    sterilization: { enabled: true, malesPerYear: 0, femalesPerYear },
    displacement: { enabled: false, individualsPerYear: 0 },
  })

  const remove = (individualsPerYear: number): ControlStrategy => ({
    lethalControl: { enabled: true, individualsPerYear },
    sterilization: { enabled: false, malesPerYear: 0, femalesPerYear: 0 },
    displacement: { enabled: false, individualsPerYear: 0 },
  })

  // "the population doubles every ~7.6 years"
  it('doubles in ~7.6 years without controls', () => {
    const analytic = Math.log(2) / Math.log(1 + PROJECTION_NET_GROWTH_RATE)
    expect(analytic).toBeGreaterThan(7.5)
    expect(analytic).toBeLessThan(7.7)

    const { projection } = runSimulation(getNoControlStrategy())
    const start = projection[0]
    expect(start).toBeDefined()
    const doubled = projection.find((p) => p.population >= 2 * (start?.population ?? 0))
    // Whole-year grid, so the first year at or past 2x is ceil(7.56) = 8 steps.
    expect(doubled?.year).toBe(CURRENT_YEAR + Math.ceil(analytic))
  })

  // "200 hippos in 2026 become roughly 4,500 by 2060"
  it('reaches ~4,500 by 2060 without controls', () => {
    const { projection } = runSimulation(getNoControlStrategy())
    const final = findYear(projection, PROJECTION_END_YEAR)
    expect(final.population).toBeGreaterThan(4400)
    expect(final.population).toBeLessThan(4600)
  })

  // "break-even sits near 19 animals a year": N* = R / (b - d) = 19.2 at N = 200.
  it('places the removal fixed point just above 19 per year at the 2026 population', () => {
    const { historical } = runSimulation(getNoControlStrategy())
    const start = historical[historical.length - 1]
    expect(start).toBeDefined()
    const breakEven = (start?.population ?? 0) * PROJECTION_NET_GROWTH_RATE
    expect(breakEven).toBeGreaterThan(19)
    expect(breakEven).toBeLessThan(20)
  })

  // "19 leaves the population still creeping upward, to about 245 by 2060"
  it('still grows at 19 removals per year', () => {
    const final = findYear(runSimulation(remove(19)).projection, PROJECTION_END_YEAR)
    expect(final.population).toBeGreaterThan(200)
    expect(final.population).toBeGreaterThan(235)
    expect(final.population).toBeLessThan(255)
  })

  // "20 turns it over and drives it down to about 20 by 2060"
  it('collapses at 20 removals per year', () => {
    const final = findYear(runSimulation(remove(20)).projection, PROJECTION_END_YEAR)
    expect(final.population).toBeLessThan(30)
    expect(final.population).toBeGreaterThan(0)
  })

  // "21 eradicates it by 2053"
  it('eradicates by 2053 at 21 removals per year', () => {
    const { projection } = runSimulation(remove(21))
    const extinct = projection.find((p) => p.population <= 0)
    expect(extinct?.year).toBe(2053)
  })

  // "the fertile fraction [must] drop under d / b ≈ 0.172 — more than 82.8% of females"
  it('needs 82.8% of females sterilized before births fall below natural deaths', () => {
    const threshold = NATURAL_DEATH_RATE / GROSS_BIRTH_RATE
    expect(threshold).toBeCloseTo(0.1724, 4)
    expect(1 - threshold).toBeCloseTo(0.8276, 4)
  })

  // "at 4 females a year the threshold is never reached by 2060 and the curve
  //  merely flattens; at 8 a year it is crossed in 2044 and the population turns over"
  it('crosses the sterilization threshold at 8 females/yr but never at 4', () => {
    const sterilizedShare = (p: SimulationPoint): number => p.sterilizedFemales / (p.population / 2)
    const threshold = 1 - NATURAL_DEATH_RATE / GROSS_BIRTH_RATE

    const low = runSimulation(sterilizeFemales(4)).projection
    expect(low.some((p) => sterilizedShare(p) > threshold)).toBe(false)
    expect(findYear(low, PROJECTION_END_YEAR).population).toBeGreaterThan(200)

    const high = runSimulation(sterilizeFemales(8)).projection
    expect(high.find((p) => sterilizedShare(p) > threshold)?.year).toBe(2044)
    // Peaks at the crossing year, then declines.
    const peak = high.reduce((best, p) => (p.population > best.population ? p : best), high[0]!)
    expect(peak.year).toBe(2044)
    expect(findYear(high, PROJECTION_END_YEAR).population).toBeLessThan(peak.population)
  })

  // "male sterilization does not move this number at all"
  it('is unaffected by male sterilization', () => {
    const malesOnly: ControlStrategy = {
      lethalControl: { enabled: false, individualsPerYear: 0 },
      sterilization: { enabled: true, malesPerYear: 12, femalesPerYear: 0 },
      displacement: { enabled: false, individualsPerYear: 0 },
    }
    const withMales = findYear(runSimulation(malesOnly).projection, PROJECTION_END_YEAR)
    const baseline = findYear(runSimulation(getNoControlStrategy()).projection, PROJECTION_END_YEAR)
    expect(withMales.population).toBeCloseTo(baseline.population, 6)
  })
})

// ---------------------------------------------------------------------------
// Waste impact
// ---------------------------------------------------------------------------

describe('computeWasteImpact', () => {
  const emptyResult = { historical: [], projection: [] } as const

  it('returns all zeros for zero population', () => {
    const waste = computeWasteImpact(emptyResult)
    expect(waste.hippoYears).toBe(0)
    expect(waste.massTonnes).toBe(0)
    expect(waste.volumeM3).toBe(0)
    expect(waste.olympicPools).toBe(0)
    expect(waste.areaM2).toBe(0)
    expect(waste.coverageFraction).toBe(0)
    expect(waste.grassTonnes).toBe(0)
    expect(waste.footballPitches).toBe(0)
    expect(waste.nitrogenTonnes).toBe(0)
  })

  it('derives mass, volume, pools and area from hippo-years', () => {
    // 1000 hippo-years → 1000 × 10 kg/day × 365 = 3,650,000 kg = 3650 t.
    const point = {
      year: 2027,
      population: 1000,
      sterilizedFemales: 0,
      sterilizedMales: 0,
    } as const
    const waste = computeWasteImpact({ historical: [], projection: [point] })
    expect(waste.hippoYears).toBe(1000)
    expect(waste.massTonnes).toBeCloseTo(3650, 6)
    expect(waste.volumeM3).toBeCloseTo(3650, 6) // ~water density → 1 t ≈ 1 m³
    expect(waste.olympicPools).toBeCloseTo(3650 / 2500, 6)
    expect(waste.areaM2).toBeCloseTo(365000, 3) // 3650 m³ / 0.01 m
  })

  it('derives grass, football pitches and nitrogen from hippo-years', () => {
    // 1000 hippo-years → grass: 1000 × 45 kg/day × 365 = 16,425,000 kg = 16,425 t.
    const point = {
      year: 2027,
      population: 1000,
      sterilizedFemales: 0,
      sterilizedMales: 0,
    } as const
    const waste = computeWasteImpact({ historical: [], projection: [point] })
    expect(waste.grassTonnes).toBeCloseTo(16425, 6)
    expect(waste.footballPitches).toBeCloseTo(16_425_000 / (2 * 7140), 3)
    expect(waste.nitrogenTonnes).toBeCloseTo(45, 6) // 1000 × 45 kg / 1000
  })

  it('clamps coverageFraction to at most 1', () => {
    const point = {
      year: 2027,
      population: 1e9,
      sterilizedFemales: 0,
      sterilizedMales: 0,
    } as const
    const waste = computeWasteImpact({ historical: [], projection: [point] })
    expect(waste.coverageFraction).toBe(1)
  })
})
