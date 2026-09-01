# Allocation

The exact rule a validator uses to place coloured value into outputs, with executed vectors for every case.

Page ID: protocol/arc20/allocation
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/arc20/allocation/

---
Allocation is the single most important rule in ARC-20. It decides which output receives which
units, and what is destroyed.

## The rule

1. Collect the coloured value carried by the transaction's inputs, summed per token.
2. Order the tokens. FIFO ordering uses the first input index that carries each token, then the
   Atomical ID. Legacy ordering uses the Atomical ID alone.
3. For each token in that order, walk the outputs starting at the first slot not already used.
4. Skip provably unspendable outputs entirely. They consume nothing.
5. Assign an output **only if its whole satoshi value fits** in the value still to place.
6. If it fits, that output is coloured for its full satoshi value, and the remaining value drops
   by that amount.
7. If the next output does not fit, stop. Whatever is left is burned.
8. If any token could not be placed cleanly, the builder discards the sequential plan and restarts
   every token from output zero.
9. Coloured output totals can never exceed coloured input totals.

## What "fits" means, precisely

An output fits when `output.value <= remaining`. Nothing is ever partially filled under normal
allocation. An output either takes its full satoshi value in units, or it takes nothing.

Step seven is not an error path. The Bitcoin transaction is valid and confirms. See
[burns](/protocol/arc20/burns/).

## Executed vectors

Every row below is computed at build time by the same engine the conformance tests run. The
numbers on this page cannot drift from the vector set.

The vector set lives at `conformance/vectors/arc20-allocation.json` and its engine at
`conformance/allocation.mjs`. See [conformance](/reference/conformance/).

## The output zero fallback

Step eight surprises people. When the sequential plan cannot place a token cleanly, the reference
builder throws away the whole plan and restarts every token from output zero. With more than one
token in the transaction, that can move value you thought was settled and can burn a token that
would otherwise have been fine.

The `two-tokens-non-clean-fallback` vector above shows it. Build transactions that never trigger
it.

## No inflation

Coloured output totals can never exceed coloured input totals. A blueprint that tries is rejected.
This is the one rule that cannot be worked around by output arrangement.

## What changes the result

| Input | Effect |
| --- | --- |
| Coloured input value | The total to place |
| Input order | Token ordering under FIFO |
| Output order | Which slot is considered next |
| Output satoshi values | Whether each output fits |
| Unspendable outputs | Skipped, consuming nothing |
| Active rule set | Whether custom coloring applies |
| Number of distinct tokens | Whether the fallback can trigger |
