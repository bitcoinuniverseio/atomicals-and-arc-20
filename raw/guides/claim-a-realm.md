# Claim a Realm

Request a top-level name, confirm it resolved to you, and protect the output that carries it.

Page ID: guides/claim-a-realm
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/claim-a-realm/

---
## Before you start

- Supported networks: mainnet.
- Status: protocol behavior. The Universe read model exposes realm resolution and hierarchy.
- A request is not a name. It becomes one only when the rules resolve it.

## Check first

1. Search for the name. `find-realms`, `get-realm`, and `realm-info` read the current state.
2. Check for existing candidates for the same name.
3. Check for confusable variants that already exist.
   See [Unicode and confusable names](/protocol/realms/unicode-and-idna/).
4. Confirm the name passes validation for your target rule set.

## The command

```text
yarn cli mint-realm <realm>
```

Options include `--satsoutput`, `--initialowner`, `--container`, `--bitworkc`, `--bitworkr`,
`--funding`, `--satsbyte`, `--rbf`. See the
[CLI reference](/reference/cli/#mint-realm).

## Cost

Two Bitcoin fees, grinding if you set Bitwork, and the output value that will carry the Realm.

## Check before signing

- The name is exactly the string you intend, character by character.
- No confusable variant is already claimed by someone else.
- The output value is above the dust threshold.
- The funding input is cardinal.

## After broadcast

1. Confirm, then wait for indexing.
2. Read the resolution. Confirm you are the **verified winner**, not a pending or losing candidate.
3. Record the Atomical ID.
4. Move the output into your protected pool. Losing that output loses the name.
5. If you plan to allow Subrealms, configure the rules deliberately.
   See [claim a Subrealm](/guides/claim-a-subrealm/).

## If you did not win

Another claim resolved first. Your Atomical exists without the name. Do not present it as the
Realm.

## Source

[Realms](/protocol/realms/overview/) and
[candidates and winners](/protocol/core/candidates-and-winners/).
