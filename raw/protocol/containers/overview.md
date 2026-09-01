# Containers

A named collection identity that items can prove membership in, and what it takes to make that proof meaningful.

Page ID: protocol/containers/overview
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/containers/overview/

---
A Container is an Atomical that represents a collection. It has a globally allocated name, and it
is the anchor that items prove membership against.

## The lifecycle

| Stage | Operation | What exists afterwards |
| --- | --- | --- |
| Mint the Container | `nft` with a container request | A named collection identity, as a candidate |
| Resolve the name | Rules | A verified Container name |
| Prepare the manifest | Off chain, then `mod` | The item rules, still editable |
| Seal the manifest | `sl` | Rules that can never change |
| Claim items | `dmt` item claims | Verified items, bounded by the manifest |

Sealing before item minting is what makes the collection meaningful. An unsealed manifest can be
rewritten while people mint against it.

## Reference commands

| Command | Use |
| --- | --- |
| `mint-container <container>` | Mint the Container |
| `prepare-dmint <folder> <mintHeight> <bitworkc>` | Build a manifest from a folder of items |
| `prepare-dmint-items` | Prepare the item files |
| `enable-dmint <container> <jsonFilename>` | Attach the manifest to the Container |
| `mint-item <container> <itemId> <manifestFile>` | Claim one item |
| `validate-container-item` | Check an item against the manifest |
| `set-container-data` | Write Container data |
| `seal` | Seal, permanently |
| `get-container`, `get-container-item`, `get-container-items` | Read |
| `find-containers`, `summary-containers` | Discover |

Exact signatures are in the generated [CLI reference](/reference/cli/).

## Name allocation

A Container name is a globally allocated name and follows the same candidate model as tickers and
Realms. A request is not a name until the rules resolve it.
See [candidates and winners](/protocol/core/candidates-and-winners/).

## What a consumer should check

1. The Container's Atomical ID, not its name.
2. Whether the manifest is sealed, and at what height.
3. Whether each item was verified against the manifest or merely claims membership in metadata.
4. The verified item count against the manifest total.

## Universe status

Containers and DMINT items are excluded from the Universe NFT and Realm read projection by
declaration. Asking that index about a Container is out of scope, not a failure. See
[status and known limitations](/start/status-and-limitations/).
