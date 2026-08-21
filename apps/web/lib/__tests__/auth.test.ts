import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setTokens, getAccessToken, getRefreshToken, clearTokens } from '../auth'

describe('Token management', () => {
  beforeEach(() => {
    // Node 26 exposes no localStorage unless a storage file is provided (CI runs
    // Node 20 where jsdom provides it); stub a working in-memory store instead.
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v) },
      removeItem: (k: string) => { store.delete(k) },
      clear: () => { store.clear() },
      key: (i: number) => Array.from(store.keys())[i] ?? null,
      get length() { return store.size },
    })
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('setTokens stores access and refresh tokens in localStorage', () => {
    setTokens('access-123', 'refresh-456')
    expect(localStorage.getItem('ff_access_token')).toBe('access-123')
    expect(localStorage.getItem('ff_refresh_token')).toBe('refresh-456')
  })

  it('getAccessToken retrieves access token from localStorage', () => {
    localStorage.setItem('ff_access_token', 'my-access-token')
    expect(getAccessToken()).toBe('my-access-token')
  })

  it('getAccessToken returns null when no token stored', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('getRefreshToken retrieves refresh token from localStorage', () => {
    localStorage.setItem('ff_refresh_token', 'my-refresh-token')
    expect(getRefreshToken()).toBe('my-refresh-token')
  })

  it('getRefreshToken returns null when no token stored', () => {
    expect(getRefreshToken()).toBeNull()
  })

  it('clearTokens removes both tokens from localStorage', () => {
    localStorage.setItem('ff_access_token', 'access-123')
    localStorage.setItem('ff_refresh_token', 'refresh-456')

    // Mock window.location.href setter to avoid navigation errors
    const locationMock = { href: '' }
    Object.defineProperty(window, 'location', {
      value: locationMock,
      writable: true,
    })

    clearTokens()

    expect(localStorage.getItem('ff_access_token')).toBeNull()
    expect(localStorage.getItem('ff_refresh_token')).toBeNull()
  })

  it('clearTokens redirects to /login', () => {
    const locationMock = { href: '' }
    Object.defineProperty(window, 'location', {
      value: locationMock,
      writable: true,
    })

    clearTokens()

    expect(window.location.href).toBe('/login')
  })
})
