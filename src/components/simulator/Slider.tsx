import type { ReactElement } from 'react'
import styles from './Slider.module.css'

interface SliderProps {
  label: string
  unit: string
  min: number
  max: number
  step: number
  value: number
  disabled: boolean
  onChange: (value: number) => void
}

export function Slider({
  label,
  unit,
  min,
  max,
  step,
  value,
  disabled,
  onChange,
}: SliderProps): ReactElement {
  return (
    <div className={`${styles.wrapper} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        className={styles.input}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled || undefined}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
