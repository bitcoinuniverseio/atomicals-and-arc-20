import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert/strict'
import test from 'node:test'
import { stagePublishedSite } from '../scripts/stage-published-site.mjs'

function fixture() {
  const parent = mkdtempSync(join(tmpdir(), 'universe-pages-stage-'))
  const root = join(parent, 'repo')
  const out = join(parent, 'artifact')
  mkdirSync(root)
  writeFileSync(join(root, '.site-manifest.json'), JSON.stringify({ manifestVersion: '1.0.0', fileCount: 1, files: ['index.html'] }))
  writeFileSync(join(root, 'index.html'), '<h1>Ready</h1>')
  return { root, out, parent }
}

test('published bytes and immutable compatibility assets are preserved', () => {
  const x = fixture()
  mkdirSync(join(x.root, '_astro'))
  writeFileSync(join(x.root, '_astro', 'old-cache.js'), 'const version = 1')
  writeFileSync(join(x.root, 'private.env'), 'not published')
  const a = stagePublishedSite(x)
  assert.equal(a.files, 2)
  assert.equal(readFileSync(join(x.out, 'index.html'), 'utf8'), '<h1>Ready</h1>')
  assert.equal(readFileSync(join(x.out, '_astro', 'old-cache.js'), 'utf8'), 'const version = 1')
  const b = stagePublishedSite({ ...x, out: join(x.parent, 'second') })
  assert.equal(a.sha256, b.sha256)
})

for (const path of ['../private.env', '/private.env', 'C:/private.env', '.env', '.ENV', '.. /private.env', 'index.html:private' ]) {
  test(`unsafe manifest path is refused: ${path}`, () => {
    const x = fixture()
    writeFileSync(join(x.root, '.site-manifest.json'), JSON.stringify([path]))
    assert.throws(() => stagePublishedSite(x), /unsafe published path/)
  })
}

test('missing published file fails before packaging', () => {
  const x = fixture()
  writeFileSync(join(x.root, '.site-manifest.json'), JSON.stringify(['missing.html']))
  assert.throws(() => stagePublishedSite(x), /ENOENT/)
})

test('existing output and repository-contained output are refused', () => {
  const x = fixture()
  mkdirSync(x.out)
  assert.throws(() => stagePublishedSite(x), /destination/)
  assert.throws(() => stagePublishedSite({ ...x, out: join(x.root, 'artifact') }), /destination/)
})

test('byte and file budgets refuse oversized artifacts', () => {
  const x = fixture()
  assert.throws(() => stagePublishedSite({ ...x, maxBytes: 1 }), /byte budget/)
  assert.throws(() => stagePublishedSite({ ...x, maxFiles: 0 }), /file budget/)
})

test('manifest count and entry-page guards refuse inconsistent inputs', () => {
  const x = fixture()
  writeFileSync(join(x.root, '.site-manifest.json'), JSON.stringify({ fileCount: 2, files: ['index.html'] }))
  assert.throws(() => stagePublishedSite(x), /consistent nonempty/)
  writeFileSync(join(x.root, '.site-manifest.json'), JSON.stringify(['theme.css']))
  writeFileSync(join(x.root, 'theme.css'), 'body{}')
  assert.throws(() => stagePublishedSite(x), /no entry page/)
})
