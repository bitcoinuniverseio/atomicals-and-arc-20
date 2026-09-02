#!/usr/bin/env node
/**
 * Publishes sw-version.json for the offline service worker.
 *
 * The cache identity is a hash of the built page manifest, so a worker cache
 * maps to exactly one documentation build and cache migration is automatic.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')
const distDir = resolve(ROOT, 'site/dist')

const pageManifest = readFileSync(resolve(distDir, 'manifest.json'))
const buildId = createHash('sha256').update(pageManifest).digest('hex').slice(0, 16)

const astroDir = resolve(distDir, '_astro')
const { readdirSync, statSync } = await import('node:fs')
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(resolve(dir, entry.name)) : [resolve(dir, entry.name)],
  )
}
const precache = walk(astroDir)
  .map((file) => relative(distDir, file).split('\\').join('/'))
  .filter((file) => file.endsWith('.css'))

writeFileSync(resolve(distDir, 'sw-version.json'), `${JSON.stringify({ buildId, precache }, null, 2)}\n`)
process.stdout.write(`sw-version.json written (build ${buildId}, ${precache.length} stylesheets precached)\n`)
