#!/usr/bin/env node
/**
 * Builds the extractive answer index for Ask Atomicals.
 *
 * Sentence-level entries derived from the built raw Markdown, each carrying
 * the page id, title, and href so every answer cites its source page. No
 * model, no network: retrieval is deterministic token overlap in the browser.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')
const rawDir = resolve(ROOT, 'site/dist/raw')
if (!existsSync(resolve(ROOT, 'site/dist/manifest.json'))) {
  // The index derives from the built output. On a fresh checkout before the
  // first build, keep the committed index and say so instead of failing.
  process.stdout.write('answer index: built output not present yet; keeping the committed index\n')
  process.exit(0)
}
const manifest = JSON.parse(readFileSync(resolve(ROOT, 'site/dist/manifest.json'), 'utf8'))

const ALIASES = {
  'colored satoshi': 'coloured satoshi',
  'color': 'colour',
  txid: 'transaction id',
  'burnt': 'burn',
  nft: 'non-fungible',
  'dmint': 'decentralized mint',
}

const englishPages = manifest.pages.filter((page) => page.locale === 'en')
const entries = []
const MAX_SENTENCES_PER_PAGE = 14

for (const page of englishPages) {
  let markdown
  try {
    markdown = readFileSync(resolve(rawDir, `${page.routeId || 'index'}.md`), 'utf8')
  } catch {
    continue
  }
  const text = markdown
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/#+ /g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_>|]/g, ' ')
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.replace(/\s+/g, ' ').trim())
    .filter((sentence) => sentence.length >= 40 && sentence.length <= 300)
    .filter((sentence) => /^[A-Z0-9]/.test(sentence))
  let taken = 0
  const seen = new Set()
  for (const sentence of sentences) {
    if (taken >= MAX_SENTENCES_PER_PAGE) break
    const key = sentence.slice(0, 60)
    if (seen.has(key)) continue
    seen.add(key)
    entries.push({
      p: page.pageId,
      t: page.title,
      h: page.href,
      s: sentence,
    })
    taken += 1
  }
}

const index = {
  indexVersion: '1.0.0',
  generatedBy: 'scripts/generate-answer-index.mjs',
  aliases: ALIASES,
  entryCount: entries.length,
  entries,
}

mkdirSync(resolve(ROOT, 'site/src/generated'), { recursive: true })
writeFileSync(resolve(ROOT, 'site/src/generated/answer-index.json'), `${JSON.stringify(index)}`)
process.stdout.write(`answer index: ${entries.length} sentences from ${englishPages.length} pages\n`)
