# Candidates and winners

Why a name request is not a name, how a candidate becomes a verified winner, and what a product must show while resolution is pending.

Page ID: protocol/core/candidates-and-winners
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/core/candidates-and-winners/

---
Globally allocated names in Atomicals are tickers, Realms, Subrealms, and Container names. They
are requested, not assigned. A request is a candidate. Only the rules decide a winner.

## The lifecycle

| Stage | What exists | What a product should show |
| --- | --- | --- |
| Requested | A confirmed mint carrying a name request | "Candidate, not yet resolved" |
| Candidate | One or more competing requests for the same name | The full candidate set, with heights |
| Verified winner | The rules resolved one Atomical as holding the name | The name plus the resolved Atomical ID |
| Losing candidate | A request that did not win | Explicitly marked as losing, never as pending |

The ARC-20 guide states that a ticker is claimed after three confirmations. That figure comes
from the guide, not from a constant this documentation independently verified against every
network configuration. Read the active revision before depending on a specific depth.

## Why this matters more than it looks

A user interface that shows a requested name as if it were owned invites two failures:

1. Someone pays for something they do not have yet.
2. Someone trusts a name that later resolves to a different Atomical.

Both are avoidable by displaying the resolved Atomical ID alongside every name and by labelling
unresolved requests plainly.

## Resolution is not permanent until it is confirmed and indexed

A resolution computed from a chain position that later reorgs can change. See
[confirmation and reorgs](/protocol/core/confirmation-and-reorgs/) and
[consistency and reorgs](/develop/consistency-and-reorgs/).

## Where each name type resolves

- Tickers: [tickers and candidates](/protocol/arc20/tickers-and-candidates/)
- Realms and Subrealms: [claims and rules](/protocol/realms/claims-and-rules/)
- Containers: [Containers](/protocol/containers/overview/)

## Integrator checklist

1. Store the request and the resolution as separate fields.
2. Never key a database row on a name.
3. Expose the candidate set, not just the current best guess.
4. Show the height at which resolution was computed.
5. Re-resolve after a reorg rather than trusting a cached winner.
