import napoles from '../../../public/napoles.json'
import { REFERENCE_AREA_M2 } from '@/lib/simulation/constants'

/**
 * A single grid cell inside the Hacienda Nápoles silhouette. Coordinates are normalized
 * to a [0, 1] × [0, 1] viewBox with y pointing DOWN (SVG convention), so cells can be
 * placed directly into an SVG without further transformation.
 */
export interface WasteCell {
  /** Cell-center x in [0, 1] (west→east). */
  readonly x: number
  /** Cell-center y in [0, 1] (north→south, SVG-down). */
  readonly y: number
}

// Outer ring of the schematic estate polygon as [lon, lat] pairs. The shape only sets
// the fill silhouette's aspect and cell layout; the reference area is REFERENCE_AREA_M2.
const RING = (napoles.geometry.coordinates[0] ?? []) as unknown as readonly (readonly [
  number,
  number,
])[]

// Target number of interior cells — tuned for a legible emoji grid (few hundred).
const TARGET_INTERIOR_CELLS = 420

// Ray-casting point-in-polygon test (lon = x, lat = y).
const pointInRing = (lon: number, lat: number): boolean => {
  let inside = false
  for (let i = 0, j = RING.length - 1; i < RING.length; j = i++) {
    const a = RING[i]
    const b = RING[j]
    if (a === undefined || b === undefined) continue
    const [xi, yi] = a
    const [xj, yj] = b
    const intersects = yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

const buildCells = (): { cells: readonly WasteCell[]; aspect: number } => {
  const lons = RING.map((p) => p[0])
  const lats = RING.map((p) => p[1])
  const minLon = Math.min(...lons)
  const maxLon = Math.max(...lons)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const bboxW = maxLon - minLon
  const bboxH = maxLat - minLat
  const aspect = bboxW / bboxH

  // Choose a square cell size (in degrees) so the interior yields ~TARGET cells.
  // The polygon covers a fraction of its bbox, so oversample then measure.
  const bboxArea = bboxW * bboxH
  const step = Math.sqrt(bboxArea / (TARGET_INTERIOR_CELLS / 0.55))

  const cols = Math.max(1, Math.round(bboxW / step))
  const rows = Math.max(1, Math.round(bboxH / step))

  const cells: WasteCell[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lon = minLon + ((c + 0.5) / cols) * bboxW
      const lat = minLat + ((r + 0.5) / rows) * bboxH
      if (!pointInRing(lon, lat)) continue
      cells.push({
        x: (lon - minLon) / bboxW,
        // Flip lat → SVG-down y.
        y: (maxLat - lat) / bboxH,
      })
    }
  }

  // Sort bottom-up (largest y first) so incremental fill reads as rising water.
  cells.sort((p, q) => q.y - p.y)

  return { cells, aspect }
}

const built = buildCells()

/** Interior cells of the Hacienda Nápoles silhouette, ordered bottom-up for fill. */
export const WASTE_CELLS: readonly WasteCell[] = built.cells

/** Width / height of the silhouette bounding box, for the SVG viewBox aspect. */
export const SILHOUETTE_ASPECT = built.aspect

/** Real ground area represented by a single filled cell, in m². */
export const CELL_AREA_M2 = REFERENCE_AREA_M2 / built.cells.length

/**
 * Number of cells to fill for a given coverage fraction [0, 1] of the reference.
 * Rounds so that a non-zero fraction always lights at least one cell.
 */
export const filledCellCount = (fraction: number): number => {
  const clamped = Math.min(1, Math.max(0, fraction))
  if (clamped <= 0) return 0
  return Math.max(1, Math.round(clamped * WASTE_CELLS.length))
}

/** Outer ring as an SVG path string in the same normalized [0, 1] viewBox. */
export const SILHOUETTE_PATH = ((): string => {
  const lons = RING.map((p) => p[0])
  const lats = RING.map((p) => p[1])
  const minLon = Math.min(...lons)
  const maxLon = Math.max(...lons)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const bboxW = maxLon - minLon
  const bboxH = maxLat - minLat
  return (
    RING.map((p, i) => {
      const x = (p[0] - minLon) / bboxW
      const y = (maxLat - p[1]) / bboxH
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(4)},${y.toFixed(4)}`
    }).join(' ') + ' Z'
  )
})()
