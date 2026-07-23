'use client'

import type { ReactElement } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { useLocale } from '@/lib/i18n/context'
import { INITIAL_YEAR, PROJECTION_END_YEAR } from '@/lib/simulation/constants'
import type { SimulationResult } from '@/lib/simulation/types'
import { getDotsForPopulation } from '@/lib/map/dots'
import { PLACE_LABELS, DEPT_LABELS, RIVER_LABELS } from '@/lib/map/labels'
import type { InvasionPhase } from '@/data/groups'
import styles from './MapPanel.module.css'

interface GeoFeature {
  rsmKey: string
  // The only GeoJSON property this map reads; declared explicitly so it does not
  // fall through to the `any` index signature below.
  properties?: { name?: string }
  // react-simple-maps hands back raw features whose remaining shape varies per
  // topology and is passed straight back to <Geography>.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

const PHASE_COLORS: Record<InvasionPhase, string> = {
  expandida: '#c0392b',
  expansion: '#c07a2f',
  establecimiento: '#4a7c9e',
}

const PHASE_KEYS: InvasionPhase[] = ['expandida', 'expansion', 'establecimiento']

// Departments with documented hippo presence (Moreno-Arias et al., 2024) — tinted
// faintly to read as a distribution/occupancy map. Names match departments.json.
const AFFECTED_DEPTS = new Set([
  'ANTIOQUIA',
  'CALDAS',
  'CUNDINAMARCA',
  'BOYACA',
  'SANTANDER',
  'BOLIVAR',
])

const getPopAtYear = (result: SimulationResult, year: number): number => {
  const point =
    result.historical.find((p) => p.year === year) ?? result.projection.find((p) => p.year === year)
  return Math.round(point?.population ?? 0)
}

// Zoomed to the Nápoles–Momposina corridor (lat 5.4°–9.8°N, lon ~-76°–-72.5°W)
const MAP_WIDTH = 420
const MAP_HEIGHT = 560
const PROJECTION_CONFIG = { center: [-74.3, 7.6] as [number, number], scale: 7000 }

interface MapPanelProps {
  result: SimulationResult
  selectedYear: number
  onYearChange: (year: number) => void
}

export function MapPanel({ result, selectedYear, onYearChange }: MapPanelProps): ReactElement {
  const { t } = useLocale()
  const totalPop = getPopAtYear(result, selectedYear)
  const dots = getDotsForPopulation(totalPop)

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('map.title')}</h2>
        <span className={styles.year}>
          {t('map.yearPrefix')} {selectedYear} — {totalPop.toLocaleString()} ind.
        </span>
      </div>

      <div className={styles.sliderRow}>
        <span className={styles.sliderEndLabel}>{INITIAL_YEAR}</span>
        <input
          type="range"
          className={styles.slider}
          min={INITIAL_YEAR}
          max={PROJECTION_END_YEAR}
          step={1}
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
          aria-label={`${t('map.yearPrefix')} ${selectedYear}`}
        />
        <span className={styles.sliderEndLabel}>{PROJECTION_END_YEAR}</span>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={PROJECTION_CONFIG}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        className={styles.map}
      >
        {/* Ocean background */}
        <rect
          x={0}
          y={0}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          style={{ fill: 'var(--map-ocean)' }}
        />

