# Errors

The error envelope, the codes that matter, and how to tell a client mistake from a service state.

Page ID: develop/errors
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/develop/errors/

---
## The envelope

Errors are returned as JSON with a stable shape: a machine-readable code, a human-readable
message, and the request identifier. The request identifier is the field to log.

## Status codes and what they mean

| Status | Meaning | Retry |
| --- | --- | --- |
| 400 | The request was malformed or a value was invalid | No, fix the request |
| 401 | Missing or invalid credentials | No |
| 403 | Authenticated but not permitted | No |
| 404 | Route not found, or the asset is not in the active generation | Depends. Check readiness first |
| 405 | Method not allowed on a known route | No |
| 409 | A conflict, such as an idempotency mismatch | No, inspect the conflict |
| 414 | The request URL is too long | No |
| 429 | Rate limited, where a limit is implemented | Yes, with backoff |
| 500 | An unexpected server error | Yes, with backoff |
| 503 | Not ready, unavailable, or degraded | Yes, after checking readiness |

## The 404 that is not an error

A 404 on an asset route can mean the asset does not exist, or that it is not in the active
generation, or that it is outside this projection. Those are different.

Check `/ready` and the projection before concluding anything is missing.
See [unavailable index against empty balance](/guides/unavailable-indexer-vs-empty-balance/).

## Named codes you will see

| Code | Meaning |
| --- | --- |
| `NFT_NOT_FOUND` | No plain NFT with that Atomical ID in the active generation |
| `REALM_NOT_FOUND` | No Realm or Subrealm with that Atomical ID in the active generation |
| `ASSET_NOT_FOUND` | No asset of any projected type with that Atomical ID |
| `NFT_MEDIA_NOT_FOUND` | The asset exists, the requested media field does not |
| `METHOD_NOT_ALLOWED` | Known route, wrong method. The `allow` header names the right one |
| `METRICS_DISABLED` | Metrics are turned off on this deployment |
| `NOT_FOUND` | The route itself does not exist |

## Validation errors

Validation failures carry a specific reason rather than a generic message. A malformed Atomical
ID, an out-of-range page, an unsupported `kind` filter, and a malformed media field name each
report what was wrong.

Unicode and IDNA name errors are surfaced explicitly rather than being flattened into a generic
validation failure.

## What a client should do

1. Log the request identifier with every failure.
2. Distinguish client mistakes from service states before retrying.
3. Retry only 429, 500, and 503, with exponential backoff and jitter.
4. On 503, read `/ready` and use its reason rather than retrying blindly.
5. Never treat 404 as "the asset was destroyed".

## Source

[Readiness and freshness](/develop/readiness-and-freshness/) and
[NFT and Realm API](/reference/api/atomicals-nfts-realms/).
