import siteMeta from '../data/site.json'

const BASE = siteMeta.base.replace(/\/$/, '')

/**
 * Resolve a root-relative documentation path to the deployed URL for one locale.
 * Components take hrefs written as `/protocol/arc20/burns/` so authors never
 * hand-count `../` segments, and never hard-code the Pages base path.
 */
export function docHref(path: string, locale?: string | undefined): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith('mailto:')) return path
  if (!path.startsWith('/')) return path
  if (BASE && path.startsWith(`${BASE}/`)) return path
  const prefix = locale && locale !== siteMeta.defaultLocale ? `${BASE}/${locale}` : BASE
  return `${prefix}${path}`
}
