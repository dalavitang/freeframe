import '@testing-library/jest-dom/vitest'
import * as React from 'react'
import { vi } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import enMessages from '../messages/en.json'

type ChangeListener = (event: { matches: boolean; media: string }) => void

interface Registration {
  listeners: Set<ChangeListener>
  lastMatches: boolean
}

let currentWidth = 1024
const registrations = new Map<string, Registration>()

// Evaluates the query types actually used in this repo (min-width / max-width,
// and prefers-color-scheme). prefers-color-scheme is handled explicitly here —
// it has nothing to do with viewport width, and must never fall through to the
// width comparison below (that previously made every color-scheme query answer
// based on the current test's viewport width, e.g. theme-store.ts:19,
// theme-initializer.tsx:28, folder-share-viewer.tsx:1099). Tests that need a
// specific color scheme should stub matchMedia themselves — this property stays
// configurable so `vi.stubGlobal('matchMedia', ...)` can still override it.
function evaluateQuery(query: string): boolean {
  const minWidth = query.match(/\(\s*min-width:\s*(\d+)px\s*\)/)
  if (minWidth) return currentWidth >= parseInt(minWidth[1], 10)

  const maxWidth = query.match(/\(\s*max-width:\s*(\d+)px\s*\)/)
  if (maxWidth) return currentWidth <= parseInt(maxWidth[1], 10)

  if (query.includes('prefers-color-scheme')) return false

  return false
}

function getRegistration(query: string): Registration {
  let reg = registrations.get(query)
  if (!reg) {
    reg = { listeners: new Set(), lastMatches: evaluateQuery(query) }
    registrations.set(query, reg)
  }
  return reg
}

function makeMediaQueryList(query: string) {
  const mql = {
    media: query,
    onchange: null as ChangeListener | null,
    get matches() {
      return evaluateQuery(query)
    },
    addEventListener(_type: string, cb: ChangeListener) {
      getRegistration(query).listeners.add(cb)
    },
    removeEventListener(_type: string, cb: ChangeListener) {
      getRegistration(query).listeners.delete(cb)
    },
    // Legacy MediaQueryList surface — theme-initializer.tsx and any other
    // pre-addEventListener caller would throw without these.
    addListener(cb: ChangeListener) {
      mql.addEventListener('change', cb)
    },
    removeListener(cb: ChangeListener) {
      mql.removeEventListener('change', cb)
    },
    dispatchEvent() {
      return false
    },
  }
  return mql
}

// Guarded: setupFiles run for every test file, including one that declares
// `@vitest-environment node` because it needs Node APIs rather than a DOM.
// There is no window to define matchMedia on there, and the whole shim is for
// components that cannot run in that environment anyway.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => makeMediaQueryList(query),
  })
}

/** Sets the viewport width every matchMedia min-width/max-width query is evaluated
 * against, and fires 'change' on any query whose match state actually flips —
 * mirrors a real MediaQueryList, so components that subscribe via
 * addEventListener/addListener see a live update, not just a new value on the
 * next matchMedia() call. */
export function setViewportWidth(width: number) {
  currentWidth = width
  registrations.forEach((reg, query) => {
    const matches = evaluateQuery(query)
    if (matches !== reg.lastMatches) {
      reg.lastMatches = matches
      const event = { matches, media: query }
      reg.listeners.forEach((cb) => cb(event))
    }
  })
}

setViewportWidth(1024)

// Every component in the app now reads its copy through next-intl, while the
// upstream test suite renders with Testing Library's plain `render`. Wrap all
// renders in a provider (and keep `rerender` wrapped too) so those tests keep
// working without touching each one. `renderWithI18n` remains available when a
// test wants to be explicit; a nested provider is harmless.
vi.mock('@testing-library/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@testing-library/react')>()
  const wrap = (ui: React.ReactElement) =>
    React.createElement(NextIntlClientProvider, { locale: 'en', messages: enMessages } as never, ui)
  return {
    ...actual,
    render: (ui: React.ReactElement, options?: Parameters<typeof actual.render>[1]) => {
      const result = actual.render(wrap(ui), options)
      const rerender = result.rerender
      result.rerender = (next: React.ReactNode) => rerender(wrap(next as React.ReactElement))
      return result
    },
    renderHook: (hook: () => unknown, options?: { wrapper?: React.ComponentType<{ children: React.ReactNode }> }) => {
      const Wrapper = options?.wrapper
      return actual.renderHook(hook, {
        ...options,
        wrapper: ({ children }: { children: React.ReactNode }) =>
          wrap(Wrapper ? React.createElement(Wrapper, null, children) : (children as React.ReactElement)),
      })
    },
  }
})
