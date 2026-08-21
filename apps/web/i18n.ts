import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { LOCALE_COOKIE, resolveLocale } from './lib/i18n'

export default getRequestConfig(async () => {
  const locale = resolveLocale(cookies().get(LOCALE_COOKIE)?.value)
  const messages =
    locale === 'zh'
      ? (await import('./messages/zh.json')).default
      : (await import('./messages/en.json')).default

  return { locale, messages }
})
