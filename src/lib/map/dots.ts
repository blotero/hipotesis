import { GROUPS, BASE_TOTAL_POP } from '@/data/groups'
import type { InvasionPhase } from '@/data/groups'
import { MAP_MAX_POPULATION } from '@/lib/simulation/constants'

export interface DotPosition {
  readonly lon: number
  readonly lat: number
  readonly groupId: string
  readonly phase: InvasionPhase
}

// Mulberry32 — fast, seedable PRNG producing floats in [0, 1)
const mulberry32 = (seed: number): (() => number) => {
  let s = seed
  return () => {
    s += 0x6d2b79f5
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Pre-compute stable dot positions at module load time.
// Each group gets enough slots to cover its proportional share of MAP_MAX_POPULATION.
// Seed = groupIndex * 1000 + dotIndex → positions are stable across renders.
const buildPrecomputed = (): Record<string, readonly DotPosition[]> => {
  const result: Record<string, DotPosition[]> = {}
  GROUPS.forEach((group, groupIndex) => {
    const maxCount = Math.ceil((MAP_MAX_POPULATION * group.basePop) / BASE_TOTAL_POP)
    const rand = mulberry32(groupIndex * 1000)
    const positions: DotPosition[] = []
    for (let i = 0; i < maxCount; i++) {
      const dLon = (rand() * 2 - 1) * group.spreadDeg
      const dLat = (rand() * 2 - 1) * group.spreadDeg
      positions.push({
        lon: group.lon + dLon,
        lat: group.lat + dLat,
        groupId: group.id,
        phase: group.phase,
      })
    }
    result[group.id] = positions
  })
  return result
}

const precomputed = buildPrecomputed()

export const getDotsForPopulation = (totalPop: number): readonly DotPosition[] =>
  GROUPS.flatMap((g) => {
    const count = Math.round((totalPop * g.basePop) / BASE_TOTAL_POP)
    return (precomputed[g.id] ?? []).slice(0, count)
  })
