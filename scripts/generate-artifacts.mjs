#!/usr/bin/env node
/**
 * Generates every artefact that is derived from the documentation content:
 * raw Markdown, the page manifest, the LLM files, the legacy compatibility routes,
 * robots.txt, sitemap.xml, and the changelog feed.
 *
 * Everything here is generated. Nothing is hand maintained twice, which is what makes
 * the compatibility routes incapable of drifting from the current content.
 *
 * Usage: node scripts/generate-artifacts.mjs --out <directory>
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import {
  root,
  siteMeta,
  sourceManifest,
  loadPages,
  toPlainMarkdown,
  urlFor,
  absoluteUrlFor,
} from './lib/content.mjs'
import { renderMarkdown, escapeHtml, setLinkBase } from './lib/markdown.mjs'

const args = process.argv.slice(2)
const outIndex = args.indexOf('--out')
const outDir = resolve(root, outIndex >= 0 ? args[outIndex + 1] : 'site/dist')

const BASE = siteMeta.base.replace(/\/$/, '')
const pages = loadPages()
const english = pages.filter((page) => page.locale === siteMeta.defaultLocale)
const changelog = JSON.parse(readFileSync(resolve(root, 'contracts/changelog.json'), 'utf8'))
const cliInventory = JSON.parse(readFileSync(resolve(root, 'contracts/cli-inventory.json'), 'utf8'))
const vectors = JSON.parse(
  readFileSync(resolve(root, 'conformance/vectors/arc20-allocation.json'), 'utf8'),
)

// Generated compatibility pages are served from the same base as the site, so
// root-relative content links need the same prefix the site applies.
setLinkBase(BASE)

const written = []

function write(relativePath, contents) {
  const target = resolve(outDir, relativePath)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, contents, 'utf8')
  written.push(relativePath)
}

// ---------------------------------------------------------------- raw Markdown

for (const page of pages) {
  const plain = toPlainMarkdown(page.body)
  const header = [
    `# ${page.title}`,
    '',
    page.description,
    '',
    `Page ID: ${page.provenance.pageId ?? page.routeId}`,
    `Applicability: ${page.provenance.applicability ?? 'editorial'}`,
    `Authority: ${page.provenance.authority ?? 'none'}`,
    `Networks: ${(page.provenance.networks ?? []).join(', ') || 'none'}`,
    `Verified: ${page.provenance.verified ?? 'unrecorded'}`,
    `Locale: ${page.locale}`,
    `URL: ${absoluteUrlFor(page.routeId)}`,
    '',
    '---',
    '',
  ].join('\n')
  write(`raw/${page.routeId || 'index'}.md`, `${header}${plain}\n`)
}

// ------------------------------------------------------------- page manifest

const manifest = {
  manifestVersion: '1.0.0',
  documentationVersion: siteMeta.docsVersion,
  generated: 'scripts/generate-artifacts.mjs',
  site: siteMeta.site,
  base: BASE,
  defaultLocale: siteMeta.defaultLocale,
  locales: siteMeta.locales.map((locale) => locale.code),
  requiredLocalizedPages: siteMeta.requiredLocalizedPages,
  pageCount: pages.length,
  pages: pages.map((page) => ({
    pageId: page.provenance.pageId ?? page.routeId,
    routeId: page.routeId,
    locale: page.locale,
    title: page.title,
    description: page.description,
    area: page.provenance.area ?? 'start',
    audience: page.provenance.audience ?? [],
    applicability: page.provenance.applicability ?? 'editorial',
    authority: page.provenance.authority ?? 'none',
    networks: page.provenance.networks ?? [],
    sources: (page.provenance.sources ?? []).map((source) => source.id),
    docsVersion: page.provenance.docsVersion ?? siteMeta.docsVersion,
    verified: page.provenance.verified ?? null,
    limitations: page.provenance.limitations ?? [],
    deprecated: page.provenance.deprecated ?? null,
    translationSourceHash: page.provenance.translationSourceHash ?? null,
    contentHash: page.hash,
    href: urlFor(page.routeId),
    raw: `${BASE}/raw/${page.routeId || 'index'}.md`,
  })),
  sources: sourceManifest.sources.map((source) => ({
    id: source.id,
    name: source.name,
    repository: source.repository,
    revision: source.revision,
    release: source.release,
    authority: source.authority,
    visibility: source.visibility,
    networks: source.network,
  })),
}
write('manifest.json', `${JSON.stringify(manifest, null, 2)}\n`)

// ------------------------------------------------------------------ LLM files

function sourceLine(source) {
  const revision = source.release ?? source.revision ?? 'unversioned'
  return `- ${source.name} (${source.authority}): ${source.repository} at ${revision}`
}

const llmsHeader = `# ${siteMeta.title}

> ${siteMeta.tagline}
> Documentation version: ${siteMeta.docsVersion}
> Home: ${absoluteUrlFor('')}
> Full content: ${BASE}/llms-full.txt
> Page manifest: ${BASE}/manifest.json
> Raw Markdown for any page: ${BASE}/raw/<page-id>.md
> Verified: ${changelog.entries[0].date}

## How to read this documentation

Three layers are never mixed, and every page states which one it describes:

- Protocol behavior: what a pinned Atomicals validator revision does.
- Universe implementation: what a Bitcoin Universe service actually exposes today.
- Proposed or experimental: what exists but is not live.

A protocol capability is not automatically a product feature. A product feature is not
automatically protocol behavior. A proposal is not an implementation.

## Normative sources, in authority order

1. Executed source code, conformance tests, generated inventories, schemas, and runtime
   contracts at an exact revision.
2. Final or Living Atomicals Improvement Proposals.
3. The Atomicals reference implementation at an exact commit or release.
4. Official Atomicals protocol and CLI documentation.
5. Universe implementation documentation at an exact revision.
6. Third-party integrations, always non-normative.

Explanatory prose, including this documentation, is never independent consensus.

## Pinned sources

${sourceManifest.sources.map(sourceLine).join('\n')}

## The ARC-20 model in seven statements

1. One ARC-20 unit is one satoshi in an output a validator recognises as coloured.
2. Supply is therefore measured in satoshis and bounded by real bitcoin.
3. Issuance is direct, fixed decentralised, or activation gated perpetual.
4. A ticker is a globally allocated name resolved to exactly one Atomical. It is not identity.
5. A transfer is an allocation over the transaction's inputs and outputs, in order.
6. Value that cannot be placed in an eligible output is destroyed. The transaction still confirms.
7. Coloured output totals can never exceed coloured input totals.

## Executed allocation vectors

Engine: conformance/allocation.mjs, implemented from ${vectors.source.id} at ${vectors.source.revision}.
Vectors: ${BASE}/conformance/vectors/arc20-allocation.json

${vectors.cases.map((testCase) => `- ${testCase.id}: ${testCase.description}`).join('\n')}

## What is never claimed here

- No price, market, ranking, investment, legal, or tax statement.
- Metadata is never authenticity. A ticker is never creator identity. A listing is never ownership.
- An indexer result is version scoped, never consensus.
- A configured service is never automatically ready.
- A proposal is never an implemented feature.

## Machine readable outputs

- ${BASE}/llms.txt
- ${BASE}/llms-full.txt
- ${BASE}/manifest.json
- ${BASE}/specification.md
- ${BASE}/sources.md
- ${BASE}/contracts/openapi/arc20.json
- ${BASE}/contracts/openapi/atomicals-nfts-realms.json
- ${BASE}/contracts/openapi/marketplace-v1.json
- ${BASE}/contracts/schemas/common.schema.json
- ${BASE}/contracts/source-manifest.json
- ${BASE}/contracts/cli-inventory.json
- ${BASE}/contracts/aip-registry.json
- ${BASE}/contracts/avm-opcodes.json
- ${BASE}/contracts/ecosystem.json
- ${BASE}/conformance/vectors/arc20-allocation.json
- ${BASE}/changelog.xml
- ${BASE}/sitemap.xml
`

const byArea = new Map()
for (const page of english) {
  const area = page.provenance.area ?? 'start'
  const bucket = byArea.get(area) ?? []
  bucket.push(page)
  byArea.set(area, bucket)
}

const AREA_ORDER = [
  'start',
  'protocol',
  'guides',
  'develop',
  'reference',
  'tools',
  'ecosystem',
  'releases',
  'contribute',
]

const llmsIndex = AREA_ORDER.filter((area) => byArea.has(area))
  .map((area) => {
    const entries = byArea
      .get(area)
      .map(
        (page) =>
          `- [${page.title}](${absoluteUrlFor(page.routeId)}) [${page.provenance.applicability ?? 'editorial'}]: ${page.description}`,
      )
      .join('\n')
    return `### ${area}\n\n${entries}`
  })
  .join('\n\n')

write('llms.txt', `${llmsHeader}\n## Page index\n\n${llmsIndex}\n`)

const llmsFull = english
  .map((page) => {
    const provenance = page.provenance
    const header = [
      `# ${page.title}`,
      '',
      `URL: ${absoluteUrlFor(page.routeId)}`,
      `Page ID: ${provenance.pageId ?? page.routeId}`,
      `Applicability: ${provenance.applicability ?? 'editorial'}`,
      `Authority: ${provenance.authority ?? 'none'}`,
      `Networks: ${(provenance.networks ?? []).join(', ') || 'none'}`,
      `Sources: ${(provenance.sources ?? []).map((source) => source.id).join(', ') || 'none'}`,
      provenance.activation ? `Activation: ${provenance.activation}` : null,
      `Verified: ${provenance.verified ?? 'unrecorded'}`,
      (provenance.limitations ?? []).length
        ? `Limitations:\n${provenance.limitations.map((item) => `- ${item}`).join('\n')}`
        : null,
      '',
    ]
      .filter((line) => line !== null)
      .join('\n')
    return `${header}\n${toPlainMarkdown(page.body)}`
  })
  .join('\n\n---\n\n')

write('llms-full.txt', `${llmsHeader}\n---\n\n${llmsFull}\n`)

// ------------------------------------------------------- specification and sources

const specPage = english.find((page) => page.routeId === 'protocol/arc20/overview')
const allocationPage = english.find((page) => page.routeId === 'protocol/arc20/allocation')
const unitPage = english.find((page) => page.routeId === 'protocol/arc20/unit-model')
const burnPage = english.find((page) => page.routeId === 'protocol/arc20/burns')

const specification = `# ARC-20 compatibility specification

Status: compatibility guide, generated from the documentation content
Documentation version: ${siteMeta.docsVersion}
Generated: ${changelog.entries[0].date}
Reference behavior pin: Atomicals ElectrumX commit ${sourceManifest.sources[0].revision} (${sourceManifest.sources[0].release})

This file is generated from the pages listed below. It is never edited by hand, so it cannot
drift from the documentation it summarises.

Source pages:

- ${absoluteUrlFor('protocol/arc20/overview')}
- ${absoluteUrlFor('protocol/arc20/unit-model')}
- ${absoluteUrlFor('protocol/arc20/allocation')}
- ${absoluteUrlFor('protocol/arc20/burns')}

## 1. Scope and authority

This document describes the Atomicals ARC-20 fungible token model on Bitcoin. It is a
compatibility guide for wallets, indexers, transaction builders, and product teams. It is not an
independent consensus specification, a smart contract specification, or a financial statement.

The Atomicals specification is defined in code. Therefore:

- Concept documentation explains the model and command line usage.
- The selected validator or indexer implementation determines version-sensitive transaction
  behavior.
- A production integration MUST pin a code revision or released version and its activation
  configuration.
- A production integration MUST NOT infer token validity or ownership from a ticker, image,
  metadata object, portfolio label, or generic Bitcoin confirmation alone.

This document covers ARC-20 fungible tokens only. Realms and Containers are Atomicals NFT and name
or collection primitives. This document does not establish an ARC-721 standard, and no official
source located during review establishes one.

${toPlainMarkdown(unitPage?.body ?? '')}

${toPlainMarkdown(specPage?.body ?? '')}

${toPlainMarkdown(allocationPage?.body ?? '')}

${toPlainMarkdown(burnPage?.body ?? '')}

## Behavioral test vectors

These vectors are executed by tests/conformance-allocation.test.mjs against
conformance/allocation.mjs, which is implemented from the pinned revision. They omit fee inputs and
output scripts for clarity, because neither changes the allocation result.

| Case | Coloured input | Outputs | Expected result |
| --- | --- | --- | --- |
${vectors.cases
  .map(
    (testCase) =>
      `| ${testCase.id} | ${testCase.inputs.map((input) => `${input.atomicalValue} units`).join(' plus ')} | ${testCase.outputs.map((output, index) => `output ${index}: ${output.value} sats${output.unspendable ? ' (unspendable)' : ''}`).join('; ')} | ${testCase.description} |`,
  )
  .join('\n')}

## Universe compatibility boundary

- Universe direct FT issuance: not exposed. The protocol supports it; no Universe product surface
  offers it.
- Universe ARC-20 discovery, token details, holders, confirmed activity, portfolio balances, and
  coloured UTXOs: available as read views, not as proof of settlement.
- Universe declared ARC-20 coverage: partial, for pending activity only.
- Universe Container and DMINT read projection: not exposed.
- Universe AVM execution: not exposed.

See ${absoluteUrlFor('start/status-and-limitations')}.

## Source set

Read ${BASE}/sources.md before implementing any behavior described here.
`

write('specification.md', specification)

const sourcesDocument = `# Atomicals and ARC-20 source ledger

Documentation version: ${siteMeta.docsVersion}
Generated: ${changelog.entries[0].date}
Last verified: ${sourceManifest.lastVerified}

This ledger is generated from contracts/source-manifest.json. It distinguishes explanatory
documentation from behavior that is validated in code, because ARC-20 transaction allocation and
deployment rules are version sensitive.

## Authority model

1. Executed source code, conformance tests, generated route inventories, schemas, deployment
   manifests, and runtime contracts at an exact revision.
2. Final or Living Atomicals Improvement Proposals applicable to the feature.
3. The official Atomicals reference implementation or released validator at an exact commit or
   release.
4. Official Atomicals protocol and CLI documentation.
5. Universe implementation documentation at an exact revision.
6. Third-party integrations, always identified as third-party and non-normative.

Explanatory prose, including this documentation, is never independent consensus.

## Pinned sources

${sourceManifest.sources
  .map((source) => {
    const revision = source.revision ? `\`${source.revision}\`` : 'unversioned'
    const release = source.release ? ` (released as ${source.release})` : ''
    const paths = Object.entries(source.paths ?? {})
      .map(([key, value]) => `  - ${key}: ${value}`)
      .join('\n')
    return `### ${source.name}

- Identifier: \`${source.id}\`
- Authority: ${source.authority}
- Repository: ${source.repository}
- Revision: ${revision}${release}
- Networks: ${source.network.length ? source.network.join(', ') : 'not deployed'}
- Visibility: ${source.visibility}
- Role: ${source.role}
- Paths:
${paths || '  - none recorded'}`
  })
  .join('\n\n')}

## Generated inventories

| Inventory | Generated from | Path |
| --- | --- | --- |
| CLI commands | ${cliInventory.source.repository} at ${cliInventory.source.revision}, ${cliInventory.source.path} | ${BASE}/contracts/cli-inventory.json |
| AVM opcodes | The beta interpreter's opcode enumeration | ${BASE}/contracts/avm-opcodes.json |
| AIP registry | The upstream proposals plus a separate implementation evidence file | ${BASE}/contracts/aip-registry.json |
| Route inventories | Sanitized exports from the runtime repositories | ${BASE}/contracts/routes/ |
| Conformance vectors | The allocation engine, executed in CI | ${BASE}/conformance/vectors/arc20-allocation.json |

## Visual asset provenance

The site includes \`assets/atomicals-cli-lockup.jpg\`, an unchanged copy of \`atomicals.jpg\` from
the Atomicals CLI repository at commit ${sourceManifest.sources.find((source) => source.id === 'atomicals-js-cli')?.revision}. That
repository declares an MIT License. No separate logo-use policy or brand colour palette was located
during review.

The visual treatment on this site is a documentation interface choice, not an asserted Atomicals
brand. The asset and its use do not imply official status, endorsement, affiliation, or a trademark
licence.

## How to update source-dependent text

1. Select and record an implementation release or commit.
2. Check the active network and the activation conditions relevant to the behavior.
3. Re-run the conformance vectors for allocation, split, burn handling, and custom coloring.
4. Update contracts/source-manifest.json, then run \`npm run generate\`.
5. Commit the regenerated artefacts. CI fails when generation leaves the tree dirty.
6. Do not turn a metadata convention, a third-party product feature, or an inactive code path into
   a protocol-wide claim.

## Out of scope

- Price, market capitalisation, liquidity, legal, tax, and investment claims.
- Third-party wallet, marketplace, or indexer endorsements.
- A standalone ARC-721 standard. No official source located during review establishes one.
`

write('sources.md', sourcesDocument)

// ------------------------------------------------------- compatibility HTML pages

function compatibilityPage({ title, description, canonical, body, noindex = false }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} | ${escapeHtml(siteMeta.title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="generator" content="scripts/generate-artifacts.mjs">
${noindex ? '<meta name="robots" content="noindex,follow">\n' : ''}<link rel="canonical" href="${canonical}">
<link rel="icon" href="${BASE}/favicon.svg" type="image/svg+xml">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="article">
<link rel="stylesheet" href="${BASE}/theme.css">
</head>
<body class="compat">
<a class="skip" href="#main">Skip to content</a>
<header class="compat-header">
  <a class="compat-brand" href="${BASE}/">${escapeHtml(siteMeta.title)}</a>
  <nav aria-label="Primary">
    <a href="${BASE}/start/what-are-atomicals/">Start</a>
    <a href="${BASE}/protocol/overview/">Protocol</a>
    <a href="${BASE}/guides/">Guides</a>
    <a href="${BASE}/reference/openapi/">Reference</a>
  </nav>
</header>
<main id="main" class="compat-main">
<div class="compat-notice">
  <strong>Compatibility page.</strong> This route is preserved so older links keep working. It is
  generated from the current documentation, so it cannot drift.
  <a href="${canonical}">Open the current page</a>.
</div>
${body}
</main>
<footer class="compat-footer">
  <p>
    Independent documentation published by Bitcoin Universe. Atomicals and ARC-20 names and artwork
    stay with their creators. Nothing here is investment, legal, or tax advice.
  </p>
  <p>
    <a href="${BASE}/llms.txt">llms.txt</a>
    <a href="${BASE}/llms-full.txt">llms-full.txt</a>
    <a href="${BASE}/specification.md">specification.md</a>
    <a href="${BASE}/sources.md">sources.md</a>
    <a href="${BASE}/manifest.json">manifest.json</a>
  </p>
</footer>
</body>
</html>
`
}

write(
  'specification.html',
  compatibilityPage({
    title: 'ARC-20 compatibility specification',
    description:
      'The ARC-20 compatibility specification, generated from the current documentation and pinned to a reference revision.',
    canonical: absoluteUrlFor('protocol/arc20/overview'),
    body: renderMarkdown(specification),
  }),
)

write(
  'sources.html',
  compatibilityPage({
    title: 'Source ledger',
    description:
      'Every source this documentation consumes, its exact revision, and why it is used.',
    canonical: absoluteUrlFor('releases/versions'),
    body: renderMarkdown(sourcesDocument),
  }),
)

write(
  'llms.html',
  compatibilityPage({
    title: 'LLM index',
    description:
      'The machine readable orientation file for this documentation, rendered for reading in a browser.',
    canonical: absoluteUrlFor('reference/ai-access'),
    body: renderMarkdown(`${llmsHeader}\n## Page index\n\n${llmsIndex}`),
  }),
)

function summaryFor(routeIds, heading) {
  const items = routeIds
    .map((routeId) => english.find((page) => page.routeId === routeId))
    .filter(Boolean)
    .map(
      (page) =>
        `- [${page.title}](${absoluteUrlFor(page.routeId)}): ${page.description}`,
    )
    .join('\n')
  return `${heading}\n\n${items}\n`
}

write(
  'about.html',
  compatibilityPage({
    title: 'About this documentation',
    description:
      'What this documentation is, who publishes it, what it will never claim, and how every statement is sourced.',
    canonical: absoluteUrlFor(''),
    body: renderMarkdown(`# About this documentation

Independent documentation for the Atomicals protocol family, ARC-20, and the Bitcoin Universe
services that expose them. Documentation version ${siteMeta.docsVersion}.

## What it is

A protocol reference, task guides, validated API contracts, executed conformance material,
interactive safety tools, and machine readable outputs. Every source-sensitive statement is pinned
to an exact revision, labelled by what it applies to, and dated.

## The three layers, never mixed

- Protocol behavior: what a pinned Atomicals validator revision does.
- Universe implementation: what a Bitcoin Universe service actually exposes today.
- Proposed or experimental: what exists but is not live.

## What it will never claim

- No price, market, ranking, investment, legal, or tax statement.
- Metadata is never authenticity. A ticker is never creator identity. A listing is never ownership.
- An indexer result is version scoped, never consensus.
- A proposal is never an implemented feature.

${summaryFor(
  [
    'start/what-are-atomicals',
    'start/what-is-arc-20',
    'start/safety-fundamentals',
    'start/status-and-limitations',
    'releases/versions',
  ],
  '## Start here',
)}
## Visual credit

The Atomicals CLI artwork displayed on this site is preserved from the Atomicals JavaScript
project. Atomicals and ARC-20 names and artwork remain associated with their respective creators.
`),
  }),
)

write(
  'guide.html',
  compatibilityPage({
    title: 'Guides',
    description:
      'Task-oriented procedures for holding, inspecting, issuing, moving, and trading Atomicals safely.',
    canonical: absoluteUrlFor('guides'),
    body: renderMarkdown(`# Guides

Every guide states its prerequisites, supported networks, current support status, exact inputs,
expected outputs, wallet prompt expectations, fee behavior, safety checks, failure cases, and how
to verify the result after broadcast.

${summaryFor(
  english
    .filter((page) => page.provenance.area === 'guides' && page.routeId !== 'guides')
    .map((page) => page.routeId),
  '## Every guide',
)}`),
  }),
)

write(
  'reference.html',
  compatibilityPage({
    title: 'Reference',
    description:
      'CLI, ElectrumX, API contracts, schemas, conformance material, and wallet integration.',
    canonical: absoluteUrlFor('reference/openapi'),
    body: renderMarkdown(`# Reference

${summaryFor(
  english
    .filter((page) => page.provenance.area === 'reference')
    .map((page) => page.routeId),
  '## Reference pages',
)}
## Machine readable downloads

- [OpenAPI, ARC-20](${BASE}/contracts/openapi/arc20.json)
- [OpenAPI, NFT and Realm](${BASE}/contracts/openapi/atomicals-nfts-realms.json)
- [OpenAPI, Marketplace v1](${BASE}/contracts/openapi/marketplace-v1.json)
- [Shared JSON Schemas](${BASE}/contracts/schemas/common.schema.json)
- [Source manifest](${BASE}/contracts/source-manifest.json)
- [CLI inventory](${BASE}/contracts/cli-inventory.json)
- [AIP registry](${BASE}/contracts/aip-registry.json)
- [AVM opcodes](${BASE}/contracts/avm-opcodes.json)
- [Ecosystem registry](${BASE}/contracts/ecosystem.json)
- [Conformance vectors](${BASE}/conformance/vectors/arc20-allocation.json)
- [Page manifest](${BASE}/manifest.json)
`),
  }),
)

// -------------------------------------------------------------- robots and sitemap

write(
  'robots.txt',
  `# ${siteMeta.title}
# Prefer ${BASE}/manifest.json and ${BASE}/raw/<page-id>.md over scraping rendered HTML.

User-agent: *
Allow: /

Sitemap: ${new URL(`${BASE}/sitemap.xml`, siteMeta.site).href}
`,
)

const sitemapEntries = pages
  .map((page) => {
    const alternates = siteMeta.locales
      .map((locale) => {
        const routeId =
          locale.code === siteMeta.defaultLocale
            ? page.baseRoute
            : `${locale.code}/${page.baseRoute}`.replace(/\/$/, '')
        return `    <xhtml:link rel="alternate" hreflang="${locale.lang}" href="${absoluteUrlFor(routeId)}"/>`
      })
      .join('\n')
    return `  <url>
    <loc>${absoluteUrlFor(page.routeId)}</loc>
    <lastmod>${page.provenance.verified ?? changelog.entries[0].date}</lastmod>
${alternates}
  </url>`
  })
  .join('\n')

write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries}
</urlset>
`,
)

// ------------------------------------------------------------------ changelog feed

const feedEntries = changelog.entries
  .map((entry) => {
    const content = [
      `<p>${escapeHtml(entry.summary)}</p>`,
      '<ul>',
      ...entry.changes.map(
        (change) => `<li><strong>${escapeHtml(change.kind)}.</strong> ${escapeHtml(change.text)}</li>`,
      ),
      '</ul>',
    ].join('')
    return `  <entry>
    <id>${absoluteUrlFor('releases')}#release-${entry.version}</id>
    <title>${escapeHtml(`${entry.version}: ${entry.title}`)}</title>
    <link href="${absoluteUrlFor('releases')}#release-${entry.version}"/>
    <updated>${entry.date}T00:00:00Z</updated>
    <summary>${escapeHtml(entry.summary)}</summary>
    <content type="html">${escapeHtml(content)}</content>
  </entry>`
  })
  .join('\n')

write(
  'changelog.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${absoluteUrlFor('releases')}</id>
  <title>${escapeHtml(changelog.title)}</title>
  <link href="${absoluteUrlFor('releases')}"/>
  <link rel="self" href="${new URL(`${BASE}/changelog.xml`, siteMeta.site).href}"/>
  <updated>${changelog.entries[0].date}T00:00:00Z</updated>
  <author><name>Bitcoin Universe</name></author>
${feedEntries}
</feed>
`,
)

// ------------------------------------------------------------- contracts passthrough

const CONTRACT_FILES = [
  'contracts/source-manifest.json',
  'contracts/cli-inventory.json',
  'contracts/aip-registry.json',
  'contracts/aip-implementation-evidence.json',
  'contracts/avm-opcodes.json',
  'contracts/ecosystem.json',
  'contracts/changelog.json',
  'contracts/schemas/common.schema.json',
  'contracts/openapi/arc20.json',
  'contracts/openapi/atomicals-nfts-realms.json',
  'contracts/openapi/marketplace-v1.json',
  'contracts/routes/arc20.json',
  'contracts/routes/atomicals-nfts-realms.json',
  'contracts/routes/marketplace-v1.json',
  'conformance/allocation.mjs',
  'conformance/vectors/arc20-allocation.json',
  // Served from the repository root on the deployed site. Copied here so the
  // built directory is a complete preview and the link checks are meaningful.
  'theme.css',
  'assets/atomicals-cli-lockup.jpg',
  'LICENSE',
]

for (const file of CONTRACT_FILES) {
  const source = resolve(root, file)
  if (!existsSync(source)) throw new Error(`missing contract artefact: ${file}`)
  const target = resolve(outDir, file)
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(source, target)
  written.push(file)
}

// ---------------------------------------------- preserved compatibility routes

/*
 * These three paths were published before this build existed, and
 * docs.manifest.json names test-vectors.html as a specification document. A URL
 * that once resolved has to keep resolving, so they are generated here from the
 * same material the site uses rather than left as hand written copies that drift.
 */

