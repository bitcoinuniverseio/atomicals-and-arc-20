/**
 * Protocol Lab engine: deterministic Atomicals workflow simulation.
 *
 * Pure ESM, no DOM, no network, no wall clock. Every identifier derives from
 * the scenario seed, so the same scenario always replays to the same trace.
 * Identifiers are synthetic (they start with "sim") and never claim to be
 * real Bitcoin hashes.
 *
 * Protocol rules are evaluated by the shared allocation engine in
 * @bitcoin-universe/protocol-core, the exact module the conformance vectors
 * execute. The trace cites the rule and the pinned source path for every
 * outcome.
 */
import { allocate } from '@bitcoin-universe/protocol-core/allocation'
import { conservationCheck, estimateVirtualSize, DUST_THRESHOLD_SATS } from '@bitcoin-universe/protocol-core/tx'

export const SCENARIO_VERSION = '1.0.0'

/** The pinned source every rule evaluation cites. */
export const RULE_SOURCE = Object.freeze({
  id: 'atomicals-electrumx-1.5.2.0',
  revision: '8df23747835c20230fc8b8097d469e7a1d97c3e0',
})

/** Rule ids map onto documentation pages and pinned source paths. */
export const RULES = Object.freeze({
  ALLOCATION: Object.freeze({
    id: 'arc20/allocation',
    page: '/protocol/arc20/allocation/',
    path: 'normalFtAllocation',
  }),
  OUTPUT_ORDER: Object.freeze({
    id: 'arc20/output-ordering',
    page: '/protocol/arc20/allocation/',
    path: 'allocationValidation',
  }),
  BURN: Object.freeze({
    id: 'arc20/burn',
    page: '/protocol/arc20/burns/',
    path: 'splitAndInflation',
  }),
  DUST: Object.freeze({
    id: 'bitcoin/dust',
    page: '/protocol/arc20/psbt-requirements/',
    path: 'constants',
  }),
  FEE: Object.freeze({
    id: 'bitcoin/fee',
    page: '/protocol/arc20/psbt-requirements/',
    path: 'constants',
  }),
  REVEAL: Object.freeze({
    id: 'atomical/commit-reveal',
    page: '/protocol/core/commit-and-reveal/',
    path: 'mintParser',
  }),
  CONFIRMATION: Object.freeze({
    id: 'bitcoin/confirmation',
    page: '/protocol/core/confirmation-and-reorgs/',
    path: 'networkActivations',
  }),
  REORG: Object.freeze({
    id: 'bitcoin/reorg',
    page: '/protocol/core/confirmation-and-reorgs/',
    path: 'networkActivations',
  }),
})

