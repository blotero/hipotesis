import {
  GROSS_BIRTH_RATE,
  NATURAL_DEATH_RATE,
  PROJECTION_END_YEAR,
  WASTE_KG_PER_HIPPO_PER_DAY,
  DUNG_DENSITY_KG_PER_M3,
  WASTE_SPREAD_DEPTH_M,
  OLYMPIC_POOL_M3,
  REFERENCE_AREA_M2,
  GRASS_KG_PER_HIPPO_PER_DAY,
  PASTURE_FRESH_KG_PER_M2,
  FOOTBALL_PITCH_M2,
  NITROGEN_KG_PER_HIPPO_PER_YEAR,
} from './constants'
import { getHistoricalSeries } from './history'
import type {
  CensusSource,
  ControlStrategy,
  SimulationPoint,
  SimulationResult,
  WasteImpact,
} from './types'

const NO_CONTROLS: ControlStrategy = {
  lethalControl: { enabled: false, individualsPerYear: 0 },
  sterilization: { enabled: false, malesPerYear: 0, femalesPerYear: 0 },
  displacement: { enabled: false, individualsPerYear: 0 },
}

/**
 * Advances population state by one year. Pure function — no side effects.
 *
 * Density-independent (no carrying-capacity term): the sources model exponential
 * growth for the coming decades. See constants.ts.
 *
 * births = GROSS_BIRTH_RATE * N * fertileFraction
 * fertileFraction = max(0, 1 - sterilizedFemales / (N/2))
 *
 * When removals reduce N, sterilized counts shrink proportionally,
 * assuming removals target the population at random (not preferentially non-sterilized).
 */
const stepYear = (current: SimulationPoint, strategy: ControlStrategy): SimulationPoint => {
  const { population: N, sterilizedFemales: sf, sterilizedMales: sm } = current

  if (N <= 0) {
    return { year: current.year + 1, population: 0, sterilizedFemales: 0, sterilizedMales: 0 }
  }

  const halfN = N / 2
  const fertileFraction = Math.max(0, 1 - sf / halfN)

  // GROSS_BIRTH_RATE is a per-capita rate applied to the whole population.
  // fertileFraction reduces births proportionally to sterilized females.
  const births = GROSS_BIRTH_RATE * N * fertileFraction
  const naturalDeaths = NATURAL_DEATH_RATE * N

  const lethalRemovals = strategy.lethalControl.enabled
    ? strategy.lethalControl.individualsPerYear
    : 0
  const displacementRemovals = strategy.displacement.enabled
    ? strategy.displacement.individualsPerYear
    : 0

  const newN = Math.max(0, N + births - naturalDeaths - lethalRemovals - displacementRemovals)
  const survivalRatio = newN / N

  const adjustedSf = sf * survivalRatio
  const adjustedSm = sm * survivalRatio

  const newSf = strategy.sterilization.enabled
    ? Math.min(adjustedSf + strategy.sterilization.femalesPerYear, newN / 2)
    : adjustedSf

  const newSm = strategy.sterilization.enabled
    ? Math.min(adjustedSm + strategy.sterilization.malesPerYear, newN / 2)
    : adjustedSm

  return {
    year: current.year + 1,
    population: newN,
    sterilizedFemales: Math.max(0, newSf),
    sterilizedMales: Math.max(0, newSm),
  }
}

const runPhase = (
  initialState: SimulationPoint,
  endYear: number,
  strategy: ControlStrategy,
): readonly SimulationPoint[] => {
  const points: SimulationPoint[] = [initialState]

  while (true) {
    const last = points[points.length - 1]
    if (last === undefined || last.year >= endYear - 1) break
    points.push(stepYear(last, strategy))
  }

  return points
}

/**
 * Runs the two-phase simulation.
 * Phase 1 (1981→2026): interpolated census data (not simulated), from the chosen
 *   source. No controls apply to the past.
 * Phase 2 (2026→2060): density-independent projection under the control strategy,
 *   started from the census series' 2026 value.
 *
 * Both phases share year 2026 as their boundary point (historical[-1] === projection[0]).
 */
export const runSimulation = (
  strategy: ControlStrategy,
  censusSource: CensusSource = 'government',
): SimulationResult => {
  const historical = getHistoricalSeries(censusSource)
  const handoffPoint = historical[historical.length - 1]

  if (handoffPoint === undefined) {
    throw new Error('Historical census series is empty')
  }

  const projection = runPhase(handoffPoint, PROJECTION_END_YEAR + 1, strategy)

  return { historical, projection }
}

export const getNoControlStrategy = (): ControlStrategy => ({ ...NO_CONTROLS })

export const computeProjectionHippoYears = (result: SimulationResult): number =>
  result.projection.reduce((sum, pt) => sum + pt.population, 0)

/**
 * Cumulative waste generated over the projection phase, derived from hippo-years.
 * One hippo-year = one hippo present for a full year:
 *   mass   = hippoYears * WASTE_KG_PER_HIPPO_PER_DAY * 365 / 1000  (tonnes)
 *   volume = mass * 1000 / DUNG_DENSITY_KG_PER_M3                  (m³)
 *   area   = volume / WASTE_SPREAD_DEPTH_M                         (m² at 1 cm)
 */
export const computeWasteImpact = (result: SimulationResult): WasteImpact => {
  const hippoYears = computeProjectionHippoYears(result)

  const massKg = hippoYears * WASTE_KG_PER_HIPPO_PER_DAY * 365
  const massTonnes = massKg / 1000
  const volumeM3 = massKg / DUNG_DENSITY_KG_PER_M3
  const olympicPools = volumeM3 / OLYMPIC_POOL_M3
  const areaM2 = volumeM3 / WASTE_SPREAD_DEPTH_M
  const coverageFraction = Math.min(1, areaM2 / REFERENCE_AREA_M2)

  const grassKg = hippoYears * GRASS_KG_PER_HIPPO_PER_DAY * 365
  const grassTonnes = grassKg / 1000
  const footballPitches = grassKg / (PASTURE_FRESH_KG_PER_M2 * FOOTBALL_PITCH_M2)

  const nitrogenTonnes = (hippoYears * NITROGEN_KG_PER_HIPPO_PER_YEAR) / 1000

  return {
    hippoYears,
    massTonnes,
    volumeM3,
    olympicPools,
    areaM2,
    coverageFraction,
    grassTonnes,
    footballPitches,
    nitrogenTonnes,
  }
}
