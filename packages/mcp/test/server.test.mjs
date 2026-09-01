import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DocumentationStore, TOOLS, callTool, handleRequest } from '../dist/server.js'

const here = dirname(fileURLToPath(import.meta.url))
const artifacts = resolve(here, '../../../site/dist')

const available = existsSync(resolve(artifacts, 'manifest.json'))
const store = available ? new DocumentationStore(artifacts) : null

test('the artefacts directory is present for these tests', () => {
  assert.ok(
    available,
    'Run `npm run build` first. These tests read the built documentation artefacts.',
  )
})

test('every declared tool is read only and has an input schema', () => {
  const forbidden = ['write', 'create', 'update', 'delete', 'sign', 'broadcast', 'send', 'set']
  for (const tool of TOOLS) {
    assert.ok(tool.name, 'a tool needs a name')
    assert.ok(tool.description, `${tool.name} needs a description`)
    assert.equal(tool.inputSchema.type, 'object', `${tool.name} needs an object input schema`)
    for (const verb of forbidden) {
      assert.ok(
        !tool.name.startsWith(`${verb}_`),
        `${tool.name} looks like a mutation. This server exposes reads only.`,
      )
    }
  }
  assert.equal(TOOLS.length, 10)
})

test('initialize advertises the tool capability and the server identity', () => {
  const response = handleRequest(store, { jsonrpc: '2.0', id: 1, method: 'initialize' })
  assert.equal(response.result.serverInfo.name, 'atomicals-docs')
  assert.ok(response.result.capabilities.tools)
})

test('tools/list returns every tool', () => {
  const response = handleRequest(store, { jsonrpc: '2.0', id: 2, method: 'tools/list' })
  assert.equal(response.result.tools.length, TOOLS.length)
})

test('an unknown method is a JSON-RPC error, not a crash', () => {
  const response = handleRequest(store, { jsonrpc: '2.0', id: 3, method: 'nope' })
  assert.equal(response.error.code, -32601)
})

test('search finds the burns page and scores the page id highest', () => {
  const results = callTool(store, 'search_documentation', { query: 'burns' })
  assert.ok(results.length > 0)
  assert.ok(results.some((entry) => entry.pageId === 'protocol/arc20/burns'))
})

test('search returns nothing for an empty query rather than everything', () => {
  assert.deepEqual(callTool(store, 'search_documentation', { query: '   ' }), [])
})

test('get_page returns raw Markdown with its provenance', () => {
  const page = callTool(store, 'get_page', { pageId: 'protocol/arc20/allocation' })
  assert.equal(page.pageId, 'protocol/arc20/allocation')
  assert.equal(page.applicability, 'protocol-behavior')
  assert.match(page.markdown, /# Allocation/)
  assert.match(page.markdown, /Page ID: protocol\/arc20\/allocation/)
})

test('get_page refuses an unknown page id', () => {
  assert.throws(() => callTool(store, 'get_page', { pageId: 'nope/nope' }), /No page with id/)
})

test('get_protocol_status separates applicability from authority', () => {
  const status = callTool(store, 'get_protocol_status', {
    pageId: 'protocol/avm/status-and-limitations',
  })
  assert.equal(status.applicability, 'experimental')
  assert.deepEqual(status.networks, ['none'])
  assert.ok(status.limitations.length > 0)
})

test('get_api_operation finds an operation across every document', () => {
  const operation = callTool(store, 'get_api_operation', { operationId: 'getAsset' })
  assert.equal(operation.method, 'GET')
  assert.equal(operation.path, '/v1/atomicals/assets/{atomicalId}')

  const marketplace = callTool(store, 'get_api_operation', {
    operationId: 'marketplaceGetContract',
  })
  assert.equal(marketplace.document, 'marketplace-v1')
})

test('get_json_schema lists definitions and returns one by name', () => {
  const list = callTool(store, 'get_json_schema', {})
  assert.ok(list.definitions.includes('AtomicAmount'))

  const one = callTool(store, 'get_json_schema', { definition: 'AtomicAmount' })
  assert.equal(one.schema.type, 'string')
  assert.ok(one.schema.pattern)
})

test('get_source_provenance returns the pinned reference revision', () => {
  const source = callTool(store, 'get_source_provenance', {
    sourceId: 'atomicals-electrumx-1.5.2.0',
  })
  assert.equal(source.revision, '8df23747835c20230fc8b8097d469e7a1d97c3e0')
  assert.equal(source.authority, 'protocol')
})

test('get_version_matrix carries the documentation version and every source', () => {
  const matrix = callTool(store, 'get_version_matrix', {})
  assert.equal(matrix.documentationVersion, '2026.08')
  assert.ok(matrix.sources.length >= 8)
})

test('get_conformance_vector returns a case and its pinned source', () => {
  const list = callTool(store, 'get_conformance_vector', {})
  assert.ok(list.cases.some((entry) => entry.id === 'oversized-next-output'))

  const single = callTool(store, 'get_conformance_vector', { caseId: 'oversized-next-output' })
  assert.equal(single.case.expected.burned[0].value, 500)
  assert.equal(single.source.id, 'atomicals-electrumx-1.5.2.0')
})

test('list_glossary_entries returns definitions', () => {
  const glossary = callTool(store, 'list_glossary_entries', {})
  assert.ok(glossary.count > 30, `expected a substantial glossary, got ${glossary.count}`)
  assert.ok(glossary.entries.some((entry) => entry.term === 'Atomical ID'))
})

test('list_known_limitations surfaces declared limitations across pages', () => {
  const limitations = callTool(store, 'list_known_limitations', {})
  assert.ok(limitations.length > 20)
  assert.ok(limitations.every((entry) => entry.limitations.length > 0))
})

test('a tool error is returned as an error result, not thrown at the transport', () => {
  const response = handleRequest(store, {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: { name: 'get_page', arguments: { pageId: 'does/not/exist' } },
  })
  assert.equal(response.result.isError, true)
  assert.match(response.result.content[0].text, /No page with id/)
})

test('the store refuses a path that escapes the artefacts directory', () => {
  assert.throws(
    () => callTool(store, 'get_page', { pageId: '../../../etc/passwd' }),
    /No page with id/,
  )
})

test('answers are deterministic for the same artefacts', () => {
  const first = callTool(store, 'search_documentation', { query: 'allocation' })
  const second = callTool(store, 'search_documentation', { query: 'allocation' })
  assert.deepEqual(first, second)
})
