import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  root,
  siteMeta,
  sourceManifest,
  loadPages,
  contentHash,
} from '../scripts/lib/content.mjs'

const pages = loadPages()
const english = pages.filter((page) => page.locale === siteMeta.defaultLocale)
const sourceIds = new Set(sourceManifest.sources.map((entry) => entry.id))

const APPLICABILITY = new Set([
  'protocol-behavior',
  'universe-implementation',
  'experimental',
  'proposed',
  'deprecated',
  'unavailable',
  'third-party',
  'editorial',
])

const AUTHORITY = new Set([
  'executed-source',
  'aip',
  'reference-implementation',
  'official-documentation',
  'universe-implementation',
  'third-party',
  'none',
])

const AREAS = new Set([
  'start',
  'protocol',
  'guides',
  'develop',
  'reference',
  'tools',
  'ecosystem',
  'releases',
  'contribute',
])

const NETWORKS = new Set(['mainnet', 'testnet', 'signet', 'regtest', 'none'])

test('there is a substantial English documentation set', () => {
  assert.ok(english.length >= 120, `expected at least 120 English pages, got ${english.length}`)
})

test('every page declares complete provenance', () => {
  for (const page of pages) {
    const provenance = page.provenance
    const where = page.routeId || 'index'
    assert.ok(page.title, `${where} needs a title`)
    assert.ok(page.description, `${where} needs a description`)
    assert.ok(provenance.pageId, `${where} needs a pageId`)
    assert.ok(AREAS.has(provenance.area), `${where} has an invalid area: ${provenance.area}`)
    assert.ok(
      Array.isArray(provenance.audience) && provenance.audience.length > 0,
      `${where} needs at least one audience`,
    )
    assert.ok(
      APPLICABILITY.has(provenance.applicability),
      `${where} has an invalid applicability: ${provenance.applicability}`,
    )
    assert.ok(
      AUTHORITY.has(provenance.authority),
      `${where} has an invalid authority: ${provenance.authority}`,
    )
    assert.ok(
      Array.isArray(provenance.networks) && provenance.networks.length > 0,
      `${where} needs at least one network`,
    )
    for (const network of provenance.networks) {
      assert.ok(NETWORKS.has(network), `${where} has an invalid network: ${network}`)
    }
    assert.match(
      String(provenance.verified ?? ''),
      /^\d{4}-\d{2}-\d{2}$/,
      `${where} needs a verified date`,
    )
  }
})

test('every declared source exists in the source manifest', () => {
  for (const page of pages) {
    for (const source of page.provenance.sources ?? []) {
      assert.ok(
        sourceIds.has(source.id),
        `${page.routeId} references unknown source "${source.id}"`,
      )
    }
  }
})

test('page ids are unique within each locale', () => {
  const seen = new Map()
  for (const page of pages) {
    const key = `${page.locale}:${page.provenance.pageId}`
    assert.ok(!seen.has(key), `duplicate pageId ${key} in ${page.routeId} and ${seen.get(key)}`)
    seen.set(key, page.routeId)
  }
})

test('a page id matches its route, so an agent can key on either', () => {
  for (const page of english) {
    const expected = page.baseRoute || 'home'
    const actual = page.provenance.pageId
    const normalised = actual.replace(/\/index$/, '')
    assert.ok(
      normalised === expected || normalised === `${expected}/index` || actual === 'home',
      `${page.routeId} declares pageId "${actual}" which does not match its route`,
    )
  }
})

test('a page claiming executed-source authority names a source', () => {
  for (const page of pages) {
    if (page.provenance.authority !== 'executed-source') continue
    assert.ok(
      (page.provenance.sources ?? []).length > 0,
      `${page.routeId} claims executed-source authority and must name a source`,
    )
  }
})

test('a page with no normative authority declares editorial applicability', () => {
  for (const page of pages) {
    if (page.provenance.authority !== 'none') continue
    assert.ok(
      ['editorial', 'proposed', 'third-party'].includes(page.provenance.applicability),
      `${page.routeId} has no authority but claims ${page.provenance.applicability}`,
    )
  }
})

test('no page presents a proposal or a beta as live behavior', () => {
  const avm = pages.filter((page) => page.routeId.includes('protocol/avm/'))
  assert.ok(avm.length >= 4, 'the AVM section must exist')
  for (const page of avm) {
    assert.equal(
      page.provenance.applicability,
      'experimental',
      `${page.routeId} must be labelled experimental`,
    )
    assert.deepEqual(
      page.provenance.networks,
      ['none'],
      `${page.routeId} must declare no supported networks`,
    )
  }
})

