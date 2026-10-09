#!/usr/bin/env node
/**
 * Publishes sw-version.json for the offline service worker.
 *
 * The cache identity includes the built content and assets, so a worker cache
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

const workerSource = readFileSync(resolve(ROOT, 'site/public/sw.js'), 'utf8')
const digest = createHash('sha256').update(pageManifest).update(workerSource)
for (const file of walk(distDir).sort()) {
  const path = relative(distDir, file).split('\\').join('/')
  if (path === 'sw.js' || path === 'sw-version.json') continue
  digest.update(path).update('\0').update(readFileSync(file)).update('\0')
}
const buildId = digest.digest('hex').slice(0, 16)
writeFileSync(resolve(distDir, 'sw.js'), workerSource.replace('__BUILD_ID__', buildId))

writeFileSync(resolve(distDir, 'sw-version.json'), `${JSON.stringify({ buildId, precache }, null, 2)}\n`)
process.stdout.write(`sw-version.json written (build ${buildId}, ${precache.length} stylesheets precached)\n`)
