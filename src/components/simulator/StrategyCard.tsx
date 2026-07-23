import type { ReactElement, ReactNode } from 'react'
import styles from './StrategyCard.module.css'

interface StrategyCardProps {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
  children: ReactNode
}

export function StrategyCard({
  label,
  description,
  enabled,
  onToggle,
  children,
}: StrategyCardProps): ReactElement {
  return (
    <div className={`${styles.card} ${enabled ? styles.active : ''}`}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <label className={styles.toggle} aria-label={label}>
          <input type="checkbox" checked={enabled} onChange={onToggle} />
          <span className={styles.toggleTrack} />
        </label>
      </div>
      <p className={styles.description}>{description}</p>
      <div className={`${styles.sliders} ${!enabled ? styles.slidersDisabled : ''}`}>
        {children}
      </div>
    </div>
  )
}
