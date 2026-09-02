# Transaction safety inspector

Parse a transaction or PSBT in your browser and read its inputs, outputs, and signature scope before you sign.

Page ID: tools/transaction-inspector
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/tools/transaction-inspector/

---
This tool takes a transaction or a PSBT. It never needs a private key, a seed phrase, or a wallet
export file, and neither does anything else on this site. Nothing you paste leaves your browser.

## What it tells you

| Reads | From |
| --- | --- |
| Version, and whether the transaction is segwit | The serialisation |
| Every input outpoint and sequence | The serialisation |
| Every output value, in order | The serialisation |
| The script kind per output | Script shape recognition |
| Declared signature hash types | The PSBT input maps |
| Expected allocation and burns | The allocation engine, if you supply the coloured inputs |

## What it cannot tell you

- Whether an input is actually coloured. It queries nothing, so you must supply that.
- Whether the counterparty's validator agrees.
- Whether the transaction will be accepted by a mempool.
- Whether an unrecognised script is safe. Unrecognised means unknown, not fine.

It fails closed: anything it cannot determine is reported as unknown rather than assumed.

## The checks to run with it

1. Confirm every input outpoint is one you meant to spend.
2. Confirm every output script and value matches your intent.
3. Confirm the output order matches what you modelled.
4. Confirm the signature hash type is the one you expected.
5. Supply the coloured inputs and confirm the burn figure is zero.

See [verify a transaction](/guides/verify-a-transaction/) for the full procedure, including what
to do after broadcast.
