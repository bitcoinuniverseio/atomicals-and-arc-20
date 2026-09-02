#!/usr/bin/env node
// Maintenance helper: an href written directly in a component is not a Markdown
// link, so the content link plugin never sees it. This rewrites those to go
// through docHref, which applies the base path and the reader's locale.
// Safe to re-run: a no-op once every component resolves its own hrefs.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const componentsRoot = resolve(root, 'site/src/components')

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  )
}

let changed = 0
for (const file of walk(componentsRoot).filter((name) => name.endsWith('.astro'))) {
  const original = readFileSync(file, 'utf8')
  if (!/href="\/(?!\/)/.test(original)) continue

  const depth = relative(componentsRoot, file).split(/[\\/]/).length - 1
  const importPath = `${'../'.repeat(depth + 1)}lib/href`

  let next = original.replace(/href="(\/[^"]*)"/g, (match, path) => {
    // Leave anything already interpolated, and leave protocol-relative URLs.
    if (path.startsWith('//')) return match
    return `href={docHref(${JSON.stringify(path)}, locale)}`
  })

  // Add the import and the locale binding to the component frontmatter.
  if (!next.includes("from '" + importPath + "'")) {
    if (next.startsWith('---')) {
      const end = next.indexOf('\n---', 3)
      const head = next.slice(0, end)
      const tail = next.slice(end)
      const additions = [
        head.includes('docHref') ? '' : `import { docHref } from '${importPath}'`,
        head.includes('const locale =')
          ? ''
          : 'const locale = Astro.locals.starlightRoute?.locale',
      ]
        .filter(Boolean)
        .join('\n')
      next = `${head}\n${additions}${tail}`
    }
  }

  if (next !== original) {
    writeFileSync(file, next, 'utf8')
    changed += 1
    process.stdout.write(`updated ${relative(componentsRoot, file)}\n`)
  }
}

process.stdout.write(`${changed} component(s) updated\n`)
