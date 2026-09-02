# @bitcoin-universe/atomicals-docs-mcp

A local, read-only Model Context Protocol server over the built Atomicals and ARC-20 documentation.

Full documentation:
[Documentation MCP server](https://bitcoinuniverseio.github.io/atomicals-and-arc-20/reference/mcp/).

## Why it exists

An agent that needs this documentation should not have to scrape rendered HTML. This server answers
from the built artefacts: the page manifest, the raw Markdown tree, the contracts, and the executed
conformance vectors.

## What it will never do

No mutation. No signing. No broadcasting. No wallet interaction. No credential. No network calls to
a Universe service. Those are structural properties, not configuration: the server has no code
paths for them.

## Run it

```bash
npm install
npm run generate
npm run build
npm --workspace packages/mcp run build

node packages/mcp/dist/server.js --artifacts ./site/dist
```

`--artifacts` points at a built documentation directory containing `manifest.json` and `raw/`.
After those artefacts are installed once, the server works offline.

## Tools

| Tool | Returns |
| --- | --- |
| `search_documentation` | Pages matching a query, with page ids and scores |
| `get_page` | One page by its stable page id, as raw Markdown |
| `get_protocol_status` | Applicability, authority, networks, sources, and limitations |
| `get_api_operation` | One OpenAPI operation by operation id |
| `get_json_schema` | One definition from the shared schema library |
| `get_source_provenance` | The source manifest entry for a source id |
| `get_version_matrix` | The documentation version and every pinned source revision |
| `get_conformance_vector` | One executed allocation vector by case id |
| `list_glossary_entries` | Every glossary term and its definition |
| `list_known_limitations` | Every declared limitation, with the page that declares it |

## Determinism

Given the same artefacts, the same query returns the same answer. That makes it usable in tests,
and it is covered by `packages/mcp/test/server.test.mjs`.

## Licence

MIT. See the repository [LICENSE](../../LICENSE).

