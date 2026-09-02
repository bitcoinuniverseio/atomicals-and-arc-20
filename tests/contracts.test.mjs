import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import * as fs from 'node:fs'
import YAML from 'yaml'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (relative) => JSON.parse(readFileSync(resolve(root, relative), 'utf8'))

const manifest = read('contracts/source-manifest.json')
const openapiFiles = readdirSync(resolve(root, 'contracts/openapi')).filter((name) =>
  name.endsWith('.json'),
)

function collectOperations(document) {
  const operations = []
  for (const [path, item] of Object.entries(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(item)) {
      if (!['get', 'put', 'post', 'delete', 'patch', 'head', 'options', 'trace'].includes(method)) {
        continue
      }
      operations.push({ path, method: method.toUpperCase(), operation })
    }
  }
  return operations
}

test('every OpenAPI document is structurally valid 3.1', () => {
  assert.ok(openapiFiles.length >= 3, 'expected at least three OpenAPI documents')
  for (const file of openapiFiles) {
    const document = read(`contracts/openapi/${file}`)
    assert.equal(document.openapi, '3.1.0', `${file} must declare OpenAPI 3.1.0`)
    assert.ok(document.info?.title, `${file} needs a title`)
    assert.ok(document.info?.version, `${file} needs a version`)
    assert.ok(document.info?.description, `${file} needs a description`)
    assert.ok(document.servers?.length, `${file} needs at least one server`)
    assert.ok(Object.keys(document.paths ?? {}).length > 0, `${file} needs paths`)
    assert.ok(document.tags?.length, `${file} needs tags`)
  }
})

test('operation ids are unique within and across documents', () => {
  const seen = new Map()
  for (const file of openapiFiles) {
    const document = read(`contracts/openapi/${file}`)
    for (const { path, method, operation } of collectOperations(document)) {
      assert.ok(operation.operationId, `${file} ${method} ${path} needs an operationId`)
      assert.ok(
        !seen.has(operation.operationId),
        `duplicate operationId ${operation.operationId} in ${file} and ${seen.get(operation.operationId)}`,
      )
      seen.set(operation.operationId, file)
    }
  }
  assert.ok(seen.size > 40, 'expected a substantial documented surface')
})

test('every operation has a summary, a tag, and at least one response', () => {
  for (const file of openapiFiles) {
    const document = read(`contracts/openapi/${file}`)
    const declaredTags = new Set((document.tags ?? []).map((tag) => tag.name))
    for (const { path, method, operation } of collectOperations(document)) {
      assert.ok(operation.summary, `${file} ${method} ${path} needs a summary`)
      assert.ok(operation.tags?.length, `${file} ${method} ${path} needs a tag`)
      for (const tag of operation.tags) {
        assert.ok(declaredTags.has(tag), `${file} uses undeclared tag ${tag}`)
      }
      assert.ok(
        Object.keys(operation.responses ?? {}).length > 0,
        `${file} ${method} ${path} needs responses`,
      )
    }
  }
})

test('no OpenAPI document names a production host or a routable address', () => {
  // Loopback is allowed: it is the only default a reader can safely run locally.
  const LOOPBACK = new Set(['127.0.0.1', '0.0.0.0'])

  for (const file of openapiFiles) {
    const text = readFileSync(resolve(root, `contracts/openapi/${file}`), 'utf8')
    const hits = []
    if (/bitcoinuniverse\.io/.test(text)) hits.push('a production hostname')
    if (/hstgr\.cloud/.test(text)) hits.push('an infrastructure hostname')
    // Only an address in host position is a leak. A dotted version string is not.
    for (const match of text.match(/(?:\/\/|@)((?:\d{1,3}\.){3}\d{1,3})/g) ?? []) {
      const address = match.replace(/^(?:\/\/|@)/, '')
      if (!LOOPBACK.has(address)) hits.push(`the routable address ${address}`)
    }
    assert.deepEqual(hits, [], `${file} must not contain ${hits.join(', ')}`)
  }
})

