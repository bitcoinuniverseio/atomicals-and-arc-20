/**
 * The shared protocol-rule modules are plain ESM JavaScript with JSDoc types.
 * The MCP server imports them for simulation tools; the surface used here is
 * declared once so the compiler stays strict.
 */
declare module '@bitcoin-universe/protocol-core/allocation' {
  export function allocate(
    outputs: { value: number; unspendable?: boolean }[],
    inputs: { atomicalId: string; txinIndex: number; atomicalValue: number }[],
    options?: { sortByFifo?: boolean; customColoring?: boolean },
  ): {
    outputs: { index: number; coloredTotal: number }[]
    burned: { atomicalId: string; value: number }[]
    cleanlyAssigned: boolean
    inflationRejected: boolean
  }
}
declare module '@bitcoin-universe/utxo-planner/planner' {
  export function classifyUtxo(utxo: {
    utxoId: string
    value: number
    address?: string
    confirmed?: boolean
    atomicals?: Record<string, number>
  }): {
    utxoId: string
    classification: string
    confidence: string
    indexerDataAvailable: boolean
    evidence: { id: string; summary: string }[]
  }
  export function detectRisks(args: {
    inputs: { utxoId?: string; value: number; atomicals?: Record<string, number>; confirmed?: boolean }[]
    outputs: { value: number; role?: string; address?: string; unspendable?: boolean }[]
    feeRate?: number
    indexerDataAvailable?: boolean
  }): { fee: number; virtualSize: number; warnings: { risk: { id: string; page: string }; detail: string; fatal: boolean }[] }
}
