import { defineMdastPlugin } from 'satteri'
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
 *
 * JSX component props are not Markdown links, so components resolve their own
 * hrefs through `src/lib/href.ts`. The two paths are checked together by
 * `tests/links.test.mjs`, which walks the built HTML.
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

function visitLink(node, ctx) {
  const prefix = localePrefixFor(ctx.fileURL?.pathname ?? ctx.fileURL)
  const next = rewriteHref(node.url, prefix)
  if (next) ctx.setProperty(node, 'url', next)
}

export const docLinksPlugin = () =>
  defineMdastPlugin({
    name: 'bu-doc-links',
    link: visitLink,
    definition: visitLink,
  })

export default docLinksPlugin