        {/* Neighboring countries — muted fill for geographic context */}
        <Geographies geography="/region.json">
          {({ geographies }) =>
            (geographies as GeoFeature[]).map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: 'var(--map-neighbor)',
                    stroke: 'var(--map-border)',
                    strokeWidth: 0.3,
                    outline: 'none',
                  },
                  hover: { fill: 'var(--map-neighbor)', outline: 'none' },
                  pressed: { fill: 'var(--map-neighbor)', outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>

        {/* Colombia departments — political boundaries + subtle fill */}
        <Geographies geography="/departments.json">
          {({ geographies }) =>
            (geographies as GeoFeature[]).map((geo) => {
              const fill = AFFECTED_DEPTS.has(geo.properties?.name ?? '')
                ? 'var(--map-affected)'
                : 'var(--map-land)'
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill,
                      stroke: 'var(--map-dept-border)',
                      strokeWidth: 0.4,
                      outline: 'none',
                    },
                    hover: { fill, stroke: 'var(--map-dept-border)', outline: 'none' },
                    pressed: { fill, stroke: 'var(--map-dept-border)', outline: 'none' },
                  }}
                />
              )
            })
          }
        </Geographies>

        {/* Colombia national outline — reinforces the country border */}
        <Geographies geography="/colombia.json">
          {({ geographies }) =>
            (geographies as GeoFeature[]).map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: 'none',
                    stroke: 'var(--map-border)',
                    strokeWidth: 0.9,
                    outline: 'none',
                  },
                  hover: { fill: 'none', stroke: 'var(--map-border)', outline: 'none' },
                  pressed: { fill: 'none', stroke: 'var(--map-border)', outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>

        {/* Major rivers — Magdalena, Cauca, Atrato, Meta, Apure */}
        <Geographies geography="/rivers.json">
          {({ geographies }) =>
            (geographies as GeoFeature[]).map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: {
                    fill: 'none',
                    stroke: 'var(--map-river)',
                    strokeWidth: 0.8,
                    outline: 'none',
                  },
                  hover: { fill: 'none', stroke: 'var(--map-river)', outline: 'none' },
                  pressed: { fill: 'none', stroke: 'var(--map-river)', outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>

        {/* Department name labels */}
        {DEPT_LABELS.map((d) => (
          <Marker key={d.name} coordinates={[d.lon, d.lat]}>
            <text className={styles.deptLabel} textAnchor="middle">
              {d.name}
            </text>
          </Marker>
        ))}

        {/* River name labels */}
        {RIVER_LABELS.map((r) => (
          <Marker key={r.name} coordinates={[r.lon, r.lat]}>
            <text
              className={styles.riverLabel}
              textAnchor="middle"
              transform={r.rotate ? `rotate(${r.rotate})` : undefined}
            >
              {r.name}
            </text>
          </Marker>
        ))}

        {/* Hippo dots — one per modeled individual */}
        {dots.map((dot, i) => (
          <Marker key={`${dot.groupId}-${i}`} coordinates={[dot.lon, dot.lat]}>
            <circle r={2.5} fill={PHASE_COLORS[dot.phase]} fillOpacity={0.85} />
          </Marker>
        ))}

        {/* Key place markers — towns along the corridor + the origin (Nápoles) */}
        {PLACE_LABELS.map((p) => (
          <Marker key={p.name} coordinates={[p.lon, p.lat]}>
            {p.origin ? (
              <path
                d="M0,-4 L1.1,-1.2 L4,-1.2 L1.7,0.6 L2.6,3.6 L0,1.8 L-2.6,3.6 L-1.7,0.6 L-4,-1.2 L-1.1,-1.2 Z"
                className={styles.originStar}
              />
            ) : (
              <circle r={1.6} className={styles.placeDot} />
            )}
            <text
              className={p.origin ? styles.originLabel : styles.placeLabel}
              x={p.dx ?? 4}
              y={p.dy ?? 3}
              textAnchor={p.anchor ?? 'start'}
            >
              {p.name}
            </text>
          </Marker>
        ))}
      </ComposableMap>

      <div className={styles.legend}>
        {PHASE_KEYS.map((phase) => (
          <div key={phase} className={styles.legendItem}>
            <span
              className={styles.legendSwatch}
              style={{ backgroundColor: PHASE_COLORS[phase] }}
            />
            <span className={styles.legendLabel}>{t(`map.phase.${phase}`)}</span>
          </div>
        ))}
      </div>

      <p className={styles.source}>{t('map.source')}</p>
    </div>
  )
}
