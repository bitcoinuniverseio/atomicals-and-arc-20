# Versioning and deprecation

What is versioned, how a breaking change is announced, and what a deprecation actually promises.

Page ID: develop/versioning-and-deprecation
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/develop/versioning-and-deprecation/

---
## Five things are versioned separately

| Axis | Where it appears |
| --- | --- |
| Protocol reference baseline | The pinned validator revision |
| Universe API surface | The `/v1/` segment and the service revision |
| Marketplace contract | The Marketplace v1 route and signing contract |
| Generated schemas | A version field inside each schema |
| Documentation | The documentation version on every page |

Never assume two of them move together.

## Reading a service version

`GET /version` returns the service name and version, the source revision and its evidence, the
declared Git revision where available, the runtime version, the pinned provider version, tag,
commit, and required AIPs, the projection name, and the asset types covered.

Record all of it with anything you cache.

## What counts as breaking

- Removing a route, a field, or an enum value.
- Changing the type or meaning of an existing field.
- Changing a default that alters results.
- Tightening validation so a previously accepted request is refused.
- Changing an identifier's shape.

Adding an optional field or a new route is not breaking, so build clients that ignore unknown
fields.

## Deprecation

A deprecated capability still works and is scheduled for removal. Every deprecation carries the
old behavior, the new behavior, the effective version, migration instructions, the compatibility
impact, and the source evidence.

Current example: the legacy Marketplace `/buys` and `/orders/{orderId}/reconcile` aliases remain
available, and new integrations use `/reservations`, `/purchases`, and `/settlements`.

## What a deprecation does not promise

It does not promise the old behavior is identical to the new one. Read the migration note rather
than assuming a rename.

## Where changes are published

| Artefact | Contains |
| --- | --- |
| [Releases](/releases/) | Human readable changelog |
| [Versions](/releases/versions/) | The compatibility matrix |
| [Deprecations](/releases/deprecations/) | What is scheduled for removal, and when |
| [Migrations](/releases/migrations/) | Step by step moves between versions |
| The changelog feed | A machine readable feed of the same |

## Source

[Migration](/develop/migration/) and [releases](/releases/).
