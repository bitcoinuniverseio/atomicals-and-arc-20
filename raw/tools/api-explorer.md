# API explorer

Browse every documented operation, parameter, and example, and copy a request to run in your own environment.

Page ID: tools/api-explorer
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/tools/api-explorer/

---
An explorer that sends requests needs a credential in the page and an origin to point at. Both are
mistakes: the credential ends up in browser history and logs, and the origin becomes a default
someone points production traffic at.

So this explorer renders the contract and hands you a command. You choose the origin and supply
the credential in your own environment.

## Reading a mutation

Mutations are marked. Before building one, read:

- [Authentication](/develop/authentication/) for the signature material and headers.
- [Idempotency and request IDs](/develop/idempotency-and-request-ids/) for safe retries.
- [Marketplace v1](/reference/api/marketplace-v1/) for the exact protocol data shapes.

The copied command carries placeholders for the idempotency key and the body, because the
signature covers the exact body bytes. Re-serialising the body invalidates it.

## Downloads

The full documents are on [OpenAPI and downloads](/reference/openapi/).