function vectorRow(entry) {
  const inputs = entry.inputs.length
    ? entry.inputs
        .map((input) => `${input.txinIndex}: ${input.atomicalValue} of ${input.atomicalId}`)
        .join('<br>')
    : 'none'
  const outputs = entry.outputs
    .map(
      (output, index) =>
        `${index}: ${output.value}${output.unspendable ? ' (unspendable)' : ''}`,
    )
    .join('<br>')
  const expectedOutputs = entry.expected.outputs ?? []
  const expectedBurned = entry.expected.burned ?? []
  const colored = expectedOutputs.length
    ? expectedOutputs.map((output) => `${output.index}: ${output.coloredTotal}`).join('<br>')
    : 'nothing coloured'
  const burned = expectedBurned.length
    ? expectedBurned.map((burn) => `${burn.atomicalId}: ${burn.value}`).join('<br>')
    : 'none'
  const cited = entry.upstreamTest
    ? `<br><small>Upstream test: <code>${entry.upstreamTest}</code></small>`
    : ''
  return `<tr><td><code>${entry.id}</code><br>${entry.title}${cited}</td><td>${
    entry.era ?? 'current'
  }</td><td>${inputs}</td><td>${outputs}</td><td>${colored}</td><td>${burned}</td><td>${
    entry.expected.cleanlyAssigned
  }</td></tr>`
}

