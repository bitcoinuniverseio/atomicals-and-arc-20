/**
 * ARC-20 allocation engine, stable import path.
 *
 * The implementation lives in packages/protocol-core, the one package every
 * consumer imports: the conformance vectors, the allocation visualizer, the
 * transaction inspector, the Protocol Lab, the UTXO planner, and the MCP
 * tools. This module re-exports it so existing paths keep resolving and
 * nothing forks the logic.
 *
 * Source: atomicals-electrumx at 8df23747835c20230fc8b8097d469e7a1d97c3e0
 */
export {
  orderFtInputs,
  assignExpectedOutputsBasic,
  calculateOutputsToColor,
  colorFtRegular,
  colorFtSplit,
  customColorFt,
  allocate,
} from '../packages/protocol-core/src/allocation.mjs'
