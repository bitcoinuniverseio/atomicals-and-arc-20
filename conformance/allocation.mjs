/**
 * ARC-20 normal fungible allocation, implemented from the pinned reference revision.
 *
 * Source: atomicals-electrumx at 8df23747835c20230fc8b8097d469e7a1d97c3e0
 *   electrumx/lib/atomicals_blueprint_builder.py
 *     - assign_expected_outputs_basic
 *     - calculate_outputs_to_color_for_ft_atomical_ids
 *     - AtomicalsTransferBlueprintBuilder.color_ft_atomicals_regular
 *     - order_ft_inputs
 *
 * This module is the single implementation used by the documentation prose, the
 * conformance vectors, and the interactive allocation visualizer. If the three
 * ever disagree, CI fails.
 *
 * It models normal allocation only. It is explanatory and never a substitute for
 * validating a concrete transaction against the validator revision you target.
 */

/**
 * @typedef {object} FtInput
 * @property {string} atomicalId  Compact Atomical ID of the coloured token.
 * @property {number} txinIndex   Position of this input in the transaction.
 * @property {number} atomicalValue Coloured units carried by this input.
 */

/**
 * @typedef {object} TxOutput
 * @property {number} value       Output value in satoshis.
 * @property {boolean} [unspendable] True when the output script is provably unspendable.
 */

/**
 * Order the fungible tokens the way the reference builder does.
 * FIFO orders by the first input index that carries each token, then by id.
 * Legacy ordering sorts by Atomical ID alone.
 */
export function orderFtInputs(ftAtomicals, sortByFifo) {
  const list = []
  if (sortByFifo) {
    /** @type {Map<number, string[]>} */
    const byInput = new Map()
    for (const [atomicalId, info] of ftAtomicals) {
      for (const index of info.inputIndexes) {
        const bucket = byInput.get(index) ?? []
        bucket.push(atomicalId)
        byInput.set(index, bucket)
      }
    }
    const seen = new Set()
    for (const inputIndex of [...byInput.keys()].sort((a, b) => a - b)) {
      for (const atomicalId of [...(byInput.get(inputIndex) ?? [])].sort()) {
        if (seen.has(atomicalId)) continue
        seen.add(atomicalId)
        list.push(ftAtomicals.get(atomicalId))
      }
    }
    return list
  }
  for (const atomicalId of [...ftAtomicals.keys()].sort()) {
    list.push(ftAtomicals.get(atomicalId))
  }
  return list
}

/**
 * Reference `assign_expected_outputs_basic`.
 * Walks outputs from `startOutIndex`, skipping unspendable outputs, and assigns
 * an output only while its whole satoshi value fits in the value still to place.
 *
 * @returns {{cleanlyAssigned: boolean, expectedOutputs: number[], remainingValue: number}}
 */
export function assignExpectedOutputsBasic(
  totalValueToAssign,
  outputs,
  startOutIndex,
  isCustomColoringActivated = false,
) {
  const expectedOutputs = []
  let remainingValue = totalValueToAssign
  let idxCount = 0

  if (startOutIndex >= outputs.length) {
    return { cleanlyAssigned: false, expectedOutputs, remainingValue: 0 }
  }

  for (let outIndex = 0; outIndex < outputs.length; outIndex += 1) {
    const txout = outputs[outIndex]
    if (idxCount < startOutIndex) {
      idxCount += 1
      continue
    }
    if (txout.unspendable) {
      idxCount += 1
      continue
    }

    if (isCustomColoringActivated) {
      expectedOutputs.push(outIndex)
      remainingValue -= txout.value
      if (remainingValue > 0) continue
      if (remainingValue === 0) {
        return { cleanlyAssigned: true, expectedOutputs, remainingValue }
      }
      return { cleanlyAssigned: false, expectedOutputs, remainingValue }
    }

    if (txout.value <= remainingValue) {
      expectedOutputs.push(outIndex)
      remainingValue -= txout.value
      if (remainingValue === 0) {
        return { cleanlyAssigned: true, expectedOutputs, remainingValue }
      }
    } else {
      // The next output is larger than what is left. The remainder is burned.
      return { cleanlyAssigned: false, expectedOutputs, remainingValue }
    }
    idxCount += 1
  }

  return { cleanlyAssigned: false, expectedOutputs, remainingValue }
}

