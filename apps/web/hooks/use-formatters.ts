'use client'

import { useLocale, useTranslations } from 'next-intl'
import { formatBytes, formatRelativeTime } from '@/lib/utils'

/**
 * Locale-aware wrappers around the pure `formatBytes` / `formatRelativeTime`
 * helpers. Components that render these should call this hook so the output
 * matches the active language (numbers, singular/plural, "just now" wording).
 */
export function useFormatters() {
  const locale = useLocale()
  const t = useTranslations('time')

  return {
    formatBytes: (bytes: number) => formatBytes(bytes, locale),
    formatRelativeTime: (date: string) =>
      formatRelativeTime(date, locale, t('justNow')),
  }
}
