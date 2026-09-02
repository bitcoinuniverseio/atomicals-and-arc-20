# AI and agent access

Source-pinned AI integration: Ask Atomicals, MCP configuration, and the Agent Skill, all over the machine-readable documentation.

Page ID: ai
Applicability: editorial
Authority: none
Networks: mainnet
Verified: 2026-09-02
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/ai/

---
Ask Atomicals retrieves sentence-level passages from this documentation and quotes them with
citations. It never invents a response to fill an empty result, and it runs entirely in your
browser with no external request by default.

## Install the Agent Skill

The Agent Skill packages the same routing, source rules, and safety constraints for coding
agents:

```
# Download the release archive from the releases page, or build it from source:
npm run skills:validate
# -> dist-skills/atomicals-and-arc20-skill.tar with a sha256 checksum
```

The skill instructs agents to answer only from pinned sources, to distinguish protocol,
implementation, proposal, and experimental claims, and to refuse key collection and mainnet
mutation. See skills/atomicals-and-arc20/SKILL.md in the repository.

## Connect an MCP client

The documentation publishes two MCP transports built on one shared core:

**Local stdio** (works offline against the built artifacts):

```json
{
  "command": "npx",
  "args": ["@bitcoin-universe/atomicals-docs-mcp", "--artifacts", "/path/to/dist"]
}
```

**Hosted Streamable HTTP** (stateless, read-only):

```json
{
  "url": "https://mcp.bitcoinuniverse.io/atomicals-and-arc-20/mcp",
  "transport": "streamable-http"
}
```

Configuration snippets are generated and tested in CI for Codex, Claude Code, Cursor, and
generic clients: see [reference/mcp](/reference/mcp/). The service performs no mutations, no
outbound requests, and holds no credentials; its capability manifest lives at
`/.well-known/mcp-manifest.json`.

## Page-level AI actions

Every page's action menu carries copy actions for source-pinned context, canonical citations,
workflow context, SDK examples, MCP configuration, and raw Markdown. Agents get exactly the
context a human reader sees.
