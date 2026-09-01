#!/usr/bin/env node
/**
 * Generates the typed surface of packages/client from the OpenAPI documents.
 *
 * Only the generated files are written here. The runtime (packages/client/src/runtime.ts)
 * is hand written, small, and reviewed, because a generated HTTP client that nobody reads
 * is exactly where a credential default or a silent retry ends up.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'packages/client/src/generated')
mkdirSync(outDir, { recursive: true })

const DOCUMENTS = [
  { id: 'arc20', file: 'contracts/openapi/arc20.json' },
  { id: 'nftsRealms', file: 'contracts/openapi/atomicals-nfts-realms.json' },
  { id: 'marketplace', file: 'contracts/openapi/marketplace-v1.json' },
]

const METHODS = new Set(['get', 'put', 'post', 'delete', 'patch', 'head', 'options', 'trace'])

function typeName(document, name) {
  return `${document.id === 'arc20' ? 'Arc20' : document.id === 'nftsRealms' ? 'Assets' : 'Market'}${name}`
}

/** Render a JSON Schema fragment as a TypeScript type. */
function renderType(document, schema, indent = 0) {
  const pad = '  '.repeat(indent)
  if (!schema) return 'unknown'

  if (schema.$ref) {
    const name = schema.$ref.split('/').pop()
    return typeName(document, name)
  }

  if (schema.const !== undefined) return JSON.stringify(schema.const)
  if (schema.enum) return schema.enum.map((value) => JSON.stringify(value)).join(' | ')

  if (schema.anyOf) {
    return schema.anyOf.map((entry) => renderType(document, entry, indent)).join(' | ')
  }
  if (schema.oneOf) {
    return schema.oneOf.map((entry) => renderType(document, entry, indent)).join(' | ')
  }

  const types = Array.isArray(schema.type) ? schema.type : [schema.type]
  const rendered = types
    .map((type) => {
      switch (type) {
        case 'string':
          return 'string'
        case 'integer':
        case 'number':
          return 'number'
        case 'boolean':
          return 'boolean'
        case 'null':
          return 'null'
        case 'array':
          return `${renderType(document, schema.items ?? {}, indent)}[]`
        case 'object': {
          const properties = Object.entries(schema.properties ?? {})
          if (properties.length === 0) return 'Record<string, unknown>'
          const required = new Set(schema.required ?? [])
          const body = properties
            .map(([key, value]) => {
              const optional = required.has(key) ? '' : '?'
              const comment = value.description
                ? `${pad}  /** ${value.description.replace(/\s+/g, ' ')} */\n`
                : ''
              return `${comment}${pad}  ${JSON.stringify(key)}${optional}: ${renderType(document, value, indent + 1)}`
            })
            .join('\n')
          const extra =
            schema.additionalProperties === true
              ? `\n${pad}  [key: string]: unknown`
              : ''
          return `{\n${body}${extra}\n${pad}}`
        }
        default:
          return 'unknown'
      }
    })
    .filter(Boolean)

  return rendered.length ? rendered.join(' | ') : 'unknown'
}

const typeBlocks = []
const operationEntries = []

for (const entry of DOCUMENTS) {
  const document = JSON.parse(readFileSync(resolve(root, entry.file), 'utf8'))
  const context = { id: entry.id }

  typeBlocks.push(`\n// ---------------------------------------------------------------------------\n// ${document.info.title}\n// Source revision: ${document.info['x-sourceRevision'] ?? 'unrecorded'}\n// ---------------------------------------------------------------------------\n`)

  for (const [name, schema] of Object.entries(document.components?.schemas ?? {})) {
    const description = schema.description
      ? `/** ${schema.description.replace(/\s+/g, ' ')} */\n`
      : ''
    typeBlocks.push(`${description}export type ${typeName(context, name)} = ${renderType(context, schema)}\n`)
  }

  for (const [path, item] of Object.entries(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(item)) {
      if (!METHODS.has(method)) continue

      const parameters = (operation.parameters ?? []).map((parameter) =>
        parameter.$ref
          ? resolveRef(document, parameter.$ref)
          : parameter,
      )

      const success = Object.entries(operation.responses ?? {}).find(([status]) =>
        status.startsWith('2'),
      )
      let responseType = 'unknown'
      if (success) {
        const response = success[1].$ref ? resolveRef(document, success[1].$ref) : success[1]
        const json = response?.content?.['application/json']
        if (json?.schema) responseType = renderType(context, json.schema)
        else if (response?.content?.['text/plain']) responseType = 'string'
        else if (response?.content?.['application/octet-stream']) responseType = 'ArrayBuffer'
        else responseType = 'void'
      }

      operationEntries.push({
        operationId: operation.operationId,
        documentId: entry.id,
        method: method.toUpperCase(),
        path,
        summary: operation.summary ?? '',
        deprecated: Boolean(operation.deprecated),
        mutating: !['get', 'head', 'options'].includes(method),
        parameters: parameters.map((parameter) => ({
          name: parameter.name,
          in: parameter.in,
          required: Boolean(parameter.required),
        })),
        responseType,
      })
    }
  }
}

function resolveRef(document, ref) {
  const parts = ref.replace(/^#\//, '').split('/')
  let node = document
  for (const part of parts) node = node?.[part]
  return node
}

writeFileSync(
  resolve(outDir, 'types.ts'),
  `// Generated by scripts/generate-client.mjs. Do not edit.
// Regenerate with \`npm run generate\`. CI fails when the committed output differs.
${typeBlocks.join('\n')}`,
  'utf8',
)

const operationsSource = `// Generated by scripts/generate-client.mjs. Do not edit.
// Regenerate with \`npm run generate\`. CI fails when the committed output differs.

export interface OperationParameter {
  readonly name: string
  readonly in: 'path' | 'query' | 'header'
  readonly required: boolean
}

export interface OperationDefinition {
  readonly operationId: string
  readonly documentId: 'arc20' | 'nftsRealms' | 'marketplace'
  readonly method: string
  readonly path: string
  readonly summary: string
  readonly deprecated: boolean
  /** True for anything that is not a safe read. The client never signs these. */
  readonly mutating: boolean
  readonly parameters: readonly OperationParameter[]
}

export const operations = ${JSON.stringify(
  Object.fromEntries(
    operationEntries.map((operation) => [
      operation.operationId,
      {
        operationId: operation.operationId,
        documentId: operation.documentId,
        method: operation.method,
        path: operation.path,
        summary: operation.summary,
        deprecated: operation.deprecated,
        mutating: operation.mutating,
        parameters: operation.parameters,
      },
    ]),
  ),
  null,
  2,
)} as const satisfies Record<string, OperationDefinition>

export type OperationId = keyof typeof operations
`

writeFileSync(resolve(outDir, 'operations.ts'), operationsSource, 'utf8')

const responseMap = `// Generated by scripts/generate-client.mjs. Do not edit.
// Regenerate with \`npm run generate\`. CI fails when the committed output differs.
import type * as Schemas from './types.js'

export interface OperationResponses {
${operationEntries
  .map(
    (operation) =>
      `  ${JSON.stringify(operation.operationId)}: ${operation.responseType.replace(/\b(Arc20|Assets|Market)([A-Z][A-Za-z0-9]*)\b/g, 'Schemas.$1$2')}`,
  )
  .join('\n')}
}
`

writeFileSync(resolve(outDir, 'responses.ts'), responseMap, 'utf8')

process.stdout.write(
  `generated client types for ${operationEntries.length} operations into packages/client/src/generated\n`,
)
