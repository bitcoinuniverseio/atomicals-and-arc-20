#!/usr/bin/env node
/**
 * Lab read-only HTTP adapter.
 *
 * Implements the GET operations of the ARC-20 contract against the local
 * Bitcoin Core and the seeded fixture feed. Every response matches the
 * contract; where the lab cannot honestly produce indexer data it declares
 * coverage "partial" with the exact reason instead of inventing values.
 *
 * Read-only by construction: the adapter exposes no POST handler beyond a
 * refused poll route, binds loopback, and holds no credentials beyond the
 * ephemeral regtest RPC URL it is started with.
 */
import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'

const CORE_RPC = process.env.LAB_CORE_RPC ?? 'http://lab:lab@bitcoin-core:18443'
const PORT = Number(process.env.LAB_PORT ?? 3043)
const FEED_FILE = process.env.LAB_FEED_FILE ?? '/fixtures/feed.json'

let rpcId = 0
function coreRpc(method, params = []) {
  const [url, auth] = CORE_RPC.replace('http://', '').split('@')
  const [user, password] = (auth ?? 'lab:lab').split(':')
  return fetch(`http://${url}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`,
    },
    body: JSON.stringify({ jsonrpc: '1.0', id: (rpcId += 1), method, params }),
  }).then(async (response) => {
    const body = await response.json()
    if (body.error) throw new Error(body.error.message ?? 'rpc error')
    return body.result
  })
}

function send(response, status, payload) {
  const body = JSON.stringify(payload)
  response.writeHead(status, {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  })
  response.end(body)
}

async function readFeed() {
  if (!existsSync(FEED_FILE)) return null
  return JSON.parse(readFileSync(FEED_FILE, 'utf8'))
}

const server = createServer(async (request, response) => {
  const started = Date.now()
  const url = new URL(request.url ?? '/', 'http://127.0.0.1')
  try {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      // The lab is read-only. Even the operator poll route stays refused.
      send(response, 405, {
        error: { code: 'read_only', message: 'The lab adapter refuses mutation operations.' },
      })
      return
    }

    if (url.pathname === '/live') {
      await coreRpc('getblockcount')
      send(response, 200, { live: true, service: 'atomicals-lab-adapter', version: '1.0.0' })
      return
    }

    if (url.pathname === '/ready') {
      const feed = await readFeed()
      if (!feed) {
        send(response, 503, {
          ready: false,
          migrations: 'complete',
          snapshot: 'missing',
          reason: 'Run npm run lab:seed to write the deterministic fixture feed.',
        })
        return
      }
      send(response, 200, { ready: true, migrations: 'complete', snapshot: 'loaded', reason: null })
      return
    }

    if (url.pathname === '/token-explorer/status') {
      const chainTip = await coreRpc('getblockcount')
      const feed = (await readFeed()) ?? { assets: 0, holders: 0, events: 0, generationId: null }
      send(response, 200, {
        coverage: 'partial',
        reason: 'Lab adapter: ARC-20 state comes from the deterministic fixture seed, not a full index of the regtest chain.',
        assets: feed.assets ?? 0,
        holders: feed.holders ?? 0,
        events: feed.events ?? 0,
        chainTip,
        atomicalsTip: chainTip,
        generations: feed.generationId ? 1 : 0,
      })
      return
    }

    if (url.pathname === '/token-explorer/arc20') {
      const feed = await readFeed()
      if (!feed) {
        send(response, 503, {
          error: { code: 'not_seeded', message: 'The fixture feed does not exist yet. Run npm run lab:seed.' },
        })
        return
      }
      const pageSize = 20
      const cursor = Number(url.searchParams.get('cursor') ?? 0)
      const items = (feed.items ?? []).slice(cursor, cursor + pageSize)
      send(response, 200, {
        items,
        nextCursor: cursor + pageSize < (feed.items ?? []).length ? String(cursor + pageSize) : null,
        generationId: feed.generationId ?? null,
      })
      return
    }

    send(response, 404, {
      error: { code: 'not_found', message: `No lab route ${url.pathname}. See contracts/openapi/arc20.json.` },
    })
  } catch (error) {
    send(response, 503, {
      error: { code: 'lab_unreachable', message: `A lab dependency failed: ${String(error?.message ?? error)}` },
    })
  } finally {
    process.stdout.write(`${request.method} ${url.pathname} ${Date.now() - started}ms\n`)
  }
})

server.listen(PORT, '127.0.0.1', () => {
  process.stdout.write(`lab adapter on 127.0.0.1:${PORT}\n`)
})
