#!/usr/bin/env node
// Rewrites relative imports in content files so they resolve from the file's own depth.
// Content authors write `components/X.astro` and `conformance/y.mjs`; this normalises the
// `../` prefix. Safe to re-run: it is a no-op once the tree is correct.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const docsRoot = resolve(root, 'site/src/content/docs')

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  )
}

// Targets a content file can import, with the number of `../` needed to reach the
// directory that contains them, counted from site/src/content/docs itself.
const TARGETS = [
  { prefix: 'components/', hops: 2 },
  { prefix: 'lib/', hops: 2 },
  { prefix: 'data/', hops: 2 },
  { prefix: 'conformance/', hops: 4 },
  { prefix: 'contracts/', hops: 4 },
]

let changed = 0
for (const file of walk(docsRoot).filter((name) => name.endsWith('.mdx'))) {
  const original = readFileSync(file, 'utf8')
  const depth = relative(docsRoot, file).split(/[\\/]/).length - 1

  const next = original.replace(
    /(from\s+['"])((?:\.\.\/)+)([^'"]+)(['"])/g,
    (match, open, _dots, tail, close) => {
      const target = TARGETS.find((entry) => tail.startsWith(entry.prefix))
      if (!target) return match
      return `${open}${'../'.repeat(target.hops + depth)}${tail}${close}`
    },
  )

  if (next !== original) {
    writeFileSync(file, next, 'utf8')
    changed += 1
    process.stdout.write(`fixed ${relative(docsRoot, file)}\n`)
  }
}
process.stdout.write(`${changed} file(s) fixed\n`)
