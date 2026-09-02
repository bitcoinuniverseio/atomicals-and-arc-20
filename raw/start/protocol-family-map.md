# Protocol family map

Every Atomicals primitive in one place, what it produces, which operation creates it, and where Universe exposes it today.

Page ID: start/protocol-family-map
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/start/protocol-family-map/

---
## Primitives

| Primitive | Creating operation | Result | Read |
| --- | --- | --- | --- |
| Atomicals NFT | `nft` | One non-fungible object with optional payload files | [NFT overview](/protocol/nft/overview/) |
| Direct FT | `ft` | Complete fungible supply in output zero | [Direct issuance](/protocol/arc20/direct-issuance/) |
| Fixed DFT | `dft` | A deployment that others mint against | [Fixed DFT](/protocol/arc20/fixed-dft/) |
| DFT claim | `dmt` | One mint of the deployment's exact amount | [Decentralised mint](/protocol/arc20/decentralized-mint/) |
| Perpetual DFT | `dft` with perpetual parameters | Activation gated progressive minting | [Perpetual DFT](/protocol/arc20/perpetual-dft/) |
| Container | `nft` with a container request | A named collection identity | [Containers](/protocol/containers/overview/) |
| DMINT item | `dmt` item claim against a sealed manifest | A verified collection item | [DMINT](/protocol/containers/dmint/) |
| Realm | `nft` with a realm request | A top-level name | [Realms](/protocol/realms/overview/) |
| Subrealm | `nft` with a subrealm request | A child name under a Realm | [Subrealms](/protocol/realms/subrealms/) |
| Payname | A Realm used as a payment destination | A resolvable name | [Paynames](/protocol/realms/paynames/) |

## Transfer and maintenance operations

| Operation | Applies to | What it does |
| --- | --- | --- |
| normal allocation | FT and NFT | Default coloring when no operation payload is present |
| `y` | FT | Split behavior at the pinned revision |
| `z` | FT | Custom coloring, activation gated |
| `x` | NFT | Splat, separating multiple Atomicals held at one output |
| `mod` | Any | State update recorded in history |
| `evt` | Any | Event record |
| `sl` | Container, NFT | Seal, making further changes impossible |
| `dat` | Any | Permanent data storage |

Exact payload shapes and activation conditions are version sensitive. See
[envelope and operations](/protocol/core/envelope-and-operations/).

## Universe product exposure

This column answers a different question from the one above. It is about what our services do,
not what the protocol allows.

| Capability | Universe status | Where |
| --- | --- | --- |
| ARC-20 token discovery, details, holders, activity | Available | [ARC-20 API](/reference/api/arc20/) |
| ARC-20 portfolio balances and UTXOs | Available | [ARC-20 API](/reference/api/arc20/) |
| NFT, Realm, and Subrealm read model | Available | [NFT and Realm API](/reference/api/atomicals-nfts-realms/) |
| Marketplace v1 for ARC-20, NFTs, Realms, Subrealms | Available, gated per action | [Marketplace v1](/reference/api/marketplace-v1/) |
| Direct `mint-ft` issuance from a Universe product | Not exposed | [Direct issuance](/protocol/arc20/direct-issuance/) |
| Container and DMINT read model | Not in the NFT and Realm projection | [Containers](/protocol/containers/overview/) |
| AVM execution | Not exposed | [AVM status](/protocol/avm/status-and-limitations/) |

The Universe NFT and Realm index deliberately projects plain NFTs, Realms, and Subrealms only.
Fungible tokens, Containers, and DMINT items are excluded from that projection and served by the
ARC-20 side. That exclusion is declared in the index's own provenance manifest.
