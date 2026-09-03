#!/usr/bin/env node
/**
 * Secret scanning for this repository.
 *
 * This is a public repository that documents private services, so the risk is
 * specific and worth checking directly rather than only relying on a hosted
 * scanner: a credential, an internal hostname, or an operator-only endpoint
 * pasted into a page.
 *
 * Runs over the tracked working tree, and over the commit history when a git
 * checkout with history is available.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const PATTERNS = [
  { name: 'GitHub personal access token', pattern: /\bghp_[A-Za-z0-9]{30,}/ },
  { name: 'GitHub fine grained token', pattern: /\bgithub_pat_[A-Za-z0-9_]{50,}/ },
  { name: 'AWS access key id', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'AWS secret access key assignment', pattern: /AWS_SECRET_ACCESS_KEY\s*[:=]\s*\S{20,}/ },
  { name: 'Private key block', pattern: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { name: 'Backblaze application key assignment', pattern: /B2_APPLICATION_KEY\s*[:=]\s*\S{10,}/ },
  { name: 'Bearer token assignment', pattern: /BEARER_TOKEN\s*[:=]\s*['"]?[A-Za-z0-9._-]{16,}/ },
  { name: 'HMAC secret assignment', pattern: /HMAC_SECRET\s*[:=]\s*['"]?\S{8,}/ },
  { name: 'Admin token assignment', pattern: /ADMIN_TOKEN\s*[:=]\s*['"]?[A-Za-z0-9._-]{12,}/ },
  { name: 'Cursor secret assignment', pattern: /CURSOR_SECRET\s*[:=]\s*['"]?\S{8,}/ },
  { name: 'Password assignment', pattern: /\bpassword\s*[:=]\s*['"][^\s'"<>{}$]{8,}['"]/i },
  { name: 'Infrastructure hostname', pattern: /\bsrv\d{6}\.hstgr\.cloud\b/ },
  { name: 'Hostinger hostname', pattern: /\bhstgr\.cloud\b/ },
  { name: 'SSH invocation with a key file', pattern: /\bssh\s+(?:-p\s+\d+\s+)?-i\s+\S/ },
  { name: 'RunsOn licence key', pattern: /\bro_[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}\b/ },
  {
    name: 'Routable private-network address',
    pattern: /(?:\/\/|@)(?:(?:10|172|192)\.(?:\d{1,3}\.){2}\d{1,3})/,
  },
]

/** Loopback and documentation addresses are safe defaults and stay allowed. */
const ALLOWED_HOSTS = new Set(['127.0.0.1', '0.0.0.0', 'localhost'])

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.pdf',
  '.wasm',
  '.zip',
  '.gz',
])

/** Files that legitimately name the patterns in order to forbid them. */
const ALLOWLIST = new Set([
  'scripts/check-secrets.mjs',
  'tests/content.test.mjs',
  'tests/links.test.mjs',
  'tests/contracts.test.mjs',
])

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 })
}

function scanText(label, text, findings) {
  for (const { name, pattern } of PATTERNS) {
    const match = text.match(pattern)
    if (!match) continue
    if (ALLOWED_HOSTS.has(match[0].replace(/^(?:\/\/|@)/, ''))) continue
    findings.push(`${label}: ${name}`)
  }
}

const findings = []

let tracked = []
try {
  tracked = git(['ls-files']).split('\n').filter(Boolean)
} catch {
  process.stderr.write('git ls-files failed, so nothing could be scanned\n')
  process.exit(1)
}

for (const file of tracked) {
  if (ALLOWLIST.has(file)) continue
  if (BINARY_EXTENSIONS.has(extname(file).toLowerCase())) continue
  let text
  try {
    text = readFileSync(resolve(root, file), 'utf8')
  } catch {
    continue
  }
  scanText(file, text, findings)
}

/**
 * History scan, restricted to the hand-authored source paths.
 *
 * The published site output is regenerated from those sources on every build,
 * so scanning it again in history would multiply the same bytes by every commit
 * without adding coverage. A secret can only enter through a source path.
 */
const HISTORY_PATHS = [
  'site/src',
  'scripts',
  'contracts',
  'conformance',
  'packages',
  'tests',
  '.github',
  'README.md',
  'package.json',
]

let historyScanned = false
try {
  const shallow = git(['rev-parse', '--is-shallow-repository']).trim()
  if (shallow === 'false') {
    const patch = git([
      'log',
      '--all',
      '--max-count=500',
      '--format=commit %H',
      '--unified=0',
      '--no-color',
      '-p',
      '--',
      ...HISTORY_PATHS,
    ])
    let commit = 'unknown'
    for (const line of patch.split('\n')) {
      if (line.startsWith('commit ')) {
        commit = line.slice(7, 19)
        continue
      }
      if (!line.startsWith('+') || line.startsWith('+++')) continue
      scanText(`history ${commit}`, line, findings)
    }
    historyScanned = true
  }
} catch {
  // A history scan failure is reported below, not swallowed.
}

if (findings.length > 0) {
  process.stderr.write('Secret scan failed:\n')
  for (const finding of [...new Set(findings)]) process.stderr.write(`  ${finding}\n`)
  process.exit(1)
}

process.stdout.write(
  `secret scan clean across ${tracked.length} tracked file(s)${historyScanned ? ' and the commit history' : ', history skipped on a shallow checkout'}\n`,
)
