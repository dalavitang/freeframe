'use client'

import { useTranslations } from 'next-intl'

export function AuthTagline() {
  const t = useTranslations('layout')
  return <p className="relative mt-8 text-2xs text-text-tertiary">{t('tagline')}</p>
}
