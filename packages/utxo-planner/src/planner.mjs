/**
 * UTXO Safety Planner: deterministic classification, risk detection, and
 * candidate-plan generation over imported UTXO data. Pure and offline: the
 * planner never signs, never broadcasts, and never looks anything up without
 * an explicit user action at a chosen endpoint.
 *
 * Unknown stays unknown. An output is never called safe merely because asset
 * metadata is missing.
 */
import { estimateVirtualSize, DUST_THRESHOLD_SATS } from '@bitcoin-universe/protocol-core/tx'

/** The pinned source every rule citation resolves to. */
export const PLANNER_SOURCE = Object.freeze({
  id: 'atomicals-electrumx-1.5.2.0',
  revision: '8df23747835c20230fc8b8097d469e7a1d97c3e0',
})

export const RISKS = Object.freeze({
  ACCIDENTAL_BURN: {
    id: 'risk/accidental-burn',
    page: '/guides/avoid-burns/',
    path: 'splitAndInflation',
    summary: 'Coloured satoshis swept into a fee or a plain change output are destroyed.',
  },
  MIXED_ASSETS: {
    id: 'risk/mixed-assets',
    page: '/protocol/arc20/wallet-safety/',
    path: 'allocationValidation',
    summary: 'Inputs carrying different tokens make per-token change impossible to place safely.',
  },
  UNKNOWN_STATE: {
    id: 'risk/unknown-state',
    page: '/protocol/core/indexer-dependency/',
    path: 'mintParser',
    summary: 'No assignment data exists for this output. It must be treated as possibly bearing an asset.',
  },
  INSUFFICIENT_CHANGE: {
    id: 'risk/insufficient-change',
    page: '/protocol/arc20/split-and-combine/',
    path: 'normalFtAllocation',
    summary: 'No output would be left to carry the remaining units, so they burn.',
  },
  DUST: {
    id: 'bitcoin/dust',
    page: '/protocol/arc20/psbt-requirements/',
    path: 'constants',
    summary: 'An output below the dust threshold is economically unspendable.',
  },
  LOW_FEE: {
    id: 'bitcoin/fee',
    page: '/protocol/arc20/psbt-requirements/',
    path: 'constants',
    summary: 'The fee does not cover the transaction virtual size at the chosen rate.',
  },
  UNCONFIRMED_INPUT: {
    id: 'risk/unconfirmed-chain',
    page: '/protocol/core/confirmation-and-reorgs/',
    path: 'networkActivations',
    summary: 'Spending unconfirmed outputs chains the new transaction to an unsettled state.',
  },
  UNSAFE_ORDERING: {
    id: 'risk/unsafe-ordering',
    page: '/protocol/arc20/psbt-requirements/',
    path: 'allocationValidation',
    summary: 'Receiver outputs must come before change, or allocation can hand assets to the wrong output.',
  },
  REUSED_CHANGE: {
    id: 'risk/reused-change',
    page: '/guides/inspect-an-address/',
    path: 'constants',
    summary: 'Reusing a change address links transactions and holder together publicly.',
  },
})

/** Classifications never guess: unknown assignment state stays unknown. */
export function classifyUtxo(utxo) {
  const assignmentEntries = Object.entries(utxo.atomicals ?? {})
  const classified = {
    utxoId: utxo.utxoId,
    value: utxo.value,
    confirmed: utxo.confirmed ?? false,
    classification: 'plain',
    confidence: 'high',
    indexerDataAvailable: Boolean(utxo.atomicals),
    evidence: [],
    source: PLANNER_SOURCE,
  }

  if (!utxo.atomicals) {
    classified.classification = 'unknown'
    classified.confidence = 'none'
    classified.evidence.push(RISKS.UNKNOWN_STATE)
    return classified
  }

  if (assignmentEntries.length === 0) {
    classified.classification = 'plain'
    classified.evidence.push({
      id: 'evidence/no-assignments',
      summary: 'The indexer reports no Atomical assignments on this output.',
    })
    return classified
  }

  const tokens = assignmentEntries.filter(([, units]) => units > 1 || utxo.value === units)
  const single = assignmentEntries.filter(([id]) => id && utxo.value >= 546 && unitsEquivalent(utxo, assignmentEntries))
  void single
  void tokens
  const kinds = new Set(assignmentEntries.map(([id]) => kindOf(id, utxo)))
  if (kinds.size > 1) {
    classified.classification = 'mixed'
  } else {
    classified.classification = [...kinds][0]
  }
  classified.confidence = utxo.confirmed ? 'high' : 'medium'
  classified.evidence.push({
    id: 'evidence/assignment-map',
    summary: `The indexer assigns ${assignmentEntries.map(([id, units]) => `${units} of ${id}`).join(', ')}.`,
  })
  return classified
}

function unitsEquivalent(utxo, entries) {
  return entries.length === 1 && entries[0][1] === utxo.value
}

