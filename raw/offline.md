# Offline

Install the documentation as an app, read it without a network, and download versioned protocol packs.

Page ID: offline
Applicability: editorial
Authority: none
Networks: none
Verified: 2026-09-02
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/offline/

---
Credentials, user-supplied endpoints, live API responses, imported UTXO data, question history,
and local lab information are never written to the offline cache. The service worker handles
same-origin static assets only.

## Install the app

Use your browser's install action, or the install prompt this site raises after the first visit.
The installed app carries the current documentation build, offline search over everything you
have read, and every tool that runs without a network: the allocation visualizer, transaction
inspector, Bitwork estimator, Protocol Lab, and UTXO Safety Planner.

The offline bar at the bottom of every page shows offline status, announces documentation
version updates, and can remove all offline data on request.

## Protocol packs

Versioned archives bundle the documentation and machine-readable artifacts for fully offline
use, with SHA-256 checksums, a software bill of materials, and build provenance:

| Pack | Contents |
| --- | --- |
| Full | Documentation, raw Markdown, search index, contracts, clients, skills, agent material |
| Docs | Documentation and offline search only |
| Developer | Contracts, conformance vectors, overlays, generated clients |
| AI agent | Agent Skill, workflow catalog, answer index, manifests |

Regenerate from source with `npm run packs:generate`. Archives and their `.sha256` files appear
in `dist-packs/`, and release versions ship with each repository release.

## Offline test gate

The offline experience is verified by a browser test with network access disabled: cached
navigation, offline search, and the static tools must all work without a connection.
