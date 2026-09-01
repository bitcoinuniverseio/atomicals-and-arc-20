/**
 * Reads the documentation content collection without Astro, so generators and tests
 * can work from the same source the site builds from.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export const docsRoot = resolve(root, 'site/src/content/docs')
export const siteMeta = JSON.parse(
  readFileSync(resolve(root, 'site/src/data/site.json'), 'utf8'),
)
export const sourceManifest = JSON.parse(
  readFileSync(resolve(root, 'contracts/source-manifest.json'), 'utf8'),
)

const LOCALE_CODES = new Set(siteMeta.locales.map((locale) => locale.code))

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  )
}

/** Minimal YAML reader for the frontmatter shapes this repository actually uses. */
export function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { data: {}, body: text }
  const body = text.slice(match[0].length)
  const lines = match[1].split(/\r?\n/)

  const rootValue = {}
  /** @type {{ indent: number, value: any }[]} */
  const stack = [{ indent: -1, value: rootValue }]

  const scalar = (raw) => {
    const value = raw.trim()
    if (value === '') return ''
    if (value === 'true') return true
    if (value === 'false') return false
    if (value === 'null') return null
    if (/^-?\d+$/.test(value)) return Number(value)
    if (/^'.*'$/.test(value) || /^".*"$/.test(value)) return value.slice(1, -1)
    if (/^\[.*\]$/.test(value)) {
      const inner = value.slice(1, -1).trim()
      if (!inner) return []
      return inner.split(',').map((item) => scalar(item))
    }
    return value
  }

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const indent = line.length - line.trimStart().length
    const trimmed = line.trim()

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop()
    const parent = stack[stack.length - 1].value

    if (trimmed.startsWith('- ')) {
      const item = trimmed.slice(2)
      if (!Array.isArray(parent)) continue
      const inlineKey = item.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
      if (inlineKey) {
        const object = {}
        object[inlineKey[1]] = scalar(inlineKey[2])
        parent.push(object)
        stack.push({ indent, value: object })
      } else {
        parent.push(scalar(item))
      }
      continue
    }

    const keyMatch = trimmed.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!keyMatch) continue
    const [, key, rest] = keyMatch

    if (rest === '') {
      // Look ahead is unnecessary: an empty value is either a map or a list, and the
      // next line's shape decides. Start as an object and convert on the first list item.
      const container = new Proxy([], {})
      const holder = { object: {}, list: [] }
      const value = holder
      Object.defineProperty(value, '__container', { value: container, enumerable: false })
      // Simpler: decide by peeking at the following non-empty line.
      const index = lines.indexOf(line)
      let next = ''
      for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
        if (lines[cursor].trim()) {
          next = lines[cursor]
          break
        }
      }
      const isList = next.trim().startsWith('- ')
      const created = isList ? [] : {}
      if (Array.isArray(parent)) parent.push({ [key]: created })
      else parent[key] = created
      stack.push({ indent, value: created })
      continue
    }

    if (Array.isArray(parent)) {
      const last = parent[parent.length - 1]
      if (last && typeof last === 'object') last[key] = scalar(rest)
    } else {
      parent[key] = scalar(rest)
    }
  }

  return { data: rootValue, body }
}

export function contentHash(body) {
  return createHash('sha256').update(body.replace(/\s+/g, ' ').trim(), 'utf8').digest('hex')
}

/** Route id relative to the docs root, without extension, with `index` collapsed. */
export function routeIdFor(file) {
  return relative(docsRoot, file)
    .split('\\')
    .join('/')
    .replace(/\.mdx?$/, '')
    .replace(/\/index$/, '')
}

export function localeOf(routeId) {
  const head = routeId.split('/')[0]
  return LOCALE_CODES.has(head) && head !== siteMeta.defaultLocale ? head : siteMeta.defaultLocale
}

export function stripLocale(routeId) {
  const head = routeId.split('/')[0]
  if (LOCALE_CODES.has(head) && head !== siteMeta.defaultLocale) {
    return routeId.split('/').slice(1).join('/')
  }
  return routeId
}

export function loadPages() {
  const files = walk(docsRoot).filter((name) => /\.mdx?$/.test(name))
  return files
    .map((file) => {
      const text = readFileSync(file, 'utf8')
      const { data, body } = parseFrontmatter(text)
      const routeId = routeIdFor(file)
      const locale = localeOf(routeId)
      return {
        file,
        routeId,
        locale,
        baseRoute: stripLocale(routeId),
        title: data.title ?? '',
        description: data.description ?? '',
        provenance: data.provenance ?? {},
        sidebar: data.sidebar ?? {},
        body,
        hash: contentHash(body),
      }
    })
    .sort((a, b) => a.routeId.localeCompare(b.routeId))
}

/** Body with MDX imports and component tags removed, so it reads as plain Markdown. */
export function toPlainMarkdown(body) {
  return body
    .replace(/^import\s+[^\n]+\n/gm, '')
    .replace(/<([A-Z][A-Za-z0-9]*)\b[^>]*\/>/g, '')
    .replace(/<\/?([A-Z][A-Za-z0-9]*)\b[^>]*>/g, '')
    .replace(/^\s*cards=\{\[[\s\S]*?\]\}\s*$/gm, '')
    .replace(/^\s*facts=\{\[[\s\S]*?\]\}\s*$/gm, '')
    .replace(/^\s*only=\{\[[^\]]*\]\}\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function urlFor(routeId) {
  const base = siteMeta.base.replace(/\/$/, '')
  return routeId ? `${base}/${routeId}/` : `${base}/`
}

export function absoluteUrlFor(routeId) {
  return new URL(urlFor(routeId), siteMeta.site).href
}
