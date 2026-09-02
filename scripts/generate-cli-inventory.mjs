#!/usr/bin/env node
// Generates contracts/cli-inventory.json from the pinned Atomicals JavaScript CLI source.
// The vendored snapshot lives in contracts/vendor/atomicals-js-cli.ts and is byte-identical
// to lib/cli.ts at the revision recorded in contracts/source-manifest.json.
// CI re-runs this generator and fails when the committed inventory drifts.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { byCodepoint } from './lib/order.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(
  readFileSync(resolve(root, 'contracts/source-manifest.json'), 'utf8'),
)
const cliSource = manifest.sources.find((entry) => entry.id === 'atomicals-js-cli')

const args = process.argv.slice(2)
const sourceIndex = args.indexOf('--source')
const sourceFile =
  sourceIndex >= 0
    ? resolve(args[sourceIndex + 1])
    : resolve(root, 'contracts/vendor/atomicals-js-cli.ts')

const text = readFileSync(sourceFile, 'utf8')

const BACKSLASH = String.fromCharCode(92)

function unescape(value) {
  return value
    .split(BACKSLASH + "'")
    .join("'")
    .split(BACKSLASH + '"')
    .join('"')
    .split(BACKSLASH + '`')
    .join('`')
    .split(BACKSLASH + 'n')
    .join(' ')
    .split(BACKSLASH + BACKSLASH)
    .join(BACKSLASH)
    .replace(/\s+/g, ' ')
    .trim()
}

function parseArgumentToken(token, description) {
  const required = token.startsWith('<')
  const variadic = token.includes('...')
  const label = token.replace(/^[<[]|[\]>]$/g, '').replace(/\.\.\./g, '')
  return {
    name: label,
    required,
    variadic,
    description: description ?? null,
  }
}

function parseSignature(signature) {
  const parts = signature.trim().split(/\s+/)
  const name = parts.shift()
  return { name, params: parts.map((token) => parseArgumentToken(token, null)) }
}

function parseOption(flags, description, fallback) {
  const tokens = flags.split(/[,\s]+/).filter(Boolean)
  const short = tokens.find((token) => /^-[^-]/.test(token)) ?? null
  const long = tokens.find((token) => /^--/.test(token)) ?? null
  const valueToken = tokens.find((token) => /^[<[]/.test(token)) ?? null
  return {
    flags: flags.trim(),
    short,
    long,
    valueName: valueToken ? valueToken.replace(/^[<[]|[\]>]$/g, '') : null,
    valueRequired: valueToken ? valueToken.startsWith('<') : false,
    description: description ?? null,
    default: fallback ?? null,
  }
}

const commandStart = /program\s*\r?\n?\s*\.command\(\s*(['"`])([\s\S]*?)\1\s*\)/g
const commands = []
let match
while ((match = commandStart.exec(text)) !== null) {
  const signature = unescape(match[2])
  const { name, params } = parseSignature(signature)
  const tail = text.slice(match.index + match[0].length)
  const actionAt = tail.search(/\.action\(/)
  const chain = actionAt === -1 ? tail.slice(0, 4000) : tail.slice(0, actionAt)

  const descriptionMatch = chain.match(/\.description\(\s*(['"`])([\s\S]*?)\1\s*\)/)

  const argumentRe =
    /\.argument\(\s*(['"`])([\s\S]*?)\1\s*(?:,\s*(['"`])([\s\S]*?)\3\s*)?\)/g
  let argumentMatch
  while ((argumentMatch = argumentRe.exec(chain)) !== null) {
    params.push(
      parseArgumentToken(
        unescape(argumentMatch[2]),
        argumentMatch[4] === undefined ? null : unescape(argumentMatch[4]),
      ),
    )
  }

  const options = []
  const optionRe =
    /\.option\(\s*(['"`])([\s\S]*?)\1\s*(?:,\s*(['"`])([\s\S]*?)\3\s*)?(?:,\s*(['"`])([\s\S]*?)\5\s*)?\)/g
  let optionMatch
  while ((optionMatch = optionRe.exec(chain)) !== null) {
    options.push(
      parseOption(
        unescape(optionMatch[2]),
        optionMatch[4] === undefined ? null : unescape(optionMatch[4]),
        optionMatch[6] === undefined ? null : unescape(optionMatch[6]),
      ),
    )
  }

  commands.push({
    name,
    signature,
    description: descriptionMatch ? unescape(descriptionMatch[2]) : null,
    arguments: params,
    options: options.sort((a, b) => byCodepoint(a.flags, b.flags)),
  })
}

commands.sort((a, b) => byCodepoint(a.name, b.name))

const inventory = {
  inventoryVersion: '1.0.0',
  generator: 'scripts/generate-cli-inventory.mjs',
  invocation: 'yarn cli <command>',
  source: {
    id: cliSource.id,
    repository: cliSource.repository,
    revision: cliSource.revision,
    path: 'lib/cli.ts',
  },
  commandCount: commands.length,
  commands,
}

writeFileSync(
  resolve(root, 'contracts/cli-inventory.json'),
  `${JSON.stringify(inventory, null, 2)}\n`,
  'utf8',
)
process.stdout.write(`cli-inventory.json written with ${commands.length} commands\n`)
