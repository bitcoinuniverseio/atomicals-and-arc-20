#!/usr/bin/env node
/**
 * Runs every check that does not need a network, in the order that gives the
 * most useful first failure.
 *
 * Each check is its own process, so a passing later command can never hide an
 * earlier failure, and the summary at the end names every gate that failed
 * rather than stopping at the first one.
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const built = existsSync(resolve(root, 'site/dist/index.html'))

const CHECKS = [
  {
    name: 'Contracts, schemas, and route inventories',
    command: process.execPath,
    args: ['--test', 'tests/contracts.test.mjs'],
  },
  {
    name: 'ARC-20 allocation conformance vectors',
    command: process.execPath,
    args: ['--test', 'tests/conformance-allocation.test.mjs'],
  },
  {
    name: 'Content metadata, provenance, and translations',
    command: process.execPath,
    args: ['--test', 'tests/content.test.mjs'],
  },
  {
    name: 'Secret scan',
    command: process.execPath,
    args: ['scripts/check-secrets.mjs'],
  },
  {
    name: 'Links, anchors, and compatibility routes',
    command: process.execPath,
    args: ['--test', 'tests/links.test.mjs'],
    needsBuild: true,
  },
  {
    name: 'Accessibility invariants',
    command: process.execPath,
    args: ['--test', 'tests/accessibility.test.mjs'],
    needsBuild: true,
  },
  {
    name: 'Performance budgets',
    command: process.execPath,
    args: ['--test', 'tests/performance.test.mjs'],
    needsBuild: true,
  },
]

const failed = []
const skipped = []

for (const check of CHECKS) {
  if (check.needsBuild && !built) {
    skipped.push(check.name)
    process.stdout.write(`\n[skip] ${check.name}: run \`npm run build\` first\n`)
    continue
  }
  process.stdout.write(`\n[run ] ${check.name}\n`)
  const result = spawnSync(check.command, check.args, { cwd: root, stdio: 'inherit' })
  if (result.status !== 0) failed.push(check.name)
}

process.stdout.write('\n---\n')
for (const check of CHECKS) {
  const status = failed.includes(check.name)
    ? 'FAIL'
    : skipped.includes(check.name)
      ? 'skip'
      : 'ok  '
  process.stdout.write(`${status} ${check.name}\n`)
}

if (skipped.length > 0) {
  process.stdout.write(
    `\n${skipped.length} check(s) were skipped because the site is not built. They are not passes.\n`,
  )
}

if (failed.length > 0) {
  process.stdout.write(`\n${failed.length} check(s) failed.\n`)
  process.exit(1)
}

process.stdout.write('\nEvery check that could run passed.\n')
if (skipped.length > 0) process.exit(1)