test('each documented route inventory matches its OpenAPI document', () => {
  const pairs = [
    ['contracts/routes/atomicals-nfts-realms.json', 'contracts/openapi/atomicals-nfts-realms.json'],
    ['contracts/routes/arc20.json', 'contracts/openapi/arc20.json'],
    ['contracts/routes/marketplace-v1.json', 'contracts/openapi/marketplace-v1.json'],
  ]

  for (const [inventoryPath, documentPath] of pairs) {
    const inventory = read(inventoryPath)
    const document = read(documentPath)

    // Normalise the marketplace outpoint route: the inventory records the literal
    // txid:vout form, the OpenAPI document uses one path parameter for it.
    const normalise = (path) =>
      path.replace('/outpoints/{txid}:{vout}', '/outpoints/{outpoint}')

    const documented = new Set(
      collectOperations(document).map(({ path, method }) => `${method} ${path}`),
    )
    const declared = new Set(
      inventory.routes.map((route) => `${route.method} ${normalise(route.path)}`),
    )

    for (const key of declared) {
      assert.ok(documented.has(key), `${documentPath} is missing ${key} declared in ${inventoryPath}`)
    }
    for (const key of documented) {
      assert.ok(
        declared.has(key),
        `${documentPath} documents ${key} which is absent from ${inventoryPath}`,
      )
    }
  }
})

test('every route inventory names a source in the manifest', () => {
  const ids = new Set(manifest.sources.map((entry) => entry.id))
  for (const file of readdirSync(resolve(root, 'contracts/routes'))) {
    const inventory = read(`contracts/routes/${file}`)
    assert.ok(ids.has(inventory.source.id), `${file} names unknown source ${inventory.source.id}`)
    const entry = manifest.sources.find((item) => item.id === inventory.source.id)
    assert.equal(
      inventory.source.revision,
      entry.revision,
      `${file} revision must match the source manifest`,
    )
  }
})

test('the shared schema library compiles and its examples validate', () => {
  const ajv = new Ajv({ strict: false, allErrors: true })
  addFormats(ajv)
  const schema = read('contracts/schemas/common.schema.json')
  ajv.addSchema(schema)

  for (const [name, definition] of Object.entries(schema.$defs)) {
    const validate = ajv.compile({ ...schema, $ref: `#/$defs/${name}`, $id: undefined })
    for (const example of definition.examples ?? []) {
      assert.ok(
        validate(example),
        `${name} example failed validation: ${ajv.errorsText(validate.errors)}`,
      )
    }
  }
})

test('every OpenAPI example validates against its own schema', () => {
  const ajv = new Ajv({ strict: false, allErrors: true })
  addFormats(ajv)

  for (const file of openapiFiles) {
    const document = read(`contracts/openapi/${file}`)
    // Register the document so internal $ref pointers resolve.
    const documentId = `https://contracts.local/${file}`
    ajv.addSchema({ ...document, $id: documentId })

    for (const { path, method, operation } of collectOperations(document)) {
      for (const [status, response] of Object.entries(operation.responses ?? {})) {
        for (const [mediaType, media] of Object.entries(response.content ?? {})) {
          if (!media.examples || !media.schema) continue
          const validate = ajv.compile({
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            allOf: [{ $ref: `${documentId}${refPointer(media.schema)}` }],
          })
          for (const [exampleName, example] of Object.entries(media.examples)) {
            assert.ok(
              validate(example.value),
              `${file} ${method} ${path} ${status} ${mediaType} example ${exampleName} failed: ${ajv.errorsText(validate.errors)}`,
            )
          }
        }
      }
    }
  }
})

