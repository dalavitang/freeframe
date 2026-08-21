'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LOCALE_COOKIE, resolveLocale } from '@/lib/i18n'
import { getCookieValue, setLocaleCookie } from '@/lib/i18n'

/**
 * On first load, if no locale cookie is set, derive the locale from the
 * browser's language (zh* → Chinese, everything else → English), persist it,
 * and re-render the route so the server picks up the new <html lang> and
 * message set. Runs at most once per browser.
 */
export function LocaleInitializer() {
  const router = useRouter()

  useEffect(() => {
    const cookie = getCookieValue(LOCALE_COOKIE)
    if (cookie !== null) return

    const locale = resolveLocale(cookie, navigator.language)
    setLocaleCookie(locale)
    router.refresh()
  }, [router])

  return null
}
