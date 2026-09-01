# Documentation MCP server

A local, read-only server that lets an agent query this documentation without scraping HTML.

Page ID: reference/mcp
Applicability: universe-implementation
Authority: universe-implementation
Networks: none
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/reference/mcp/

---
The package in `packages/mcp` runs a local Model Context Protocol server over the built
documentation artefacts. An agent can then query pages, contracts, and vectors directly instead of
scraping rendered HTML.

It reads the generated page manifest, raw Markdown, contracts, and vectors from disk. It requires
no network access, no credential, and it cannot mutate anything.

## Install

  

```bash
npm install
npm run generate
npm --workspace packages/mcp run build
```

  
  

```bash
node packages/mcp/dist/server.js --artifacts ./dist
```

  

The `--artifacts` path points at a built site directory containing `manifest.json` and the `raw/`
tree. After installing those artefacts once, the server works offline.

## Tools it exposes

| Tool | Returns |
| --- | --- |
| `search_documentation` | Pages matching a query, with page IDs and scores |
| `get_page` | One page by its stable page ID, as raw Markdown |
| `get_protocol_status` | The applicability and authority of a capability, with its limitations |
| `get_api_operation` | One OpenAPI operation by operation identifier |
| `get_json_schema` | One schema definition from the shared library |
| `get_source_provenance` | The source manifest entry for a source identifier |
| `get_version_matrix` | Every pinned source revision and its networks |
| `get_conformance_vector` | One executed vector by case identifier |
| `list_glossary_entries` | Every glossary term and its definition |
| `list_known_limitations` | Every declared limitation across the documentation |

## What it will never expose

- No mutation of any kind.
- No signing or broadcasting.
- No wallet interaction.
- No credential, secret, or operator-only material.
- No network calls to a Universe service.

Those are structural, not configuration. The server has no code paths for them.

## Configuring an agent

Point your MCP client at the built server with the artefacts path. The exact configuration format
depends on the client, and the server itself takes only the one argument.

## Determinism

The server answers from the committed artefacts. Given the same artefacts, the same query returns
the same answer, which makes it usable in tests.

## Source

[AI and agent access](/reference/ai-access/).