function refPointer(schema) {
  if (!schema.$ref) {
    throw new Error('inline response schemas with examples are not supported by this check')
  }
  return schema.$ref.replace(/^#/, '#')
}

test('deprecated routes name their replacement', () => {
  for (const file of readdirSync(resolve(root, 'contracts/routes'))) {
    const inventory = read(`contracts/routes/${file}`)
    for (const route of inventory.routes) {
      if (route.deprecated) {
        assert.ok(route.replacedBy, `${route.path} is deprecated and must name a replacement`)
      }
    }
  }

  for (const file of openapiFiles) {
    const document = read(`contracts/openapi/${file}`)
    for (const { path, method, operation } of collectOperations(document)) {
      if (operation.deprecated) {
        assert.match(
          operation.description ?? '',
          /Deprecated/i,
          `${file} ${method} ${path} is deprecated and its description must say so`,
        )
      }
    }
  }
})

/**
 * docs.manifest.json is the record other Universe documentation surfaces read to
 * find this repository's documents. It is hand maintained rather than generated,
 * because most of what it says (classification, audiences, how this documentation
 * relates to upstream) is a judgement rather than something derivable. What it can
 * drift on is the mechanical part: a version that no longer matches, or a
 * specification path that no longer resolves. That is what these check.
 */
test('the integration manifest points at documents that exist', () => {
  const docsManifest = read('docs.manifest.json')
  const specifications = docsManifest.specifications ?? []
  assert.ok(specifications.length > 0, 'docs.manifest.json must name its specification documents')
  const missing = specifications.filter((path) => !existsSync(resolve(root, path)))
  assert.deepEqual(missing, [], 'docs.manifest.json names a specification that is not published')
})

test('the integration manifest declares the current documentation version', () => {
  const docsManifest = read('docs.manifest.json')
  const siteMeta = read('site/src/data/site.json')
  assert.equal(
    docsManifest.releaseVersion,
    siteMeta.docsVersion,
    'docs.manifest.json releaseVersion must match the documentation version',
  )
  assert.equal(docsManifest.repository, 'bitcoinuniverseio/atomicals-and-arc-20')
  assert.equal(docsManifest.securityClassification, 'public')
})

/**
 * The lockfile has to cover the platform CI builds on, not just the one it was
 * written on.
 *
 * npm 11 records only the host platform's optional dependencies. This repository is
 * authored on Windows and built on Linux, so the lockfile carried @esbuild/win32-x64
 * and @img/sharp-win32-x64 and nothing else. `npm ci` on a Linux runner removed those
 * and installed no replacement, leaving esbuild and sharp with no binary and failing
 * the site build. The failure is invisible locally: every check passes on Windows.
 *
 * The Linux binaries are declared as optionalDependencies so they resolve into the
 * lockfile from any host. They are skipped on a platform they do not match.
 */
test('the lockfile carries the Linux binaries CI builds with', () => {
  const lock = read('package-lock.json')
  const present = new Set(
    Object.keys(lock.packages ?? {}).map((key) => key.split('node_modules/').pop()),
  )
  const required = ['@esbuild/linux-x64', '@img/sharp-linux-x64', '@img/sharp-libvips-linux-x64']
  const missing = required.filter((name) => !present.has(name))
  assert.deepEqual(
    missing,
    [],
    'npm ci on a Linux runner would install no binary for these, and the site build would fail',
  )
})

test('the Linux binaries are declared optional so they never break a Windows install', () => {
  const manifest = read('package.json')
  const optional = manifest.optionalDependencies ?? {}
  for (const name of ['@esbuild/linux-x64', '@img/sharp-linux-x64', '@img/sharp-libvips-linux-x64']) {
    assert.ok(optional[name], `${name} must be declared under optionalDependencies`)
  }
  const hard = { ...(manifest.dependencies ?? {}), ...(manifest.devDependencies ?? {}) }
  for (const name of Object.keys(optional)) {
    assert.ok(!hard[name], `${name} must not also be a hard dependency; it is platform specific`)
  }
})

// ---------------------------------------------------------------------------
// Protocol Atlas and Version contracts.
//
// The Atlas is the evidence layer for every comparative claim the site makes,
// and the version manifest is what stops the navigator from blending source
// revisions. Both are validated here so a bad cell or a fabricated snapshot
// fails CI before it reaches a page.
// ---------------------------------------------------------------------------

const atlas = read('contracts/protocol-atlas/atlas.json')
const atlasSchema = read('contracts/protocol-atlas/atlas.schema.json')
const versionManifest = read('contracts/versions/manifest.json')
const versionSchema = read('contracts/versions/version-manifest.schema.json')

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)

test('the Protocol Atlas dataset validates against its schema', () => {
  const validate = ajv.compile(atlasSchema)
  const ok = validate(atlas)
  assert.deepEqual(
    ok,
    true,
    validate.errors?.map((error) => `${error.instancePath}: ${error.message}`).join('; '),
  )
})

