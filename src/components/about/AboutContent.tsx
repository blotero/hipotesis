'use client'

import type { ReactElement } from 'react'
import { useLocale } from '@/lib/i18n/context'
import type { TranslationKey } from '@/lib/i18n/types'
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

export function AboutContent(): ReactElement {
  const { t } = useLocale()

  return (
    <article className={styles.article}>
      <h1 className={styles.title}>{t('about.title')}</h1>
      <p className={styles.intro}>{t('about.intro')}</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('about.model.title')}</h2>
        <p className={styles.body}>{t('about.model.description')}</p>
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
