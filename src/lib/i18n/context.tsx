'use client'

import { createContext, useContext, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { createTranslator, DEFAULT_LOCALE } from './index'
import type { Locale, TranslationKey } from './index'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }): ReactElement {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE)
  const t = createTranslator(locale)
  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
  )
}

export const useLocale = (): LocaleContextValue => {
  const ctx = useContext(LocaleContext)
  if (ctx === null) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
