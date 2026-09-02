# Burns

How ARC-20 value is destroyed, the four shapes that cause it, and the checks that prevent every one of them.

Page ID: protocol/arc20/burns
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/arc20/burns/

---
A burn is coloured value that a validator could not place in any eligible output. It is recorded
as destroyed. The Bitcoin transaction that caused it is valid, mined, and confirmed.

Burned units do not go anywhere. There is no address that holds them and no procedure that
returns them. Prevention is the only control.

## The four shapes that cause a burn

### 1. The next output is too large

The most common. You have 500 units left to place and the next output is 546 satoshis. It does not
fit, so the 500 units are destroyed.

**Prevention.** Size the change output to exactly the remainder you intend to keep.

### 2. There are not enough outputs

Every output was covered and value is still left. Nothing remains to place it in.

**Prevention.** Always include a coloured change output when the inputs exceed what you are
sending.

### 3. The first output is larger than the whole lot

Nothing can be placed at all, so the entire lot burns.

**Prevention.** Never send a small coloured lot into a transaction whose first output is a large
cardinal payment.

### 4. The fallback rearranged a multi token transaction

One token could not be placed cleanly, so the builder restarted every token from output zero and a
different token lost its slot.

**Prevention.** Move one token per transaction unless you have modelled the multi token case.

## Executed cases

## The checks that prevent all four

1. Compute the expected assignment before signing, not after.
2. Confirm the burn figure is zero.
3. Size every coloured output deliberately, in satoshis.
4. Keep fee inputs cardinal and separate.
5. Move one token per transaction unless you have a reason not to.
6. Re-check after any change to the output set, including a wallet adding change.

Use the [allocation visualizer](/tools/allocation-visualizer/) to do steps one and two.

## Detecting a burn after the fact

A validator records burns per transaction. Read the transaction through a source that reports
them, and compare the coloured input total against the sum of coloured output totals. Any
difference is a burn.

The Universe ARC-20 activity feed publishes burn records among its confirmed activity. See
[ARC-20 API](/reference/api/arc20/).
