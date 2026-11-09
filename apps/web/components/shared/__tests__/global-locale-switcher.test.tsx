import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithI18n } from '@/test/render-with-i18n'
import { GlobalLocaleSwitcher } from '@/components/shared/global-locale-switcher'

const refresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

beforeEach(() => {
  refresh.mockClear()
  document.cookie = 'ff_locale=; path=/; max-age=0'
})

describe('GlobalLocaleSwitcher', () => {
  it('is on every page shell and switches the locale cookie', () => {
    renderWithI18n(<GlobalLocaleSwitcher />)

    fireEvent.click(screen.getByRole('button', { name: /switch language/i }))
    fireEvent.click(screen.getByRole('button', { name: '中文' }))

    expect(document.cookie).toContain('ff_locale=zh')
    expect(refresh).toHaveBeenCalledTimes(1)
  })
})
