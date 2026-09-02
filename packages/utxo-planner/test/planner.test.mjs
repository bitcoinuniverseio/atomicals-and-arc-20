import test from 'node:test'
import assert from 'node:assert/strict'

import {
  classifyUtxo,
  detectRisks,
  generatePlans,
  OBJECTIVES,
  RISKS,
} from '../src/planner.mjs'

const plainUtxo = { utxoId: 'tx1:0', value: 50000, address: 'bc1qa', confirmed: true, atomicals: {} }
const arc20Utxo = {
  utxoId: 'tx1:1',
  value: 1092,
  address: 'bc1qb',
  confirmed: true,
  atomicals: { 'a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4i5': 1092 },
}
const nftUtxo = {
  utxoId: 'tx1:2',
  value: 1000,
  address: 'bc1qc',
  confirmed: true,
  atomicals: { 'b1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4i9': 1 },
}
const unknownUtxo = { utxoId: 'tx1:3', value: 700, address: 'bc1qd', confirmed: false }

test('classification separates plain, ARC-20, NFT, and unknown outputs', () => {
  assert.equal(classifyUtxo(plainUtxo).classification, 'plain')
  assert.equal(classifyUtxo(arc20Utxo).classification, 'arc-20-bearing')
  assert.equal(classifyUtxo(nftUtxo).classification, 'nft-bearing')
  assert.equal(classifyUtxo(unknownUtxo).classification, 'unknown')
})

test('unknown classification never claims safety and reports missing indexer data', () => {
  const classified = classifyUtxo(unknownUtxo)
  assert.equal(classified.confidence, 'none')
  assert.equal(classified.indexerDataAvailable, false)
  assert.ok(classified.evidence.some((entry) => entry.id === RISKS.UNKNOWN_STATE.id))
})

test('the accidental-burn detector fires when outputs cannot carry the units', () => {
  // The classic burn: an oversized receiver output cannot absorb the units,
  // and allocation has nowhere to place the remainder.
  const result = detectRisks({
    inputs: [arc20Utxo],
    outputs: [{ value: 1000, role: 'receiver', address: 'bc1qreceiver' }, { value: 92000, role: 'change', address: 'bc1qa' }],
    feeRate: 1,
  })
  assert.ok(result.warnings.some((warning) => warning.risk.id === RISKS.ACCIDENTAL_BURN.id))

  // A fee paid out of a carrying input destroys the coloured sats it eats.
  const feeBurn = detectRisks({
    inputs: [arc20Utxo],
    outputs: [
      { value: 546, role: 'receiver', address: 'bc1qreceiver' },
      { value: 500, role: 'change', address: 'bc1qa' },
    ],
    feeRate: 1,
  })
  assert.ok(feeBurn.warnings.some((warning) => warning.risk.id === RISKS.INSUFFICIENT_CHANGE.id && warning.fatal))
})

test('overspending is refused with a fatal warning, not adjusted silently', () => {
  const result = detectRisks({
    inputs: [plainUtxo],
    outputs: [
      { value: 40000, role: 'receiver', address: 'bc1qreceiver' },
      { value: 40000, role: 'change', address: 'bc1qa' },
    ],
    feeRate: 1,
  })
  const fatal = result.warnings.find((warning) => warning.risk.id === RISKS.LOW_FEE.id)
  assert.ok(fatal)
  assert.equal(fatal.fatal, true)
})

test('mixed token inputs warn explicitly', () => {
  const other = {
    utxoId: 'tx2:0',
    value: 800,
    address: 'bc1qe',
    confirmed: true,
    atomicals: { 'c1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4i7': 800 },
  }
  const result = detectRisks({
    inputs: [arc20Utxo, other],
    outputs: [{ value: 1892, role: 'receiver', address: 'bc1qreceiver' }],
    feeRate: 1,
  })
  assert.ok(result.warnings.some((warning) => warning.risk.id === RISKS.MIXED_ASSETS.id))
})

test('dust, unconfirmed inputs, and change reuse are each detected', () => {
  const result = detectRisks({
    inputs: [{ ...plainUtxo, confirmed: false }],
    outputs: [
      { value: 300, role: 'receiver', address: 'bc1qreceiver' },
      { value: 49500, role: 'change', address: 'bc1qa' },
      { value: 200, role: 'change', address: 'bc1qa' },
    ],
    feeRate: 1,
  })
  const ids = result.warnings.map((warning) => warning.risk.id)
  assert.ok(ids.includes(RISKS.DUST.id))
  assert.ok(ids.includes(RISKS.UNCONFIRMED_INPUT.id))
  assert.ok(ids.includes(RISKS.REUSED_CHANGE.id))
})

test('plans are deterministic for the same inputs', () => {
  const first = generatePlans(OBJECTIVES.CONSOLIDATE_PLAIN, [plainUtxo, { ...plainUtxo, utxoId: 'tx9:0' }], { receiver: 'bc1qz' })
  const second = generatePlans(OBJECTIVES.CONSOLIDATE_PLAIN, [plainUtxo, { ...plainUtxo, utxoId: 'tx9:0' }], { receiver: 'bc1qz' })
  assert.deepEqual(first, second)
})

test('preserve-all produces a hands-off plan instead of pretending to move assets', () => {
  const plans = generatePlans(OBJECTIVES.PRESERVE_ALL, [arc20Utxo, unknownUtxo], {})
  assert.equal(plans.length, 1)
  assert.equal(plans[0].inputs.length, 0)
  assert.equal(plans[0].safety, 'all-assets-preserved')
})

test('transfer planning proposes an exact-amount plan with a safe change path', () => {
  const plans = generatePlans(OBJECTIVES.TRANSFER_AMOUNT, [arc20Utxo, plainUtxo], { amount: 1092, receiver: 'bc1qreceiver' })
  const exact = plans.find((plan) => plan.outputs.some((output) => output.value === 1092 && output.role === 'receiver'))
  assert.ok(exact, 'an exact plan exists')
  assert.equal(exact.inputs.length, 1)
  const burnWarnings = exact.warnings.filter((warning) => warning.risk.id === RISKS.ACCIDENTAL_BURN.id)
  assert.deepEqual(burnWarnings, [], 'sending the exact unit count must not warn about burns')
})

test('isolate-unknown freezes each unknown output into its own plan', () => {
  const plans = generatePlans(OBJECTIVES.ISOLATE_UNKNOWN, [unknownUtxo], { isolationAddress: 'bc1qfresh' })
  assert.equal(plans.length, 1)
  assert.equal(plans[0].outputs[0].address, 'bc1qfresh')
})

test('every warning carries the pinned source so the UI can cite it', () => {
  const result = detectRisks({ inputs: [{ ...plainUtxo, confirmed: false }], outputs: [{ value: 300 }], feeRate: 1 })
  for (const warning of result.warnings) {
    assert.ok(warning.risk.page.startsWith('/'))
    assert.ok(warning.risk.path)
  }
})
