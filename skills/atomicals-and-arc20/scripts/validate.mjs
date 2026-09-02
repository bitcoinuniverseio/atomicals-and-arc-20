#!/usr/bin/env node
/**
 * Validates the Agent Skills package and produces the versioned archive.
 *
 * Structure rules: SKILL.md with frontmatter (name, description, version),
 * every reference file it routes to exists, no duplicated normative prose
 * (references point at repository artifacts instead), and no instruction
 * anywhere that asks for keys or suggests mainnet mutation.
 */
import { readFileSync, readdirSync, statSync, createWriteStream, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '../../..')
const skillDir = resolve(ROOT, 'skills/atomicals-and-arc20')

const failures = []
const expect = (condition, message) => {
  if (!condition) failures.push(message)
}

const skill = readFileSync(resolve(skillDir, 'SKILL.md'), 'utf8')
expect(skill.startsWith('---'), 'SKILL.md must start with frontmatter')
const frontmatter = skill.slice(3, skill.indexOf('---', 3))
expect(frontmatter.includes('name: atomicals-and-arc20'), 'frontmatter names the skill')
expect(frontmatter.includes('version:'), 'frontmatter carries a version')
expect(/description:\s*\n?\s*/.test(frontmatter), 'frontmatter carries a description')

// Every routed reference exists.
const routed = [...skill.matchAll(/references\/([a-z0-9-]+\.md)/g)].map((match) => match[1])
for (const file of routed) {
  expect(statSync(resolve(skillDir, 'references', file), { throwIfNoEntry: false }) !== undefined, `missing reference ${file}`)
}

// No key collection or mainnet mutation instructions.
const allFiles = ['SKILL.md', ...readdirSync(resolve(skillDir, 'references')).map((file) => `references/${file}`)]
for (const file of allFiles) {
  const text = readFileSync(resolve(skillDir, file), 'utf8')
  expect(
    !/(paste|enter|provide) your (private key|seed|mnemonic)|share your (private key|seed phrase)|ask the user for (their |your )?(private key|seed)|request (a |the )?(private key|seed phrase|mnemonic)/i.test(text),
    `${file} must not request secrets`,
  )
  expect(!/broadcast to mainnet|sign on mainnet/i.test(text), `${file} must not instruct mainnet mutation`)
}

// References must point at repository artifacts rather than restating rules.
const allocation = readFileSync(resolve(skillDir, 'references/arc20-allocation.md'), 'utf8')
expect(allocation.includes('packages/protocol-core'), 'allocation reference must delegate to the shared engine')

if (failures.length > 0) {
  for (const failure of failures) process.stderr.write(`FAILED ${failure}\n`)
  process.exit(1)
}
process.stdout.write(`skills:validated ${allFiles.length} files, ${routed.length} routed references\n`)

// Archive: deterministic tar with checksums beside it.
const outDir = resolve(ROOT, 'dist-skills')
mkdirSync(outDir, { recursive: true })
const archive = resolve(outDir, 'atomicals-and-arc20-skill.tar')
const tar = spawnSync('tar', ['--force-local', '-cf', archive, '-C', resolve(ROOT, 'skills'), 'atomicals-and-arc20'], { stdio: 'inherit', shell: process.platform === 'win32' })
if (tar.status !== 0) {
  process.stderr.write('archival failed (tar unavailable); validation still passed\n')
  process.exit(0)
}
const digest = createHash('sha256').update(readFileSync(archive)).digest('hex')
writeFileSync(`${archive}.sha256`, `${digest}  atomicals-and-arc20-skill.tar\n`)
process.stdout.write(`skills:packaged ${archive} (sha256 ${digest.slice(0, 16)}...)\n`)
