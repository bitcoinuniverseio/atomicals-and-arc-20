import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

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
