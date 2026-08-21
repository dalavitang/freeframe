import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ReactElement } from 'react'
import enMessages from '../messages/en.json'

/** Render a component under the en locale so `useTranslations` works in tests. */
export function renderWithI18n(
  ui: ReactElement,
  options?: Parameters<typeof render>[1],
) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {ui}
    </NextIntlClientProvider>,
    options,
  )
}
