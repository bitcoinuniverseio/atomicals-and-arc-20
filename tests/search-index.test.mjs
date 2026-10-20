import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
const script = fileURLToPath(new URL('../scripts/index-search.mjs', import.meta.url))
const snapshot = root => {
  const walk = path => readdirSync(path,{withFileTypes:true}).flatMap(file => file.isDirectory() ? walk(resolve(path,file.name)) : [resolve(path,file.name)])
  return walk(root).sort().map(file=>[relative(root,file),createHash('sha256').update(readFileSync(file)).digest('hex')])
}
test('fresh Pagefind processes preserve multilingual search and produce identical bytes despite filesystem creation order',()=>{
  const base=mkdtempSync(resolve(tmpdir(),'atomicals-search-order-'))
  const files=['index.html','guide/one/index.html','guide/two/index.html','pt/primeiro/index.html','pt/segundo/index.html','ja/first/index.html']
  try {
    for(const [iteration,order] of [files,[...files].reverse(),[files[2],files[0],files[4],files[1],files[5],files[3]]].entries()) {
      const root=resolve(base,String(iteration));mkdirSync(root)
      for(const file of order){mkdirSync(resolve(root,file,'..'),{recursive:true});const lang=file.startsWith('pt/')?'pt':file.startsWith('ja/')?'ja':'en'
        writeFileSync(resolve(root,file),`<html lang="${lang}"><head><title>${file}</title></head><body><main data-pagefind-body><h1>${file}</h1><p>Unique protocol allocation reference ${file} token.</p></main></body></html>`)
      }
      execFileSync(process.execPath,[script,root],{stdio:'pipe',timeout:60000})
    }
    const expected=snapshot(resolve(base,'0/pagefind'))
    assert.deepEqual(snapshot(resolve(base,'1/pagefind')),expected)
    assert.deepEqual(snapshot(resolve(base,'2/pagefind')),expected)
    const entry=JSON.parse(readFileSync(resolve(base,'0/pagefind/pagefind-entry.json'),'utf8'))
    assert.deepEqual(Object.keys(entry.languages),['en','ja','pt'])
    const fragments=readdirSync(resolve(base,'0/pagefind/fragment')).map(file=>JSON.parse(gunzipSync(readFileSync(resolve(base,'0/pagefind/fragment',file))).toString().replace(/^pagefind_dcd/,'')))
    assert.equal(fragments.length,files.length)
    assert.deepEqual(fragments.map(record=>record.url).sort(),files.map(file=>'/'+(file==='index.html'?'':file.slice(0,-10))).sort())
    for(const record of fragments)assert.match(record.content.replaceAll("\u200b", ""),/Unique protocol allocation reference/)
  } finally {rmSync(base,{recursive:true,force:true})}
})