/** Deterministic 32-bit FNV-1a, hex padded. The lab never uses Math.random. */
export function seededHash(seed, counter, label = '') {
  let hash = 0x811c9dc5
  const text = `${seed}:${counter}:${label}`
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export function syntheticTxid(seed, counter) {
  return `sim${seededHash(seed, counter, 'tx')}${seededHash(seed, counter + 1, 'tx')}`
}

export function syntheticAtomicalId(seed, counter, txid) {
  return `${txid}i${counter}`
}

/** Create the empty lab state for a scenario run. */
export function emptyState(scenario) {
  return {
    network: scenario.network ?? 'regtest',
    seed: scenario.seed,
    blockHeight: 0,
    mempool: [],
    blocks: [],
    utxos: new Map(),
    atomicals: new Map(),
    symbolic: new Map(),
    txCounter: 0,
    stepCounter: 0,
  }
}

function utxoId(txid, vout) {
  return `${txid}:${vout}`
}

/**
 * Register a created output under symbolic references so scenario authors
 * never need synthetic txids: "s0o1" names step 0 output 1, and a labelled
 * step also answers to "<label>o1".
 */
function registerOutputs(state, stepIndex, step, created) {
  created.forEach((output, index) => {
    if (!output.utxoId) return
    state.symbolic.set(`s${stepIndex}o${index}`, output.utxoId)
    if (step.label) state.symbolic.set(`${step.label}o${index}`, output.utxoId)
  })
}

function resolveRef(state, reference) {
  if (state.utxos.has(reference)) return reference
  const symbolic = state.symbolic.get(reference)
  if (symbolic && state.utxos.has(symbolic)) return symbolic
  return undefined
}

function snapshotUtxos(state) {
  const plain = {}
  for (const [id, utxo] of state.utxos) {
    plain[id] = {
      value: utxo.value,
      address: utxo.address,
      confirmed: utxo.confirmed,
      unspendable: utxo.unspendable ?? false,
      atomicals: Object.fromEntries(utxo.atomicals),
    }
  }
  return plain
}

function diffState(before, after) {
  const diff = []
  const ids = new Set([...Object.keys(before), ...Object.keys(after)])
  for (const id of ids) {
    const was = before[id]
    const now = after[id]
    if (JSON.stringify(was) !== JSON.stringify(now)) {
      diff.push({ utxo: id, before: was ?? null, after: now ?? null })
    }
  }
  return diff
}

/**
 * Run one validated scenario. Returns the full execution trace plus the final
 * state and a summary. Deterministic: same scenario in, same trace out.
 */
export function runScenario(scenario) {
  if (scenario.scenarioVersion !== SCENARIO_VERSION) {
    throw new RangeError(`scenarioVersion must be ${SCENARIO_VERSION}`)
  }
  const state = emptyState(scenario)
  const trace = []
  for (const step of scenario.steps ?? []) {
    const entry = applyStep(state, step)
    trace.push(entry)
    if (entry.fatal) break
  }
  return {
    traceVersion: '1.0.0',
    scenarioId: scenario.id,
    seed: scenario.seed,
    network: state.network,
    trace,
    finalState: {
      blockHeight: state.blockHeight,
      mempoolSize: state.mempool.length,
      utxos: snapshotUtxos(state),
      atomicals: Object.fromEntries(
        [...state.atomicals.entries()].map(([id, record]) => [
          id,
          JSON.parse(JSON.stringify({ ...record, assignments: undefined })),
        ]),
      ),
    },
    balances: balancesFor(state),
  }
}

/** Address holdings at the end of the run, in units and BTC sats. */
export function balancesFor(state) {
  const balances = new Map()
  for (const utxo of state.utxos.values()) {
    const entry = balances.get(utxo.address) ?? { sats: 0, atomicals: {} }
    entry.sats += utxo.value
    for (const [id, units] of utxo.atomicals) {
      entry.atomicals[id] = (entry.atomicals[id] ?? 0) + units
    }
    balances.set(utxo.address, entry)
  }
  return Object.fromEntries(balances)
}

function applyStep(state, step) {
  switch (step.type) {
    case 'fund':
      return stepFund(state, step)
    case 'reveal':
      return stepReveal(state, step)
    case 'transfer':
      return stepTransfer(state, step)
    case 'confirm':
      return stepConfirm(state, step)
    case 'reorg':
      return stepReorg(state, step)
    default:
      return {
        step,
        fatal: true,
        errors: [`unknown step type "${step.type}"`],
        rules: [],
        warnings: [],
      }
  }
}

function newTx(state, label) {
  state.txCounter += 1
  return syntheticTxid(state.seed, state.txCounter)
}

// ------------------------------------------------------------- fund

function stepFund(state, step) {
  const stepIndex = state.stepCounter
  const txid = newTx(state, 'fund')
  const outputs = []
  step.outputs.forEach((output, index) => {
    const id = utxoId(txid, index)
    const utxo = {
      txid,
      vout: index,
      value: output.value,
      address: output.address,
      scriptType: output.scriptType ?? 'p2tr',
      confirmed: false,
      atomicals: new Map(),
    }
    state.utxos.set(id, utxo)
    state.mempool.push(txid)
    outputs.push({ index, ...output, utxoId: id })
  })
  registerOutputs(state, stepIndex, step, outputs)
  state.stepCounter += 1
  return {
    step,
    txid,
    inputs: [],
    outputs,
    before: null,
    after: null,
    rules: [{ rule: RULES.FEE, outcome: 'coinbase-like funding output carries no fee', ok: true }],
    warnings: [],
    errors: [],
    stateDiff: [],
  }
}

// ------------------------------------------------------------- reveal

/**
 * Reveal an Atomical or ARC-20 deployment or mint. The commit is modeled as
 * already funded UTXOs (the fund step); the reveal spends them and creates
 * the object on output zero per the reference parser.
 */
function stepReveal(state, step) {
  const stepIndex = state.stepCounter
  const txid = newTx(state, 'reveal')
  const inputs = []
  let inValue = 0
  for (const reference of step.inputs) {
    const resolved = resolveRef(state, reference)
    if (!resolved) {
      return fatal(step, `input ${reference} does not exist`)
    }
    const utxo = state.utxos.get(resolved)
    inputs.push({ utxoId: resolved, value: utxo.value })
    inValue += utxo.value
  }
  const outputs = step.outputs.map((output, index) => ({ index, ...output }))
  const conservation = conservationCheck(inputs, outputs)
  const rules = [{ rule: RULES.REVEAL, outcome: 'envelope exposed in the reveal witness', ok: true }]
  const warnings = []

  if (!conservation.valid) {
    rules.push({ rule: RULES.FEE, outcome: `inputs ${conservation.inputs} < outputs ${conservation.outputs}`, ok: false })
    return fatal(step, 'reveal spends more than its inputs hold', { rules })
  }
  if (conservation.fee < 0) return fatal(step, 'negative fee', { rules })
  const fee = conservation.fee

  // Output zero carries the object.
  const atomicalId = syntheticAtomicalId(state.seed, state.txCounter, txid)
  const record = {
    type: step.atomical?.type ?? 'nft',
    ticker: step.atomical?.ticker,
    units: step.atomical?.units ?? 0,
    ownerOutput: utxoId(txid, 0),
    confirmed: false,
  }
  state.atomicals.set(atomicalId, record)
  // Spend the inputs, credit the outputs. Output zero carries the object.
  for (const reference of step.inputs) {
    const resolved = resolveRef(state, reference)
    if (resolved) state.utxos.delete(resolved)
  }
  outputs.forEach((output, index) => {
    state.utxos.set(utxoId(txid, index), {
      txid,
      vout: index,
      value: output.value,
      address: output.address ?? step.changeAddress ?? 'sim-change',
      scriptType: 'p2tr',
      confirmed: false,
      atomicals: index === 0 && record.type === 'ft' ? new Map([[atomicalId, record.units]]) : new Map(),
    })
  })
  registerOutputs(state, stepIndex, step, step.outputs.map((output, index) => ({ index, utxoId: utxoId(txid, index) })))
  state.mempool.push(txid)
  state.stepCounter += 1
  return {
    step,
    txid,
    atomicalId,
    fee,
    inputs,
    outputs,
    rules,
    warnings,
    errors: [],
    stateDiff: [],
  }
}

// ------------------------------------------------------------- transfer

/**
 * A plain ARC-20 transfer, split, merge, or burn. Inputs are coloured UTXOs;
 * outputs go through the shared allocation engine, so burn and change
 * behaviour are exactly what the conformance vectors execute.
 */
function stepTransfer(state, step) {
  const stepIndex = state.stepCounter
  const txid = newTx(state, 'transfer')
  const inputs = []
  const engineInputs = []
  const perAtomical = new Map()
  let inValue = 0

  for (const reference of step.inputs) {
    const resolved = resolveRef(state, reference)
    if (!resolved) return fatal(step, `input ${reference} does not exist`)
    const utxo = state.utxos.get(resolved)
    inputs.push({ utxoId: resolved, value: utxo.value })
    inValue += utxo.value
    for (const [atomicalId, units] of utxo.atomicals) {
      engineInputs.push({ atomicalId, txinIndex: inputs.length - 1, atomicalValue: units })
      if (!perAtomical.has(atomicalId)) perAtomical.set(atomicalId, [])
      perAtomical.get(atomicalId).push(reference)
    }
  }

  const outputs = step.outputs.map((output, index) => ({
    index,
    value: output.value,
    unspendable: output.unspendable ?? false,
  }))
  const conservation = conservationCheck(inputs, step.outputs)
  const rules = []
  const warnings = []
  if (!conservation.valid) {
    return fatal(step, `outputs exceed inputs by ${Math.abs(conservation.fee)} sats`, {
      rules: [{ rule: RULES.FEE, outcome: 'outputs exceed inputs', ok: false }],
    })
  }
  rules.push({ rule: RULES.FEE, outcome: `fee ${conservation.fee} sats`, ok: true })

  // Run the reference allocation for every coloured token in the inputs.
  const allocationByAtomical = new Map()
  for (const [atomicalId] of perAtomical) {
    const mine = engineInputs.filter((input) => input.atomicalId === atomicalId)
    const result = allocate(outputs, mine, { sortByFifo: true })
    allocationByAtomical.set(atomicalId, result)
    rules.push({
      rule: RULES.ALLOCATION,
      outcome: `${atomicalId}: ${result.outputs.map((output) => `out${output.index}=${output.coloredTotal}`).join(', ') || 'nothing assigned'}`,
      ok: result.cleanlyAssigned,
    })
    for (const burned of result.burned) {
      rules.push({
        rule: RULES.BURN,
        outcome: `${burned.atomicalId}: ${burned.value} units burned`,
        ok: false,
      })
      warnings.push(`${burned.value} units of ${burned.atomicalId} burned because no output could carry them`)
    }
  }

  // Rebuild UTXO ownership: consume inputs, create outputs with assignments.
  const assigned = new Map()
  for (const [atomicalId, result] of allocationByAtomical) {
    for (const output of result.outputs) {
      if (output.coloredTotal > 0) {
        if (!assigned.has(output.index)) assigned.set(output.index, new Map())
        assigned.get(output.index).set(atomicalId, (assigned.get(output.index).get(atomicalId) ?? 0) + output.coloredTotal)
      }
    }
  }

  for (const reference of step.inputs) {
    const resolved = resolveRef(state, reference)
    if (resolved) state.utxos.delete(resolved)
  }
  step.outputs.forEach((output, index) => {
    const utxo = {
      txid,
      vout: index,
      value: output.value,
      address: output.address ?? 'sim-change',
      scriptType: 'p2tr',
      confirmed: false,
      unspendable: output.unspendable ?? false,
      atomicals: assigned.get(index) ?? new Map(),
    }
    state.utxos.set(utxoId(txid, index), utxo)
    if (output.value < DUST_THRESHOLD_SATS) {
      warnings.push(`output ${index} is dust (${output.value} sats below ${DUST_THRESHOLD_SATS})`)
      rules.push({ rule: RULES.DUST, outcome: `output ${index} below dust threshold`, ok: false })
    }
  })
  registerOutputs(state, stepIndex, step, step.outputs.map((output, index) => ({ index, utxoId: utxoId(txid, index) })))
  state.mempool.push(txid)
  state.stepCounter += 1

  const vsize = estimateVirtualSize({ inputCount: inputs.length, outputCount: step.outputs.length })
  return {
    step,
    txid,
    fee: conservation.fee,
    inputs,
    outputs: step.outputs,
    virtualSize: vsize,
    allocation: Object.fromEntries(allocationByAtomical),
    rules,
    warnings,
    errors: [],
    stateDiff: [],
  }
}

// ------------------------------------------------------------- confirm + reorg

function stepConfirm(state, step) {
  state.stepCounter += 1
  const count = step.blocks ?? 1
  const confirmedTxids = [...state.mempool]
  state.blocks.push(...confirmedTxids.map((txid, index) => ({ height: state.blockHeight + index + 1, txid })))
  state.blockHeight += count
  state.mempool = []
  for (const utxo of state.utxos.values()) utxo.confirmed = true
  return {
    step,
    blockHeight: state.blockHeight,
    confirmed: confirmedTxids,
    rules: [{ rule: RULES.CONFIRMATION, outcome: `${count} block(s) mined; mempool confirmed`, ok: true }],
    warnings: [],
    errors: [],
  }
}

function stepReorg(state, step) {
  state.stepCounter += 1
  const depth = step.depth ?? 1
  if (depth > state.blocks.length) {
    return fatal(step, `cannot reorganize ${depth} blocks; only ${state.blocks.length} exist`)
  }
  const removed = state.blocks.splice(state.blocks.length - depth, depth)
  state.blockHeight -= depth
  const unconfirmed = new Set(removed.map((block) => block.txid))
  for (const utxo of state.utxos.values()) {
    if (unconfirmed.has(utxo.txid)) utxo.confirmed = false
  }
  state.mempool.push(...removed.map((block) => block.txid))
  return {
    step,
    blockHeight: state.blockHeight,
    unsettled: removed.map((block) => block.txid),
    rules: [
      {
        rule: RULES.REORG,
        outcome: `${depth} block(s) reorganized away; their transactions return to the mempool`,
        ok: true,
      },
    ],
    warnings: [
      `A reorganization unset ${removed.length} transaction(s). Anything that depended on their confirmation is no longer settled.`,
    ],
    errors: [],
  }
}

function fatal(step, message, extra = {}) {
  return {
    step,
    fatal: true,
    rules: extra.rules ?? [],
    warnings: [],
    errors: [message],
  }
}
