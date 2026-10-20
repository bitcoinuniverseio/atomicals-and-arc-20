#!/usr/bin/env node
// Feed the pinned Starlight Pagefind dependency in a stable order. addDirectory
// indexes concurrently, so document IDs and shard bytes can vary on fresh builds.
import { createRequire, findPackageJSON } from 'node:module'
import { readFileSync, readdirSync, writeFileSync, mkdirSync, rmSync, renameSync, existsSync, lstatSync } from 'node:fs'
import { resolve, relative, dirname, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const requireSite = createRequire(resolve(root, 'site/package.json'))
const packagePath = findPackageJSON('pagefind', pathToFileURL(requireSite.resolve('@astrojs/starlight')))
const dependency = JSON.parse(readFileSync(packagePath))
const entry = resolve(dirname(packagePath), dependency.exports['.'].import)
if (dependency.version !== '1.5.2') throw new Error('Expected the locked Pagefind 1.5.2 dependency')
const pagefind = await import(pathToFileURL(entry).href)
const dist = resolve(process.argv[2] ?? resolve(root, 'site/dist'))
if (dist === root || dist === resolve(dist, '..') || !lstatSync(dist).isDirectory() || lstatSync(dist).isSymbolicLink()) throw new Error('Expected an owned build directory')
const output = resolve(dist, 'pagefind')
const staged = resolve(dist, '.pagefind-sorted')
if (existsSync(staged)) throw new Error('A prior incomplete search build needs review')
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(item => {
  if (item.isSymbolicLink()) throw new Error('Search inputs must be regular owned files')
  const file = resolve(directory, item.name)
  return item.isDirectory() ? (file === output ? [] : walk(file)) : file.endsWith('.html') ? [file] : []
})
const files = walk(dist).map(file => relative(dist, file).split(sep).join('/')).sort()
if (!files.length) throw new Error('Search requires built HTML pages')
const checked = result => {
  if (!Array.isArray(result.errors) || result.errors.length) throw new Error('Pagefind indexing failed')
  return result
}
try {
  const { index } = checked(await pagefind.createIndex())
  if (!index) throw new Error('Pagefind did not create an index')
  for (const file of files) {
    const url = '/' + (file === 'index.html' ? '' : file.endsWith('/index.html') ? file.slice(0, -10) : file)
    checked(await index.addHTMLFile({ sourcePath: file, url, content: readFileSync(resolve(dist, file), 'utf8') }))
  }
  // Receive complete buffers before closing the native service. writeFiles can
  // return while bundled static assets are still being flushed to disk.
  const { files: assets } = checked(await index.getFiles())
  if (!Array.isArray(assets) || !assets.length) throw new Error('Search returned no assets')
  mkdirSync(staged)
  const seen = new Set()
  for (const asset of assets) {
    const target = resolve(staged, asset.path)
    if (!target.startsWith(staged + sep) || seen.has(target) || !(asset.content instanceof Uint8Array) || !asset.content.length) throw new Error('Invalid search asset')
    seen.add(target)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, asset.content)
  }
  const manifestPath = resolve(staged, 'pagefind-entry.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (!manifest.languages || !Object.keys(manifest.languages).length) throw new Error('Search has no indexed languages')
  manifest.languages = Object.fromEntries(Object.entries(manifest.languages).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0))
  writeFileSync(manifestPath, JSON.stringify(manifest))
  if (existsSync(output) && lstatSync(output).isSymbolicLink()) throw new Error('Search output must not be a link')
  rmSync(output, { recursive: true, force: true })
  renameSync(staged, output)
  console.log(`Indexed ${files.length} HTML pages in stable source order`)
} finally {
  await pagefind.close()
}
