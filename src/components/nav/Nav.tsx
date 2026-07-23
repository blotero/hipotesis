'use client'

import type { ReactElement } from 'react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n/context'
import { ThemeToggle } from './ThemeToggle'
import styles from './Nav.module.css'

export function Nav(): ReactElement {
  const { locale, setLocale, t } = useLocale()

  const toggleLocale = (): void => setLocale(locale === 'es' ? 'en' : 'es')

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.brand}>
        {t('app.title')}
      </Link>
      <div className={styles.links}>
        <Link href="/" className={styles.link}>
          {t('app.nav.simulator')}
        </Link>
        <Link href="/about" className={styles.link}>
          {t('app.nav.about')}
        </Link>
        <button className={styles.localeToggle} onClick={toggleLocale} type="button">
          {locale === 'es' ? 'EN' : 'ES'}
        </button>
        <ThemeToggle />
      </div>
    </nav>
  )
}
