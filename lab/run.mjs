#!/usr/bin/env node
/**
 * Regtest Lab runner: executes the critical read-only workflows against the
 * local stack and verifies the seeded state matches the deterministic
 * expectations. Exits non-zero on the first failed expectation.
 *
 * Runs against the adapter on 127.0.0.1:3043 and Bitcoin Core on 18443. Every
 * assertion is concrete: a status field, a block count, a refusal.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')
const ADAPTER = process.env.LAB_ADAPTER ?? 'http://127.0.0.1:3043'
const CORE_RPC = process.env.LAB_CORE_RPC ?? 'http://lab:lab@127.0.0.1:18443'

const failures = []
function expect(name, condition, detail = '') {
  if (condition) {
    process.stdout.write(`ok ${name}\n`)
  } else {
    failures.push(name)
    process.stderr.write(`FAILED ${name}${detail ? `: ${detail}` : ''}\n`)
  }
}

async function get(pathname) {
  const response = await fetch(`${ADAPTER}${pathname}`)
  return { status: response.status, body: await response.json().catch(() => null) }
}

let rpcId = 0
async function rpc(method, params = []) {
  const response = await fetch(CORE_RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '1.0', id: (rpcId += 1), method, params }),
  })
  const body = await response.json()
  if (body.error) throw new Error(`${method}: ${body.error.message}`)
  return body.result
}

async function main() {
  const state = existsSync(resolve(here, 'fixtures', 'state.json'))
    ? JSON.parse(readFileSync(resolve(here, 'fixtures', 'state.json'), 'utf8'))
    : null

  expect(
    'the seeder ran and recorded its state',
    Boolean(state?.miner),
    'run npm run lab:seed first',
  )

  const live = await get('/live')
  expect('GET /live is 200 and declares liveness', live.status === 200 && live.body?.live === true)

  const ready = await get('/ready')
  expect(
    'GET /ready is 200 with a loaded snapshot after seeding',
    ready.status === 200 && ready.body?.ready === true,
    JSON.stringify(ready.body),
  )

  const status = await get('/token-explorer/status')
  expect(
    'GET /token-explorer/status declares partial coverage with an exact reason',
    status.status === 200 && status.body?.coverage === 'partial' && typeof status.body?.reason === 'string',
  )
  expect(
    'the reported chain tip matches Bitcoin Core',
    status.body?.chainTip === (await rpc('getblockcount')),
  )

  const feed = await get('/token-explorer/arc20')
  expect('GET /token-explorer/arc20 returns a page-shaped feed', feed.status === 200 && Array.isArray(feed.body?.items))
  expect('the feed cursor terminates', feed.body?.nextCursor === null)

  // The adapter must refuse mutations outright.
  const refused = await fetch(`${ADAPTER}/indexer/atomicals/poll`, { method: 'POST' })
  expect('POST poll is refused by the read-only adapter', refused.status === 405)

  // Bitcoin Core itself must reject a structurally broken transaction.
  const rejected = await rpc('testmempoolaccept', [['broken-hex']])
  expect('testmempoolaccept refuses a malformed transaction', rejected?.[0]?.allowed === false)

  if (failures.length > 0) {
    process.stderr.write(`lab:test failed with ${failures.length} expectation(s)\n`)
    process.exit(1)
  }
  process.stdout.write('lab:test passed\n')
}

main().catch((error) => {
  process.stderr.write(`lab:test crashed: ${error.message}\n`)
  process.exit(1)
})
