#!/usr/bin/env node
// Authoring helper: split a bundle file into content pages.
// Sections are separated by a line of the form:  ===== relative/path.md =====
// Paths are relative to site/src/content/docs unless --root is given.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const bundlePath = resolve(args[0])
const rootIndex = args.indexOf('--root')
const outRoot =
  rootIndex >= 0 ? resolve(here, args[rootIndex + 1]) : resolve(here, 'site/src/content/docs')

const text = readFileSync(bundlePath, 'utf8').replace(/\r\n/g, '\n')
const parts = text.split(/^===== (.+?) =====$/m)

let written = 0
for (let index = 1; index < parts.length; index += 2) {
  const relative = parts[index].trim()
  const body = parts[index + 1].replace(/^\n/, '')
  const target = resolve(outRoot, relative)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, body, 'utf8')
  written += 1
  process.stdout.write(`wrote ${relative}\n`)
}
process.stdout.write(`${written} file(s) written\n`)
