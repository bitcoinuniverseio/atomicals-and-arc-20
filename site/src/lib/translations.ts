import { getCollection, type CollectionEntry } from 'astro:content'
import { createHash } from 'node:crypto'
import siteMeta from '../data/site.json'

export const LOCALE_CODES = siteMeta.locales.map((locale) => locale.code)
export const NON_DEFAULT_LOCALES = LOCALE_CODES.filter(
  (code) => code !== siteMeta.defaultLocale,
)

/** Strip the locale prefix from a Starlight route id. `pt/start/x` -> `start/x`. */
export function stripLocale(routeId: string): string {
  const [head, ...rest] = routeId.split('/')
  return NON_DEFAULT_LOCALES.includes(head) ? rest.join('/') : routeId
}

export function localeOf(routeId: string): string {
  const head = routeId.split('/')[0]
  return NON_DEFAULT_LOCALES.includes(head) ? head : siteMeta.defaultLocale
}

/**
 * Stable hash of an English page body, used to detect translations that fell behind.
 * Whitespace is normalised so a reflow does not invalidate every translation.
 */
export function sourceHash(body: string): string {
  return createHash('sha256').update(body.replace(/\s+/g, ' ').trim(), 'utf8').digest('hex')
}

let englishHashes: Map<string, string> | null = null

async function loadEnglishHashes(): Promise<Map<string, string>> {
  if (englishHashes) return englishHashes
  const entries = (await getCollection('docs')) as CollectionEntry<'docs'>[]
  englishHashes = new Map()
  for (const entry of entries) {
    if (localeOf(entry.id) !== siteMeta.defaultLocale) continue
    englishHashes.set(stripLocale(entry.id), sourceHash(entry.body ?? ''))
  }
  return englishHashes
}

export async function isStaleTranslation(
  routeId: string,
  provenance: { translationSourceHash?: string },
): Promise<boolean> {
  if (!provenance.translationSourceHash) return false
  if (localeOf(routeId) === siteMeta.defaultLocale) return false
  const hashes = await loadEnglishHashes()
  const current = hashes.get(stripLocale(routeId))
  if (!current) return false
  return current !== provenance.translationSourceHash
}
