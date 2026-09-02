import test from 'node:test'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const { createNativeBackend, createWasmBackend, validateProgram, LIMITS } = await import('../src/host.mjs')

test('the pinned source checksum contract matches the vendored tarball', () => {
  const contract = JSON.parse(readFileSync(resolve(root, 'source-checksum.json'), 'utf8'))
  assert.equal(contract.revision, 'c185e6216a3ea2cb2e011e508033ca535ece3472')
  const tarball = resolve(root, contract.tarball)
  if (!existsSync(tarball)) {
    assert.fail('the vendored pinned source tarball is missing from the repository')
  }
  const digest = createHash('sha256').update(readFileSync(tarball)).digest('hex')
  assert.equal(digest, contract.sha256, 'the vendored tarball must match the recorded checksum')
})

test('program validation enforces the size limits without executing anything', () => {
  assert.equal(validateProgram('').ok, false)
  assert.equal(validateProgram('x'.repeat(LIMITS.programBytes + 1)).ok, false)
  assert.equal(validateProgram('OP_RETURN OP_1').ok, true)
})

test('the wasm backend refuses honestly when the release build is absent', async () => {
  const backend = await createWasmBackend(null)
  assert.equal(backend.available, false)
  const result = await backend.run('OP_1')
  assert.equal(result.ok, false)
  assert.match(result.error, /release pipeline/)
})

test('the native backend refuses honestly when the binary is absent', async () => {
  const backend = createNativeBackend(resolve(root, 'out/avm-cli'), async () => {
    throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' })
  })
  const result = await backend.run('OP_1 OP_ADD')
  assert.equal(result.ok, false)
  assert.match(result.error, /native backend unavailable/)
})

test('golden fixtures run only when a built backend exists (CI), never faked', async () => {
  const binaryPath = resolve(root, 'out/avm-cli')
  const wasmPath = resolve(root, 'out/avm-interpreter.mjs')
  if (!existsSync(binaryPath) && !existsSync(wasmPath)) {
    process.stdout.write('skipped: no built backend in this environment; the CI avm gate runs the goldens\n')
    return
  }
  const golden = JSON.parse(readFileSync(resolve(root, 'fixtures/golden.json'), 'utf8'))
  const backend = existsSync(binaryPath)
    ? createNativeBackend(binaryPath)
    : await createWasmBackend((await import(wasmPath)).default)
  for (const fixture of golden.fixtures) {
    const result = await backend.run(fixture.program)
    assert.equal(result.ok, fixture.expectOk, fixture.name)
    if (fixture.expectOutput) assert.equal(result.output?.trim(), fixture.expectOutput, fixture.name)
  }
})
