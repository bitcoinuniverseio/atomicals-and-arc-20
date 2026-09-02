import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv/dist/2020.js'

import { runScenario, SCENARIO_VERSION, syntheticTxid } from '../src/engine.mjs'
import { scenarios, scenarioById } from '../src/scenarios.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../..')

const ajv = new Ajv({ allErrors: true, strict: false })
const validate = ajv.compile(
  JSON.parse(readFileSync(resolve(here, '../scenario.schema.json'), 'utf8')),
)

test('every shipped scenario validates against the scenario schema', () => {
  assert.ok(scenarios.length >= 10, 'the lab ships a real scenario library')
  for (const scenario of scenarios) {
    const ok = validate(scenario)
    assert.deepEqual(
      ok,
      true,
      `${scenario.id}: ${validate.errors?.map((error) => `${error.instancePath} ${error.message}`).join('; ')}`,
    )
  }
})

test('scenario ids are unique', () => {
  assert.equal(scenarioById.size, scenarios.length)
})

test('golden replay: every scenario replays exactly to its fixture', () => {
  const fixtures = readdirSync(resolve(here, '../fixtures')).filter((name) => name.startsWith('golden-'))
  assert.equal(fixtures.length, scenarios.length)
  for (const scenario of scenarios) {
    const golden = JSON.parse(
      readFileSync(resolve(here, '../fixtures', `golden-${scenario.id}.json`), 'utf8'),
    )
    assert.deepEqual(runScenario(scenario), golden, scenario.id)
  }
})

test('deterministic replay: two runs of the same scenario are identical', () => {
  const scenario = scenarioById.get('arc20-transfer')
  assert.deepEqual(runScenario(scenario), runScenario(scenario))
})

test('the same seed yields the same identifiers, different seeds differ', () => {
  assert.equal(syntheticTxid('seed', 1), syntheticTxid('seed', 1))
  assert.notEqual(syntheticTxid('seed', 1), syntheticTxid('other', 1))
})

test('UTXO conservation holds across every non-fatal scenario', () => {
  for (const scenario of scenarios) {
    const result = runScenario(scenario)
    if (result.trace.some((entry) => entry.fatal)) continue
    let total = 0
    for (const utxo of Object.values(result.finalState.utxos)) {
      if (!utxo.unspendable) total += utxo.value
    }
    const funded = scenario.steps
      .filter((step) => step.type === 'fund')
      .flatMap((step) => step.outputs)
      .reduce((sum, output) => sum + output.value, 0)
    const spent = result.trace.reduce((sum, entry) => sum + (entry.fee ?? 0), 0)
    const burned = scenario.steps
      .filter((step) => step.type === 'transfer')
      .flatMap((step) => step.outputs)
      .filter((output) => output.unspendable)
      .reduce((sum, output) => sum + output.value, 0)
    assert.equal(total, funded - spent - burned, `${scenario.id}: satoshis are conserved across fees and provable burns`)
  }
})

test('asset conservation: accidental burn burns, clean transfer does not', () => {
  const clean = runScenario(scenarioById.get('arc20-transfer'))
  const transfer = clean.trace.find((entry) => entry.step.type === 'transfer' && entry.step.label === 'send')
  assert.equal(transfer.warnings.length, 0, 'the clean transfer must not burn')

  const careless = runScenario(scenarioById.get('accidental-burn'))
  const bad = careless.trace.find((entry) => entry.step.label === 'send-carelessly')
  assert.ok(bad.warnings.length > 0, 'the careless transfer must warn')
  const burnRule = bad.rules.find((rule) => rule.rule.id === 'arc20/burn')
  assert.ok(burnRule, 'the burn cites the burn rule')
  assert.equal(burnRule.ok, false)
})

test('reorg unsettles confirmed state and the scenario recovers on re-confirmation', () => {
  const result = runScenario(scenarioById.get('confirmations-reorg'))
  const reorg = result.trace.find((entry) => entry.step.type === 'reorg')
  assert.ok(reorg, 'the reorg step ran')
  assert.ok(reorg.warnings[0].includes('reorganization'))
  assert.equal(result.finalState.blockHeight, 2)
})

test('the invalid scenario stops with a fatal trace instead of inventing money', () => {
  const result = runScenario(scenarioById.get('invalid-operation'))
  const fatalEntry = result.trace.find((entry) => entry.fatal)
  assert.ok(fatalEntry, 'the overspend is refused')
  assert.match(fatalEntry.errors[0], /exceed/)
})

test('every rule outcome cites the pinned source revision', () => {
  for (const scenario of scenarios) {
    const result = runScenario(scenario)
    for (const entry of result.trace) {
      for (const rule of entry.rules ?? []) {
        assert.equal(rule.rule.id.includes('/'), true, 'rule ids name their area')
      }
    }
  }
})

test('scenario version is pinned', () => {
  assert.equal(SCENARIO_VERSION, '1.0.0')
})
