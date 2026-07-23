// Curated cartographic labels for the hippo-distribution map.
// Coordinates are approximate ([lon, lat]) and chosen to match the framing in
// PROJECTION_CONFIG (Magdalena Medio corridor, ~5.4°–9.8°N).

export interface PlaceLabel {
  readonly name: string
  readonly lon: number
  readonly lat: number
  // dx/dy nudge the text away from the marker dot (SVG units)
  readonly dx?: number
  readonly dy?: number
  // anchor controls which side of the dot the text sits on
  readonly anchor?: 'start' | 'middle' | 'end'
  // origin renders a star instead of a plain dot (Hacienda Nápoles = the source)
  readonly origin?: boolean
}

// Key places in the invasion story. Hacienda Nápoles is the introduction point;
// the rest trace the Magdalena Medio corridor the population has colonised, plus
// the downstream Depresión Momposina frontier.
export const PLACE_LABELS: readonly PlaceLabel[] = [
  { name: 'Hacienda Nápoles', lon: -74.73, lat: 5.93, dx: 6, dy: 3, anchor: 'start', origin: true },
  { name: 'Puerto Triunfo', lon: -74.64, lat: 5.87, dx: 5, dy: 10, anchor: 'start' },
  { name: 'Doradal', lon: -74.7, lat: 5.98, dx: -5, dy: -3, anchor: 'end' },
  { name: 'La Dorada', lon: -74.66, lat: 5.45, dx: 5, dy: 3, anchor: 'start' },
  { name: 'Puerto Boyacá', lon: -74.59, lat: 5.98, dx: 6, dy: 3, anchor: 'start' },
  { name: 'Puerto Nare', lon: -74.62, lat: 6.19, dx: -5, dy: 3, anchor: 'end' },
  { name: 'Puerto Berrío', lon: -74.4, lat: 6.49, dx: 6, dy: 3, anchor: 'start' },
  { name: 'Yondó', lon: -73.91, lat: 6.98, dx: -5, dy: 3, anchor: 'end' },
  { name: 'Barrancabermeja', lon: -73.85, lat: 7.06, dx: 6, dy: 3, anchor: 'start' },
  { name: 'Magangué', lon: -74.76, lat: 9.24, dx: 6, dy: 3, anchor: 'start' },
]

// Department names to render across the framed region. Positions are hand-placed
// (not true centroids) so labels stay inside the visible frame and off the dots.
export interface DeptLabel {
  readonly name: string
  readonly lon: number
  readonly lat: number
}

export const DEPT_LABELS: readonly DeptLabel[] = [
  { name: 'ANTIOQUIA', lon: -75.5, lat: 6.6 },
  { name: 'SANTANDER', lon: -73.3, lat: 6.9 },
  { name: 'BOYACÁ', lon: -73.2, lat: 5.9 },
  { name: 'CUNDINAMARCA', lon: -74.1, lat: 4.9 },
  { name: 'CALDAS', lon: -75.4, lat: 5.35 },
  { name: 'TOLIMA', lon: -75.2, lat: 4.6 },
  { name: 'BOLÍVAR', lon: -74.4, lat: 8.6 },
  { name: 'CESAR', lon: -73.5, lat: 8.6 },
  { name: 'SUCRE', lon: -75.0, lat: 9.3 },
  { name: 'CÓRDOBA', lon: -75.7, lat: 8.3 },
]

// River name labels, placed along each course within the frame.
export interface RiverLabel {
  readonly name: string
  readonly lon: number
  readonly lat: number
  readonly rotate?: number
}

export const RIVER_LABELS: readonly RiverLabel[] = [
  { name: 'Río Magdalena', lon: -74.32, lat: 7.9, rotate: -72 },
  { name: 'Río Cauca', lon: -75.05, lat: 7.6, rotate: -68 },
]
