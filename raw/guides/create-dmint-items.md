# Create DMINT items

Seal the manifest before opening minting, and check what is on chain before making it permanent.

Page ID: guides/create-dmint-items
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/create-dmint-items/

---
## Before you start

- Supported networks: mainnet.
- Status: protocol behavior.
- You need a Container whose name already resolved to your Atomical ID.
  See [create a Container](/guides/create-a-container/).

Seal first, then open minting. A manifest that can still be edited while people mint against it
makes every verification meaningless.

## The procedure

1. Assemble the final item set in a folder. Final means final.
2. Build the manifest:

   ```text
   yarn cli prepare-dmint <folder> <mintHeight> <bitworkc>
   ```

3. Prepare the item files with `prepare-dmint-items`.
4. Verify locally that every item you intend to allow is in the manifest, and nothing else is.
5. Attach it:

   ```text
   yarn cli enable-dmint <container> <jsonFilename>
   ```

6. **Read the manifest back from the chain** and compare it byte for byte with what you built.
7. Only then seal:

   ```text
   yarn cli seal <atomicalId>
   ```

8. Publish the Container Atomical ID, the sealed state, and the manifest.
9. Open minting at or after the mint height.

Step six is the one people skip. Read back what is actually on chain before making it permanent.

## What claimants do

```text
yarn cli mint-item <container> <itemId> <manifestFile>
```

They can check first with `validate-container-item`, without minting.

## Failure states for a claimant

| State | Cause |
| --- | --- |
| Item not in the manifest | Wrong identifier |
| Digest mismatch | Content differs from the manifest entry |
| Before mint height | Claimed too early |
| Bitwork not satisfied | Grinding incomplete |
| Payment missing or wrong | A payment rule was not satisfied |
| Already claimed | Someone else won the race |

Every one of those produced a confirmed Bitcoin transaction and cost a fee.

## After

Verify a sample of minted items against the manifest yourself, and publish the verified item count
alongside the manifest total.

## Source

[DMINT](/protocol/containers/dmint/) and
[sealing and rules](/protocol/containers/sealing-and-rules/).
