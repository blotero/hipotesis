'use client'

import type { ReactElement, ReactNode } from 'react'
import { useLocale } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/types'
import { Formula, InlineMath } from './Formula'
import {
  CensusInterpolation,
  FertileFraction,
  PopulationUpdate,
  RemovalEquilibrium,
  SterilizationThreshold,
  SterilizedUpdate,
  UncontrolledGrowth,
} from './formulas'
import styles from './AboutContent.module.css'

interface Reference {
  readonly key: TranslationKey
  readonly href?: string
}

// Ordered as cited: population model first, then impact estimates, then data sources.
const REFERENCES: readonly Reference[] = [
  { key: 'about.references.castelblanco2021' },
  { key: 'about.references.stears2018', href: 'https://www.pnas.org/doi/10.1073/pnas.1800407115' },
  {
    key: 'about.references.subalusky2015',
    href: 'https://onlinelibrary.wiley.com/doi/10.1111/fwb.12474',
  },
  {
    key: 'about.references.dutton2018',
    href: 'https://www.nature.com/articles/s41467-018-04391-6',
  },
  {
    key: 'about.references.shurin2020',
    href: 'https://esajournals.onlinelibrary.wiley.com/doi/10.1002/ecy.2991',
  },
  { key: 'about.references.data' },
]

interface GlossaryRow {
  readonly id: string
  readonly symbol: ReactNode
  readonly meaning: TranslationKey
  readonly value: TranslationKey
}

// Ordered as the symbols first appear in the equations above the table:
// state variables, then rates, then the control inputs, then derived quantities.
const GLOSSARY: readonly GlossaryRow[] = [
  {
    id: 'population',
    symbol: (
      <msub>
        <mi>N</mi>
        <mi>t</mi>
      </msub>
    ),
    meaning: 'about.model.symbols.population',
    value: 'about.model.symbols.population.value',
  },
  {
    id: 'sterilizedFemales',
    symbol: (
      <msub>
        <mi>F</mi>
        <mi>t</mi>
      </msub>
    ),
    meaning: 'about.model.symbols.sterilizedFemales',
    value: 'about.model.symbols.sterilizedFemales.value',
  },
  {
    id: 'sterilizedMales',
    symbol: (
      <msub>
        <mi>M</mi>
        <mi>t</mi>
      </msub>
    ),
    meaning: 'about.model.symbols.sterilizedMales',
    value: 'about.model.symbols.sterilizedMales.value',
  },
  {
    id: 'fertileFraction',
    symbol: (
      <msub>
        <mi>φ</mi>
        <mi>t</mi>
      </msub>
    ),
    meaning: 'about.model.symbols.fertileFraction',
    value: 'about.model.symbols.fertileFraction.value',
  },
  {
    id: 'birthRate',
    symbol: <mi>b</mi>,
    meaning: 'about.model.symbols.birthRate',
    value: 'about.model.symbols.birthRate.value',
  },
  {
    id: 'deathRate',
    symbol: <mi>d</mi>,
    meaning: 'about.model.symbols.deathRate',
    value: 'about.model.symbols.deathRate.value',
  },
  {
    id: 'lethal',
    symbol: <mi>L</mi>,
    meaning: 'about.model.symbols.lethal',
    value: 'about.model.symbols.lethal.value',
  },
  {
    id: 'displacement',
    symbol: <mi>X</mi>,
    meaning: 'about.model.symbols.displacement',
    value: 'about.model.symbols.displacement.value',
  },
  {
    id: 'femalesPerYear',
    symbol: <mi>f</mi>,
    meaning: 'about.model.symbols.femalesPerYear',
    value: 'about.model.symbols.femalesPerYear.value',
  },
  {
    id: 'malesPerYear',
    symbol: <mi>m</mi>,
    meaning: 'about.model.symbols.malesPerYear',
    value: 'about.model.symbols.malesPerYear.value',
  },
  {
    id: 'survivalRatio',
    symbol: (
      <msub>
        <mi>s</mi>
        <mi>t</mi>
      </msub>
    ),
    meaning: 'about.model.symbols.survivalRatio',
    value: 'about.model.symbols.survivalRatio.value',
  },
]

interface Implication {
  readonly id: string
  readonly title: TranslationKey
  readonly description: TranslationKey
  readonly formula: ReactNode
}