test('every Atlas evidence object resolves to a pinned source', () => {
  const ids = new Set(manifest.sources.map((source) => source.id))
  const problems = []
  for (const protocol of atlas.protocols) {
    for (const [key, evidence] of Object.entries(protocol.attributes)) {
      if (evidence.sourceId === 'none') continue
      if (!ids.has(evidence.sourceId)) {
        problems.push(`${protocol.id}/${key}: unknown sourceId ${evidence.sourceId}`)
        continue
      }
      const source = manifest.sources.find((entry) => entry.id === evidence.sourceId)
      if (
        evidence.sourceRevision &&
        source.revision &&
        evidence.sourceRevision !== source.revision
      ) {
        problems.push(`${protocol.id}/${key}: revision differs from the manifest pin`)
      }
    }
  }
  assert.deepEqual(problems, [], 'atlas evidence must cite the exact manifest revisions')
})

test('the Atlas carries the fixed protocol list with no extras', () => {
  assert.deepEqual(
    atlas.protocols.map((protocol) => protocol.id),
    [
      'atomicals',
      'arc-20',
      'avm',
      'ordinals',
      'runes',
      'brc-20',
      'stamps-src-20',
      'tap',
      'alkanes-protorunes',
      'counterparty',
      'rgb',
    ],
  )
})

test('unknown and conflicting facts are recorded, not inferred away', () => {
  const unknownCells = atlas.protocols.flatMap((protocol) =>
    Object.values(protocol.attributes).filter(
      (evidence) => evidence.status === 'unknown' || evidence.status === 'conflicting',
    ),
  )
  assert.ok(unknownCells.length >= 10, 'the atlas must honestly record unknowns')
})

test('the version manifest validates against its schema', () => {
  const validate = ajv.compile(versionSchema)
  const ok = validate(versionManifest)
  assert.deepEqual(
    ok,
    true,
    validate.errors?.map((error) => `${error.instancePath}: ${error.message}`).join('; '),
  )
})

test('every version set pins revisions that exist in the source manifest', () => {
  const ids = new Map(manifest.sources.map((source) => [source.id, source.revision]))
  const problems = []
  for (const set of versionManifest.sets) {
    const pins = [
      set.sources.protocol,
      set.sources.cli,
      set.sources.aipRegistry,
      set.sources.avmInterpreter,
      ...set.sources.universeRuntime,
    ]
    for (const pin of pins) {
      if (!ids.has(pin.sourceId)) problems.push(`${set.id}: unknown source ${pin.sourceId}`)
      const manifestRevision = ids.get(pin.sourceId)
      if (pin.revision && manifestRevision && pin.revision !== manifestRevision) {
        problems.push(`${set.id}: ${pin.sourceId} revision differs from the manifest`)
      }
    }
  }
  assert.deepEqual(problems, [], 'a version set must match the pinned manifest revisions')
})

test('the read-only overlay only marks safe methods and exists for every set', () => {
  const { readFileSync } = fs
  const { parse } = YAML
  const overlay = parse(
    readFileSync(resolve(root, 'overlays/openapi/arc20-read-only.overlay.yaml'), 'utf8'),
  )
  assert.equal(overlay.overlay, '1.1.0')
  assert.ok(overlay.extends.endsWith('contracts/openapi/arc20.json'))
  for (const action of overlay.actions) {
    assert.match(action.target, /\$\.(paths\.\*\.)(get|head)$/, `unsafe target: ${action.target}`)
    assert.equal(action.update['x-read-only'], true)
  }
})

test('the overlay marks exactly the read operations and nothing else', () => {
  const document = read('contracts/openapi/arc20.json')
  const overlay = YAML.parse(
    readFileSync(resolve(root, 'overlays/openapi/arc20-read-only.overlay.yaml'), 'utf8'),
  )
  const targetedMethods = new Set(
    overlay.actions.map((action) => action.target.split('.').pop()),
  )
  assert.deepEqual([...targetedMethods].sort(), ['get', 'head'])
  const uncovered = []
  for (const [path, item] of Object.entries(document.paths)) {
    for (const method of Object.keys(item)) {
      if (!targetedMethods.has(method)) uncovered.push(method.toUpperCase() + ' ' + path)
    }
  }
  assert.deepEqual(
    uncovered,
    ['POST /indexer/atomicals/poll'],
    'only documented mutation operations may sit outside the read-only overlay',
  )
})
