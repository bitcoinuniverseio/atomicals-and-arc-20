#!/usr/bin/env node
// One-off maintenance helper: rewrite relative in-content links into the root-relative
// form the remark plugin expects. Safe to re-run; it is a no-op once content is clean.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const docsRoot = resolve(root, 'site/src/content/docs')

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  )
}

const files = walk(docsRoot).filter((file) => /\.mdx?$/.test(file))
let changed = 0

for (const file of files) {
  const original = readFileSync(file, 'utf8')
  const relative = file.slice(docsRoot.length + 1).split('\\').join('/')
  const pageUrl = `/${relative.replace(/\.mdx?$/, '')}`.replace(/\/index$/, '')

  const next = original.replace(
    /(\]\(|href=")((?:\.\.?\/)[^)"]*)/g,
    (match, prefix, relativeHref) => {
      const absolute = new URL(relativeHref, `http://local${pageUrl}/`).pathname
      return prefix + absolute
    },
  )

  if (next !== original) {
    writeFileSync(file, next, 'utf8')
    changed += 1
    process.stdout.write(`rewrote ${relative}\n`)
  }
}

process.stdout.write(`${changed} file(s) normalised\n`)
