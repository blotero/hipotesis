'use client'

import { useReducer, useState } from 'react'
import type { ReactElement } from 'react'
import { useLocale } from '@/lib/i18n/context'
import { runSimulation } from '@/lib/simulation/engine'
import { CURRENT_YEAR } from '@/lib/simulation/constants'
import { INITIAL_STRATEGY, RANGES, simulatorReducer } from './state'
import { StrategyCard } from './StrategyCard'
import { Slider } from './Slider'
import { PopulationChart } from './PopulationChart'
import { StatsPanel } from './StatsPanel'
import { WasteImpact } from './WasteImpact'
import { MapPanel } from '@/components/map/MapPanel'
import styles from './SimulatorPanel.module.css'

export function SimulatorPanel(): ReactElement {
  const [strategy, dispatch] = useReducer(simulatorReducer, INITIAL_STRATEGY)
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR)
  const { t } = useLocale()

  // runSimulation is pure and completes in ~1ms — no memoization needed.
  // Uses the default (government) census baseline; see history.ts.
  const result = runSimulation(strategy)

  return (
    <div className={styles.layout}>
      <aside className={styles.controls}>
        <div className={styles.controlsHeader}>
          <h2 className={styles.controlsTitle}>{t('controls.title')}</h2>
          <p className={styles.controlsDescription}>{t('controls.description')}</p>
        </div>

        <div className={styles.cards}>
          <StrategyCard
            label={t('controls.lethal.label')}
            description={t('controls.lethal.description')}
            enabled={strategy.lethalControl.enabled}
            onToggle={() => dispatch({ type: 'TOGGLE_LETHAL' })}
          >
            <Slider
              label={t('controls.lethal.param.individualsPerYear.label')}
              unit={t('controls.lethal.param.individualsPerYear.unit')}
              min={RANGES.lethal.min}
              max={RANGES.lethal.max}
              step={RANGES.lethal.step}
              value={strategy.lethalControl.individualsPerYear}
              disabled={!strategy.lethalControl.enabled}
              onChange={(value) => dispatch({ type: 'SET_LETHAL_RATE', value })}
            />
          </StrategyCard>

          <StrategyCard
            label={t('controls.sterilization.label')}
            description={t('controls.sterilization.description')}
            enabled={strategy.sterilization.enabled}
            onToggle={() => dispatch({ type: 'TOGGLE_STERILIZATION' })}
          >
            <Slider
              label={t('controls.sterilization.param.femalesPerYear.label')}
              unit={t('controls.sterilization.param.femalesPerYear.unit')}
              min={RANGES.sterilizationFemales.min}
              max={RANGES.sterilizationFemales.max}
              step={RANGES.sterilizationFemales.step}
              value={strategy.sterilization.femalesPerYear}
              disabled={!strategy.sterilization.enabled}
              onChange={(value) => dispatch({ type: 'SET_STERILIZATION_FEMALES', value })}
            />
            <Slider
              label={t('controls.sterilization.param.malesPerYear.label')}
              unit={t('controls.sterilization.param.malesPerYear.unit')}
              min={RANGES.sterilizationMales.min}
              max={RANGES.sterilizationMales.max}
              step={RANGES.sterilizationMales.step}
              value={strategy.sterilization.malesPerYear}
              disabled={!strategy.sterilization.enabled}
              onChange={(value) => dispatch({ type: 'SET_STERILIZATION_MALES', value })}
            />
            <p className={styles.note}>{t('controls.sterilization.note.males')}</p>
          </StrategyCard>

          <StrategyCard
            label={t('controls.displacement.label')}
            description={t('controls.displacement.description')}
            enabled={strategy.displacement.enabled}
            onToggle={() => dispatch({ type: 'TOGGLE_DISPLACEMENT' })}
          >
            <Slider
              label={t('controls.displacement.param.individualsPerYear.label')}
              unit={t('controls.displacement.param.individualsPerYear.unit')}
              min={RANGES.displacement.min}
              max={RANGES.displacement.max}
              step={RANGES.displacement.step}
              value={strategy.displacement.individualsPerYear}
              disabled={!strategy.displacement.enabled}
              onChange={(value) => dispatch({ type: 'SET_DISPLACEMENT_RATE', value })}
            />
          </StrategyCard>
        </div>
      </aside>

      <section className={styles.visualization}>
        <PopulationChart result={result} onYearHover={setSelectedYear} />
        <StatsPanel result={result} />
        <WasteImpact result={result} />
        <MapPanel result={result} selectedYear={selectedYear} onYearChange={setSelectedYear} />
      </section>
    </div>
  )
}
