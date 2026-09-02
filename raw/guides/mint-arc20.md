# Mint ARC-20

Claim against a deployment without wasting a fee on a claim that was never going to be valid.

Page ID: guides/mint-arc20
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/mint-arc20/

---
## Before you start

- Supported networks: mainnet.
- Status: protocol behavior. Universe products expose decentralised mint flows.
- You need funding for two fees plus the mint amount locked in output zero.

In a contested mint the quota fills. Every claim after the last valid one is a confirmed Bitcoin
transaction that cost a fee and produced nothing.

## Check before you build

1. Resolve the ticker to a **verified winning Atomical ID**.
2. Confirm the Atomical ID matches the one the project published.
3. Read the deployment: mode, mint amount, maximum mints, mint height, Bitwork.
4. Read claims made so far, with the height that figure came from.
5. Confirm the current height is at or past `mint_height`.
6. Confirm the current Bitwork requirement, especially for a perpetual deployment.

If claims made is already at the maximum, stop. There is nothing left to claim.

## The command

```text
yarn cli mint-dft <ticker>
```

Useful options: `--current`, `--initialowner`, `--funding`, `--satsbyte`, `--rbf`,
`--disablechalk`. See the [CLI reference](/reference/cli/#mint-dft).

## What happens

1. Commit transaction, ground if commit Bitwork applies.
2. Reveal transaction, ground if reveal Bitwork applies.
3. Output zero of the reveal carries exactly `mint_amount` satoshis.

Exactly. Not at least.

## Cost

Two Bitcoin fees, grinding time, and `mint_amount` satoshis locked in output zero. In a contested
mint, fee rates rise, so budget above the current rate.

## If it fails

| Failure | Meaning |
| --- | --- |
| Quota already full | The claim is invalid. The fee is spent |
| Before `mint_height` | Invalid. Wait and try again |
| Bitwork not met | The grind targeted the wrong requirement |
| Wrong output zero amount | Invalid. It must be exact |
| Ticker was a candidate, not a winner | You minted against something that does not hold the name |

## After broadcast

1. Confirm on Bitcoin.
2. Wait for indexing at that height.
3. Read the claim result. A confirmed transaction is not a successful mint.
4. If valid, read your new coloured outpoint and record it.
5. Move it into your protected pool.
   See [protect coloured outputs](/guides/protect-colored-outputs/).

## Source

[Decentralised mint claims](/protocol/arc20/decentralized-mint/).
