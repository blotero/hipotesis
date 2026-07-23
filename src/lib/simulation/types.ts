export interface SimulationPoint {
  readonly year: number
  readonly population: number
  readonly sterilizedFemales: number
  readonly sterilizedMales: number
}

export interface LethalControl {
  readonly enabled: boolean
  /** Number of individuals removed by lethal control per year. Valid range: 20–50. */
  readonly individualsPerYear: number
}

export interface Sterilization {
  readonly enabled: boolean
  /**
   * Males sterilized per year. Valid range: 6–12.
   * Tracked for display only — does not affect birth rate while fertile males remain.
   */
  readonly malesPerYear: number
  /** Females sterilized per year. Valid range: 4–8. Drives birth-rate reduction. */
  readonly femalesPerYear: number
}

export interface Displacement {
  readonly enabled: boolean
  /** Number of individuals relocated per year. Valid range: 3–8. */
  readonly individualsPerYear: number
}

export interface ControlStrategy {
  readonly lethalControl: LethalControl
  readonly sterilization: Sterilization
  readonly displacement: Displacement
}

/**
 * Which documented census series anchors the historical phase. The two disagree
 * materially (e.g. ~200 vs ~131 hippos in 2026); see history.ts.
 * - 'government': official/press counts (Cornare et al.), ~200 in 2026.
 * - 'castelblanco': the fitted Leslie-matrix line of Castelblanco-Martínez et al.
 *   (2023), ~91 in 2022 / ~131 in 2026.
 */
export type CensusSource = 'government' | 'castelblanco'

export interface SimulationResult {
  /**
   * Introduction (1981) → 2026 inclusive. Interpolated census data, not simulated;
   * no controls apply to the past.
   */
  readonly historical: readonly SimulationPoint[]
  /**
   * 2026–2060 inclusive. First element is year 2026 (shared with historical).
   * When concatenating for a chart, drop projection[0] to avoid duplicate year.
   */
  readonly projection: readonly SimulationPoint[]
}

/**
 * Cumulative waste generated over the projection phase (2026–2060), derived from
 * the area under the population curve (hippo-years) times per-hippo egestion rates.
 * See constants.ts for the calibration and unit assumptions.
 */
export interface WasteImpact {
  /** Area under the projection curve — hippo-years. */
  readonly hippoYears: number
  /** Cumulative wet-feces mass, in tonnes. */
  readonly massTonnes: number
  /** Cumulative volume, in cubic metres (≈ litres / 1000). */
  readonly volumeM3: number
  /** Equivalent number of Olympic swimming pools by volume. */
  readonly olympicPools: number
  /** Ground area the volume would cover, spread to WASTE_SPREAD_DEPTH_M, in m². */
  readonly areaM2: number
  /** areaM2 as a fraction of the reference area (El Poblado), clamped to [0, 1]. */
  readonly coverageFraction: number
  /** Cumulative terrestrial grass grazed, in tonnes (wet mass). */
  readonly grassTonnes: number
  /** Grazed grass expressed as an equivalent number of football pitches of pasture. */
  readonly footballPitches: number
  /** Cumulative nitrogen loaded into water, in tonnes. */
  readonly nitrogenTonnes: number
}
