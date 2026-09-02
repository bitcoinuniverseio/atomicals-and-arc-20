import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Link and route checks against the built site.
 *
 * These run over `site/dist`, which is what actually gets published, rather than over the
 * content sources. A link that resolves in source and 404s in the build is exactly the
 * failure worth catching.
 */
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'site/dist')
const siteMeta = JSON.parse(readFileSync(resolve(root, 'site/src/data/site.json'), 'utf8'))
const BASE = siteMeta.base.replace(/\/$/, '')

const built = existsSync(resolve(dist, 'index.html'))

function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  )
}

const files = built ? walk(dist) : []
const htmlFiles = files.filter((file) => file.endsWith('.html'))
const relativePaths = new Set(
  files.map((file) => `/${relative(dist, file).split('\\').join('/')}`),
)

/** Resolve an in-site href to the file the deployment would serve. */
function resolveHref(href) {
  const withoutHash = href.split('#')[0].split('?')[0]
  if (!withoutHash.startsWith(BASE)) return null
  let path = withoutHash.slice(BASE.length) || '/'
  if (path.endsWith('/')) path += 'index.html'
  if (!/\.[a-z0-9]+$/i.test(path)) path += '/index.html'
  return path
}

test('the site has been built before these checks run', () => {
  assert.ok(built, 'Run `npm run build` first. These checks read site/dist.')
})

test('the build produced every locale and a substantial page set', () => {
  assert.ok(htmlFiles.length > 900, `expected a large build, got ${htmlFiles.length} pages`)
  for (const locale of siteMeta.locales) {
    if (locale.code === siteMeta.defaultLocale) continue
    assert.ok(
      existsSync(resolve(dist, locale.code)),
      `locale ${locale.code} produced no routes`,
    )
  }
})

test('every required compatibility artefact exists at the site root', () => {
  const required = [
    'index.html',
    'about.html',
    'guide.html',
    'reference.html',
    'specification.md',
    'specification.html',
    'sources.md',
    'sources.html',
    'llms.txt',
    'llms-full.txt',
    'llms.html',
    '404.html',
    'robots.txt',
    'sitemap.xml',
    'manifest.json',
    'changelog.xml',
  ]
  for (const file of required) {
    assert.ok(existsSync(resolve(dist, file)), `missing compatibility artefact ${file}`)
  }
})

test('no internal link in the built HTML is broken', () => {
  const broken = []
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    const where = relative(dist, file).split('\\').join('/')
    for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const href = match[1]
      if (/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(href)) continue
      if (!href.startsWith('/')) continue
      const target = resolveHref(href)
      if (target === null) {
        broken.push(`${where}: ${href} is outside the base path ${BASE}`)
        continue
      }
      if (!relativePaths.has(target)) broken.push(`${where}: ${href} resolves to a missing ${target}`)
    }
  }
  assert.deepEqual(broken.slice(0, 25), [], `${broken.length} broken internal link(s)`)
})

test('every in-page anchor target exists on its own page', () => {
  const broken = []
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    const where = relative(dist, file).split('\\').join('/')
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]))
    ids.add('_top')
    for (const match of html.matchAll(/href="#([^"]+)"/g)) {
      const anchor = decodeURIComponent(match[1])
      if (!anchor) continue
      if (!ids.has(anchor)) broken.push(`${where}: #${anchor}`)
    }
  }
  assert.deepEqual(broken.slice(0, 25), [], `${broken.length} broken anchor(s)`)
})

test('every page declares a canonical link and a language', () => {
  const missing = []
  for (const file of htmlFiles) {
    if (file.endsWith('404.html')) continue
    const html = readFileSync(file, 'utf8')
    const where = relative(dist, file).split('\\').join('/')
    if (!/<link[^>]+rel="canonical"/.test(html)) missing.push(`${where}: no canonical link`)
    if (!/<html[^>]+lang="/.test(html)) missing.push(`${where}: no lang attribute`)
  }
  assert.deepEqual(missing.slice(0, 25), [], `${missing.length} page(s) missing metadata`)
})

test('every page has exactly one h1', () => {
  const problems = []
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    const count = [...html.matchAll(/<h1[\s>]/g)].length
    if (count !== 1) {
      problems.push(`${relative(dist, file).split('\\').join('/')}: ${count} h1 elements`)
    }
  }
  assert.deepEqual(problems.slice(0, 25), [], `${problems.length} page(s) with a bad h1 count`)
})

test('every image has an alt attribute', () => {
  const problems = []
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    for (const match of html.matchAll(/<img\b[^>]*>/g)) {
      if (!/\salt="/.test(match[0])) {
        problems.push(`${relative(dist, file).split('\\').join('/')}: ${match[0].slice(0, 80)}`)
      }
    }
  }
  assert.deepEqual(problems.slice(0, 25), [], `${problems.length} image(s) without alt text`)
})

