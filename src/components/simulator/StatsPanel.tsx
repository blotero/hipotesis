'use client'

import type { ReactElement } from 'react'
import { useLocale } from '@/lib/i18n/context'
import { MILESTONE_POPULATION, CURRENT_YEAR } from '@/lib/simulation/constants'
import { computeProjectionHippoYears } from '@/lib/simulation/engine'
import type { SimulationResult } from '@/lib/simulation/types'
import styles from './StatsPanel.module.css'

interface StatsPanelProps {
  result: SimulationResult
}

interface StatCardProps {
  label: string
  value: string
  tooltip?: string
}

function StatCard({ label, value, tooltip }: StatCardProps): ReactElement {
  return (
    <div className={styles.card}>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>
        {label}
        {tooltip !== undefined && <span className={styles.tooltipIcon}>i</span>}
      </span>
      {tooltip !== undefined && <div className={styles.tooltip}>{tooltip}</div>}
    </div>
  )
}

export function StatsPanel({ result }: StatsPanelProps): ReactElement {
  const { t } = useLocale()

  const currentPoint = result.historical.find((p) => p.year === CURRENT_YEAR)
  const currentPop = Math.round(currentPoint?.population ?? 0)

  const finalPoint = result.projection[result.projection.length - 1]
  const pop2060 = Math.round(finalPoint?.population ?? 0)

  const yearToMilestone = result.projection.find((p) => p.population >= MILESTONE_POPULATION)?.year
  const capacityLabel =
    yearToMilestone !== undefined ? String(yearToMilestone) : t('stats.yearsToCapacity.never')

  const hippoYears = Math.round(computeProjectionHippoYears(result))

  return (
    <div className={styles.panel}>
      <StatCard
        label={t('stats.currentPopulation')}
        value={currentPop.toLocaleString()}
        tooltip={t('stats.tooltip.currentPopulation')}
      />
      <StatCard
        label={t('stats.populationIn2060')}
        value={pop2060.toLocaleString()}
        tooltip={t('stats.tooltip.populationIn2060')}
      />
      <StatCard
        label={t('stats.yearsToCapacity')}
        value={capacityLabel}
        tooltip={t('stats.tooltip.yearsToCapacity')}
      />
      <StatCard
        label={t('stats.projectionHippoYears')}
        value={hippoYears.toLocaleString()}
        tooltip={t('stats.tooltip.projectionHippoYears')}
      />
    </div>
  )
}
