#!/usr/bin/env node
/**
 * Verifies the ecosystem registry against reachable sources.
 *
 * The rules this enforces are the ones the registry itself declares:
 *   - A network failure produces `unreachable`, never `deprecated` or `closed`.
 *   - Conflicting evidence produces `unverified`, never a guess.
 *   - Only an operator's own reachable statement produces `deprecated` or `closed`.
 *
 * It never edits the registry. It reports what it observed so a person decides,
 * because deciding that a service closed is a claim about someone else's product.
 *
 * Usage: node scripts/check-ecosystem.mjs --report ecosystem-report.json
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const registry = JSON.parse(readFileSync(resolve(root, 'contracts/ecosystem.json'), 'utf8'))

const args = process.argv.slice(2)
const reportIndex = args.indexOf('--report')
const reportPath = reportIndex >= 0 ? resolve(root, args[reportIndex + 1]) : null

const TIMEOUT_MS = 15_000
const sleep = (ms) => new Promise((done) => setTimeout(done, ms))

async function probe(url) {
  if (!url) return { observed: 'not-applicable' }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'atomicals-docs-ecosystem-check', range: 'bytes=0-4095' },
    })
    if (response.ok) return { observed: 'reachable', code: response.status }
    if (response.status === 404 || response.status === 410) {
      // A 404 on a listed URL is evidence about that URL, not about the operator
      // shutting down. It is reported as a conflict for a person to resolve.
      return { observed: 'not-found', code: response.status }
    }
    return { observed: 'inconclusive', code: response.status }
  } catch (error) {
    return { observed: 'unreachable', detail: (error && error.name) || 'error' }
  } finally {
    clearTimeout(timer)
  }
}

const observations = []
for (const record of registry.records) {
  const target = record.repository ?? record.url
  const result = await probe(target)

  let suggestion = null
  if (record.availability === 'verified-active' && result.observed === 'not-found') {
    suggestion = 'unverified'
  } else if (record.availability === 'verified-active' && result.observed === 'unreachable') {
    // Explicitly not a downgrade to closed. A failed request proves nothing.
    suggestion = 'unreachable'
  } else if (record.availability === 'unknown' && result.observed === 'reachable') {
    suggestion = 'verified-active'
  }

  observations.push({
    id: record.id,
    name: record.name,
    recorded: record.availability,
    probed: target ?? null,
    ...result,
    suggestion,
    lastVerified: record.lastVerified,
  })

  await sleep(500)
}

const conflicts = observations.filter((entry) => entry.suggestion !== null)

const report = {
  reportVersion: '1.0.0',
  checkedAt: new Date().toISOString().slice(0, 10),
  policy: registry.policy,
  totals: {
    records: observations.length,
    reachable: observations.filter((entry) => entry.observed === 'reachable').length,
    unreachable: observations.filter((entry) => entry.observed === 'unreachable').length,
    notFound: observations.filter((entry) => entry.observed === 'not-found').length,
    inconclusive: observations.filter((entry) => entry.observed === 'inconclusive').length,
    conflicts: conflicts.length,
  },
  observations,
  conflicts,
}

if (reportPath) writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

for (const entry of observations) {
  process.stdout.write(
    `${entry.id}: recorded ${entry.recorded}, observed ${entry.observed}${entry.suggestion ? ` -> review as ${entry.suggestion}` : ''}\n`,
  )
}

process.stdout.write(
  `\n${conflicts.length} record(s) need a human decision out of ${observations.length}\n`,
)

// Reporting only. Changing someone else's product status is never automatic.