write(
  'test-vectors.html',
  compatibilityPage({
    title: 'Test vectors',
    description:
      'Executed ARC-20 allocation vectors with their inputs, outputs, coloured results, and burns.',
    canonical: absoluteUrlFor('reference/conformance'),
    body: `<h1>Test vectors</h1>
<p>Every row below is produced by running <code>conformance/allocation.mjs</code>, the port of the
allocation rules from the pinned indexer revision. The expected values are not transcribed. They are
what the engine returns, checked in CI, so a page that disagrees with the engine cannot be
published.</p>
<p>Cases naming an upstream test correspond to a case in the indexer's own
<code>tests/lib/test_atomicals_blueprint_builder.py</code> at the pinned revision.</p>
<p>Era is <code>exact-cover</code> for the rules before activation height 848484, where an output had
to be fully covered or nothing was coloured, and <code>current</code> for the rules at or after it,
where an output can be partially coloured.</p>
<p>Machine readable: <a href="${BASE}/conformance/vectors/arc20-allocation.json">arc20-allocation.json</a>.
Run them interactively in the <a href="${BASE}/tools/allocation-visualizer/">allocation visualizer</a>.</p>
<div class="table-scroll"><table>
<caption>ARC-20 allocation vectors, executed</caption>
<thead><tr><th scope="col">Case</th><th scope="col">Era</th><th scope="col">Inputs</th><th scope="col">Outputs</th><th scope="col">Coloured</th><th scope="col">Burned</th><th scope="col">Clean</th></tr></thead>
<tbody>${vectors.cases.map(vectorRow).join('')}</tbody>
</table></div>`,
  }),
)

