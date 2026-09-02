/**
 * Protocol core: pure, framework-free protocol rules.
 *
 * One implementation per rule, consumed by the documentation pages, the
 * conformance vectors, the browser tools, the Protocol Lab, the UTXO Safety
 * Planner, and the MCP tools. No DOM, no network, no clock: the same input
 * always produces the same output.
 */
export * from './allocation.mjs'
export * from './bitwork.mjs'
export * from './tx.mjs'
