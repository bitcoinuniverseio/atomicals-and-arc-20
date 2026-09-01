import { defineHastPlugin } from 'satteri'
import siteMeta from '../data/site.json' with { type: 'json' }

const BASE = siteMeta.base.replace(/\/$/, '')
const DEFAULT_LOCALE = siteMeta.defaultLocale
const LOCALES = new Set(siteMeta.locales.map((locale) => locale.code))

/**
 * Content is authored with root-relative links such as `/protocol/arc20/burns/`.
 * This plugin rewrites them to the deployed base path and keeps the reader inside
 * their current locale, so one Markdown source works for every language without
 * hand-counting `../` segments and without hard-coding the Pages base path.
 *
 * Starlight generates a fallback route for every page in every configured locale,
 * so a localised href always resolves even before that translation exists.
 */
export function localePrefixFor(fileUrl) {
  const path = String(fileUrl ?? '').replace(/\\/g, '/')
  const marker = path.indexOf('/src/content/docs/')
  if (marker === -1) return BASE
  const rest = path.slice(marker + '/src/content/docs/'.length)
  const head = rest.split('/')[0]
  if (LOCALES.has(head) && head !== DEFAULT_LOCALE) return `${BASE}/${head}`
  return BASE
}

export function rewriteHref(href, prefix) {
  if (typeof href !== 'string') return null
  if (!href.startsWith('/')) return null
  if (href.startsWith('//')) return null
  if (BASE && href.startsWith(`${BASE}/`)) return null
  return `${prefix}${href}`
}

export const docLinksPlugin = () =>
  defineHastPlugin({
    name: 'bu-doc-links',
    element: {
      filter: ['a'],
      visit(node, ctx) {
        const prefix = localePrefixFor(ctx.fileURL?.pathname ?? ctx.fileURL)
        const next = rewriteHref(node.properties?.href, prefix)
        if (next) ctx.setProperty(node, 'properties', { ...node.properties, href: next })
      },
    },
  })

export default docLinksPlugin
