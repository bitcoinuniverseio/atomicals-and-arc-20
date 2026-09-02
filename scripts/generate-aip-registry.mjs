#!/usr/bin/env node
// Generates contracts/aip-registry.json from the vendored Atomicals Improvement Proposals
// and contracts/aip-implementation-evidence.json.
//
// Rule enforced here: an AIP is never marked implemented because it exists. The
// implementation column comes only from the evidence file, and every row names its source.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(
  readFileSync(resolve(root, 'contracts/source-manifest.json'), 'utf8'),
)
const aipSource = manifest.sources.find((entry) => entry.id === 'atomicals-aips')
const evidenceFile = JSON.parse(
  readFileSync(resolve(root, 'contracts/aip-implementation-evidence.json'), 'utf8'),
)
const evidenceByAip = new Map(evidenceFile.evidence.map((entry) => [entry.aip, entry]))

// The complete AIP status model. An AIP sits in exactly one of these.
export const AIP_STATUSES = [
  'Idea',
  'Draft',
  'Review',
  'Last Call',
  'Final',
  'Stagnant',
  'Withdrawn',
  'Living',
]

const vendorDir = resolve(root, 'contracts/vendor/aips')
const files = readdirSync(vendorDir).filter((name) => /^aip-\d+\.md$/.test(name))

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  /** @type {Record<string, string>} */
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':')
    if (separator === -1) continue
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim()
    if (key) data[key] = value
  }
  return data
}

function firstSection(text, heading) {
  const pattern = new RegExp(`^##\\s+${heading}\\s*$([\\s\\S]*?)(?=^##\\s|\\Z)`, 'mi')
  const match = text.match(pattern)
  if (!match) return null
  return match[1]
    .replace(/<!--[\s\S]*?-->/g, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .slice(0, 600)
}

const entries = []
for (const file of files) {
  const text = readFileSync(resolve(vendorDir, file), 'utf8')
  const front = parseFrontmatter(text)
  const number = Number.parseInt(front.aip ?? file.replace(/\D/g, ''), 10)
  const evidence = evidenceByAip.get(number)

  if (front.status && !AIP_STATUSES.includes(front.status)) {
    throw new Error(
      `AIP ${number} declares status "${front.status}" which is not in the supported status model.`,
    )
  }

  entries.push({
    number,
    title: front.title ?? null,
    description: front.description ?? null,
    type: front.type ?? null,
    category: front.category ?? null,
    status: front.status ?? 'Idea',
    authors: (front.author ?? '')
      .split(/,(?![^<(]*[>)])/)
      .map((value) => value.trim())
      .filter(Boolean),
    created: front.created ?? null,
    requires: (front.requires ?? '')
      .split(',')
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => Number.isInteger(value)),
    discussionsTo: front['discussions-to'] ?? null,
    abstract: firstSection(text, 'Abstract') ?? firstSection(text, 'What is an AIP') ?? null,
    sourcePath: `AIPs/${file}`,
    sourceUrl: `${aipSource.repository}/blob/${aipSource.revision}/AIPs/${file}`,
    conformance: evidence?.conformance ?? 'none',
    conformanceNote: evidence?.note ?? 'No implementation evidence was located.',
    implementations: evidence?.implementations ?? [],
    lastChecked: evidenceFile.lastVerified,
  })
}

entries.sort((a, b) => a.number - b.number)

const registry = {
  registryVersion: '1.0.0',
  generator: 'scripts/generate-aip-registry.mjs',
  statusModel: AIP_STATUSES,
  conformanceLevels: evidenceFile.conformanceLevels,
  source: {
    id: aipSource.id,
    repository: aipSource.repository,
    revision: aipSource.revision,
    path: 'AIPs/',
  },
  aipCount: entries.length,
  aips: entries,
}

writeFileSync(
  resolve(root, 'contracts/aip-registry.json'),
  `${JSON.stringify(registry, null, 2)}\n`,
  'utf8',
)
process.stdout.write(`aip-registry.json written with ${entries.length} proposals\n`)
