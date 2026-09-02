/**
 * Transaction and UTXO model shared by the Protocol Lab, the UTXO Safety
 * Planner, and the transaction inspector. Plain data in, plain data out.
 *
 * Values are satoshis as integers. Assignments map an Atomical or ARC-20
 * identifier to the output index that carries it. Nothing here parses real
 * Bitcoin serialization; the model is deliberately structural so every tool
 * reasons over the same shapes.
 */

/**
 * Estimate the virtual size of a transaction from its structural shape.
 * Weights follow the BIP-141 formula over conservative per-input and
 * per-output sizes: P2TR keypath inputs are the reference wallet shape.
 */
export function estimateVirtualSize({ inputCount, outputCount, inputScript = 'p2tr', outputsExtraBytes = 0 }) {
  const inputWeights = { p2tr: 148, p2wpkh: 108, p2sh: 234, legacy: 240 }
  const weight = inputCount * (inputWeights[inputScript] ?? inputWeights.legacy) * 4 + outputCount * 124 + outputsExtraBytes
  return Math.ceil(weight / 4)
}

/**
 * Sum of output values. Rejects fractional or negative satoshis early, since
 * every downstream tool assumes integer satoshis.
 */
export function totalOutputValue(outputs) {
  return outputs.reduce((sum, output) => {
    if (!Number.isInteger(output.value) || output.value < 0) {
      throw new TypeError('output values must be non-negative integer satoshis')
    }
    return sum + output.value
  }, 0)
}

/**
 * Satoshi conservation for a transaction: inputs minus outputs is the fee,
 * and a negative fee means the transaction cannot confirm.
 */
export function conservationCheck(inputs, outputs) {
  const inValue = inputs.reduce((sum, input) => sum + input.value, 0)
  const outValue = totalOutputValue(outputs)
  return { inputs: inValue, outputs: outValue, fee: inValue - outValue, valid: inValue >= outValue }
}

/**
 * Classify which outputs carry an assignment after allocation. The planner
 * and the lab share this so "which output holds the asset" means the same
 * thing everywhere.
 */
export function assignedOutputs(allocationMap) {
  const byOutput = new Map()
  for (const [atomicalId, result] of allocationMap) {
    for (const outputIndex of result.expectedOutputs ?? []) {
      if (!byOutput.has(outputIndex)) byOutput.set(outputIndex, [])
      byOutput.get(outputIndex).push(atomicalId)
    }
  }
  return byOutput
}

/**
 * Dust threshold below which an output is economically unspendable at the
 * reference dust rate. The planner warns; the lab refuses to create one
 * silently.
 */
export const DUST_THRESHOLD_SATS = 546
