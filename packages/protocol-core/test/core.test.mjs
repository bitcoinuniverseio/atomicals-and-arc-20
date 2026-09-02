import test from 'node:test'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

import {
  bitworkBits,
  expectedAttempts,
  probabilityAfter,
  effortTable,
  practicality,
  estimateVirtualSize,
  conservationCheck,
  totalOutputValue,
  assignedOutputs,
  allocate,
} from '../src/index.mjs'

test('bitwork bits count 4 per prefix character plus whole extension bits', () => {
  assert.equal(bitworkBits(1), 4)
  assert.equal(bitworkBits(6), 24)
  assert.equal(bitworkBits(6, 3), 27)
  assert.throws(() => bitworkBits(-1))
  assert.throws(() => bitworkBits(1.5))
})

test('expected attempts double with every bit', () => {
  assert.equal(expectedAttempts(4), 16)
  assert.equal(expectedAttempts(8), 256)
})

test('probability approaches 1 with more attempts and never exceeds it', () => {
  const bits = 10
  assert.ok(probabilityAfter(expectedAttempts(bits), bits) > 0.6)
  assert.ok(probabilityAfter(expectedAttempts(bits) * 10, bits) > 0.999)
  assert.ok(probabilityAfter(expectedAttempts(bits) * 100, bits) <= 1)
})

test('the effort table reports time from the caller-supplied rate', () => {
  const rows = effortTable(20, 1000, [1, 2])
  assert.equal(rows.length, 2)
  assert.equal(rows[1].attempts, rows[0].attempts * 2)
  assert.equal(rows[0].seconds, rows[0].attempts / 1000)
})

test('practicality bands match the estimator thresholds', () => {
  assert.equal(practicality(20).tone, 'ok')
  assert.equal(practicality(28).tone, 'warn')
  assert.equal(practicality(33).tone, 'risk')
})

test('virtual size grows with inputs and outputs', () => {
  const base = estimateVirtualSize({ inputCount: 1, outputCount: 2 })
  assert.ok(base > 100)
  assert.ok(estimateVirtualSize({ inputCount: 3, outputCount: 2 }) > base)
  assert.ok(estimateVirtualSize({ inputCount: 1, outputCount: 4 }) > base)
})

test('conservation check rejects a transaction that spends more than it has', () => {
  const result = conservationCheck([{ value: 1000 }], [{ value: 900 }, { value: 50 }])
  assert.equal(result.fee, 50)
  assert.equal(result.valid, true)
  assert.equal(conservationCheck([{ value: 100 }], [{ value: 200 }]).valid, false)
})

test('output values must be whole satoshis', () => {
  assert.throws(() => totalOutputValue([{ value: 1.5 }]))
  assert.throws(() => totalOutputValue([{ value: -1 }]))
})

test('assigned outputs invert the allocation map for the planner and lab', () => {
  const map = new Map([
    ['a$i1', { expectedOutputs: [1, 2], expectedValues: 100 }],
    ['b$i2', { expectedOutputs: [2], expectedValues: 50 }],
  ])
  const byOutput = assignedOutputs(map)
  assert.deepEqual(byOutput.get(1), ['a$i1'])
  // Output 2 is covered by both assignments, so both ids land there in order.
  assert.deepEqual(byOutput.get(2), ['a$i1', 'b$i2'])
})

test('the package allocation path matches the conformance vectors it came from', () => {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
  const vectorSet = JSON.parse(
    readFileSync(resolve(root, 'conformance/vectors/arc20-allocation.json'), 'utf8'),
  )
  assert.ok(vectorSet.cases.length >= 10)
  for (const testCase of vectorSet.cases) {
    const result = allocate(testCase.outputs, testCase.inputs, testCase.options)
    for (const expected of testCase.expected.outputs ?? []) {
      assert.equal(
        result.outputs[expected.index].coloredTotal,
        expected.coloredTotal,
        testCase.id,
      )
    }
    assert.equal(result.cleanlyAssigned, testCase.expected.cleanlyAssigned, testCase.id)
  }
})
