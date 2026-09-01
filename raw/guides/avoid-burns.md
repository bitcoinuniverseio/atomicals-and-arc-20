# Avoid burns

The working procedure that prevents every burn shape, with the executed cases that show what each one looks like.

Page ID: guides/avoid-burns
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/avoid-burns/

---
## Before you start

- Supported networks: mainnet.
- Status: protocol behavior.
- Prevention is the only control. There is no recovery.

## The procedure

1. Work in outpoints and satoshis. Never in a token amount box.
2. Move one token per transaction unless you have modelled the multi token case.
3. Always include a coloured change output when the lot exceeds what you are sending.
4. Size the change output to **exactly** the remainder.
5. Model the exact input and output set, in order, before building.
6. Confirm the computed burn figure is zero.
7. Add the fee inputs and cardinal change, then model again.
8. Confirm the burn figure is still zero.
9. Compare the wallet prompt to your model, line by line, before signing.

Steps seven and eight are the ones people skip, and they are where wallet-added change silently
changes the result.

## The four shapes, executed

| Shape | Prevention |
| --- | --- |
| Next output too large | Size change to exactly the remainder |
| Not enough outputs | Always include coloured change |
| First output larger than the lot | Never send a small lot into a large first payment |
| Multi token fallback | One token per transaction |

An exchange deposit address, a plain Bitcoin wallet, or any service without Atomicals support
spends the output as ordinary bitcoin. The units are gone, and no burn record will comfort you.
Check the destination supports Atomicals before you send.

## The one case where a burn is deliberate

Destroying units on purpose is a valid action. Do it explicitly: build the transaction that burns
exactly what you intend, confirm the figure, and record why. Never rely on an accidental burn.

## After broadcast

Read the transaction through a source that reports burns and confirm the figure is what you
expected. Compare the coloured input total against the sum of coloured output totals.

## Source

[Burns](/protocol/arc20/burns/) and [allocation](/protocol/arc20/allocation/).
