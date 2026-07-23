'use client'

import type { ReactElement } from 'react'
import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import styles from './Nav.module.css'

function SunIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

// The resolved theme is only known on the client, so the button stays hidden
// until after hydration. useSyncExternalStore reports server/client directly via
// its snapshot pair — no setState-in-effect, and no cascading render.
// Nothing to subscribe to — the snapshot never changes after hydration.
const noop = (): void => undefined
const subscribe = (): (() => void) => noop
const getSnapshot = (): boolean => true
const getServerSnapshot = (): boolean => false

export function ThemeToggle(): ReactElement {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const isDark = theme === 'dark'
  const toggle = (): void => setTheme(isDark ? 'light' : 'dark')

  return (
    <button
      type="button"
      onClick={mounted ? toggle : undefined}
      className={styles.themeToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{ visibility: mounted ? 'visible' : 'hidden' }}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
