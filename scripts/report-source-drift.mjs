#!/usr/bin/env node
/**
 * Turns a drift report into exactly one open issue.
 *
 * It opens an issue when there are findings, updates that same issue while they
 * persist, and closes it when they are resolved. It never edits documentation,
 * because deciding what a moved revision means is a judgement a person makes.
 *
 * Usage: node scripts/report-source-drift.mjs --report drift-report.json
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const reportIndex = args.indexOf('--report')
const reportPath = resolve(root, reportIndex >= 0 ? args[reportIndex + 1] : 'drift-report.json')

const report = JSON.parse(readFileSync(reportPath, 'utf8'))
const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN
const repository = process.env.GITHUB_REPOSITORY

if (!token || !repository) {
  process.stderr.write('GH_TOKEN and GITHUB_REPOSITORY are required to file a report.\n')
  process.exit(1)
}

const MARKER = '<!-- atomicals-docs-source-drift -->'
const TITLE = 'Source drift: a pinned revision has moved'

const headers = {
  accept: 'application/vnd.github+json',
  authorization: `Bearer ${token}`,
  'content-type': 'application/json',
  'user-agent': 'atomicals-docs-source-drift',
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

function body() {
  if (report.findings.length === 0) {
    return `${MARKER}\n\nNo drift as of ${report.checkedAt}. Every pinned source still matches its recorded revision.`
  }

  const sections = report.findings.map((finding) => {
    const pages =
      finding.pages.length > 0
        ? finding.pages.map((page) => `- \`${page}\``).join('\n')
        : '- No page names this source directly.'
    const revisions =
      finding.kind === 'revision-moved'
        ? [
            `- Repository: ${finding.repository}`,
            `- Pinned here: \`${finding.pinned}\``,
            `- Upstream head: \`${finding.head}\`${finding.headDate ? ` (${finding.headDate})` : ''}`,
          ].join('\n')
        : ''
    return `### ${finding.sourceId}\n\n${finding.detail}\n\n${revisions}\n\n**Affected pages**\n\n${pages}`
  })

  return [
    MARKER,
    '',
    `Checked ${report.checkedAt} in the \`${report.scope}\` scope.`,
    '',
    'The pinned revision is still what this documentation describes, and it is still',
    'accurate about that revision. This issue exists so someone decides whether to move',
    'the pin, not because anything is currently wrong.',
    '',
    '**What to do**',
    '',
    '1. Read what changed upstream between the pinned revision and the head below.',
    '2. Re-run the conformance vectors against the new revision.',
    '3. If behavior changed, update the affected pages and record the new limitation.',
    '4. Update `contracts/source-manifest.json`, run `npm run generate`, and commit.',
    '',
    ...sections,
  ].join('\n')
}

const search = await api('/issues?state=open&per_page=100')
const existing = search.find(
  (issue) => issue.title === TITLE && (issue.body ?? '').includes(MARKER),
)

if (report.findings.length === 0) {
  if (existing) {
    await api(`/issues/${existing.number}`, {
      method: 'PATCH',
      body: JSON.stringify({ state: 'closed', body: body() }),
    })
    process.stdout.write(`closed issue #${existing.number}: no drift remains\n`)
  } else {
    process.stdout.write('no drift, and no open drift issue to close\n')
  }
} else if (existing) {
  await api(`/issues/${existing.number}`, {
    method: 'PATCH',
    body: JSON.stringify({ body: body() }),
  })
  process.stdout.write(`updated issue #${existing.number} with ${report.findings.length} finding(s)\n`)
} else {
  const created = await api('/issues', {
    method: 'POST',
    body: JSON.stringify({
      title: TITLE,
      body: body(),
      labels: ['source-version-update'],
    }),
  })
  process.stdout.write(`opened issue #${created.number} with ${report.findings.length} finding(s)\n`)
}
