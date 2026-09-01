#!/usr/bin/env node
/**
 * Builds the documentation site and publishes it to the repository root.
 *
 * The built site lives in version control because three consumers need the same bytes:
 * GitHub Pages serves the default branch, Inscribe consumes this repository as a submodule,
 * and the compatibility routes must exist as real files rather than as a build step someone
 * has to remember to run.
 *
 * Every published path is recorded in .site-manifest.json. On the next build, a path that
 * was published before and is not published now is removed, so the root cannot accumulate
 * stale files.
 */
import { spawnSync } from 'node:child_process'
import {
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
  rmSync,
  existsSync,
  statSync,
} from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const siteDir = resolve(root, 'site')
const distDir = resolve(siteDir, 'dist')
const manifestPath = resolve(root, '.site-manifest.json')

/** Paths at the repository root that the build never touches. */
const PRESERVED = new Set([
  '.git',
  '.github',
  '.gitignore',
  '.nojekyll',
  '.site-manifest.json',
  '.cursor',
  '.ai-memory.toml',
  'LICENSE',
  'README.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'package.json',
  'package-lock.json',
  'node_modules',
  'site',
  'scripts',
  'contracts',
  'conformance',
  'packages',
  'tests',
  'assets',
  'theme.css',
])

const args = process.argv.slice(2)
const skipAstro = args.includes('--skip-astro')

function run(command, commandArgs, cwd) {
  const result = spawnSync(command, commandArgs, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  if (result.status !== 0) {
    process.stderr.write(`\n${command} ${commandArgs.join(' ')} failed\n`)
    process.exit(result.status ?? 1)
  }
}

if (!skipAstro) {
  run('npx', ['astro', 'build'], siteDir)
}

run('node', [resolve(root, 'scripts/generate-artifacts.mjs'), '--out', distDir], root)

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  )
}

/**
 * Directories the build copies into `dist` for the preview and the MCP package, but does
 * not publish to the root, because the source files already live at exactly those paths
 * and are served from there.
 */
const ALREADY_AT_ROOT = new Set(['contracts', 'conformance'])

const built = walk(distDir)
  .map((file) => relative(distDir, file).split('\\').join('/'))
  .filter((file) => file !== '.generated-artifacts.json')
  .sort()

const published = built.filter((file) => !ALREADY_AT_ROOT.has(file.split('/')[0]))

// Refuse to publish anything that would clobber a preserved root path.
for (const file of published) {
  const top = file.split('/')[0]
  if (PRESERVED.has(top)) {
    process.stderr.write(`\nrefusing to publish ${file}: ${top} is a preserved root path\n`)
    process.exit(1)
  }
}

const previous = existsSync(manifestPath)
  ? (JSON.parse(readFileSync(manifestPath, 'utf8')).files ?? [])
  : []

// Remove files published by a previous build that this build no longer produces.
const publishedSet = new Set(published)
let removed = 0
for (const file of previous) {
  if (publishedSet.has(file)) continue
  const target = resolve(root, file)
  if (existsSync(target)) {
    rmSync(target, { force: true })
    removed += 1
  }
}

// Prune directories that the removals emptied.
function pruneEmptyDirectories(dir) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) pruneEmptyDirectories(join(dir, entry.name))
  }
  if (dir !== root && readdirSync(dir).length === 0) rmSync(dir, { recursive: true, force: true })
}

for (const file of previous) {
  if (publishedSet.has(file)) continue
  const top = file.split('/')[0]
  if (!PRESERVED.has(top)) pruneEmptyDirectories(resolve(root, top))
}

let copied = 0
for (const file of published) {
  const source = resolve(distDir, file)
  const target = resolve(root, file)
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(source, target)
  copied += 1
}

writeFileSync(
  manifestPath,
  `${JSON.stringify(
    {
      manifestVersion: '1.0.0',
      note: 'Every path published to the repository root by scripts/build.mjs. Do not edit by hand.',
      fileCount: published.length,
      files: published,
    },
    null,
    2,
  )}\n`,
  'utf8',
)

process.stdout.write(`\npublished ${copied} files to the repository root, removed ${removed}\n`)
