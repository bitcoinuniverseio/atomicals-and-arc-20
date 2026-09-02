# AI and agent access

Every machine readable output this documentation publishes, and what each one is for.

Page ID: reference/ai-access
Applicability: editorial
Authority: none
Networks: none
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/reference/ai-access/

---
This documentation is built to be read by software as well as by people. Nothing here requires
scraping rendered HTML.

## The outputs

| Artefact | Path | Use |
| --- | --- | --- |
| Compact LLM index | `/llms.txt` | An orientation file: scope, core model, and where to look |
| Full LLM bundle | `/llms-full.txt` | The complete normative content in one file |
| Rendered LLM page | `/llms.html` | The same content, readable in a browser |
| Page manifest | `/manifest.json` | Every page with its stable ID, area, status, sources, and content hash |
| Raw Markdown | `/raw/<page-id>.md` | The exact source of any page |
| Specification | `/specification.md` | The compatibility specification as a standalone file |
| Source ledger | `/sources.md` | Every source, revision, and why it is used |
| OpenAPI documents | `/contracts/openapi/*.json` | Validated 3.1 contracts |
| JSON Schemas | `/contracts/schemas/*.json` | The shared component library |
| Conformance vectors | `/conformance/vectors/*.json` | Executed deterministic cases |
| Changelog feed | `/changelog.xml` | A subscribable feed of documentation changes |
| Sitemap | `/sitemap.xml` | Every route |

## What the LLM files guarantee

1. **Normative sources come first.** The pinned validator revision and the executed vectors lead;
   explanatory prose follows.
2. **Proposals and experiments are labelled.** Nothing that is proposed or beta is presented as
   live behavior.
3. **Protocol and product are never collapsed.** Every claim says whether it describes the protocol
   or a Universe service.
4. **Every claim is dated and pinned.** The source revision and verification date travel with the
   content.

## Page identity

Every page has a stable `pageId` recorded in its frontmatter and exposed in the manifest, in a
`bu:page-id` meta tag, and in the raw Markdown path. Page IDs are never reused and never renamed
without a redirect.

Use the page ID as the key, not the URL. URLs can move between locales and versions; a page ID
cannot.

## Content hashes

The manifest records a hash of each page's content. An agent can detect a change without diffing
text, and a translation records the hash of the English source it was made from, which is how the
site marks a translation as stale.

## Fetching politely

`robots.txt` allows crawling. Two requests:

1. Read `manifest.json` once and fetch only the pages whose hash changed.
2. Prefer `/raw/<page-id>.md` over the rendered page. It is smaller and it is the source.
