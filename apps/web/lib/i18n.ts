export const LOCALE_COOKIE = 'ff_locale'

export const SUPPORTED_LOCALES = ['en', 'zh'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'en' || value === 'zh'
}

/**
 * Normalise a `?lang=` value. Accepts `en`, `zh` and their regional variants
 * (`en-US`, `zh-CN`, `zh-Hant-TW`), so a share link can carry the language a
 * recipient should start in. Anything else is ignored rather than coerced.
 */
export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null
  const tag = value.trim().toLowerCase()
  if (tag === 'en' || tag.startsWith('en-')) return 'en'
  if (tag === 'zh' || tag.startsWith('zh-')) return 'zh'
  return null
}

/** Map a browser language tag (e.g. `zh-CN`, `zh-Hant-TW`) to a supported locale. */
export function browserLocale(value: string | undefined): Locale {
  if (!value) return 'en'
  return value.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

/**
 * Resolve the effective locale: an explicit cookie wins, otherwise fall back to
 * the browser language, then English. Cookie name + resolution are shared by the
 * server (root layout) and the client (LocaleInitializer / LocaleSwitcher).
 */
export function resolveLocale(
  cookieValue: string | null | undefined,
  browserLanguage?: string,
): Locale {
  if (isLocale(cookieValue)) return cookieValue
  return browserLocale(browserLanguage)
}

export function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`))
  return match ? match.slice(name.length + 1) : null
}

export function setLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
}