write(
  'simulator.html',
  compatibilityPage({
    title: 'Allocation simulator',
    description: 'The transfer outcome simulator now lives in the allocation visualizer.',
    canonical: absoluteUrlFor('tools/allocation-visualizer'),
    noindex: true,
    body: `<h1>Allocation simulator</h1>
<p>This tool is now the
<a href="${BASE}/tools/allocation-visualizer/">allocation visualizer</a>. It runs the same engine the
<a href="${BASE}/test-vectors.html">test vectors</a> are executed with, in your browser, and it never
signs or broadcasts anything.</p>`,
  }),
)

write(
  'changelog.html',
  compatibilityPage({
    title: 'Changelog',
    description: 'Release history for this documentation and the revisions it is pinned to.',
    canonical: absoluteUrlFor('releases'),
    body: `<h1>Changelog</h1>
<p>The full release history, with the pinned source revision behind each entry, is on the
<a href="${BASE}/releases/">releases page</a>. A machine readable feed is at
<a href="${BASE}/changelog.xml">changelog.xml</a>.</p>`,
  }),
)

// ------------------------------------------------------------------------- report

write(
  '.generated-artifacts.json',
  `${JSON.stringify({ generated: written.sort(), count: written.length }, null, 2)}\n`,
)

process.stdout.write(`generated ${written.length} artefacts into ${outDir}\n`)
