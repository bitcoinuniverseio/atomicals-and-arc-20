#!/usr/bin/env node
/**
 * Regenerates every derived artefact, in dependency order.
 *
 * CI runs this and then fails if the working tree is dirty, which is what makes
 * "generated artefacts are reproducible" a fact rather than an intention.
 */
import { spawnSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const STEPS = [
  ['Command inventory from the pinned Atomicals CLI source', 'scripts/generate-cli-inventory.mjs'],
  ['AVM opcode inventory from the beta interpreter source', 'scripts/generate-avm-opcodes.mjs'],
  ['AIP registry from the proposals and the evidence file', 'scripts/generate-aip-registry.mjs'],
  ['TypeScript client from the OpenAPI documents', 'scripts/generate-client.mjs'],
  ['Standalone response validators for the Conformance Workbench', 'scripts/generate-validators.mjs'],
  ['Arazzo workflow validation and workflow artefacts', 'scripts/generate-workflows.mjs'],
  ['Multi-language SDK clients from the OpenAPI contracts', 'scripts/generate-sdks.mjs'],
]

for (const [label, script] of STEPS) {
  process.stdout.write(`\n${label}\n`)
  const result = spawnSync(process.execPath, [resolve(root, script)], {
    cwd: root,
    stdio: 'inherit',
  })
  if (result.status !== 0) {
    process.stderr.write(`\n${script} failed\n`)
    process.exit(result.status ?? 1)
  }
}

process.stdout.write('\nEvery derived artefact regenerated.\n')
