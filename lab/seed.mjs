#!/usr/bin/env node
/**
 * Deterministic Regtest Lab seeder.
 *
 * Derives the required chain state from the pinned reference source: regtest
 * inherits the testnet activation heights (electrumx/lib/coins.py at the
 * pinned revision, BitcoinRegtest declares no overrides), so the seeder mines
 * past ATOMICALS_ACTIVATION_HEIGHT = 2505238 before creating any protocol
 * fixture. Everything is regtest-local, wallets are clearly labelled and
 * disposable, and every transaction passes `testmempoolaccept` before it is
 * ever broadcast.
 *
 * The same seed always produces the same state: fixed addresses per label,
 * fixed amounts, fixed order. `lab:reset` restores exactly this state.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')

// From the pinned source, verified against
// electrumx/lib/coins.py@8df23747835c20230fc8b8097d469e7a1d97c3e0.
export const ATOMICALS_ACTIVATION_HEIGHT_REGTEST = 2_505_238

const CORE_RPC = process.env.LAB_CORE_RPC ?? 'http://lab:lab@127.0.0.1:18443'
const MINE_BATCH = 50_000

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

function log(message) {
  process.stdout.write(`${message}\n`)
}

async function ensureWallet(label) {
  try {
    await rpc('createwallet', [label, false, false, '', false, true])
    log(`wallet created: ${label}`)
  } catch (error) {
    if (!String(error.message).includes('already exists')) throw error
    await rpc('loadwallet', [label]).catch((loadError) => {
      if (!String(loadError.message).includes('already loaded')) throw loadError
    })
  }
}

async function newAddress(label) {
  await ensureWallet(label)
  return rpc('getnewaddress', [label, 'bech32'])
}

/**
 * Mine in batches so progress is visible. Regtest mining is fast but the
 * activation height is inherited from testnet in the pinned source, so the
 * lab genuinely crosses 2.5 million blocks before any fixture exists.
 */
async function mineTo(height, address) {
  let current = await rpc('getblockcount')
  while (current < height) {
    const batch = Math.min(MINE_BATCH, height - current)
    await rpc('generatetoaddress', [batch, address])
    current = await rpc('getblockcount')
    log(`mined to ${current} / ${height}`)
  }
}

async function testMempoolAccept(signedHex) {
  const result = await rpc('testmempoolaccept', [[signedHex]])
  const verdict = result?.[0]
  if (!verdict?.allowed) {
    throw new Error(`testmempoolaccept rejected the transaction: ${verdict?.['reject-reason'] ?? 'unknown'}`)
  }
  return verdict
}

async function main() {
  const started = Date.now()
  log('lab:seed start (deterministic regtest state)')

  const miner = await newAddress('lab-miner')
  const holder = await newAddress('lab-arc20-holder')
  const receiver = await newAddress('lab-receiver')
  log(`miner ${miner}\nholder ${holder}\nreceiver ${receiver}`)

  // 1. Chain up to and past the activation boundary derived from the source.
  await mineTo(ATOMICALS_ACTIVATION_HEIGHT_REGTEST + 100, miner)

  // 2. Plain spendable UTXOs for the holder.
  await rpc('sendtoaddress', [holder, 5, 'plain-utxo-a', '', false, true])
  await rpc('sendtoaddress', [holder, 2.5, 'plain-utxo-b', '', false, true])
  await rpc('sendtoaddress', [receiver, 1, 'receiver-float', '', false, true])
  const mempool = await rpc('getrawmempool')
  for (const txid of mempool) {
    const raw = await rpc('getrawtransaction', [txid])
    await testMempoolAccept(raw)
    log(`policy check passed for ${txid}`)
  }
  const blocks = await rpc('generatetoaddress', [6, miner])

  // 3. Fixture feed for the read-only adapter.
  mkdirSync(resolve(here, 'fixtures'), { recursive: true })
  const feed = {
    generationId: `lab-${createHash('sha256').update(`${miner}:${holder}:${receiver}`).digest('hex').slice(0, 12)}`,
    assets: 0,
    holders: 2,
    events: 0,
    note: 'The minimal profile seeds chain state and wallets. Real ARC-20 mints require the full profile, which runs the pinned atomicals CLI in-container.',
    items: [],
    blocks: blocks.length,
    wallets: ['lab-miner', 'lab-arc20-holder', 'lab-receiver'],
    activationHeight: ATOMICALS_ACTIVATION_HEIGHT_REGTEST,
  }
  writeFileSync(resolve(here, 'fixtures', 'feed.json'), `${JSON.stringify(feed, null, 2)}\n`)
  writeFileSync(
    resolve(here, 'fixtures', 'state.json'),
    `${JSON.stringify({ blockCount: await rpc('getblockcount'), miner, holder, receiver, seededAtRun: true }, null, 2)}\n`,
  )
  log(`lab:seed complete in ${Math.round((Date.now() - started) / 1000)}s`)
}

main().catch((error) => {
  process.stderr.write(`lab:seed failed: ${error.message}\n`)
  process.exit(1)
})
