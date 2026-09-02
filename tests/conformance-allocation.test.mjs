import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { allocate } from '../conformance/allocation.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const vectors = JSON.parse(
  readFileSync(resolve(root, 'conformance/vectors/arc20-allocation.json'), 'utf8'),
)

test('every allocation vector matches the reference engine', async (t) => {
  assert.ok(vectors.cases.length > 0, 'vector set must not be empty')

  for (const testCase of vectors.cases) {
    await t.test(`${testCase.id}: ${testCase.title}`, () => {
      const result = allocate(testCase.outputs, testCase.inputs, testCase.options)

      if (testCase.expected.outputs) {
        for (const expected of testCase.expected.outputs) {
          const actual = result.outputs[expected.index]
          assert.ok(actual, `output ${expected.index} must exist in the result`)
          assert.equal(
            actual.coloredTotal,
            expected.coloredTotal,
            `output ${expected.index} coloured total`,
          )
        }
      }

      assert.deepEqual(result.burned, testCase.expected.burned, 'burned set')
      assert.equal(
        result.cleanlyAssigned,
        testCase.expected.cleanlyAssigned,
        'cleanlyAssigned flag',
      )
      assert.equal(
        result.inflationRejected,
        testCase.expected.inflationRejected,
        'inflationRejected flag',
      )
    })
  }
})

test('no-inflation rule holds for every vector', () => {
  for (const testCase of vectors.cases) {
    const result = allocate(testCase.outputs, testCase.inputs, testCase.options)
    const inputTotals = new Map()
    for (const input of testCase.inputs) {
      inputTotals.set(
        input.atomicalId,
        (inputTotals.get(input.atomicalId) ?? 0) + input.atomicalValue,
      )
    }
    const outputTotals = new Map()
    for (const output of result.outputs) {
      for (const assignment of output.assignments) {
        outputTotals.set(
          assignment.atomicalId,
          (outputTotals.get(assignment.atomicalId) ?? 0) + assignment.coloredValue,
        )
      }
    }
    for (const [atomicalId, total] of outputTotals) {
      assert.ok(
        total <= (inputTotals.get(atomicalId) ?? 0),
        `${testCase.id}: coloured output total for ${atomicalId} must not exceed the input total`,
      )
    }
  }
})

test('vector set declares its pinned source revision', () => {
  assert.match(vectors.source.revision, /^[0-9a-f]{40}$/)
  assert.equal(vectors.source.id, 'atomicals-electrumx-1.5.2.0')
  assert.ok(vectors.source.paths.length >= 3)
})
