import { describe, expect, it } from 'bun:test'
import { computeWasteImpact, getNoControlStrategy, runSimulation } from './engine'
import {
  CURRENT_YEAR,
  INITIAL_POPULATION,
  INITIAL_YEAR,
  MILESTONE_POPULATION,
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