test('the Substantiation Factor page is labelled proposed with no authority', () => {
  const page = english.find((entry) => entry.routeId === 'protocol/arc20/substantiation-factor')
  assert.ok(page, 'the Substantiation Factor page must exist')
  assert.equal(page.provenance.applicability, 'proposed')
  assert.equal(page.provenance.authority, 'none')
})

test('prohibited marketing claims do not appear in content', () => {
  const PROHIBITED = [
    /\brisk[- ]free\b/i,
    /\bguaranteed\b/i,
    /\bmilitary[- ]grade\b/i,
    /\bprice floor\b/i,
    /\bcoming soon\b/i,
    /\bto be determined\b/i,
    /\bTODO\b/,
    /\bTBD\b/,
    /\bPLACEHOLDER\b/,
    /\[placeholder\]/i,
    /\blorem ipsum\b/i,
    /\bunder construction\b/i,
    /\bwork in progress\b/i,
  ]
  // These pages name the prohibited terms in order to prohibit them, or describe a
  // renderer falling back to a placeholder, which is the behavior being warned against.
  const ALLOWED = new Set([
    'start/glossary',
    'contribute/content-model',
    'contribute/translations',
    'protocol/arc20/substantiation-factor',
    'protocol/arc20/direct-issuance',
    'protocol/arc20/overview',
  ])

  for (const page of english) {
    if (ALLOWED.has(page.routeId)) continue
    for (const pattern of PROHIBITED) {
      assert.doesNotMatch(
        page.body,
        pattern,
        `${page.routeId} contains prohibited language matching ${pattern}`,
      )
    }
  }
})

test('no em dash is used anywhere in the content', () => {
  const EM_DASH = String.fromCharCode(8212)
  for (const page of pages) {
    assert.ok(
      !page.body.includes(EM_DASH) && !page.title.includes(EM_DASH),
      `${page.routeId} contains an em dash`,
    )
  }
})

test('no page leaks operational material', () => {
  const FORBIDDEN = [
    /\bghp_[A-Za-z0-9]{20,}/,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bpassword\s*[:=]\s*\S+/i,
    /\bssh\s+-i\s/,
    /\bhstgr\.cloud\b/,
  ]
  for (const page of pages) {
    for (const pattern of FORBIDDEN) {
      assert.doesNotMatch(page.body, pattern, `${page.routeId} may leak operational material`)
    }
  }
})

test('every required localised page exists in every configured locale', () => {
  const byLocale = new Map()
  for (const page of pages) {
    const bucket = byLocale.get(page.locale) ?? new Set()
    bucket.add(page.baseRoute)
    byLocale.set(page.locale, bucket)
  }

  for (const locale of siteMeta.locales) {
    if (locale.code === siteMeta.defaultLocale) continue
    const present = byLocale.get(locale.code) ?? new Set()
    for (const required of siteMeta.requiredLocalizedPages) {
      const route = required === 'guides/index' ? 'guides' : required
      assert.ok(
        present.has(route),
        `locale ${locale.code} is missing the required page ${route}`,
      )
    }
  }
})

test('every translation records the English source hash it was made from', () => {
  for (const page of pages) {
    if (page.locale === siteMeta.defaultLocale) continue
    assert.match(
      String(page.provenance.translationSourceHash ?? ''),
      /^[0-9a-f]{64}$/,
      `${page.routeId} must record translationSourceHash`,
    )
  }
})

test('no translation is stale against its English source', () => {
  const englishByRoute = new Map(english.map((page) => [page.baseRoute, page]))
  const stale = []
  for (const page of pages) {
    if (page.locale === siteMeta.defaultLocale) continue
    const source = englishByRoute.get(page.baseRoute)
    if (!source) {
      stale.push(`${page.routeId}: no English source`)
      continue
    }
    if (contentHash(source.body) !== page.provenance.translationSourceHash) {
      stale.push(`${page.routeId}: hash does not match ${source.routeId}`)
    }
  }
  assert.deepEqual(stale, [], 'stale or orphaned translations')
})

test('no translation exists without an English source', () => {
  const englishRoutes = new Set(english.map((page) => page.baseRoute))
  for (const page of pages) {
    if (page.locale === siteMeta.defaultLocale) continue
    assert.ok(
      englishRoutes.has(page.baseRoute),
      `${page.routeId} is an orphan translation with no English source`,
    )
  }
})

