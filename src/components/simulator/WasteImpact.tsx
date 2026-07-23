'use client'

import type { ReactElement } from 'react'
import { useLocale } from '@/lib/i18n/context'
import { computeWasteImpact } from '@/lib/simulation/engine'
import type { SimulationResult } from '@/lib/simulation/types'
import {
  WASTE_CELLS,
  SILHOUETTE_ASPECT,
  SILHOUETTE_PATH,
  filledCellCount,
} from '@/lib/map/wasteCells'
import styles from './WasteImpact.module.css'

interface WasteImpactProps {
  result: SimulationResult
}

interface MetricProps {
  value: string
  label: string
  sub?: string
  tooltip?: string
}

function Metric({ value, label, sub, tooltip }: MetricProps): ReactElement {
  return (
    <div className={styles.metric}>
      <span className={styles.metricValue}>{value}</span>
      <span className={styles.metricLabel}>
        {label}
        {tooltip !== undefined && <span className={styles.tooltipIcon}>i</span>}
      </span>
      {sub !== undefined && <span className={styles.metricSub}>{sub}</span>}
      {tooltip !== undefined && <div className={styles.tooltip}>{tooltip}</div>}
    </div>
  )
}

const VIEW_H = 100
const VIEW_W = SILHOUETTE_ASPECT * VIEW_H

export function WasteImpact({ result }: WasteImpactProps): ReactElement {
  const { t } = useLocale()

  const waste = computeWasteImpact(result)
  const filled = filledCellCount(waste.coverageFraction)
  const percent = Math.round(waste.coverageFraction * 1000) / 10

  const massDisplay = Math.round(waste.massTonnes).toLocaleString()
  const poolsDisplay = Math.round(waste.olympicPools).toLocaleString()
  const areaKm2 = waste.areaM2 / 1e6
  const areaDisplay = areaKm2.toLocaleString(undefined, { maximumFractionDigits: 1 })
  const grassDisplay = Math.round(waste.grassTonnes).toLocaleString()
  const pitchesDisplay = Math.round(waste.footballPitches).toLocaleString()
  const nitrogenDisplay = Math.round(waste.nitrogenTonnes).toLocaleString()

  // Emoji glyph size relative to the viewBox — a touch larger than the cell pitch
  // so filled cells read as a continuous mass rather than isolated dots.
  const glyph = (VIEW_H / Math.sqrt(WASTE_CELLS.length / SILHOUETTE_ASPECT)) * 1.15

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>{t('waste.title')}</h3>
      <p className={styles.subtitle}>{t('waste.subtitle')}</p>

      <div className={styles.body}>
        <div className={styles.figure}>
          <span className={styles.sizeRef}>{t('waste.sizeReference')}</span>
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className={styles.svg}
            role="img"
            aria-label={t('waste.figureAlt')}
          >
            <path d={scalePath(SILHOUETTE_PATH, VIEW_W, VIEW_H)} className={styles.silhouette} />
            {WASTE_CELLS.slice(0, filled).map((cell, i) => (
              <text
                key={i}
                x={cell.x * VIEW_W}
                y={cell.y * VIEW_H}
                fontSize={glyph}
                textAnchor="middle"
                dominantBaseline="central"
                className={styles.poop}
              >
                💩
              </text>
            ))}
          </svg>
          <span className={styles.coverage}>
            {t('waste.coverage').replace('{percent}', percent.toLocaleString())}
          </span>
        </div>

        <div className={styles.metrics}>
          <div className={styles.group}>
            <span className={styles.groupTitle}>{t('waste.group.waste')}</span>
            <Metric value={massDisplay} label={t('waste.mass')} tooltip={t('waste.tooltip.mass')} />
            <Metric
              value={poolsDisplay}
              label={t('waste.pools')}
              tooltip={t('waste.tooltip.pools')}
            />
            <Metric value={areaDisplay} label={t('waste.area')} tooltip={t('waste.tooltip.area')} />
          </div>

          <div className={styles.group}>
            <span className={styles.groupTitle}>{t('waste.group.land')}</span>
            <Metric
              value={grassDisplay}
              label={t('waste.grass')}
              sub={t('waste.grassPitches').replace('{pitches}', pitchesDisplay)}
              tooltip={t('waste.tooltip.grass')}
            />
          </div>

          <div className={styles.group}>
            <span className={styles.groupTitle}>{t('waste.group.water')}</span>
            <Metric
              value={nitrogenDisplay}
              label={t('waste.nitrogen')}
              tooltip={t('waste.tooltip.nitrogen')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// The path string is normalized to a [0,1] viewBox; rescale to the render viewBox.
const scalePath = (path: string, w: number, h: number): string =>
  path.replace(/(-?\d*\.?\d+),(-?\d*\.?\d+)/g, (_m, x: string, y: string) => {
    return `${(Number(x) * w).toFixed(2)},${(Number(y) * h).toFixed(2)}`
  })
