/** Package only the maintained public site and its immutable compatibility assets. */
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function stagePublishedSite({ root, out, maxFiles = 10000, maxBytes = 512 * 1024 * 1024 }) {
  root = resolve(root)
  out = resolve(out)
  if (out === root || !relative(root, out).startsWith('..') || existsSync(out)) throw new Error('Refuse existing or repository-contained artifact destination')
  const record = JSON.parse(readFileSync(join(root, '.site-manifest.json'), 'utf8'))
  const manifest = Array.isArray(record) ? record : record?.files
  if (!Array.isArray(manifest) || !manifest.length || (!Array.isArray(record) && record.fileCount !== manifest.length)) throw new Error('Published manifest must be a consistent nonempty file list')
  const files = new Set()
  function add(name) {
    if (typeof name !== 'string' || !name || isAbsolute(name) || /^[A-Za-z]:/.test(name) || name.includes('\\') || name.includes(':') || name.split('/').some(x => /[. ]$/.test(x) || x.toLowerCase() === '.git' || x.toLowerCase() === '.env') || /\.(?:pass|pem|key)$/i.test(name)) throw new Error('Refuse unsafe published path')
    const path = resolve(root, name)
    if (relative(root, path).startsWith('..')) throw new Error('Published path escapes repository')
    const info = lstatSync(path)
    if (info.isSymbolicLink()) throw new Error('Refuse published symbolic link')
    if (relative(realpathSync(root), realpathSync(path)).startsWith('..')) throw new Error('Published path escapes repository')
    if (info.isDirectory()) {
      for (const child of readdirSync(path).sort()) add(`${name}/${child}`)
    } else if (info.isFile()) files.add(name)
    else throw new Error('Refuse nonregular published input')
  }
  for (const name of manifest) add(name)
  for (const name of ['_astro', 'assets', 'contracts', 'conformance', 'pagefind', 'theme.css', 'LICENSE', 'docs.manifest.json', 'SUPPORT.md', '.nojekyll']) if (existsSync(join(root, name))) add(name)
  if (!files.has('index.html')) throw new Error('Published site has no entry page')
  if (files.size > maxFiles) throw new Error('Published file budget exceeded')
  const names = [...files].sort()
  const bytes = names.reduce((n, name) => n + lstatSync(join(root, name)).size, 0)
  if (bytes > maxBytes) throw new Error('Published byte budget exceeded')
  const digest = createHash('sha256')
  mkdirSync(out, { recursive: true })
  for (const name of names) {
    const source = join(root, name)
    const destination = join(out, name)
    mkdirSync(dirname(destination), { recursive: true })
    copyFileSync(source, destination)
    const data = readFileSync(destination)
    digest.update(name).update('\0').update(createHash('sha256').update(data).digest())
  }
  const result = { files: files.size, bytes, sha256: digest.digest('hex') }
  writeFileSync(`${out}.receipt.json`, JSON.stringify(result) + '\n')
  return result
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (!process.argv[2]) throw new Error('Artifact output directory required')
    console.log(JSON.stringify(stagePublishedSite({ root: resolve(dirname(fileURLToPath(import.meta.url)), '..'), out: process.argv[2] })))
  } catch (error) {
    console.error(`Public artifact staging refused: ${error.code || error.message}`)
    process.exitCode = 1
  }
}
