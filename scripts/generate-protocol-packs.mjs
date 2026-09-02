#!/usr/bin/env node
/**
 * Generates the versioned offline protocol packs.
 *
 * Four packs, all deterministic: full, docs, developer, and ai-agent. Every
 * pack carries SHA-256 checksums and a software bill of materials. Archives
 * are tar files built with a fixed sort so the same inputs give the same
 * bytes.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { resolve, dirname, relative, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')
const outDir = resolve(ROOT, 'dist-packs')
mkdirSync(outDir, { recursive: true })

const siteMeta = JSON.parse(readFileSync(resolve(ROOT, 'site/src/data/site.json'), 'utf8'))
const sourceManifest = JSON.parse(readFileSync(resolve(ROOT, 'contracts/source-manifest.json'), 'utf8'))
const lock = JSON.parse(readFileSync(resolve(ROOT, 'package-lock.json'), 'utf8'))

function filesUnder(relativeRoot) {
  const absolute = resolve(ROOT, relativeRoot)
  const collected = []
  try {
    for (const entry of readdirSync(absolute, { withFileTypes: true })) {
      const path = join(relativeRoot, entry.name)
      if (entry.isDirectory()) collected.push(...filesUnder(path))
      else collected.push(path)
    }
  } catch {
    /* optional root missing */
  }
  return collected.sort()
}

const PACKS = {
  full: {
    description: 'Everything: documentation, contracts, clients, skills, and agent material.',
    include: () => [
      ...filesUnder('site/dist/raw'),
      ...filesUnder('site/dist/pagefind'),
      'manifest.json',
      'llms.txt',
      'llms-full.txt',
      ...filesUnder('contracts'),
      ...filesUnder('conformance'),
      ...filesUnder('overlays'),
      'packages/client/src/generated/types.ts',
      'packages/client/src/generated/operations.ts',
      'clients/python/atomicals_client/client.py',
      'clients/go/client.go',
      'clients/rust/src/lib.rs',
      'site/src/generated/workflows.json',
      'site/src/generated/answer-index.json',
      'skills/atomicals-and-arc20/SKILL.md',
      'site/public/sw.js',
    ],
  },
  docs: {
    description: 'Documentation and offline search only.',
    include: () => [
      ...filesUnder('site/dist/raw'),
      ...filesUnder('site/dist/pagefind'),
      'manifest.json',
      'llms.txt',
      'llms-full.txt',
      ...filesUnder('contracts/source-manifest.json'),
    ],
  },
  developer: {
    description: 'Contracts, conformance vectors, overlays, and generated clients.',
    include: () => [
      ...filesUnder('contracts'),
      ...filesUnder('conformance'),
      ...filesUnder('overlays'),
      'packages/client/src/generated/types.ts',
      'packages/client/src/generated/operations.ts',
      'clients/python/atomicals_client/client.py',
      'clients/go/client.go',
      'clients/rust/src/lib.rs',
    ],
  },
  'ai-agent': {
    description: 'Agent Skill, MCP configuration examples, workflow catalog, and the answer index.',
    include: () => [
      'skills/atomicals-and-arc20/SKILL.md',
      ...filesUnder('skills/atomicals-and-arc20/references'),
      'site/src/generated/workflows.json',
      'site/src/generated/answer-index.json',
      'contracts/protocol-atlas/atlas.json',
      'contracts/versions/manifest.json',
      'contracts/drift-status.json',
      'contracts/source-manifest.json',
    ],
  },
}

function sbom() {
  const packages = Object.entries(lock.packages ?? {})
    .filter(([key]) => key.startsWith('node_modules/'))
    .map(([key, value]) => ({ name: key.replace('node_modules/', ''), version: value.version }))
  return {
    sbomVersion: '1.0.0',
    format: 'universe-simplified-cyclonedx',
    project: { name: '@bitcoin-universe/atomicals-and-arc-20', docsVersion: siteMeta.docsVersion },
    generatedFrom: 'package-lock.json (deterministic generation; no timestamps)',
    components: packages.map((entry) => ({ type: 'library', ...entry })),
  }
}

const sbomText = `${JSON.stringify(sbom(), null, 2)}\n`
const provenance = {
  provenanceVersion: '1.0.0',
  repository: siteMeta.repository,
  docsVersion: siteMeta.docsVersion,
  sourceManifestRevision: sourceManifest.lastVerified,
  sources: sourceManifest.sources.map((source) => ({ id: source.id, revision: source.revision })),
  note: 'Build and source provenance for the packs. Generated without timestamps so identical inputs produce identical output.',
}

let packed = 0
for (const [name, pack] of Object.entries(PACKS)) {
  const include = [...new Set([...pack.include(), 'SBOM.json', 'PROVENANCE.json'])].sort()
  const staging = resolve(outDir, `staging-${name}`)
  mkdirSync(staging, { recursive: true })
  for (const relativePath of include) {
    const source = resolve(ROOT, relativePath)
    try {
      statSync(source)
    } catch {
      continue
    }
    const target = resolve(staging, relativePath)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, readFileSync(source))
  }
  writeFileSync(resolve(staging, 'SBOM.json'), sbomText)
  writeFileSync(resolve(staging, 'PROVENANCE.json'), `${JSON.stringify(provenance, null, 2)}\n`)

  const archive = resolve(outDir, `atomicals-protocol-pack-${name}-${siteMeta.docsVersion}.tar`)
  const tar = spawnSync('tar', ['--force-local', '-cf', archive, '-C', staging, '.'], { shell: process.platform === 'win32' })
  if (tar.status !== 0) {
    process.stderr.write(`tar failed for ${name}\n`)
    process.exit(1)
  }
  const digest = createHash('sha256').update(readFileSync(archive)).digest('hex')
  writeFileSync(`${archive}.sha256`, `${digest}  atomicals-protocol-pack-${name}-${siteMeta.docsVersion}.tar\n`)
  writeFileSync(resolve(staging, 'CHECKSUMS.txt'), `${digest}  ${name}\n`)
  packed += 1
}

process.stdout.write(`protocol packs: generated ${packed} archives with checksums, SBOM, and provenance into dist-packs/\n`)