test('every external link is safe to follow', () => {
  const problems = []
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    const where = relative(dist, file).split('\\').join('/')
    for (const match of html.matchAll(/<a\b[^>]*href="https?:\/\/[^"]*"[^>]*>/g)) {
      const tag = match[0]
      if (/target="_blank"/.test(tag) && !/rel="[^"]*noopener/.test(tag)) {
        problems.push(`${where}: target _blank without noopener`)
      }
      if (/\bhref="http:\/\//.test(tag)) problems.push(`${where}: insecure http link`)
    }
  }
  assert.deepEqual(problems.slice(0, 25), [], `${problems.length} unsafe external link(s)`)
})

test('the page manifest matches what was built', () => {
  const manifest = JSON.parse(readFileSync(resolve(dist, 'manifest.json'), 'utf8'))
  const missing = []
  for (const page of manifest.pages) {
    const target = resolveHref(page.href)
    if (!relativePaths.has(target)) missing.push(`${page.pageId}: ${page.href}`)
    const raw = `/raw/${page.routeId || 'index'}.md`
    if (!relativePaths.has(raw)) missing.push(`${page.pageId}: raw Markdown missing at ${raw}`)
  }
  assert.deepEqual(missing.slice(0, 25), [], `${missing.length} manifest entry problem(s)`)
})

test('the sitemap lists only routes that exist', () => {
  const sitemap = readFileSync(resolve(dist, 'sitemap.xml'), 'utf8')
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  assert.ok(locations.length > 100, 'the sitemap should list the full site')
  const missing = []
  for (const location of locations) {
    const path = new URL(location).pathname
    const target = resolveHref(path)
    if (!relativePaths.has(target)) missing.push(location)
  }
  assert.deepEqual(missing.slice(0, 25), [], `${missing.length} sitemap entry problem(s)`)
})

test('the LLM files are complete and label their layers', () => {
  const llms = readFileSync(resolve(dist, 'llms.txt'), 'utf8')
  const full = readFileSync(resolve(dist, 'llms-full.txt'), 'utf8')

  assert.match(llms, /Protocol behavior/)
  assert.match(llms, /Universe implementation/)
  assert.match(llms, /Proposed or experimental/)
  assert.match(llms, /8df23747835c20230fc8b8097d469e7a1d97c3e0/)
  assert.ok(llms.length > 8_000, 'llms.txt should be a substantial orientation file')

  assert.ok(full.length > 100_000, 'llms-full.txt should carry the complete content')
  assert.match(full, /Applicability: protocol-behavior/)
  assert.match(full, /Applicability: universe-implementation/)
  assert.match(full, /Applicability: experimental/)
})

test('the generated specification carries its pin and its vectors', () => {
  const specification = readFileSync(resolve(dist, 'specification.md'), 'utf8')
  assert.match(specification, /8df23747835c20230fc8b8097d469e7a1d97c3e0/)
  assert.match(specification, /v1\.5\.2\.0/)
  assert.match(specification, /oversized-next-output/)
  assert.match(specification, /does not establish an ARC-721 standard/)
})

test('the source ledger lists every pinned source', () => {
  const sources = readFileSync(resolve(dist, 'sources.md'), 'utf8')
  const manifest = JSON.parse(readFileSync(resolve(root, 'contracts/source-manifest.json'), 'utf8'))
  for (const source of manifest.sources) {
    assert.ok(sources.includes(source.id), `sources.md is missing ${source.id}`)
  }
})

test('no built artefact leaks a credential or an infrastructure host', () => {
  const FORBIDDEN = [
    /\bghp_[A-Za-z0-9]{20,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bhstgr\.cloud\b/,
    /\bB2_APPLICATION_KEY\b/,
    /\bARC20_SOURCE_BEARER_TOKEN\s*=/,
  ]
  const hits = []
  for (const file of files) {
    if (/\.(png|jpe?g|gif|webp|avif|woff2?|ico|pf_fragment|pf_index|pf_meta|wasm)$/i.test(file)) {
      continue
    }
    const text = readFileSync(file, 'utf8')
    for (const pattern of FORBIDDEN) {
      if (pattern.test(text)) hits.push(`${relative(dist, file)}: ${pattern}`)
    }
  }
  assert.deepEqual(hits, [], 'built artefacts must contain no credential or infrastructure host')
})

test('robots.txt allows crawling and points at the sitemap', () => {
  const robots = readFileSync(resolve(dist, 'robots.txt'), 'utf8')
  assert.match(robots, /User-agent: \*/)
  assert.match(robots, /Allow: \//)
  assert.match(robots, /Sitemap: https:\/\//)
})

test('the changelog feed is a valid Atom document with at least one entry', () => {
  const feed = readFileSync(resolve(dist, 'changelog.xml'), 'utf8')
  assert.match(feed, /<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom">/)
  assert.match(feed, /<entry>/)
  assert.match(feed, /<updated>\d{4}-\d{2}-\d{2}T/)
})

test('the search index was generated', () => {
  assert.ok(existsSync(resolve(dist, 'pagefind')), 'pagefind assets are missing')
  assert.ok(
    readdirSync(resolve(dist, 'pagefind')).some((name) => name.endsWith('.js')),
    'pagefind script is missing',
  )
})
