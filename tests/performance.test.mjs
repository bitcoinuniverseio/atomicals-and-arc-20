import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync, brotliCompressSync, constants } from 'node:zlib'

/**
 * Performance budgets, enforced as a failing check rather than a report.
 *
 * These measure what a browser actually downloads for a page: the scripts and
 * stylesheets it links, compressed the way a server would send them. A budget
 * that only reports is a budget that gets exceeded.
 */
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'site/dist')

const BUDGETS = {
  // An ordinary documentation page. The interactive tool pages are allowed more,
  // and are measured separately below.
  ordinaryPageJsKib: 150,
  ordinaryPageCssKib: 75,
  // A tool page loads its own island in addition to the shell.
  toolPageJsKib: 260,
  // Any single asset. A larger one would dominate the critical path.
  singleAssetKib: 200,
  // Uncompressed HTML for one page.
  pageHtmlKib: 260,
}

function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  )
}

const built = existsSync(resolve(dist, 'index.html'))
const files = built ? walk(dist) : []
const htmlFiles = files.filter((file) => file.endsWith('.html'))
const where = (file) => relative(dist, file).split('\\').join('/')

/** Compressed transfer size, using brotli the way a static host would. */
const compressedCache = new Map()
function compressedKib(assetPath) {
  if (compressedCache.has(assetPath)) return compressedCache.get(assetPath)
  const absolute = resolve(dist, assetPath.replace(/^\//, '').replace(/^atomicals-and-arc-20\//, ''))
  if (!existsSync(absolute)) {
    compressedCache.set(assetPath, 0)
    return 0
  }
  const bytes = readFileSync(absolute)
  const compressed = brotliCompressSync(bytes, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  })
  const kib = compressed.length / 1024
  compressedCache.set(assetPath, kib)
  return kib
}

/** Assets a page links, resolved to paths inside dist. */
function pageAssets(file) {
  const html = readFileSync(file, 'utf8')
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1])
  const styles = [
    ...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"/g),
    ...html.matchAll(/<link[^>]+href="([^"]+)"[^>]*rel="stylesheet"/g),
  ].map((match) => match[1])
  const inlineScript = [...html.matchAll(/<script(?![^>]+src=)[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1])
    .join('\n')
  const inlineStyle = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map((match) => match[1])
    .join('\n')
  return { scripts, styles, inlineScript, inlineStyle }
}

function inlineKib(text) {
  if (!text.trim()) return 0
  return brotliCompressSync(Buffer.from(text, 'utf8'), {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  }).length / 1024
}

// Representative routes, one per template, in the default locale.
const REPRESENTATIVE = [
  'index.html',
  'start/what-is-arc-20/index.html',
  'protocol/arc20/allocation/index.html',
  'guides/transfer-arc20/index.html',
  'reference/cli/index.html',
  'reference/api/marketplace-v1/index.html',
  'ecosystem/index.html',
  'releases/index.html',
]

const TOOL_ROUTES = [
  'tools/allocation-visualizer/index.html',
  'tools/transaction-inspector/index.html',
  'tools/bitwork-estimator/index.html',
  'tools/cli-builder/index.html',
  'tools/api-explorer/index.html',
]

test('the site has been built before these checks run', () => {
  assert.ok(built, 'Run `npm run build` first. These checks read site/dist.')
})

test('ordinary documentation pages stay within the JavaScript budget', () => {
  const failures = []
  for (const route of REPRESENTATIVE) {
    const file = resolve(dist, route)
    assert.ok(existsSync(file), `representative route missing: ${route}`)
    const assets = pageAssets(file)
    const total =
      assets.scripts.reduce((sum, asset) => sum + compressedKib(asset), 0) +
      inlineKib(assets.inlineScript)
    if (total > BUDGETS.ordinaryPageJsKib) {
      failures.push(`${route}: ${total.toFixed(1)} KiB of JavaScript`)
    }
  }
  assert.deepEqual(
    failures,
    [],
    `pages over the ${BUDGETS.ordinaryPageJsKib} KiB compressed JavaScript budget`,
  )
})

test('ordinary documentation pages stay within the CSS budget', () => {
  const failures = []
  for (const route of REPRESENTATIVE) {
    const file = resolve(dist, route)
    const assets = pageAssets(file)
    const total =
      assets.styles.reduce((sum, asset) => sum + compressedKib(asset), 0) +
      inlineKib(assets.inlineStyle)
    if (total > BUDGETS.ordinaryPageCssKib) {
      failures.push(`${route}: ${total.toFixed(1)} KiB of CSS`)
    }
  }
  assert.deepEqual(failures, [], `pages over the ${BUDGETS.ordinaryPageCssKib} KiB compressed CSS budget`)
})

test('interactive tool pages stay within their own budget', () => {
  const failures = []
  for (const route of TOOL_ROUTES) {
    const file = resolve(dist, route)
    assert.ok(existsSync(file), `tool route missing: ${route}`)
    const assets = pageAssets(file)
    const total =
      assets.scripts.reduce((sum, asset) => sum + compressedKib(asset), 0) +
      inlineKib(assets.inlineScript)
    if (total > BUDGETS.toolPageJsKib) {
      failures.push(`${route}: ${total.toFixed(1)} KiB of JavaScript`)
    }
  }
  assert.deepEqual(failures, [], `tool pages over the ${BUDGETS.toolPageJsKib} KiB budget`)
})

test('tool code is code split, so it is not on every page', () => {
  const homeAssets = pageAssets(resolve(dist, 'index.html'))
  const toolAssets = pageAssets(resolve(dist, 'tools/allocation-visualizer/index.html'))
  const homeScripts = new Set(homeAssets.scripts)
  const toolOnly = toolAssets.scripts.filter((asset) => !homeScripts.has(asset))
  assert.ok(
    toolOnly.length > 0,
    'the allocation visualizer must ship its own bundle rather than being in the shared shell',
  )
})

