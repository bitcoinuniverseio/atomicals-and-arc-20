# Envelope and operations

The structure a validator reads, the operation codes it recognises, and why a JSON object in a user interface is not a wire format.

Page ID: protocol/core/envelope-and-operations
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/core/envelope-and-operations/

---
The reveal witness carries a non-executed script structure of this shape:

```text
OP_FALSE
OP_IF
  "atom"
  <operation>
  
OP_ENDIF
```

`OP_FALSE OP_IF` means Bitcoin skips the block entirely. The bytes are inert to consensus and
meaningful only to an Atomicals validator.

## Operation codes

| Code | Branch | Purpose |
| --- | --- | --- |
| `nft` | Non-fungible | Mint a non-fungible object, including Realms, Subrealms, and Containers |
| `ft` | Fungible | Direct issuance of a complete supply |
| `dft` | Fungible | Deploy a decentralised mint |
| `dmt` | Fungible | Claim one mint against a deployment |
| `y` | Fungible | Split behavior at the pinned revision |
| `z` | Fungible | Custom coloring, activation gated |
| `x` | Non-fungible | Splat, separating Atomicals held at one output |
| `mod` | Any | Update mutable state |
| `evt` | Any | Record an event |
| `sl` | Any | Seal, refusing further changes |
| `dat` | Any | Store permanent data |

## The payload is CBOR, not JSON

A user interface may show you JSON. The wire format is CBOR. The differences that matter:

- CBOR has real binary strings, so embedded files are raw bytes rather than base64.
- CBOR map key ordering affects the encoded bytes and therefore the transaction id you grind.
- A JSON round trip can silently change number types and lose byte exactness.

Build the CBOR with the library your target validator uses. Do not hand-assemble an envelope from
a formatted JSON blob.

## Embedded files

A payload can carry named files. Each file declares a content type and its bytes. A validator
records a digest so a consumer can check integrity later. See
[permanent storage](/protocol/core/permanent-storage/) and
[metadata and media](/protocol/nft/metadata-and-media/).

## Validation is contextual

The same envelope can be valid in one block and invalid in another. Height, network, active rule
set, deployment state, quota, and Bitwork all participate. A parser that only checks structure
will pass envelopes a validator rejects.

The only reliable check is running the exact validator revision you target against the exact
transaction blueprint you intend to broadcast.
