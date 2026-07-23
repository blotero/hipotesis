'use client'

import type { ReactElement } from 'react'
import { useLocale } from '@/lib/i18n/context'
import styles from './Footer.module.css'

export function Footer(): ReactElement {
  const { t } = useLocale()

  return (
    <footer className={styles.footer}>
      <p className={styles.disclaimer}>{t('footer.disclaimer')}</p>
      <p className={styles.openSource}>{t('footer.openSource')}</p>
    </footer>
  )
}