test('no single built asset dominates the critical path', () => {
  const oversized = []
  for (const file of files) {
    if (!/\.(js|css)$/.test(file)) continue
    const kib =
      brotliCompressSync(readFileSync(file), {
        params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
      }).length / 1024
    if (kib > BUDGETS.singleAssetKib) oversized.push(`${where(file)}: ${kib.toFixed(1)} KiB`)
  }
  assert.deepEqual(oversized, [], `assets over ${BUDGETS.singleAssetKib} KiB compressed`)
})

test('no page ships an excessive amount of HTML', () => {
  const oversized = []
  for (const file of htmlFiles) {
    const kib = statSync(file).size / 1024
    if (kib > BUDGETS.pageHtmlKib) oversized.push(`${where(file)}: ${kib.toFixed(1)} KiB`)
  }
  assert.deepEqual(oversized.slice(0, 10), [], `${oversized.length} page(s) over the HTML budget`)
})

test('built assets are content hashed so they can be cached immutably', () => {
  const assets = files.filter((file) => where(file).startsWith('_astro/'))
  assert.ok(assets.length > 0, 'the build should emit hashed assets')
  // Five characters is the shortest hash anything in this build emits: Expressive Code
  // names its shared assets ec.<hash>.js. What an immutable cache header needs is that
  // the name changes when the bytes do, not that the hash is a particular width.
  const unhashed = assets.filter((file) =>
    !/\.[A-Za-z0-9_-]{5,}\.(js|css|woff2?|svg|png|jpg)$/.test(file),
  )
  assert.deepEqual(
    unhashed.map(where).slice(0, 10),
    [],
    'every asset under _astro must carry a content hash',
  )
})

test('no page loads a third-party script or stylesheet', () => {
  const external = []
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    for (const match of html.matchAll(/<script[^>]+src="(https?:\/\/[^"]+)"/g)) {
      external.push(`${where(file)}: script ${match[1]}`)
    }
    for (const match of html.matchAll(/<link[^>]+rel="stylesheet"[^>]*href="(https?:\/\/[^"]+)"/g)) {
      external.push(`${where(file)}: stylesheet ${match[1]}`)
    }
  }
  assert.deepEqual(external.slice(0, 10), [], 'no third-party script or stylesheet is permitted')
})

test('every image element declares its dimensions, so nothing shifts', () => {
  const problems = []
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    for (const match of html.matchAll(/<img\b[^>]*>/g)) {
      const tag = match[0]
      const sized = /\swidth="/.test(tag) && /\sheight="/.test(tag)
      const styled = /style="[^"]*(?:aspect-ratio|width)/.test(tag)
      if (!sized && !styled) problems.push(`${where(file)}: ${tag.slice(0, 90)}`)
    }
  }
  assert.deepEqual(problems.slice(0, 10), [], `${problems.length} unbounded image(s)`)
})

test('diagrams declare a viewBox, so they scale without shifting layout', () => {
  const problems = []
  for (const file of htmlFiles.slice(0, 200)) {
    const html = readFileSync(file, 'utf8')
    for (const match of html.matchAll(/<svg\b[^>]*>/g)) {
      if (!/viewBox="/.test(match[0])) problems.push(`${where(file)}: svg without a viewBox`)
    }
  }
  assert.deepEqual(problems.slice(0, 10), [], `${problems.length} svg(s) without a viewBox`)
})

test('the search index is present but not loaded on every page', () => {
  assert.ok(existsSync(resolve(dist, 'pagefind')), 'the search index must be built')
  const home = readFileSync(resolve(dist, 'index.html'), 'utf8')
  assert.doesNotMatch(
    home,
    /<script[^>]+src="[^"]*pagefind[^"]*\.js"[^>]*><\/script>/,
    'the search index must load on demand, not on first paint',
  )
})

test('gzip is also within budget, for hosts that do not serve brotli', () => {
  const failures = []
  for (const route of REPRESENTATIVE) {
    const file = resolve(dist, route)
    const assets = pageAssets(file)
    let total = 0
    for (const asset of assets.scripts) {
      const absolute = resolve(dist, asset.replace(/^\//, '').replace(/^atomicals-and-arc-20\//, ''))
      if (existsSync(absolute)) total += gzipSync(readFileSync(absolute), { level: 9 }).length / 1024
    }
    if (assets.inlineScript.trim()) {
      total += gzipSync(Buffer.from(assets.inlineScript, 'utf8'), { level: 9 }).length / 1024
    }
    // Gzip is allowed a modest allowance over brotli.
    if (total > BUDGETS.ordinaryPageJsKib * 1.2) {
      failures.push(`${route}: ${total.toFixed(1)} KiB gzipped JavaScript`)
    }
  }
  assert.deepEqual(failures, [], 'pages over the gzip JavaScript budget')
})

/**
 * Reproducibility.
 *
 * The built site is committed to the repository root, so the build has to be a
 * function of the working tree alone. Anything derived from the commit history
 * makes the published HTML one commit stale by construction, and no rebuild can
 * ever close the gap. Starlight's git-derived "last updated" footer is the one
 * source of that in this stack, and it is switched off in astro.config.mjs.
 */
test('no built page carries a commit-derived timestamp', () => {
  const offenders = []
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8')
    for (const match of html.matchAll(/<time datetime="([^"]+)"/g)) {
      offenders.push(`${where(file)}: ${match[1]}`)
    }
  }
  assert.deepEqual(
    offenders.slice(0, 10),
    [],
    `${offenders.length} page(s) render a timestamp the working tree does not determine`,
  )
})
