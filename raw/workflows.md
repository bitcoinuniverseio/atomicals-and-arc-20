# Workflows

Machine-readable Arazzo workflows with generated curl, TypeScript, and JavaScript examples for every step.

Page ID: workflows
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet, regtest
Verified: 2026-09-02
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/workflows/

---
The workflow layer is a single Arazzo 1.1.0 document under `contracts/workflows/`, validated
against the specification schema in CI with every referenced OpenAPI operation ID resolved. The
page below, the curl examples, the TypeScript and JavaScript snippets, the MCP tool metadata, and
the conformance tests all generate from that one document.

The machine-readable sources are the [Arazzo document](../../contracts/workflows/atomicals-read-only.arazzo.yaml)
and the [generated summary](../../site/src/generated/workflows.json).

## Running the local workflows

The Regtest Lab workflows need the lab running:

```
npm run lab:up
npm run lab:seed
npm run lab:test
```

Everything else runs against any endpoint you choose in the
[Conformance Workbench](/tools/api-conformance/), which never sends a mutation.
