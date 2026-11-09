import { withBasePath } from './base-path'

export type ShareLinkLanguage = 'viewer' | 'en' | 'zh'

/**
 * The public URL for a share link. A link whose language is not "viewer" carries
 * `?lang=` so the recipient gets that language on the first paint; the proxy
 * writes the locale cookie and redirects to the clean URL. The share page also
 * applies the stored language as a fallback when a bare token URL is opened.
 */
export function sharePageUrl(
  token: string,
  language?: ShareLinkLanguage | null,
  origin?: string,
): string {
  const path = withBasePath(`/share/${token}`)
  const base = origin ? `${origin}${path}` : path
  return language === 'en' || language === 'zh' ? `${base}?lang=${language}` : base
}
