# Transfer ARC-20

Build a transfer that places every unit where you intend and burns nothing.

Page ID: guides/transfer-arc20
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/transfer-arc20/

---
## Before you start

- Supported networks: mainnet.
- Status: protocol behavior.
- You need a wallet or builder that works in outpoints and satoshi values, not in an amount field.

Sizes are in satoshis, not in a token amount box. Get one wrong and the remainder burns.

## The shape that works

| Position | Contents |
| --- | --- |
| Input 0 | The coloured lot |
| Input 1 and later | Cardinal inputs for the fee |
| Output 0 | The recipient, sized to exactly the units you are sending |
| Output 1 | Coloured change, sized to exactly the remainder |
| Output 2 | Cardinal change, if any |

## The procedure

1. List your coloured outpoints and pick the lot to spend.
2. Decide the amount to send. That number is also the satoshi value of output 0.
3. Compute the remainder: lot value minus amount sent. That is the satoshi value of output 1.
4. Model the exact input and output set in the
   [allocation visualizer](/tools/allocation-visualizer/).
5. Confirm the burn figure is zero.
6. Add cardinal inputs for the fee and a cardinal change output last.
7. Re-model with the fee inputs and outputs included. The burn figure must still be zero.
8. Build the transaction, preserving your input and output order.
9. Compare the wallet prompt to your model, line by line.
10. Sign and broadcast.

## Why step seven exists

Adding a fee input or a change output changes the output set, and the allocation walks outputs in
order. A transfer that was clean before the wallet added change can burn after it.

## The two vectors that show the risk

Same intent, same lot, same amount sent. The only difference is the change output size, and one of
them destroys 200 units.

## Cost

One Bitcoin fee, paid from a cardinal input. No commit and reveal pair, and no grinding, for an
ordinary transfer.

## If it fails

- The wallet will not let you set output values in satoshis: use a different builder.
- The wallet reorders outputs: use a different builder. Order is meaning.
- The burn figure is not zero: change the output sizes, do not proceed.

## After broadcast

Confirm, wait for indexing, read the asset location, and check the recorded burn figure.
See [verify a transaction](/guides/verify-a-transaction/).

## Source

[Allocation](/protocol/arc20/allocation/) and [burns](/protocol/arc20/burns/).