function kindOf(atomicalId, utxo) {
  const entries = Object.entries(utxo.atomicals ?? {})
  const totalUnits = entries.reduce((sum, [, units]) => sum + units, 0)
  if (entries.length > 1) return 'mixed-assignment'
  if (/^[a-f0-9]{64}i\d+$/.test(atomicalId) && totalUnits === utxo.value && utxo.value > 546) {
    return 'arc-20-bearing'
  }
  if (/^[a-f0-9]{64}i\d+$/.test(atomicalId)) return 'nft-bearing'
  return 'unknown'
}

/** Detect risks in a proposed input and output set. Warnings cite rules. */
export function detectRisks({ inputs, outputs, feeRate = 1, indexerDataAvailable = true }) {
  const warnings = []
  const carrying = inputs.filter((input) => Object.keys(input.atomicals ?? {}).length > 0)
  const unknownInputs = inputs.filter((input) => !input.atomicals)

  const inValue = inputs.reduce((sum, input) => sum + input.value, 0)
  const outValue = outputs.reduce((sum, output) => sum + output.value, 0)
  const fee = inValue - outValue
  const vsize = estimateVirtualSize({
    inputCount: inputs.length,
    outputCount: outputs.length,
  })

  if (fee < 0) {
    warnings.push({ risk: RISKS.LOW_FEE, detail: `Outputs exceed inputs by ${-fee} sats.`, fatal: true })
  } else if (fee < vsize * feeRate) {
    warnings.push({
      risk: RISKS.LOW_FEE,
      detail: `Fee ${fee} sats is below ${vsize} vB at ${feeRate} sat/vB.`,
      fatal: false,
    })
  }

  const tokenIds = new Set(carrying.flatMap((input) => Object.keys(input.atomicals ?? {})))
  if (tokenIds.size > 1) {
    warnings.push({ risk: RISKS.MIXED_ASSETS, detail: `${tokenIds.size} different tokens share these inputs.`, fatal: false })
  }

  for (const input of carrying) {
    const units = Object.values(input.atomicals ?? {})[0] ?? 0
    const sameTokenOutputs = outputs.filter((output) => !output.unspendable)
    const capacity = sameTokenOutputs.reduce((sum, output) => sum + output.value, 0)
    if (tokenIds.size === 1 && capacity < units) {
      warnings.push({
        risk: RISKS.INSUFFICIENT_CHANGE,
        detail: `Outputs can carry ${capacity} of ${units} units; the rest burns.`,
        fatal: true,
      })
    }
    if (outputs.some((output) => output.unspendable) === false && carrying.length > 0 && tokenIds.size === 1) {
      const first = outputs[0]
      if (first && first.value < units) {
        warnings.push({
          risk: RISKS.ACCIDENTAL_BURN,
          detail: `The first output cannot hold all ${units} coloured units; leftovers follow allocation and can burn.`,
          fatal: false,
        })
      }
    }
  }

  if (outputs.some((output) => output.value < DUST_THRESHOLD_SATS)) {
    warnings.push({ risk: RISKS.DUST, detail: `An output is below ${DUST_THRESHOLD_SATS} sats.`, fatal: false })
  }

  const receiverOutputs = outputs.filter((output) => output.role === 'receiver')
  const changeOutputs = outputs.filter((output) => output.role === 'change')
  if (receiverOutputs.length > 0 && changeOutputs.length > 0) {
    const firstChangeIndex = outputs.findIndex((output) => output.role === 'change')
    const lastReceiverIndex = outputs.map((output) => output.role).lastIndexOf('receiver')
    if (firstChangeIndex < lastReceiverIndex) {
      warnings.push({
        risk: RISKS.UNSAFE_ORDERING,
        detail: 'A change output precedes a receiver output, which is where misdirected assets happen.',
        fatal: false,
      })
    }
  }

  if (inputs.some((input) => input.confirmed === false)) {
    warnings.push({ risk: RISKS.UNCONFIRMED_INPUT, detail: 'At least one input is unconfirmed.', fatal: false })
  }

  const changeAddresses = outputs.filter((output) => output.role === 'change').map((output) => output.address)
  if (new Set(changeAddresses).size < changeAddresses.length) {
    warnings.push({ risk: RISKS.REUSED_CHANGE, detail: 'A change address repeats across outputs.', fatal: false })
  }

  if (!indexerDataAvailable || unknownInputs.length > 0) {
    warnings.push({
      risk: RISKS.UNKNOWN_STATE,
      detail: `${unknownInputs.length} input(s) have no assignment data. Treat them as asset-bearing until proven otherwise.`,
      fatal: false,
    })
  }

  return { fee, virtualSize: vsize, warnings }
}

export const OBJECTIVES = Object.freeze({
  PRESERVE_ALL: 'preserve-all',
  TRANSFER_AMOUNT: 'transfer-amount',
  SPLIT: 'split',
  CONSOLIDATE_PLAIN: 'consolidate-plain',
  ISOLATE_UNKNOWN: 'isolate-unknown',
})