/**
 * Reference `calculate_outputs_to_color_for_ft_atomical_ids`.
 */
export function calculateOutputsToColor(
  outputs,
  ftAtomicals,
  sortByFifo,
  isCustomColoringActivated = false,
) {
  if (ftAtomicals.size === 0) return null

  const atomicalList = orderFtInputs(ftAtomicals, sortByFifo)
  let nextStartOutIndex = 0
  let map = new Map()
  let nonCleanOutputSlots = false
  let utxoCleanlyAssigned = true
  const ftsBurned = new Map()

  for (const item of atomicalList) {
    const { cleanlyAssigned, expectedOutputs, remainingValue } = assignExpectedOutputsBasic(
      item.atomicalValue,
      outputs,
      nextStartOutIndex,
      isCustomColoringActivated,
    )
    if (!cleanlyAssigned) utxoCleanlyAssigned = false

    if (!isCustomColoringActivated) {
      if (cleanlyAssigned && expectedOutputs.length > 0) {
        nextStartOutIndex = expectedOutputs[expectedOutputs.length - 1] + 1
        map.set(item.atomicalId, {
          expectedOutputs,
          expectedValues: item.atomicalValue,
        })
      } else {
        map = new Map()
        nonCleanOutputSlots = true
        break
      }
    } else {
      if (remainingValue > 0) ftsBurned.set(item.atomicalId, remainingValue)
      if (expectedOutputs.length > 0) {
        nextStartOutIndex = expectedOutputs[expectedOutputs.length - 1] + 1
        map.set(item.atomicalId, {
          expectedOutputs,
          expectedValues: item.atomicalValue,
        })
      } else {
        map = new Map()
        nonCleanOutputSlots = true
        break
      }
    }
  }

  // If the slots did not fit cleanly, fall back to assigning every token from output zero.
  if (nonCleanOutputSlots) {
    map = new Map()
    for (const item of atomicalList) {
      const { cleanlyAssigned, expectedOutputs, remainingValue } = assignExpectedOutputsBasic(
        item.atomicalValue,
        outputs,
        0,
        isCustomColoringActivated,
      )
      map.set(item.atomicalId, {
        expectedOutputs,
        expectedValues: item.atomicalValue,
      })
      if (remainingValue > 0) ftsBurned.set(item.atomicalId, remainingValue)
      if (!cleanlyAssigned) utxoCleanlyAssigned = false
    }
  }

  return { map, ftsBurned, cleanlyAssigned: utxoCleanlyAssigned, atomicalList }
}

/**
 * Reference `color_ft_atomicals_regular`, producing the per-output colouring.
 *
 * @param {TxOutput[]} outputs
 * @param {FtInput[]} inputs
 * @param {{sortByFifo?: boolean, customColoring?: boolean}} [options]
 */
export function colorFtRegular(outputs, inputs, options = {}) {
  const sortByFifo = options.sortByFifo ?? true
  const isCustomColoringActivated = options.customColoring ?? false

  /** @type {Map<string, {atomicalId: string, atomicalValue: number, inputIndexes: number[]}>} */
  const ftAtomicals = new Map()
  for (const input of inputs) {
    const existing = ftAtomicals.get(input.atomicalId)
    if (existing) {
      existing.atomicalValue += input.atomicalValue
      existing.inputIndexes.push(input.txinIndex)
    } else {
      ftAtomicals.set(input.atomicalId, {
        atomicalId: input.atomicalId,
        atomicalValue: input.atomicalValue,
        inputIndexes: [input.txinIndex],
      })
    }
  }

  const summary = calculateOutputsToColor(
    outputs,
    ftAtomicals,
    sortByFifo,
    isCustomColoringActivated,
  )

  /** @type {Map<number, Map<string, {outputValue: number, coloredValue: number}>>} */
  const outputColored = new Map()
  if (!summary) {
    return {
      outputs: outputColored,
      burned: new Map(),
      cleanlyAssigned: true,
      inflationRejected: false,
    }
  }

  let cleanlyAssigned = summary.cleanlyAssigned

  for (const [atomicalId, info] of summary.map) {
    let totalValue = info.expectedValues
    for (const outIndex of info.expectedOutputs) {
      const txout = outputs[outIndex]
      const bucket = outputColored.get(outIndex) ?? new Map()
      let coloredValue
      if (!isCustomColoringActivated) {
        coloredValue = txout.value
      } else if (totalValue >= txout.value) {
        coloredValue = txout.value
        totalValue -= coloredValue
      } else {
        coloredValue = totalValue
        totalValue = 0
      }
      bucket.set(atomicalId, { outputValue: txout.value, coloredValue })
      outputColored.set(outIndex, bucket)
    }
  }

  // No-inflation validation: coloured output totals can never exceed coloured input totals.
  const inputTotals = new Map()
  for (const [atomicalId, info] of ftAtomicals) inputTotals.set(atomicalId, info.atomicalValue)
  const outputTotals = new Map()
  for (const bucket of outputColored.values()) {
    for (const [atomicalId, entry] of bucket) {
      outputTotals.set(atomicalId, (outputTotals.get(atomicalId) ?? 0) + entry.coloredValue)
    }
  }
  let inflationRejected = false
  for (const [atomicalId, total] of outputTotals) {
    if (total > (inputTotals.get(atomicalId) ?? 0)) inflationRejected = true
  }
  if (inflationRejected) cleanlyAssigned = false

  return {
    outputs: outputColored,
    burned: summary.ftsBurned,
    cleanlyAssigned,
    inflationRejected,
  }
}

