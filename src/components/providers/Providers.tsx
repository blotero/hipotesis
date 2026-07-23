'use client'

import type { ReactElement, ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import { LocaleProvider } from '@/lib/i18n/context'

export function Providers({ children }: { children: ReactNode }): ReactElement {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LocaleProvider>{children}</LocaleProvider>
    </ThemeProvider>
  )
}
