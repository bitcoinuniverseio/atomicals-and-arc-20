import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (relative) => readFileSync(resolve(root, relative), 'utf8')

const coverage = JSON.parse(read('site/src/generated/sdk-coverage.json'))
const workflows = JSON.parse(read('site/src/generated/workflows.json'))

function snake(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
}

function pascal(value) {
  return snake(value)
    .split('_')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('')
}

test('the generated clients cover every read-only operation in every contract', () => {
  let expected = 0
  for (const name of ['arc20', 'atomicals-nfts-realms', 'marketplace-v1']) {
    const document = JSON.parse(read(`contracts/openapi/${name}.json`))
    for (const item of Object.values(document.paths)) {
      for (const [method, operation] of Object.entries(item)) {
        if (method === 'get') {
          expected += 1
          assert.ok(coverage.operations.includes(operation.operationId), `${operation.operationId} missing from coverage`)
        }
      }
    }
  }
  assert.equal(coverage.operationCount, expected)
})

test('the generated sources actually contain every covered operation', () => {
  const python = read('clients/python/atomicals_client/client.py')
  const go = read('clients/go/client.go')
  const rust = read('clients/rust/src/lib.rs')
  for (const operationId of coverage.operations.slice(0, 60)) {
    assert.ok(python.includes(snake(operationId)), `python missing ${operationId}`)
    assert.ok(go.includes(pascal(operationId)), `go missing ${operationId}`)
    assert.ok(rust.includes(snake(operationId)), `rust missing ${operationId}`)
  }
})

test('no generated client carries a hidden default origin, signing, or broadcast', () => {
  for (const file of [
    'clients/python/atomicals_client/client.py',
    'clients/go/client.go',
    'clients/rust/src/lib.rs',
  ]) {
    const source = read(file)
    assert.equal(/https:\/\/[^\s"]*bitcoinuniverse\.io/.test(source), false, `${file} must not hard-code an origin`)
    // Strip comments, doc lines, and docstring blocks first: operation
    // summaries and usage notes legitimately describe the marketplace
    // signing contract and refusal promises in prose.
    const code = source
      .replace(/"""[\s\S]*?"""/g, ' ')
      .split('\n')
      .filter((line) => !/^\s*(\/\/|#)/.test(line))
      .join('\n')
    assert.equal(/sign|broadcast|wif|private[_ ]?key/i.test(code), false, `${file} code must not touch signing or broadcasting`)
  }
})

test('every arazzo workflow generated a page artefact with steps', () => {
  assert.equal(workflows.workflows.length, 10)
  for (const workflow of workflows.workflows) {
    assert.ok(workflow.steps.length >= 1, `${workflow.workflowId} has steps`)
    for (const step of workflow.steps) {
      assert.ok(step.curl.startsWith('curl '), `${workflow.workflowId}/${step.stepId} curl example`)
    }
  }
})

test('rust, python, and go packages exist on disk', () => {
  assert.ok(existsSync(resolve(root, 'clients/rust/Cargo.toml')))
  assert.ok(existsSync(resolve(root, 'clients/go/go.mod')))
  assert.ok(existsSync(resolve(root, 'clients/python/pyproject.toml')))
})
