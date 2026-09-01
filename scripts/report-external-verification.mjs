#!/usr/bin/env node
/**
 * Files one issue for anything the external verification found that needs a
 * human decision: a link that is definitely gone, or an ecosystem record whose
 * recorded status no longer matches what a reachable source shows.
 *
 * Unreachable and rate limited results are summarised but never filed as
 * defects, because neither is evidence that anything is wrong.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
const repository = process.env.GITHUB_REPOSITORY

if (!token || !repository) {
  process.stderr.write('GH_TOKEN and GITHUB_REPOSITORY are required to file a report.\n')
  process.exit(1)
}

function read(name) {
  const path = resolve(root, name)
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null
}

const linkReport = read('external-links.json')
const ecosystemReport = read('ecosystem-report.json')

const MARKER = '<!-- atomicals-docs-external-verification -->'
const TITLE = 'External verification: links and ecosystem records need review'

const headers = {
  accept: 'application/vnd.github+json',
  authorization: `Bearer ${token}`,
  'content-type': 'application/json',
  'user-agent': 'atomicals-docs-external-verification',
  'x-github-api-version': '2022-11-28',
}

async function api(path, init = {}) {
  const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
    ...init,
    headers,
  })
  if (!response.ok) {
    throw new Error(`GitHub API ${init.method ?? 'GET'} ${path} failed: ${response.status}`)
  }
  return response.json()
}

const missingLinks = (linkReport?.results ?? []).filter((entry) => entry.status === 'missing')
const conflicts = ecosystemReport?.conflicts ?? []
const actionable = missingLinks.length + conflicts.length

function body() {
  const lines = [MARKER, '']

  if (actionable === 0) {
    lines.push(
      `Nothing needs a decision as of ${linkReport?.checkedAt ?? ecosystemReport?.checkedAt ?? 'the last run'}.`,
    )
  } else {
    lines.push(
      `Checked ${linkReport?.checkedAt ?? ecosystemReport?.checkedAt}. ${actionable} item(s) need a decision.`,
      '',
      'Unreachable and rate limited results are summarised below but are not listed as',
      'defects. A failed request is not evidence that a link is broken or that a product',
      'has closed.',
      '',
    )
  }

  if (missingLinks.length > 0) {
    lines.push('## Links that returned a definite not-found', '')
    for (const entry of missingLinks) {
      lines.push(`- ${entry.url} returned ${entry.code}, on ${entry.pageCount} page(s)`)
      for (const page of entry.pages) lines.push(`  - \`${page}\``)
    }
    lines.push('')
  }

  if (conflicts.length > 0) {
    lines.push('## Ecosystem records whose observed state differs from the recorded one', '')
    for (const entry of conflicts) {
      lines.push(
        `- \`${entry.id}\` is recorded as \`${entry.recorded}\`, observed \`${entry.observed}\`. Review as \`${entry.suggestion}\`.`,
      )
    }
    lines.push(
      '',
      'Apply the registry rules before changing anything: a network failure produces',
      '`unreachable`, conflicting evidence produces `unverified`, and only an operator',
      'statement produces `deprecated` or `closed`.',
      '',
    )
  }

  if (linkReport) {
    lines.push('## Link check summary', '')
    for (const [key, value] of Object.entries(linkReport.totals)) {
      lines.push(`- ${key}: ${value}`)
    }
    lines.push('')
  }

  if (ecosystemReport) {
    lines.push('## Ecosystem check summary', '')
    for (const [key, value] of Object.entries(ecosystemReport.totals)) {
      lines.push(`- ${key}: ${value}`)
    }
  }

  return lines.join('\n')
}

const open = await api('/issues?state=open&per_page=100')
const existing = open.find((issue) => issue.title === TITLE && (issue.body ?? '').includes(MARKER))

if (actionable === 0) {
  if (existing) {
    await api(`/issues/${existing.number}`, {
      method: 'PATCH',
      body: JSON.stringify({ state: 'closed', body: body() }),
    })
    process.stdout.write(`closed issue #${existing.number}: nothing left to decide\n`)
  } else {
    process.stdout.write('nothing actionable, and no open issue to close\n')
  }
} else if (existing) {
  await api(`/issues/${existing.number}`, {
    method: 'PATCH',
    body: JSON.stringify({ body: body() }),
  })
  process.stdout.write(`updated issue #${existing.number} with ${actionable} item(s)\n`)
} else {
  const created = await api('/issues', {
    method: 'POST',
    body: JSON.stringify({
      title: TITLE,
      body: body(),
      labels: ['broken-external-integration'],
    }),
  })
  process.stdout.write(`opened issue #${created.number} with ${actionable} item(s)\n`)
}
