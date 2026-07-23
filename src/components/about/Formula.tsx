import type { ReactElement, ReactNode } from 'react'
import styles from './Formula.module.css'

interface FormulaProps {
  /** Plain-language description shown above the math. Omit for unlabelled formulas. */
  readonly label?: string
  readonly children: ReactNode
}

/**
 * A block of display math with an optional caption. The math itself scrolls
 * horizontally rather than overflowing the page on narrow screens.
 */
export function Formula({ label, children }: FormulaProps): ReactElement {
  return (
    <figure className={styles.figure}>
      {label !== undefined ? <figcaption className={styles.label}>{label}</figcaption> : null}
      <div className={styles.math}>{children}</div>
    </figure>
  )
}

interface InlineMathProps {
  readonly children: ReactNode
}

/** Inline math, for symbols referenced inside prose or table cells. */
export function InlineMath({ children }: InlineMathProps): ReactElement {
  return <math className={styles.inline}>{children}</math>
}