test('code blocks are identical between a translation and its English source', () => {
  const englishByRoute = new Map(english.map((page) => [page.baseRoute, page]))
  const fences = (body) => [...body.matchAll(/```[\s\S]*?```/g)].map((match) => match[0])

  for (const page of pages) {
    if (page.locale === siteMeta.defaultLocale) continue
    const source = englishByRoute.get(page.baseRoute)
    if (!source) continue
    assert.deepEqual(
      fences(page.body),
      fences(source.body),
      `${page.routeId} code blocks differ from ${source.routeId}. Code is never translated.`,
    )
  }
})

test('the sidebar references only pages that exist', () => {
  const routes = new Set(english.map((page) => page.baseRoute))
  const walk = (items) => {
    for (const item of items) {
      if (item.slug !== undefined) {
        assert.ok(routes.has(item.slug), `sidebar references missing page "${item.slug}"`)
      }
      if (item.items) walk(item.items)
    }
  }
  walk(siteMeta.sidebar)
})

test('every English page is reachable from the sidebar or is the home page', () => {
  const referenced = new Set()
  const walk = (items) => {
    for (const item of items) {
      if (item.slug !== undefined) referenced.add(item.slug)
      if (item.items) walk(item.items)
    }
  }
  walk(siteMeta.sidebar)

  const orphans = english
    .map((page) => page.baseRoute)
    .filter(
      (route) =>
        route !== '' &&
        !referenced.has(route) &&
        // A compatibility redirect stub is reachable through its own URL, not
        // through navigation; discoverability is exactly what it must avoid.
        !english.find((page) => page.baseRoute === route)?.provenance?.tags?.includes('redirect'),
    )

  assert.deepEqual(orphans, [], 'pages not reachable from the sidebar')
})

test('the source manifest is internally consistent', () => {
  assert.match(sourceManifest.lastVerified, /^\d{4}-\d{2}-\d{2}$/)
  const ids = new Set()
  for (const source of sourceManifest.sources) {
    assert.ok(!ids.has(source.id), `duplicate source id ${source.id}`)
    ids.add(source.id)
    assert.ok(source.name, `${source.id} needs a name`)
    assert.match(source.repository, /^https:\/\//, `${source.id} needs an https repository`)
    assert.ok(['protocol', 'universe', 'third-party'].includes(source.authority), `${source.id} authority`)
    assert.ok(['public', 'private'].includes(source.visibility), `${source.id} visibility`)
    assert.ok(source.role, `${source.id} needs a role`)
    if (source.revision !== null) {
      assert.match(source.revision, /^[0-9a-f]{40}$/, `${source.id} revision must be a full sha`)
    }
  }
})

test('the pinned protocol baseline has not been silently rewritten', () => {
  const baseline = sourceManifest.sources.find(
    (source) => source.id === 'atomicals-electrumx-1.5.2.0',
  )
  assert.ok(baseline, 'the pinned protocol baseline must exist')
  assert.equal(baseline.revision, '8df23747835c20230fc8b8097d469e7a1d97c3e0')
  assert.equal(baseline.release, 'v1.5.2.0')
  assert.equal(baseline.releaseDate, '2025-03-27')
})

test('the ecosystem registry records evidence and a verified date for every entry', () => {
  const registry = JSON.parse(readFileSync(resolve(root, 'contracts/ecosystem.json'), 'utf8'))
  const STATES = new Set(Object.keys(registry.availabilityStates))
  for (const record of registry.records) {
    assert.ok(record.id, 'a record needs an id')
    assert.ok(record.evidence, `${record.id} needs evidence`)
    assert.match(record.lastVerified, /^\d{4}-\d{2}-\d{2}$/, `${record.id} needs a verified date`)
    assert.ok(STATES.has(record.availability), `${record.id} availability: ${record.availability}`)
    assert.ok(record.securityNotes, `${record.id} needs security notes`)
  }
})

test('the AIP registry never marks a proposal implemented without evidence', () => {
  const registry = JSON.parse(readFileSync(resolve(root, 'contracts/aip-registry.json'), 'utf8'))
  for (const aip of registry.aips) {
    assert.ok(
      ['proven', 'claimed', 'none'].includes(aip.conformance),
      `AIP-${aip.number} conformance: ${aip.conformance}`,
    )
    if (aip.conformance === 'proven') {
      assert.ok(
        aip.implementations.length > 0,
        `AIP-${aip.number} claims proven conformance and must name an implementation`,
      )
    }
    assert.ok(registry.statusModel.includes(aip.status), `AIP-${aip.number} status: ${aip.status}`)
  }
})

test('every generated contract artefact exists', () => {
  const required = [
    'contracts/source-manifest.json',
    'contracts/cli-inventory.json',
    'contracts/aip-registry.json',
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
  ]
  for (const file of required) {
    assert.ok(existsSync(resolve(root, file)), `missing ${file}`)
  }
})