// Each of these is a consequence of the equations above, not a separate model.
const IMPLICATIONS: readonly Implication[] = [
  {
    id: 'growth',
    title: 'about.model.implications.growth.title',
    description: 'about.model.implications.growth.description',
    formula: <UncontrolledGrowth />,
  },
  {
    id: 'removal',
    title: 'about.model.implications.removal.title',
    description: 'about.model.implications.removal.description',
    formula: <RemovalEquilibrium />,
  },
  {
    id: 'sterilization',
    title: 'about.model.implications.sterilization.title',
    description: 'about.model.implications.sterilization.description',
    formula: <SterilizationThreshold />,
  },
]

const ASSUMPTIONS: readonly TranslationKey[] = [
  'about.model.assumptions.sexRatio',
  'about.model.assumptions.noAgeStructure',
  'about.model.assumptions.noDensityDependence',
  'about.model.assumptions.noSpatial',
  'about.model.assumptions.deterministic',
  'about.model.assumptions.randomRemoval',
  'about.model.assumptions.sterilizationInstant',
  'about.model.assumptions.malesInert',
  'about.model.assumptions.annualStep',
  'about.model.assumptions.continuous',
]

export function AboutContent(): ReactElement {
  const { t } = useLocale()

  return (
    <article className={styles.article}>
      <h1 className={styles.title}>{t('about.title')}</h1>
      <p className={styles.intro}>{t('about.intro')}</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('about.model.title')}</h2>
        <p className={styles.body}>{t('about.model.description')}</p>

        <section className={styles.subsection}>
          <h3 className={styles.subsectionTitle}>{t('about.model.historical.title')}</h3>
          <p className={styles.body}>{t('about.model.historical.description')}</p>
          <Formula label={t('about.model.historical.formula')}>
            <CensusInterpolation />
          </Formula>
          <p className={styles.note}>{t('about.model.historical.note')}</p>
        </section>

        <section className={styles.subsection}>
          <h3 className={styles.subsectionTitle}>{t('about.model.projection.title')}</h3>
          <p className={styles.body}>{t('about.model.projection.description')}</p>
          <Formula label={t('about.model.projection.formula.fertile')}>
            <FertileFraction />
          </Formula>
          <Formula label={t('about.model.projection.formula.population')}>
            <PopulationUpdate />
          </Formula>
          <Formula label={t('about.model.projection.formula.sterilized')}>
            <SterilizedUpdate />
          </Formula>
          <p className={styles.note}>{t('about.model.projection.note')}</p>
        </section>

        <section className={styles.subsection}>
          <h3 className={styles.subsectionTitle}>{t('about.model.symbols.title')}</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">{t('about.model.symbols.column.symbol')}</th>
                  <th scope="col">{t('about.model.symbols.column.meaning')}</th>
                  <th scope="col">{t('about.model.symbols.column.value')}</th>
                </tr>
              </thead>
              <tbody>
                {GLOSSARY.map(({ id, symbol, meaning, value }) => (
                  <tr key={id}>
                    <td className={styles.symbolCell}>
                      <InlineMath>{symbol}</InlineMath>
                    </td>
                    <td>{t(meaning)}</td>
                    <td className={styles.valueCell}>{t(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.subsection}>
          <h3 className={styles.subsectionTitle}>{t('about.model.implications.title')}</h3>
          {IMPLICATIONS.map(({ id, title, description, formula }) => (
            <div className={styles.implication} key={id}>
              <h4 className={styles.implicationTitle}>{t(title)}</h4>
              <p className={styles.body}>{t(description)}</p>
              <Formula>{formula}</Formula>
            </div>
          ))}
        </section>

        <section className={styles.subsection}>
          <h3 className={styles.subsectionTitle}>{t('about.model.assumptions.title')}</h3>
          <p className={styles.body}>{t('about.model.assumptions.intro')}</p>
          <ul className={styles.assumptions}>
            {ASSUMPTIONS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </section>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('about.impact.title')}</h2>
        <p className={styles.body}>{t('about.impact.description')}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('about.references.title')}</h2>
        <ul className={styles.references}>
          {REFERENCES.map(({ key, href }) => (
            <li key={key}>
              {href !== undefined ? (
                <a className={styles.link} href={href} target="_blank" rel="noreferrer">
                  {t(key)}
                </a>
              ) : (
                t(key)
              )}
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
