import test from 'node:test'
import assert from 'node:assert/strict'
import { AtomicalsClient, AtomicalsApiError, operations } from '../dist/index.js'

function stubFetch(handler) {
  return async (url, init) => handler(String(url), init ?? {})
}

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
  })
}

test('a base URL is required, because a default becomes a production host', () => {
  assert.throws(() => new AtomicalsClient({}), /baseUrl is required/)
  assert.throws(() => new AtomicalsClient({ baseUrl: '' }), /baseUrl is required/)
})

test('the operation table covers every documented surface', () => {
  const ids = Object.keys(operations)
  assert.ok(ids.length > 60, `expected a substantial operation table, got ${ids.length}`)
  assert.ok(ids.includes('getAsset'))
  assert.ok(ids.includes('arc20GetFeedPage'))
  assert.ok(ids.includes('marketplaceGetContract'))
  for (const [id, operation] of Object.entries(operations)) {
    assert.equal(operation.operationId, id)
    assert.match(operation.path, /^\//)
    assert.ok(operation.summary.length > 0, `${id} needs a summary`)
  }
})

test('path parameters are substituted and encoded', () => {
  const client = new AtomicalsClient({ baseUrl: 'http://127.0.0.1:3044/' })
  const url = client.buildUrl('getAsset', {
    path: { atomicalId: 'abc123i0' },
  })
  assert.equal(url, 'http://127.0.0.1:3044/v1/atomicals/assets/abc123i0')
})

test('a missing path parameter is refused rather than producing a broken URL', () => {
  const client = new AtomicalsClient({ baseUrl: 'http://127.0.0.1:3044' })
  assert.throws(() => client.buildUrl('getAsset', {}), /Missing path parameter "atomicalId"/)
})

test('query parameters are applied and undefined values are dropped', () => {
  const client = new AtomicalsClient({ baseUrl: 'http://127.0.0.1:3044' })
  const url = client.buildUrl('listNfts', { query: { limit: 50, cursor: undefined } })
  assert.equal(url, 'http://127.0.0.1:3044/v1/atomicals-nfts/assets?limit=50')
})

test('freshness metadata travels with the parsed body', async () => {
  const client = new AtomicalsClient({
    baseUrl: 'http://127.0.0.1:3044',
    fetch: stubFetch(async () =>
      jsonResponse(
        { atomicalId: 'abc123i0', type: 'nft', generationId: 'gen_1' },
        { headers: { 'x-request-id': 'req_1', 'x-indexed-height': '900000' } },
      ),
    ),
  })

  const envelope = await client.call('getAsset', { path: { atomicalId: 'abc123i0' } })
  assert.equal(envelope.status, 200)
  assert.equal(envelope.requestId, 'req_1')
  assert.equal(envelope.generationId, 'gen_1')
  assert.equal(envelope.indexedHeight, 900000)
  assert.equal(envelope.data.atomicalId, 'abc123i0')
})

test('errors carry the machine readable code and the request identifier', async () => {
  const client = new AtomicalsClient({
    baseUrl: 'http://127.0.0.1:3044',
    fetch: stubFetch(async () =>
      jsonResponse(
        {
          error: { code: 'NFT_NOT_FOUND', message: 'NFT was not found in the active generation.' },
          requestId: 'req_2',
        },
        { status: 404 },
      ),
    ),
  })

  await assert.rejects(
    () => client.call('getNft', { path: { atomicalId: 'abc123i0' } }),
    (error) => {
      assert.ok(error instanceof AtomicalsApiError)
      assert.equal(error.status, 404)
      assert.equal(error.code, 'NFT_NOT_FOUND')
      assert.equal(error.requestId, 'req_2')
      assert.equal(error.retryable, false)
      return true
    },
  )
})

test('503 and 429 are marked retryable, 400 is not', async () => {
  for (const [status, retryable] of [
    [429, true],
    [503, true],
    [500, true],
    [400, false],
    [404, false],
  ]) {
    const client = new AtomicalsClient({
      baseUrl: 'http://127.0.0.1:3044',
      fetch: stubFetch(async () =>
        jsonResponse({ error: { code: 'X', message: 'x' } }, { status }),
      ),
    })
    await assert.rejects(
      () => client.call('getReady'),
      (error) => {
        assert.equal(error.retryable, retryable, `status ${status}`)
        return true
      },
    )
  }
})

test('a bearer token is sent only when one was supplied', async () => {
  let seen = null
  const withToken = new AtomicalsClient({
    baseUrl: 'http://127.0.0.1:3044',
    bearerToken: 'test-token',
    fetch: stubFetch(async (_url, init) => {
      seen = new Headers(init.headers).get('authorization')
      return jsonResponse({ items: [] })
    }),
  })
  await withToken.call('arc20GetFeedPage')
  assert.equal(seen, 'Bearer test-token')

  seen = null
  const withoutToken = new AtomicalsClient({
    baseUrl: 'http://127.0.0.1:3044',
    fetch: stubFetch(async (_url, init) => {
      seen = new Headers(init.headers).get('authorization')
      return jsonResponse({ items: [] })
    }),
  })
  await withoutToken.call('arc20GetFeedPage')
  assert.equal(seen, null)
})

test('pagination follows cursors and stops when there is no next page', async () => {
  const pages = [
    { items: [{ atomicalId: 'a' }], nextCursor: 'c1', generationId: 'gen_1' },
    { items: [{ atomicalId: 'b' }], nextCursor: null, generationId: 'gen_1' },
  ]
  let call = 0
  const client = new AtomicalsClient({
    baseUrl: 'http://127.0.0.1:3044',
    fetch: stubFetch(async () => jsonResponse(pages[call++])),
  })

  const seen = []
  for await (const page of client.paginate('listNfts', { query: { limit: 1 } })) {
    seen.push(...page.data.items)
  }
  assert.deepEqual(
    seen.map((item) => item.atomicalId),
    ['a', 'b'],
  )
})

test('pagination refuses to continue across a generation change', async () => {
  const pages = [
    { items: [], nextCursor: 'c1', generationId: 'gen_1' },
    { items: [], nextCursor: 'c2', generationId: 'gen_2' },
  ]
  let call = 0
  const client = new AtomicalsClient({
    baseUrl: 'http://127.0.0.1:3044',
    fetch: stubFetch(async () => jsonResponse(pages[call++])),
  })

  await assert.rejects(
    async () => {
      for await (const _page of client.paginate('listNfts')) {
        // Drain until it throws.
      }
    },
    (error) => {
      assert.equal(error.code, 'GENERATION_CHANGED')
      return true
    },
  )
})

test('the client exposes no signing, broadcasting, or credential storage surface', () => {
  const client = new AtomicalsClient({ baseUrl: 'http://127.0.0.1:3044' })
  const surface = [
    ...Object.getOwnPropertyNames(Object.getPrototypeOf(client)),
    ...Object.getOwnPropertyNames(client),
  ]
  for (const forbidden of ['sign', 'broadcast', 'privateKey', 'seed', 'mnemonic', 'wallet']) {
    assert.ok(
      !surface.some((name) => name.toLowerCase().includes(forbidden)),
      `client must expose no ${forbidden} surface`,
    )
  }
})
