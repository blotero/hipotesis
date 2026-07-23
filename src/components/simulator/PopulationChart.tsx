'use client'

import type { ReactElement } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useLocale } from '@/lib/i18n/context'
import { MILESTONE_POPULATION, CURRENT_YEAR } from '@/lib/simulation/constants'
import type { SimulationResult } from '@/lib/simulation/types'
import styles from './PopulationChart.module.css'

interface ChartPoint {
  year: number
  historical: number | null
  projection: number | null
}

const buildChartData = (result: SimulationResult): ChartPoint[] => {
  const historical: ChartPoint[] = result.historical.map((p) => ({
    year: p.year,
    historical: Math.round(p.population),
    projection: null,
  }))

  // Year 2026: give both series the same value so the lines share a visual junction
  const handoff = result.historical[result.historical.length - 1]
  const handoffValue = Math.round(handoff?.population ?? 0)

  const projection: ChartPoint[] = result.projection.slice(1).map((p) => ({
    year: p.year,
    historical: null,
    projection: Math.round(p.population),
  }))

  return [
    ...historical.slice(0, -1),
    { year: CURRENT_YEAR, historical: handoffValue, projection: handoffValue },
    ...projection,
  ]
}

interface PopulationChartProps {
  result: SimulationResult
  onYearHover?: (year: number) => void
}

export function PopulationChart({ result, onYearHover }: PopulationChartProps): ReactElement {
  const { t } = useLocale()
  const data = buildChartData(result)

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{t('chart.title')}</h2>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 32, bottom: 28, left: 8 }}
          onMouseMove={(state) => {
            if (onYearHover && state.activeLabel !== undefined) {
              onYearHover(Number(state.activeLabel))
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grid)" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12 }}
            label={{
              value: t('chart.xAxis.label'),
              position: 'insideBottom',
              offset: -12,
              fontSize: 12,
            }}
          />
          <YAxis
            domain={[0, 'auto']}
            allowDataOverflow={false}
            tick={{ fontSize: 12 }}
            label={{
              value: t('chart.yAxis.label'),
              angle: -90,
              position: 'insideLeft',
              offset: 12,
              fontSize: 12,
            }}
          />
          <Tooltip
            formatter={(value) => {
              if (typeof value !== 'number') return ['', '']
              return [Math.round(value).toString(), ''] as [string, string]
            }}
            labelFormatter={(label) => String(label)}
          />
          <Legend verticalAlign="top" />
          <ReferenceLine
            y={MILESTONE_POPULATION}
            stroke="var(--color-capacity)"
            strokeDasharray="4 4"
            label={{
              value: t('chart.annotation.carryingCapacity'),
              // Inside the plot: `right` overflows the 32px right margin and the
              // label gets clipped at every column width.
              position: 'insideTopRight',
              fontSize: 10,
              fill: 'var(--color-capacity)',
            }}
          />
          <ReferenceLine
            x={CURRENT_YEAR}
            stroke="var(--color-today)"
            strokeDasharray="4 4"
            label={{
              value: t('chart.annotation.currentYear'),
              // `top` draws above the plot area, where it runs into the legend
              // once the legend wraps to two lines at narrow widths.
              position: 'insideTop',
              fontSize: 10,
              fill: 'var(--color-today)',
            }}
          />
          <Line
            type="monotone"
            dataKey="historical"
            name={t('chart.series.historical')}
            stroke="var(--color-historical)"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="projection"
            name={t('chart.series.projection')}
            stroke="var(--color-projection)"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