/**
 * Group inputs into one entry per token, preserving the order the inputs appeared in.
 * Both split and custom colouring iterate tokens by atomical id, not by input order,
 * which is why they can produce a different answer from the regular path on the same
 * transaction.
 */
function groupByAtomical(inputs) {
  const ftAtomicals = new Map()
  for (const input of inputs) {
    const existing = ftAtomicals.get(input.atomicalId)
    if (existing) {
      existing.atomicalValue += input.atomicalValue
      existing.inputIndexes.push(input.txinIndex)
    } else {
      ftAtomicals.set(input.atomicalId, {
        atomicalId: input.atomicalId,
        atomicalValue: input.atomicalValue,
        inputIndexes: [input.txinIndex],
      })
    }
  }
  return [...ftAtomicals.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
}

/**
 * Reference `color_ft_atomicals_split`, the `y` operation.
 *
 * The payload maps a token to a number of satoshis to pass over before that token
 * starts colouring. It is how two tokens sharing one input get separated. Note that
 * the skip is counted in output satoshis, not in token units, and that a token whose
 * skip never completes simply never colours anything.
 *
 * @param {TxOutput[]} outputs
 * @param {FtInput[]} inputs
 * @param {Record<string, number>} payload skip amount in satoshis, keyed by atomical id
 * @param {{customColoring?: boolean}} [options]
 */
export function colorFtSplit(outputs, inputs, payload = {}, options = {}) {
  const isCustomColoringActivated = options.customColoring ?? false
  const outputColored = new Map()
  const ftsBurned = new Map()
  let cleanlyAssigned = true

  for (const [atomicalId, info] of groupByAtomical(inputs)) {
    let remainingValue = info.atomicalValue

    const skipCandidate = payload?.[atomicalId]
    const totalAmountToSkip =
      Number.isInteger(skipCandidate) && skipCandidate >= 0 ? skipCandidate : 0
    let totalSkippedSoFar = 0

    if (isCustomColoringActivated) {
      for (let outIndex = 0; outIndex < outputs.length; outIndex += 1) {
        const txout = outputs[outIndex]
        if (totalAmountToSkip > 0 && totalSkippedSoFar < totalAmountToSkip) {
          totalSkippedSoFar += txout.value
          continue
        }
        const expectedValue = txout.value <= remainingValue ? txout.value : remainingValue
        remainingValue -= txout.value
        const bucket = outputColored.get(outIndex) ?? new Map()
        bucket.set(atomicalId, { outputValue: txout.value, coloredValue: expectedValue })
        outputColored.set(outIndex, bucket)
        if (remainingValue === 0) break
        if (remainingValue < 0) {
          remainingValue = 0
          cleanlyAssigned = false
          break
        }
      }
      if (remainingValue !== 0) {
        cleanlyAssigned = false
        ftsBurned.set(atomicalId, remainingValue)
      }
    } else {
      for (let outIndex = 0; outIndex < outputs.length; outIndex += 1) {
        const txout = outputs[outIndex]
        if (totalAmountToSkip > 0 && totalSkippedSoFar < totalAmountToSkip) {
          totalSkippedSoFar += txout.value
          continue
        }
        if (txout.value <= remainingValue) {
          remainingValue -= txout.value
          const bucket = outputColored.get(outIndex) ?? new Map()
          bucket.set(atomicalId, { outputValue: txout.value, coloredValue: txout.value })
          outputColored.set(outIndex, bucket)
          if (remainingValue === 0) break
        }
        // Read literally from the reference: this test runs against the value already
        // decremented above, so an exactly covering output falls through to the next
        // iteration rather than breaking here.
        if (txout.value > remainingValue || remainingValue < 0) {
          cleanlyAssigned = false
          ftsBurned.set(atomicalId, remainingValue)
          break
        }
      }
      if (remainingValue !== 0) {
        cleanlyAssigned = false
        ftsBurned.set(atomicalId, remainingValue)
      }
    }
  }

  return { outputs: outputColored, burned: ftsBurned, cleanlyAssigned, inflationRejected: false }
}

/**
 * Reference `custom_color_ft_atomicals`, the `z` operation.
 *
 * The payload names an exact value per output per token. Every request is clamped
 * twice, first to the output's satoshi value and then to the token's remaining
 * balance, so a payload asking for more than exists cannot inflate supply. Anything
 * the payload does not direct at an output is burned.
 *
 * @param {TxOutput[]} outputs
 * @param {FtInput[]} inputs
 * @param {Record<string, Record<number, number>>} payload
 */
export function customColorFt(outputs, inputs, payload = {}) {
  const outputColored = new Map()
  const ftsBurned = new Map()
  let cleanlyAssigned = true

  for (const [atomicalId, info] of groupByAtomical(inputs)) {
    let remainingValue = info.atomicalValue
    const requested = payload?.[atomicalId] ?? {}

    for (let outIndex = 0; outIndex < outputs.length; outIndex += 1) {
      const txout = outputs[outIndex]
      let expectedValue = Number(requested[outIndex] ?? requested[String(outIndex)] ?? 0)
      if (!Number.isInteger(expectedValue)) expectedValue = 0
      if (expectedValue <= 0 || remainingValue <= 0) continue
      if (expectedValue > txout.value) expectedValue = txout.value
      if (expectedValue > remainingValue) expectedValue = remainingValue
      if (expectedValue < txout.value) cleanlyAssigned = false
      const bucket = outputColored.get(outIndex) ?? new Map()
      bucket.set(atomicalId, { outputValue: txout.value, coloredValue: expectedValue })
      outputColored.set(outIndex, bucket)
      remainingValue -= expectedValue
    }

    if (remainingValue > 0) {
      cleanlyAssigned = false
      ftsBurned.set(atomicalId, remainingValue)
    }
  }

  return { outputs: outputColored, burned: ftsBurned, cleanlyAssigned, inflationRejected: false }
}

/**
 * Flat, serialisable result used by the conformance vectors and the visualizer.
 */
export function allocate(outputs, inputs, options = {}) {
  const operation = options.operation ?? 'regular'
  const result =
    operation === 'split'
      ? colorFtSplit(outputs, inputs, options.payload ?? {}, options)
      : operation === 'custom'
        ? customColorFt(outputs, inputs, options.payload ?? {})
        : colorFtRegular(outputs, inputs, options)
  const perOutput = outputs.map((txout, index) => {
    const bucket = result.outputs.get(index)
    const assignments = bucket
      ? [...bucket.entries()].map(([atomicalId, entry]) => ({
          atomicalId,
          coloredValue: entry.coloredValue,
        }))
      : []
    return {
      index,
      value: txout.value,
      unspendable: Boolean(txout.unspendable),
      assignments,
      coloredTotal: assignments.reduce((sum, entry) => sum + entry.coloredValue, 0),
    }
  })

  return {
    outputs: perOutput,
    burned: [...result.burned.entries()]
      .map(([atomicalId, value]) => ({ atomicalId, value }))
      .sort((a, b) => a.atomicalId.localeCompare(b.atomicalId)),
    cleanlyAssigned: result.cleanlyAssigned,
    inflationRejected: result.inflationRejected,
  }
}
