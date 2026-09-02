import test from 'node:test'
import assert from 'node:assert/strict'

import {
  isSendableOperation,
  evaluateResponse,
  deriveVerdict,
  scrubReport,
  extractIdentity,
  MAX_RESPONSE_BYTES,
} from '../src/rules.mjs'

const readGet = { 'x-read-only': true, responses: { 200: { content: { 'application/json': { schema: {} } } } } }
const pollPost = {
  responses: {
    202: { content: { 'application/json': {} } },
    401: { content: { 'application/json': { schema: { $ref: 'Error' } } } },
  },
}

test('only read-only GET and HEAD operations are ever sendable', () => {
  assert.equal(isSendableOperation(readGet, 'GET').sendable, true)
  assert.equal(isSendableOperation({ 'x-read-only': true, responses: {} }, 'HEAD').sendable, true)
  assert.equal(isSendableOperation(pollPost, 'POST').sendable, false)
  assert.equal(isSendableOperation(readGet, 'DELETE').sendable, false)
  const unmarked = isSendableOperation({ responses: {} }, 'GET')
  assert.equal(unmarked.sendable, false)
  assert.match(unmarked.reason, /not marked read-only/)
})

test('a conforming live response passes every check', () => {
  const result = evaluateResponse({
    operation: readGet,
    method: 'GET',
    status: 200,
    contentType: 'application/json',
    headers: {},
    body: JSON.stringify({ live: true, service: 'x', version: '1' }),
  })
  assert.equal(result.allPassed, true, JSON.stringify(result.checks))
})

test('an undocumented status and wrong media type both fail individually', () => {
  // A status the contract never declares has no media expectation to match,
  // but the undocumented status itself and the missing error shape both fail.
  const undocumented = evaluateResponse({
    operation: readGet,
    method: 'GET',
    status: 504,
    contentType: 'text/html',
    headers: {},
    body: '{}',
  })
  assert.deepEqual(
    undocumented.checks.filter((check) => !check.passed).map((check) => check.name).sort(),
    ['error shape follows the contract', 'status in contract'],
  )

  // A documented status with the wrong media type fails on media alone.
  const wrongMedia = evaluateResponse({
    operation: readGet,
    method: 'GET',
    status: 200,
    contentType: 'text/html',
    headers: {},
    body: '<html></html>',
  })
  assert.deepEqual(
    wrongMedia.checks.filter((check) => !check.passed).map((check) => check.name).sort(),
    ['body parses as JSON', 'media type matches'],
  )
})

test('error responses must carry error.code and error.message', () => {
  const bad = evaluateResponse({
    operation: { 'x-read-only': true, responses: { 500: {} } },
    method: 'GET',
    status: 500,
    contentType: 'application/json',
    headers: {},
    body: JSON.stringify({ message: 'nope' }),
  })
  assert.ok(bad.checks.some((check) => check.name === 'error shape follows the contract' && !check.passed))

  const good = evaluateResponse({
    operation: { 'x-read-only': true, responses: { 404: {} } },
    method: 'GET',
    status: 404,
    contentType: 'application/json',
    headers: {},
    body: JSON.stringify({ error: { code: 'not_found', message: 'x' } }),
  })
  assert.ok(good.checks.find((check) => check.name === 'error shape follows the contract').passed)
})

test('feed pagination is checked when the operation mentions nextCursor', () => {
  const operation = { 'x-read-only': true, responses: { 200: {} }, description: 'returns items and nextCursor' }
  const good = evaluateResponse({
    operation,
    method: 'GET',
    status: 200,
    contentType: 'application/json',
    headers: {},
    body: JSON.stringify({ items: [], nextCursor: null }),
  })
  assert.ok(good.checks.find((check) => check.name === 'pagination behaviour').passed)

  const bad = evaluateResponse({
    operation,
    method: 'GET',
    status: 200,
    contentType: 'application/json',
    headers: {},
    body: JSON.stringify({ items: [], nextCursor: 42 }),
  })
  assert.ok(!bad.checks.find((check) => check.name === 'pagination behaviour').passed)
})

test('required header parameters become individual checks', () => {
  const operation = {
    'x-read-only': true,
    responses: { 200: {} },
    parameters: [{ name: 'X-Generation', in: 'header', required: true, description: 'generation pin' }],
  }
  const missing = evaluateResponse({ operation, method: 'GET', status: 200, contentType: 'application/json', headers: {}, body: '{}' })
  assert.ok(!missing.checks.find((check) => check.name === 'header X-Generation present').passed)
  const present = evaluateResponse({
    operation,
    method: 'GET',
    status: 200,
    contentType: 'application/json',
    headers: { 'x-generation': 'g1' },
    body: '{}',
  })
  assert.ok(present.checks.find((check) => check.name === 'header X-Generation present').passed)
})

test('verdicts distinguish divergence from unreachability and wrong network', () => {
  assert.equal(deriveVerdict({ sent: false }).verdict, 'unknown')
  assert.equal(deriveVerdict({ sent: true, timedOut: true }).verdict, 'unreachable')
  assert.equal(deriveVerdict({ sent: true, networkError: true }).verdict, 'unreachable')

  const passing = { allPassed: true, checks: [] }
  assert.equal(
    deriveVerdict({
      sent: true,
      response: { status: 200 },
      evaluation: passing,
      identity: { network: 'mainnet' },
      expectedNetwork: 'mainnet',
    }).verdict,
    'compatible',
  )
  assert.equal(
    deriveVerdict({
      sent: true,
      evaluation: passing,
      identity: { network: 'mainnet' },
      expectedNetwork: 'regtest',
    }).verdict,
    'wrong-network',
  )
  assert.equal(
    deriveVerdict({
      sent: true,
      evaluation: passing,
      identity: { chainTip: 100, indexedHeight: 90 },
    }).verdict,
    'stale',
  )
  const divergence = deriveVerdict({
    sent: true,
    evaluation: { allPassed: false, checks: [{ name: 'status in contract', passed: false }] },
  })
  assert.equal(divergence.verdict, 'schema-divergence')
})

test('the scrubbed report carries no origin and says so', () => {
  const report = scrubReport({
    endpointLabel: 'https://my-endpoint.example',
    operationId: 'getStatus',
    verdict: { verdict: 'compatible', detail: 'ok' },
    evaluation: { checks: [{ name: 'status in contract', passed: true, detail: 'ok' }] },
    identity: { network: 'mainnet', buildRevision: 'abc123' },
    timing: { totalMs: 42 },
  })
  assert.equal(JSON.stringify(report).includes('my-endpoint.example'), false)
  assert.equal(report.identity.buildRevision, '[redacted]')
  assert.match(report.note, /redacted/)
})

test('identity is extracted from the identity surface only', () => {
  const identity = extractIdentity(
    { chainTip: 500, atomicalsTip: 499, coverage: 'partial', reason: 'r' },
    { network: 'regtest' },
  )
  assert.equal(identity.network, 'regtest')
  assert.equal(identity.chainTip, 500)
  assert.equal(identity.indexedHeight, 499)
  assert.equal(extractIdentity(null, null), null)
  assert.ok(MAX_RESPONSE_BYTES > 0)
})
