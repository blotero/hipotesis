export type InvasionPhase = 'expandida' | 'expansion' | 'establecimiento'

export interface GroupData {
  readonly id: string
  readonly name: string
  readonly lat: number
  readonly lon: number
  readonly spreadDeg: number // jitter radius ≈ sqrt(KUD_95%_km² / π) / 111
  readonly basePop: number // 2022 census estimate (Moreno-Arias et al., 2024)
  readonly phase: InvasionPhase
}

// Seven spatially discrete population groups identified in Moreno-Arias et al. (2024).
// Centroids estimated from Figures 2 & 6 of that paper.
export const GROUPS: readonly GroupData[] = [
  {
    id: 'napoles',
    name: 'Nápoles',
    lat: 5.93,
    lon: -74.73,
    spreadDeg: 0.014,
    basePop: 117,
    phase: 'expandida',
  },
  {
    id: 'tolones',
    name: 'Tolones',
    lat: 6.1,
    lon: -74.78,
    spreadDeg: 0.047,
    basePop: 7,
    phase: 'expansion',
  },
  {
    id: 'cocorna',
    name: 'Cocorná',
    lat: 6.05,
    lon: -74.68,
    spreadDeg: 0.032,
    basePop: 31,
    phase: 'expansion',
  },
  {
    id: 'nare',
    name: 'Nare',
    lat: 6.28,
    lon: -74.56,
    spreadDeg: 0.079,
    basePop: 5,
    phase: 'expansion',
  },
  {
    id: 'berrio',
    name: 'Berrío',
    lat: 6.49,
    lon: -74.38,
    spreadDeg: 0.149,
    basePop: 9,
    phase: 'expansion',
  },
  {
    id: 'yondo',
    name: 'Yondó',
    lat: 6.95,
    lon: -73.98,
    spreadDeg: 0.218,
    basePop: 4,
    phase: 'establecimiento',
  },
  {
    id: 'momposina',
    name: 'Momposina',
    lat: 9.25,
    lon: -74.75,
    spreadDeg: 0.052,
    basePop: 5,
    phase: 'establecimiento',
  },
]

export const BASE_TOTAL_POP = GROUPS.reduce((sum, g) => sum + g.basePop, 0) // 178
