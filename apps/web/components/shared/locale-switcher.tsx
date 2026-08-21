'use client'

import * as React from 'react'
import * as Popover from '@radix-ui/react-popover'
import { useRouter } from 'next/navigation'
import { Check, Languages } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  LOCALE_COOKIE,
  SUPPORTED_LOCALES,
  getCookieValue,
  localeNames,
  setLocaleCookie,
  type Locale,
} from '@/lib/i18n'

export function LocaleSwitcher() {
  const t = useTranslations('locale')
  const router = useRouter()
  const [locale, setLocale] = React.useState<Locale>(() => {
    const cookie = getCookieValue(LOCALE_COOKIE)
    if (cookie === 'zh' || cookie === 'en') return cookie
    return typeof navigator !== 'undefined' &&
      navigator.language.toLowerCase().startsWith('zh')
      ? 'zh'
      : 'en'
  })

  function switchTo(next: Locale) {
    if (next === locale) return
    setLocaleCookie(next)
    setLocale(next)
    router.refresh()
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          aria-label={t('switchTo')}
          title={t('switchTo')}
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-bg-hover hover:text-text-primary"
        >
          <Languages className="h-4 w-4" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={6}
          className="z-50 w-40 rounded-xl border border-border bg-bg-secondary shadow-2xl py-1.5
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <p className="px-3 py-1 text-xs text-text-tertiary">{t('language')}</p>
          {SUPPORTED_LOCALES.map((value) => (
            <button
              key={value}
              onClick={() => switchTo(value)}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors',
                locale === value
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover',
              )}
            >
              <span className="w-4 shrink-0">
                {locale === value && <Check className="h-3.5 w-3.5" />}
              </span>
              {localeNames[value]}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
