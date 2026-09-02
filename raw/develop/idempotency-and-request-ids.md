# Idempotency and request IDs

Making a mutation safe to retry, and making a failure traceable afterwards.

Page ID: develop/idempotency-and-request-ids
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/develop/idempotency-and-request-ids/

---
## Request identifiers

Every response carries a request identifier. It is the field to log, and the field to quote in a
support question.

Log it on success as well as on failure. A wrong result you cannot trace is much harder to explain
than a failure you can.

## Idempotency keys

Marketplace mutations require an `Idempotency-Key`. It makes a retry safe: the same key for the
same request returns the same result rather than performing the action twice.

Rules:

1. Generate one key per logical action, not per HTTP attempt.
2. Reuse it for every retry of that action.
3. Never reuse it for a different action.
4. Store it with your own record of the action, so a retry after a restart uses the same key.
5. Treat a conflict as a signal that the key was reused for different content, and inspect rather
   than retrying.

## Idempotency scope

Keys are scoped per protocol lane. The four Marketplace authorities are isolated, so a key used in
one lane does not collide with the same key in another.

## Replay protection

Public mutations also carry a timestamp and a nonce inside the signed string, which makes replay
of a captured request detectable. Idempotency and replay protection solve different problems:

| Control | Prevents |
| --- | --- |
| Idempotency key | Your own retry performing the action twice |
| Timestamp and nonce | Someone else replaying a captured request |

You need both.

## A safe retry loop

1. Generate and persist an idempotency key.
2. Send the request.
3. On 429, 500, or 503, wait with exponential backoff and jitter, then retry with the same key.
4. On 409, stop and inspect. Do not retry with a new key hoping it works.
5. On success, record the result and the request identifier.
6. Bound the number of attempts.

## Source

[Authentication](/develop/authentication/) and [errors](/develop/errors/).
