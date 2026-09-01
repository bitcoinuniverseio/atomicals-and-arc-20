# Bitwork estimator

Model a Bitwork prefix and see the expected search space, with the uncertainty stated rather than hidden.

Page ID: tools/bitwork-estimator
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/tools/bitwork-estimator/

---
## How the numbers are derived

Each hexadecimal character of prefix fixes four bits of the transaction id, so the expected number
of attempts is two to the power of the fixed bits. A partial next character fixes whole bits
between two character levels.

The probability of having finished after a given number of attempts assumes independent attempts,
each succeeding with probability two to the negative power of the fixed bits.

There is a real chance of finishing in a fraction of the expected time, and a real chance of taking
several times longer. Plan for the range, not the average.

## What this does not tell you

- Your actual attempt rate. Measure it; the tool takes your figure.
- Electricity, hardware, or opportunity cost.
- Whether the mint will still have quota left when you finish.
- Whether a perpetual deployment's requirement will have progressed by then.

## For deployers

Setting a mint Bitwork requirement raises the cost of automated claiming, and it raises the cost
for every ordinary participant equally. Model the level you are considering before publishing it,
because it cannot be changed afterwards for a fixed deployment.

See [ARC-20 Bitwork requirements](/protocol/arc20/bitwork-requirements/).
