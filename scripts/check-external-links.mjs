#!/usr/bin/env node
/**
 * Verifies the external links in the built site.
 *
 * Design constraints that matter here:
 *   - A network failure is not a broken link. It is recorded as unreachable.
 *   - A rate limit is honoured with backoff, not hammered through.
 *   - Each host is checked serially, so this never behaves like a crawler.
 *   - Results are cached per URL within a run, so a link used on 900 pages is
 *     fetched once.
 *   - An allowlist covers hosts that refuse automated requests by policy. Each
 *     entry names why, so the list cannot quietly become a way to hide failures.
 *
 * Usage: node scripts/check-external-links.mjs --report external-links.json
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'site/dist')

const args = process.argv.slice(2)
const reportIndex = args.indexOf('--report')
const reportPath = reportIndex >= 0 ? resolve(root, args[reportIndex + 1]) : null

/**
 * Hosts that are not fetched, each with the reason. Reviewed on every change.
 * An entry here is a statement that a check would be meaningless, never that a
 * failure is acceptable.
 */
const ALLOWLIST = [
  {
    host: 'example.com',
    reason: 'Reserved for documentation by RFC 2606. Never a real destination.',
  },
  {
    host: 'localhost',
    reason: 'A local development origin, by definition not reachable from CI.',
  },
]

const TIMEOUT_MS = 15_000
const MAX_ATTEMPTS = 3
const PER_HOST_DELAY_MS = 750

function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  )
}

if (!existsSync(resolve(dist, 'index.html'))) {
  process.stderr.write('Build the site first. This checker reads site/dist.\n')
  process.exit(1)
}

/** url -> set of pages that link to it */
const links = new Map()
for (const file of walk(dist).filter((name) => name.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8')
  const page = relative(dist, file).split('\\').join('/')
  for (const match of html.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    const url = match[1].replace(/[.,)]+$/, '')
    const pages = links.get(url) ?? new Set()
    pages.add(page)
    links.set(url, pages)
  }
}

const byHost = new Map()
for (const url of links.keys()) {
  let host
  try {
    host = new URL(url).host
  } catch {
    host = 'invalid'
  }
  const bucket = byHost.get(host) ?? []
  bucket.push(url)
  byHost.set(host, bucket)
}

function allowlisted(host) {
  return ALLOWLIST.find((entry) => host === entry.host || host.endsWith(`.${entry.host}`))
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms))

async function check(url) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      // HEAD first, because it is the polite request. Some hosts refuse it, so
      // fall back to a ranged GET rather than reporting a false failure.
      let response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': 'atomicals-docs-link-check' },
      })
      if (response.status === 405 || response.status === 501) {
        response = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers: { 'user-agent': 'atomicals-docs-link-check', range: 'bytes=0-1023' },
        })
      }

      if (response.status === 429 || response.status === 503) {
        const retryAfter = Number(response.headers.get('retry-after')) || attempt * 5
        if (attempt < MAX_ATTEMPTS) {
          await sleep(Math.min(retryAfter, 30) * 1000)
          continue
        }
        return { status: 'rate-limited', code: response.status }
      }

      if (response.ok) return { status: 'ok', code: response.status }
      if (response.status === 404 || response.status === 410) {
        return { status: 'missing', code: response.status }
      }
      // Anything else is unknown rather than broken: many hosts return 403 to
      // automated requests while serving people normally.
      return { status: 'unknown', code: response.status }
    } catch (error) {
      if (attempt < MAX_ATTEMPTS) {
        await sleep(attempt * 2000)
        continue
      }
      return { status: 'unreachable', detail: (error && error.name) || 'error' }
    } finally {
      clearTimeout(timer)
    }
  }
  return { status: 'unreachable' }
}

const results = []
for (const [host, urls] of [...byHost.entries()].sort()) {
  const allowed = allowlisted(host)
  if (allowed) {
    for (const url of urls) {
      results.push({ url, host, status: 'allowlisted', reason: allowed.reason })
    }
    continue
  }
  for (const url of urls) {
    const outcome = await check(url)
    results.push({
      url,
      host,
      ...outcome,
      pages: [...(links.get(url) ?? [])].slice(0, 5),
      pageCount: (links.get(url) ?? new Set()).size,
    })
    await sleep(PER_HOST_DELAY_MS)
  }
}

const missing = results.filter((entry) => entry.status === 'missing')
const unreachable = results.filter((entry) => entry.status === 'unreachable')
const rateLimited = results.filter((entry) => entry.status === 'rate-limited')

const report = {
  reportVersion: '1.0.0',
  checkedAt: new Date().toISOString().slice(0, 10),
  allowlist: ALLOWLIST,
  totals: {
    urls: results.length,
    hosts: byHost.size,
    ok: results.filter((entry) => entry.status === 'ok').length,
    missing: missing.length,
    unreachable: unreachable.length,
    rateLimited: rateLimited.length,
    unknown: results.filter((entry) => entry.status === 'unknown').length,
    allowlisted: results.filter((entry) => entry.status === 'allowlisted').length,
  },
  results,
}

if (reportPath) writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

for (const [key, value] of Object.entries(report.totals)) {
  process.stdout.write(`${key}: ${value}\n`)
}

// Only a definite 404 or 410 fails. Unreachable and rate limited are reported,
// never treated as evidence that a link is broken.
if (missing.length > 0) {
  process.stderr.write('\nLinks that returned a definite not-found:\n')
  for (const entry of missing) {
    process.stderr.write(`  ${entry.url} (${entry.code}) on ${entry.pageCount} page(s)\n`)
  }
  process.exit(1)
}
