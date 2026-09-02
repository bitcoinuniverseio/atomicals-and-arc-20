/**
 * The shipped scenario library. Each scenario is a data file validated
 * against scenario.schema.json and executed by the engine; the browser lab,
 * the tests, and the MCP tools all read this one list.
 */
import commitRevealNft from '../scenarios/commit-reveal-nft.json' with { type: 'json' }
import arc20Mint from '../scenarios/arc20-mint.json' with { type: 'json' }
import arc20Transfer from '../scenarios/arc20-transfer.json' with { type: 'json' }
import arc20Split from '../scenarios/arc20-split.json' with { type: 'json' }
import arc20Merge from '../scenarios/arc20-merge.json' with { type: 'json' }
import accidentalBurn from '../scenarios/accidental-burn.json' with { type: 'json' }
import intentionalBurn from '../scenarios/intentional-burn.json' with { type: 'json' }
import confirmationsReorg from '../scenarios/confirmations-reorg.json' with { type: 'json' }
import invalidOperation from '../scenarios/invalid-operation.json' with { type: 'json' }
import realmClaim from '../scenarios/realm-claim.json' with { type: 'json' }

export const scenarios = [
  commitRevealNft,
  arc20Mint,
  arc20Transfer,
  arc20Split,
  arc20Merge,
  accidentalBurn,
  intentionalBurn,
  confirmationsReorg,
  invalidOperation,
  realmClaim,
]

export const scenarioById = new Map(scenarios.map((scenario) => [scenario.id, scenario]))
