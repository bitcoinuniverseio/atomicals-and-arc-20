/**
 * Protocol Lab worker: executes scenarios off the main thread so a large
 * scenario never blocks the page. Terminating the worker is always safe: the
 * engine is pure, so a rerun reproduces the same trace from the same input.
 */
import { runScenario } from '@bitcoin-universe/protocol-lab/engine'
import { scenarios } from '@bitcoin-universe/protocol-lab/scenarios'

self.onmessage = (event) => {
  const { id, scenario } = event.data ?? {}
  if (id === 'list') {
    self.postMessage({
      id: 'list',
      scenarios: scenarios.map((entry) => ({
        id: entry.id,
        title: entry.title,
        description: entry.description,
        scenario: entry,
      })),
    })
    return
  }
  if (id === 'run' && scenario) {
    try {
      const result = runScenario(scenario)
      self.postMessage({ id: 'run', scenarioId: scenario.id, result })
    } catch (error) {
      self.postMessage({ id: 'run', scenarioId: scenario?.id, error: String(error?.message ?? error) })
    }
  }
}
