#!/usr/bin/env node
/**
 * Verifies the real production origin, not a local build.
 *
 * It checks status codes, canonical tags, navigation, search assets, raw
 * Markdown, the LLM files, every compatibility route, the contract downloads,
 * one route per locale, and the version routes. A failure here means the
 * deployment does not serve what the build produced.
 *
 * Usage: node scripts/verify-deployment.mjs [--origin https://host/base]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const siteMeta = JSON.parse(readFileSync(resolve(root, 'site/src/data/site.json'), 'utf8'))
const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8'))

const args = process.argv.slice(2)
const originIndex = args.indexOf('--origin')
const base = (
  originIndex >= 0 ? args[originIndex + 1] : siteMeta.productionUrl
).replace(/\/$/, '')

const TIMEOUT_MS = 20_000
const sleep = (ms) => new Promise((done) => setTimeout(done, ms))

const results = []
let failures = 0

async function get(path, { method = 'GET' } = {}) {
  const url = `${base}${path}`
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const response = await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': 'atomicals-docs-deployment-verify' },
      })
      const text = method === 'GET' ? await response.text() : ''
      return { url, status: response.status, headers: response.headers, text }
    } catch (error) {
      if (attempt === 3) return { url, status: 0, error: (error && error.name) || 'error', text: '' }
      await sleep(attempt * 2000)
    } finally {
      clearTimeout(timer)
    }
  }
  return { url, status: 0, text: '' }
}

function record(name, ok, detail) {
  results.push({ name, ok, detail })
  if (!ok) failures += 1
  process.stdout.write(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? `: ${detail}` : ''}\n`)
}

async function expectOk(path, name, assertions = []) {
  const response = await get(path)
  if (response.status !== 200) {
    record(name, false, `status ${response.status}${response.error ? ` (${response.error})` : ''}`)
    return response
  }
  for (const assertion of assertions) {
    if (!assertion.test(response.text)) {
      record(name, false, `served, but ${assertion.describe}`)
      return response
    }
  }
  record(name, true)
  return response
}

process.stdout.write(`Verifying ${base}\n\n`)

// ---------------------------------------------------------------- the home page

const home = await expectOk('/', 'home page', [
  {
    describe: 'no canonical link',
    test: (text) => /<link[^>]+rel="canonical"/.test(text),
  },
  {
    describe: 'no site navigation',
    test: (text) => /class="[^"]*sidebar/.test(text) || /<nav\b/.test(text),
  },
  {
    describe: 'no search control',
    test: (text) => /site-search|pagefind/.test(text),
  },
  {
    describe: 'no documentation version meta tag',
    test: (text) => /name="bu:docs-version"/.test(text),
  },
])

if (home.status === 200) {
  const canonical = home.text.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1]
  record(
    'canonical points at the published origin',
    Boolean(canonical && canonical.startsWith(siteMeta.site)),
    canonical ?? 'no canonical href',
  )
}

// ------------------------------------------------------- compatibility routes

for (const route of [
  '/index.html',
  '/about.html',
  '/guide.html',
  '/reference.html',
  '/specification.html',
  '/sources.html',
  '/llms.html',
  '/404.html',
]) {
  await expectOk(route, `compatibility route ${route}`)
}

for (const route of ['/specification.md', '/sources.md', '/llms.txt', '/llms-full.txt']) {
  await expectOk(route, `raw artefact ${route}`)
}

// ------------------------------------------------------------- machine outputs

await expectOk('/robots.txt', 'robots.txt', [
  { describe: 'no sitemap reference', test: (text) => /Sitemap: https:\/\//.test(text) },
])
await expectOk('/sitemap.xml', 'sitemap.xml', [
  { describe: 'not a sitemap document', test: (text) => /<urlset/.test(text) },
])
await expectOk('/changelog.xml', 'changelog feed', [
  { describe: 'not an Atom feed', test: (text) => /<feed xmlns/.test(text) },
])
await expectOk('/manifest.json', 'page manifest', [
  { describe: 'no pages listed', test: (text) => /"pages"\s*:\s*\[/.test(text) },
])

for (const contract of [
  '/contracts/openapi/arc20.json',
  '/contracts/openapi/atomicals-nfts-realms.json',
  '/contracts/openapi/marketplace-v1.json',
  '/contracts/schemas/common.schema.json',
  '/contracts/source-manifest.json',
  '/contracts/cli-inventory.json',
  '/contracts/aip-registry.json',
  '/contracts/avm-opcodes.json',
  '/contracts/ecosystem.json',
  '/conformance/vectors/arc20-allocation.json',
]) {
  await expectOk(contract, `contract download ${contract}`)
}

// ------------------------------------------------------------------- raw pages

for (const pageId of [
  'index',
  'protocol/arc20/allocation',
  'protocol/arc20/burns',
  'guides/transfer-arc20',
  'reference/cli',
]) {
  await expectOk(`/raw/${pageId}.md`, `raw Markdown ${pageId}`, [
    { describe: 'no page id header', test: (text) => /Page ID: /.test(text) },
  ])
}

// ------------------------------------------------------------------- locales

for (const locale of siteMeta.locales) {
  const prefix = locale.code === siteMeta.defaultLocale ? '' : `/${locale.code}`
  await expectOk(`${prefix}/start/what-is-arc-20/`, `locale ${locale.code}`, [
    {
      describe: `lang is not ${locale.lang}`,
      test: (text) => new RegExp(`<html[^>]*lang="${locale.lang}"`).test(text),
    },
  ])
}

// -------------------------------------------------------- representative routes

for (const route of [
  '/start/safety-fundamentals/',
  '/protocol/overview/',
  '/protocol/arc20/allocation/',
  '/protocol/avm/status-and-limitations/',
  '/guides/',
  '/develop/',
  '/reference/openapi/',
  '/tools/allocation-visualizer/',
  '/ecosystem/',
  '/releases/versions/',
  '/contribute/',
]) {
  await expectOk(route, `route ${route}`)
}

// ---------------------------------------------------------------- search index

await expectOk('/pagefind/pagefind.js', 'search index script')

// --------------------------------------------------------------- 404 behaviour

const notFound = await get('/this-route-does-not-exist/')
record(
  '404 route serves the not found page',
  notFound.status === 404 || /Page not found|404/i.test(notFound.text),
  `status ${notFound.status}`,
)

// -------------------------------------------------- the deployment is current

const deployedManifest = await get('/manifest.json')
if (deployedManifest.status === 200) {
  try {
    const parsed = JSON.parse(deployedManifest.text)
    record(
      'deployed page count matches this commit',
      parsed.pageCount === manifest.pageCount,
      `deployed ${parsed.pageCount}, expected ${manifest.pageCount}`,
    )
    record(
      'deployed documentation version matches this commit',
      parsed.documentationVersion === manifest.documentationVersion,
      `deployed ${parsed.documentationVersion}`,
    )
  } catch {
    record('deployed manifest parses', false, 'the served manifest is not valid JSON')
  }
}

// ---------------------------------------------------------------------- report

const report = {
  reportVersion: '1.0.0',
  origin: base,
  checkedAt: new Date().toISOString(),
  checks: results.length,
  failures,
  results,
}
writeFileSync(resolve(root, 'deployment-verification.json'), `${JSON.stringify(report, null, 2)}\n`)

process.stdout.write(`\n${results.length - failures}/${results.length} checks passed\n`)
if (failures > 0) process.exit(1)
