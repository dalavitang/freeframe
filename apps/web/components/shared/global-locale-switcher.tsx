'use client'

import { LocaleSwitcher } from '@/components/shared/locale-switcher'

/**
 * The language control on every surface, including share links, auth pages and
 * the full-screen review views whose own headers replace the dashboard header.
 *
 * It sits just below the top bar: below `h-11` on the dashboard and `h-12` on a
 * share page, so it never covers the actions in either. The wrapper gives it a
 * surface over full-bleed media, where the icon-only button would otherwise
 * disappear into the picture.
 */
export function GlobalLocaleSwitcher() {
  return (
    <div
      className="fixed right-3 top-14 z-[60] rounded-full border border-border bg-bg-secondary/85 p-1 shadow-sm backdrop-blur-sm print:hidden"
      data-testid="global-locale-switcher"
    >
      <LocaleSwitcher />
    </div>
  )
}
