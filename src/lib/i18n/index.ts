import type { Locale, TranslationKey, Translations } from './types'
import enStrings from './en.json'
import esStrings from './es.json'

const translations: Record<Locale, Translations> = {
  en: enStrings,
  es: esStrings,
}

/**
 * Returns a type-safe translation accessor for the given locale.
 * Throws at runtime if a key is missing, surfacing gaps as errors rather than empty strings.
 */
export const createTranslator = (locale: Locale) => {
  const dict = translations[locale]
  return (key: TranslationKey): string => {
    const value = dict[key]
    if (value === undefined) {
      throw new Error(`Missing translation key "${key}" for locale "${locale}"`)
    }
    return value
  }
}

export const DEFAULT_LOCALE: Locale = 'es'

export type { Locale, TranslationKey } from './types'
