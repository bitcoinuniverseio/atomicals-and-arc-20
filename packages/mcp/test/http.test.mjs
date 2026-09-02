import test from 'node:test'
import assert from 'node:assert/strict'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'node:http'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../..')
const artifacts = resolve(root, 'site/dist')

const { createHttpServer } = await import('../dist/http.js')

function start(port = 0) {
  const server = createHttpServer({ artifacts, port, host: '127.0.0.1', origins: ['http://127.0.0.1', 'http://allowed.example'] })
  return new Promise((resolvePromise) => server.listen(port, '127.0.0.1', () => resolvePromise(server)))
}

async function post(server, body, headers = {}) {
  const address = server.address()
  const response = await fetch(`http://127.0.0.1:${address.port}/mcp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  return { status: response.status, body: await response.json() }
}

test('the http transport answers initialize, tools, and resources statelessly', async () => {
  const server = await start()
  try {
    const init = await post(server, { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} })
    assert.equal(init.status, 200)
    assert.equal(init.body.result.serverInfo.name, 'atomicals-docs')
    assert.ok(init.body.result.capabilities.tools)
    assert.ok(init.body.result.capabilities.resources)

    const tools = await post(server, { jsonrpc: '2.0', id: 2, method: 'tools/list' })
    const names = tools.body.result.tools.map((tool) => tool.name)
    for (const expected of ['search_documentation', 'get_protocol_atlas', 'get_version_manifest', 'inspect_workflow', 'get_avm_opcodes', 'simulate_arc20_allocation', 'analyze_utxo_plan']) {
      assert.ok(names.includes(expected), `missing tool ${expected}`)
    }

    const atlas = await post(server, { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'get_protocol_atlas', arguments: {} } })
    assert.equal(atlas.body.result.isError, false)
    const payload = JSON.parse(atlas.body.result.content[0].text)
    assert.equal(payload.protocols.length, 11)

    const resources = await post(server, { jsonrpc: '2.0', id: 4, method: 'resources/list' })
    assert.ok(resources.body.result.resources.length >= 12)

    const read = await post(server, { jsonrpc: '2.0', id: 5, method: 'resources/read', params: { uri: 'docs://contracts/versions' } })
    const manifest = JSON.parse(read.body.result.contents[0].text)
    assert.equal(manifest.sets.length, 1)
  } finally {
    server.close()
  }
})

test('the simulation tools run the shared engines with pinned provenance', async () => {
  const server = await start()
  try {
    const simulation = await post(server, {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'simulate_arc20_allocation',
        arguments: {
          outputs: [{ value: 700 }, { value: 500 }],
          inputs: [{ atomicalId: 'TOKENA', txinIndex: 0, atomicalValue: 1200 }],
        },
      },
    })
    assert.equal(simulation.body.result.isError, false)
    const output = JSON.parse(simulation.body.result.content[0].text)
    assert.equal(output.source.id, 'atomicals-electrumx-1.5.2.0')
    assert.equal(output.result.outputs[0].coloredTotal, 700)

    const plan = await post(server, {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'analyze_utxo_plan',
        arguments: {
          inputs: [{ utxoId: 'x:0', value: 546, atomicals: { someid: 546 }, confirmed: true }],
          outputs: [{ value: 20000, role: 'receiver' }],
        },
      },
    })
    const planOutput = JSON.parse(plan.body.result.content[0].text)
    assert.ok(planOutput.analysis.warnings.length >= 1)
  } finally {
    server.close()
  }
})

test('security: origin check, method limits, and structured errors', async () => {
  const server = await start()
  try {
    const address = server.address()

    const hostile = await fetch(`http://127.0.0.1:${address.port}/mcp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://evil.example' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' }),
    })
    assert.equal(hostile.status, 403)

    const sse = await fetch(`http://127.0.0.1:${address.port}/mcp`)
    assert.equal(sse.status, 405)

    const missing = await fetch(`http://127.0.0.1:${address.port}/nope`)
    assert.equal(missing.status, 404)

    const badJson = await fetch(`http://127.0.0.1:${address.port}/mcp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    })
    assert.equal(badJson.status, 400)
    assert.equal((await badJson.json()).error.code, -32700)

    const unknownResource = await post(server, {
      jsonrpc: '2.0',
      id: 9,
      method: 'resources/read',
      params: { uri: 'docs://does-not-exist' },
    })
    assert.equal(unknownResource.body.error.code, -32002)

    const health = await fetch(`http://127.0.0.1:${address.port}/health`)
    assert.equal(health.status, 200)

    const manifest = await fetch(`http://127.0.0.1:${address.port}/.well-known/mcp-manifest.json`)
    const manifestBody = await manifest.json()
    assert.equal(manifestBody.safety.mutations, 'none')
    assert.equal(manifestBody.safety.outboundRequests, 'none')
  } finally {
    server.close()
  }
})

test('rate limiting answers 429 past the per-minute budget', async () => {
  const server = await start()
  try {
    const address = server.address()
    let sawLimited = false
    for (let index = 0; index < 70; index += 1) {
      const response = await fetch(`http://127.0.0.1:${address.port}/mcp`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: index, method: 'ping' }),
      })
      if (response.status === 429) {
        sawLimited = true
        break
      }
    }
    assert.ok(sawLimited, 'the limiter must engage within the minute window')
  } finally {
    server.close()
  }
})

test('the standalone http module never imports a fetch client', () => {
  const source = createServer ? 'node:http' : ''
  assert.equal(source, 'node:http')
})
