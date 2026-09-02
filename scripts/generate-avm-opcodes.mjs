#!/usr/bin/env node
// Generates contracts/avm-opcodes.json from the Atomicals AVM interpreter source.
// The vendored snapshot lives in contracts/vendor/avm-script.h and is byte-identical to
// src/script/script.h at the revision recorded in contracts/source-manifest.json.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(
  readFileSync(resolve(root, 'contracts/source-manifest.json'), 'utf8'),
)
const avm = manifest.sources.find((entry) => entry.id === 'atomicals-avm-interpreter')

const args = process.argv.slice(2)
const sourceIndex = args.indexOf('--source')
const sourceFile =
  sourceIndex >= 0
    ? resolve(args[sourceIndex + 1])
    : resolve(root, 'contracts/vendor/avm-script.h')

const text = readFileSync(sourceFile, 'utf8')

// Only the opcodes the AVM adds or changes relative to Bitcoin script are documented here.
const ATOMICALS_RANGE_START = 0xc0

const GROUPS = [
  { test: /^OP_CHECKAUTHSIG/, group: 'authorisation' },
  { test: /^OP_(TXVERSION|TXINPUTCOUNT|TXOUTPUTCOUNT|TXLOCKTIME|OUTPOINT|INPUT|OUTPUT)/, group: 'introspection' },
  { test: /^OP_KV_/, group: 'state-storage' },
  { test: /^OP_FT_/, group: 'fungible-tokens' },
  { test: /^OP_NFT_/, group: 'non-fungible-tokens' },
  { test: /^OP_(GET|DECODE)BLOCKINFO/, group: 'block-info' },
  { test: /^OP_HASH_FN/, group: 'hashing' },
]

function groupFor(name) {
  for (const entry of GROUPS) if (entry.test.test(name)) return entry.group
  return 'other'
}

const opcodes = []
const lineRe = /^\s*(OP_[A-Z0-9_]+)\s*=\s*(0x[0-9a-fA-F]{2})\s*,\s*(?:\/\/\s*(.*))?$/gm
let match
while ((match = lineRe.exec(text)) !== null) {
  const [, name, hex, comment = ''] = match
  const value = Number.parseInt(hex, 16)
  if (value < ATOMICALS_RANGE_START) continue

  const trimmed = comment.trim()
  const tested = /^TESTED\b/i.test(trimmed)
  const notWorking = /NOT WORKING/i.test(trimmed)
  const description = trimmed
    .replace(/^TESTED\.?\s*/i, '')
    .replace(/^NOT WORKING\.?\s*/i, '')
    .replace(/^NOT USED\.?\s*/i, '')
    .trim()

  opcodes.push({
    name,
    hex,
    value,
    group: groupFor(name),
    status: notWorking ? 'not-working' : tested ? 'tested' : 'undeclared',
    description: description || null,
    sourceComment: trimmed || null,
  })
}

opcodes.sort((a, b) => a.value - b.value)

const inventory = {
  inventoryVersion: '1.0.0',
  generator: 'scripts/generate-avm-opcodes.mjs',
  applicability: 'experimental',
  statusNote:
    'The AVM interpreter is beta. A tested opcode is tested upstream. It is not a statement that any Universe service executes AVM contracts.',
  source: {
    id: avm.id,
    repository: avm.repository,
    revision: avm.revision,
    path: 'src/script/script.h',
  },
  opcodeCount: opcodes.length,
  groups: [...new Set(opcodes.map((entry) => entry.group))].sort(),
  opcodes,
}

writeFileSync(
  resolve(root, 'contracts/avm-opcodes.json'),
  `${JSON.stringify(inventory, null, 2)}\n`,
  'utf8',
)
process.stdout.write(`avm-opcodes.json written with ${opcodes.length} opcodes\n`)
