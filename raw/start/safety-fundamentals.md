# Safety fundamentals

The eight checks that separate a clean Atomicals transaction from a permanent loss, and the four claims you must never accept at face value.

Page ID: start/safety-fundamentals
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/start/safety-fundamentals/

---
Most Atomicals losses are not exploits. They are ordinary Bitcoin transactions that spent a
coloured output the way an ordinary wallet would.

## Never do these

- Never give a seed phrase, private key, or wallet export file to anything, including us. No
  legitimate verification needs them.
- Never let a general purpose Bitcoin wallet choose fee inputs from a set that includes your
  coloured outputs.
- Never treat a ticker, image, name, or marketplace listing as proof of who made something.
- Never treat one indexer response as final truth. It is one version's opinion at one moment.

## The eight checks before you sign

1. **Which outputs are coloured?** Identify the exact outpoints carrying the asset. If your
   wallet cannot tell you, stop.
2. **What is the input order?** Allocation walks inputs and outputs in order. Order changes the
   result.
3. **What is each output worth in satoshis?** Not in token units. In satoshis.
4. **What is the output order?** Output zero is special for mints and for most transfer shapes.
5. **How much lands where?** Every output should have an expected unit figure before you sign.
6. **What burns?** If any value cannot be placed, it is destroyed. It should be zero unless you
   intended otherwise.
7. **Where does the fee come from?** A separate cardinal input, never the coloured one.
8. **What does the wallet prompt actually say?** Compare it to your expectation, line by line.

Sending a coloured output to an exchange deposit address, a plain Bitcoin wallet, or any service
that does not understand Atomicals means the value is spent as ordinary bitcoin. The units are
gone. There is no recovery path.

## What a burn looks like

A burn is not an error. The Bitcoin transaction is valid, mined, and confirmed. The units simply
have nowhere to go, so the validator records them as destroyed. Read
[burns](/protocol/arc20/burns/) for the exact rule and
[avoid burns](/guides/avoid-burns/) for the working procedure.

## Four claims that prove nothing

| Claim | What it actually proves |
| --- | --- |
| The ticker matches | A name was allocated to some Atomical. Nothing about who. |
| The metadata says so | Someone wrote arbitrary data into a payload. |
| It is listed on a marketplace | Someone submitted a listing. Ownership is checked separately, at settlement. |
| The indexer shows a balance | One implementation, at one generation, believes that. Check the version and freshness. |

## After you broadcast

1. Wait for confirmation on Bitcoin.
2. Wait for the index to reach that height and report a stable generation.
3. Re-read the asset's location and confirm it matches the output you intended.
4. Check the transaction for recorded burns.

Confirmation and indexing are two separate answers.
See [confirmations and reorgs](/guides/confirmations-and-reorgs/).

## If something already went wrong

- A transaction that was rejected before broadcast is recoverable:
  [recover from a rejection](/guides/recover-from-a-rejection/).
- A wallet that will not sign is usually a capability or encoding problem:
  [wallet signing failures](/guides/wallet-signing-failures/).
- A balance that reads zero is often an unavailable index, not a loss:
  [unavailable index against empty balance](/guides/unavailable-indexer-vs-empty-balance/).
- A confirmed burn cannot be reversed. Nothing on this site can change that.
