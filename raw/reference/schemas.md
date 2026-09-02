# JSON Schemas

The shared component library, what each definition is for, and the rules it encodes.

Page ID: reference/schemas
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/reference/schemas/

---
One component library is shared by every OpenAPI document and by the generated client. Every
example in it is validated in CI.

## The rules the schemas encode

**Atomic amounts are strings.** `AtomicAmount` is a decimal string with a pattern, not a number.
That is deliberate: a satoshi quantity above the safe integer range would lose precision as a JSON
number, and a client that parses one into a float produces silently wrong arithmetic.

**Atomical IDs have a shape.** `AtomicalId` is `<txid>i<index>`, matched by pattern. A location is
`<txid>:<vout>`. They are different things and the schemas keep them apart.

**Names have three forms.** `AssetProjection` carries `name` as the exact minted bytes and
`normalizedName` for comparison. Neither is a display form. See
[Unicode and IDNA](/protocol/realms/unicode-and-idna/).

**Freshness travels with answers.** `Freshness` carries the generation identifier, indexed height,
stale flag, mixed tip flag, source revision, and network. A caller that stores an answer without
these cannot explain a later disagreement.

**Errors have a code.** Branch on `error.code`, never on `error.message`. Messages are for humans
and can change without a version bump.

`MediaDescriptor` carries a declared content type and a digest. The digest proves the bytes. The
content type is attacker controlled. Sniff the bytes.

## Versioning

Schemas carry a version. When it changes:

1. Validate your stored records against the new schema.
2. Fix what fails before switching.
3. Keep the old schema available until nothing reads the old records.

See [migration](/develop/migration/).

## Adding a schema

Contributor instructions are in [adding an API](/contribute/adding-an-api/). In short: add the
definition with at least one example, reference it from the documents that use it, and let CI
validate the example.
