#!/usr/bin/env node
/**
 * Compares the committed contracts against the sources they were generated from.
 *
 * Two scopes, deliberately separated:
 *
 *   --scope public   Only public repositories. Needs no credential, so it runs
 *                    anywhere, including on an untrusted fork.
 *   --scope private  Universe runtime repositories. Needs a read-only token that
 *                    only exists on the trusted scheduled path.
 *
 * A finding is written to the report file rather than acted on. Nothing here
 * rewrites documentation: a human reads the report and decides.
 *
 * Usage:
 *   node scripts/check-source-drift.mjs --scope public
 *   node scripts/check-source-drift.mjs --scope private --report drift-report.json
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(
  readFileSync(resolve(root, 'contracts/source-manifest.json'), 'utf8'),
)

const args = process.argv.slice(2)
const scopeIndex = args.indexOf('--scope')
const scope = scopeIndex >= 0 ? args[scopeIndex + 1] : 'public'
const reportIndex = args.indexOf('--report')
const reportPath = reportIndex >= 0 ? resolve(root, args[reportIndex + 1]) : null

const token = process.env.SOURCE_READ_TOKEN ?? process.env.GITHUB_TOKEN ?? ''

/** Pages that name a given source, so a report can say what is affected. */
function pagesFor(sourceId) {
  const manifestPath = resolve(root, 'site/dist/manifest.json')
  try {
    const pageManifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    return pageManifest.pages
      .filter((page) => page.locale === 'en' && page.sources.includes(sourceId))
      .map((page) => page.pageId)
  } catch {
    return []
  }
}

function repoPath(repository) {
  return repository.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '')
}

async function latestCommit(repository) {
  const headers = {
    accept: 'application/vnd.github+json',
    'user-agent': 'atomicals-docs-source-drift',
    'x-github-api-version': '2022-11-28',
  }
  if (token) headers.authorization = `Bearer ${token}`

  const response = await fetch(
    `https://api.github.com/repos/${repoPath(repository)}/commits?per_page=1`,
    { headers },
  )
  if (response.status === 404) return { error: 'not-found' }
  if (response.status === 403) return { error: 'forbidden-or-rate-limited' }
  if (!response.ok) return { error: `http-${response.status}` }
  const body = await response.json()
  const head = Array.isArray(body) ? body[0] : null
  if (!head?.sha) return { error: 'no-commit' }
  return { sha: head.sha, date: head.commit?.committer?.date ?? null }
}

const findings = []
const checked = []

for (const source of manifest.sources) {
  const isPublic = source.visibility === 'public'
  if (scope === 'public' && !isPublic) continue
  if (scope === 'private' && isPublic) continue
  if (!source.revision) {
    checked.push({ id: source.id, status: 'unpinned', note: 'No revision is recorded.' })
    continue
  }

  if (scope === 'private' && !token) {
    findings.push({
      sourceId: source.id,
      kind: 'credential-missing',
      detail:
        'No read-only source token was provided, so private contracts could not be compared. This is a configuration problem, not drift.',
      pages: [],
    })
    continue
  }

  const head = await latestCommit(source.repository)
  if (head.error) {
    // A reachability failure is reported as itself, never as drift.
    checked.push({ id: source.id, status: `unreachable:${head.error}` })
    continue
  }

  if (head.sha === source.revision) {
    checked.push({ id: source.id, status: 'current' })
    continue
  }

  findings.push({
    sourceId: source.id,
    kind: 'revision-moved',
    repository: source.repository,
    pinned: source.revision,
    head: head.sha,
    headDate: head.date,
    detail: `${source.name} has moved since the pinned revision. Re-verify the behavior this documentation derives from it, then update contracts/source-manifest.json and run npm run generate.`,
    pages: pagesFor(source.id),
  })
}

const report = {
  reportVersion: '1.0.0',
  scope,
  checkedAt: new Date().toISOString().slice(0, 10),
  checked,
  findings,
}

if (reportPath) {
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
}

for (const entry of checked) {
  process.stdout.write(`${entry.id}: ${entry.status}\n`)
}
for (const finding of findings) {
  process.stdout.write(`DRIFT ${finding.sourceId}: ${finding.kind}\n`)
}

// Drift is information, not a build failure: the pinned revision is still the
// revision this documentation describes, and it is still correct about it. The
// workflow files an issue from the report instead.
process.stdout.write(
  `\n${findings.length} finding(s) across ${checked.length + findings.length} source(s) in the ${scope} scope\n`,
)
