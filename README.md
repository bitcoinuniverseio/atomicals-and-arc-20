# Atomicals + ARC-20 documentation

An independent static documentation bundle for the Atomicals ARC-20 fungible-token model on Bitcoin.

## What is here

- [index.html](index.html): protocol overview, mental model, issuance modes, and transfer-risk orientation.
- [reference.html](reference.html): envelope, identifiers, CLI forms, DFT lifecycle, metadata, transfer allocation, and preflight checks.
- [guide.html](guide.html): build and verification playbook, plus the current Universe product-scope matrix and transfer guardrail.
- [specification.md](specification.md): source-pinned compatibility specification and behavioral test vectors.
- [sources.md](sources.md): authority hierarchy, implementation pin, exact source links, and update process.
- [llms.txt](llms.txt): compact machine-readable summary.
- [theme.css](theme.css) and [site.js](site.js): shared, dependency-free static-site assets.
- [assets/atomicals-cli-lockup.jpg](assets/atomicals-cli-lockup.jpg): unchanged source-pinned Atomicals CLI visual used with attribution in the site shell.

## Scope

ARC-20 is an Atomicals UTXO coloring model. One ARC-20 unit maps to one satoshi. Asset control follows a Bitcoin UTXO only when the Atomicals allocation rules validly assign the units to that output.

This is not an ERC-20 account-balance protocol, a price guarantee, a redemption mechanism, or a substitute for the Atomicals validator.

This is also not an official Atomicals protocol site. It uses an unchanged asset bundled in the Atomicals CLI repository to make source provenance visible, without asserting affiliation or a trademark license.

## Accuracy policy

The Atomicals specification guide says the specification is defined in code. This documentation therefore:

- links explanatory material to the Atomicals guide;
- pins source-dependent behavior to an ElectrumX revision in [sources.md](sources.md);
- separates protocol capabilities from the features currently exposed by Universe; and
- marks activation-gated behavior instead of presenting it as universal support.

## Local preview

Open [index.html](index.html) in a browser, or serve this directory from any static-file server. The site uses only relative links and no build step.

## Important product boundary

The local static bundle is a documentation artifact. Check [guide.html](guide.html#universe-scope) before representing a protocol feature as available in the current Universe product. In particular, direct `mint-ft` issuance and the visible ARC-20 transfer path must not be described as supported today.

## Source material

- [Atomicals ARC-20 guide](https://atomicals-community.github.io/atomicals-guide/arc20-tokens/)
- [Atomicals specification guide](https://atomicals-community.github.io/atomicals-guide/reference-and-tools/specification.html)
- [Atomicals JavaScript CLI](https://github.com/atomicals/atomicals-js)
- [Pinned Atomicals CLI lockup asset](https://github.com/atomicals/atomicals-js/blob/1333565efbfe5ca4bdb8443a94d72e9f8534c2c4/atomicals.jpg)
- [Pinned ElectrumX source ledger](sources.md)
