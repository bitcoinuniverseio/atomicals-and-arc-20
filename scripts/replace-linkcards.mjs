#!/usr/bin/env node
// Maintenance helper: Starlight's LinkCard takes a raw href, which bypasses the
// base-path and locale rewriting the rest of the site uses. Replace those blocks
// with the EntryCards component so every card link resolves correctly in all locales.
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

function attr(source, name) {
  const match = source.match(new RegExp(`${name}="([^"]*)"`))
  return match ? match[1] : ''
}

let changed = 0
for (const file of walk(docsRoot).filter((f) => f.endsWith('.mdx'))) {
  const original = readFileSync(file, 'utf8')
  if (!original.includes('<CardGrid>')) continue

  const depth = relative(docsRoot, file).split(/[\\/]/).length
  const importPath = `${'../'.repeat(depth + 1)}components/EntryCards.astro`

  let next = original.replace(/<CardGrid>([\s\S]*?)<\/CardGrid>/g, (_match, inner) => {
    const cards = [...inner.matchAll(/<LinkCard\b([^>]*)\/>/g)].map((entry) => ({
      title: attr(entry[1], 'title'),
      body: attr(entry[1], 'description'),
      href: attr(entry[1], 'href'),
    }))
    if (cards.length === 0) return _match
    const body = cards
      .map(
        (card) =>
          `    { title: ${JSON.stringify(card.title)}, body: ${JSON.stringify(card.body)}, href: ${JSON.stringify(card.href)} },`,
      )
      .join('\n')
    return `<EntryCards\n  cards={[\n${body}\n  ]}\n/>`
  })

  next = next.replace(/,?\s*CardGrid,?\s*LinkCard\s*}/, ' }').replace(/{\s*}/, '{ Aside }')
  next = next.replace(
    /import\s*{\s*Aside\s*}\s*from\s*'@astrojs\/starlight\/components'/,
    `import { Aside } from '@astrojs/starlight/components'\nimport EntryCards from '${importPath}'`,
  )

  if (next !== original) {
    writeFileSync(file, next, 'utf8')
    changed += 1
    process.stdout.write(`updated ${relative(docsRoot, file)}\n`)
  }
}
process.stdout.write(`${changed} file(s) updated\n`)