/**
 * Deterministic candidate plans for an objective. Plans are compared on
 * several axes at once; the planner never collapses them into one score.
 */
export function generatePlans(objective, utxos, options = {}) {
  const { amount = 0, feeRate = 1, receiver } = options
  const plans = []

  const plain = utxos.filter((utxo) => Object.keys(utxo.atomicals ?? {}).length === 0)
  const carrying = utxos.filter((utxo) => Object.keys(utxo.atomicals ?? {}).length > 0)
  const unknowns = utxos.filter((utxo) => !utxo.atomicals)

  if (objective === OBJECTIVES.CONSOLIDATE_PLAIN && plain.length > 1) {
    plans.push(buildPlan(plain, [{ value: plain.reduce((sum, u) => sum + u.value, 0), role: 'change', address: receiver ?? 'bc1qconsolidated' }], { feeRate }))
  }

  if (objective === OBJECTIVES.PRESERVE_ALL) {
    // A hands-off plan: spend nothing, isolate everything, warn about unknowns.
    plans.push({
      objective,
      inputs: [],
      outputs: [],
      action: 'Spend nothing from asset-bearing outputs. Move plain outputs freely; leave carrying and unknown outputs untouched until classified.',
      fee: 0,
      virtualSize: 0,
      safety: 'all-assets-preserved',
      warnings: unknowns.length
        ? [{ risk: RISKS.UNKNOWN_STATE, detail: `${unknowns.length} unclassified output(s) stay frozen.`, fatal: false }]
        : [],
    })
  }

  if (objective === OBJECTIVES.TRANSFER_AMOUNT && amount > 0) {
    const funding = carrying.filter((utxo) => Object.values(utxo.atomicals ?? {})[0] >= amount)
    if (funding.length > 0) {
      const source = smallestFirst(funding)[0]
      const units = Object.values(source.atomicals ?? {})[0]
      const change = source.value - amount
      const outputs = [
        { value: amount, role: 'receiver', address: receiver ?? 'bc1qreceiver' },
      ]
      if (change > 0) outputs.push({ value: change, role: 'receiver', address: source.address })
      plans.push(buildPlan([source], outputs, { feeRate }))
      void units
    }
    const plainFunding = smallestFirst(plain).filter((utxo) => utxo.value >= amount)
    if (plainFunding.length > 0) {
      const source = plainFunding[0]
      const change = source.value - amount
      const outputs = [{ value: amount, role: 'receiver', address: receiver ?? 'bc1qreceiver' }]
      if (change > 0) outputs.push({ value: change, role: 'change', address: source.address })
      plans.push(buildPlan([source], outputs, { feeRate, note: 'plain-BTC only' }))
    }
  }

  if (objective === OBJECTIVES.SPLIT && carrying.length > 0) {
    const source = smallestFirst(carrying)[0]
    const units = Object.values(source.atomicals ?? {})[0]
    if (units >= 2 && units % 2 === 0) {
      const half = units / 2
      plans.push(
        buildPlan(
          [source],
          [
            { value: half, role: 'receiver', address: receiver ?? 'bc1qreceiver' },
            { value: half, role: 'receiver', address: source.address },
          ],
          { feeRate },
        ),
      )
    }
  }

  if (objective === OBJECTIVES.ISOLATE_UNKNOWN && unknowns.length > 0) {
    for (const candidate of unknowns) {
      plans.push({
        objective,
        inputs: [candidate.utxoId],
        outputs: [{ value: candidate.value, role: 'change', address: options.isolationAddress ?? 'bc1qisolate' }],
        action: 'Sweep the unknown output alone to a fresh address it alone controls, so no classified output ever mixes with it.',
        fee: detectRisks({ inputs: [candidate], outputs: [{ value: candidate.value }], feeRate }).fee,
        virtualSize: estimateVirtualSize({ inputCount: 1, outputCount: 1 }),
        safety: 'isolated',
        warnings: [{ risk: RISKS.UNKNOWN_STATE, detail: 'The output keeps its unknown status at the new address.', fatal: false }],
      })
    }
  }

  return plans.map((plan) => finalizePlan(plan))
}

function smallestFirst(list) {
  return [...list].sort((a, b) => a.value - b.value)
}

function buildPlan(inputs, outputs, { feeRate = 1, note } = {}) {
  const risk = detectRisks({ inputs, outputs, feeRate })
  return {
    inputs: inputs.map((input) => input.utxoId),
    outputs,
    action: note ?? 'Construct and sign in a protocol-aware wallet after reviewing every warning.',
    fee: risk.fee,
    virtualSize: risk.virtualSize,
    warnings: risk.warnings,
  }
}

function finalizePlan(plan) {
  return {
    ...plan,
    safety: plan.safety ?? (plan.warnings.some((warning) => warning.fatal) ? 'unsafe-as-specified' : 'review-warnings'),
    privacy:
      plan.inputs.length > 2
        ? 'large consolidation links many addresses publicly'
        : 'modest footprint',
    source: PLANNER_SOURCE,
  }
}
