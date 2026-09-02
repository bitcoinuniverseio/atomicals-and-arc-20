#!/usr/bin/env node
/**
 * Read-only Model Context Protocol server over the built documentation artefacts.
 *
 * It answers from files on disk: the page manifest, the raw Markdown tree, the contracts,
 * and the conformance vectors. There is no network access, no credential, and no mutation
 * path. Those are structural properties, not configuration: the server has no code for them.
 *
 * Usage: node dist/server.js --artifacts <directory>
 */
import { readFileSync, existsSync } from 'node:fs'
import { allocate } from '@bitcoin-universe/protocol-core/allocation'
import { classifyUtxo, detectRisks } from '@bitcoin-universe/utxo-planner/planner'
import { resolve } from 'node:path'
import { createInterface } from 'node:readline'

const PROTOCOL_VERSION = '2024-11-05'
const SERVER_NAME = 'atomicals-docs'
const SERVER_VERSION = '1.0.0'

interface ManifestPage {
  pageId: string
  routeId: string
  locale: string
  title: string
  description: string
  area: string
  audience: string[]
  applicability: string
  authority: string
  networks: string[]
  sources: string[]
  docsVersion: string
  verified: string | null
  limitations: string[]
  deprecated: unknown
  contentHash: string
  href: string
  raw: string
}

interface Manifest {
  manifestVersion: string
  documentationVersion: string
  site: string
  base: string
  defaultLocale: string
  locales: string[]
  pageCount: number
  pages: ManifestPage[]
  sources: {
    id: string
    name: string
    repository: string
    revision: string | null
    release: string | null
    authority: string
    visibility: string
    networks: string[]
  }[]
}

export function parseArguments(argv: string[]): { artifacts: string } {
  const index = argv.indexOf('--artifacts')
  const artifacts = index >= 0 ? argv[index + 1] : undefined
  if (!artifacts) {
    throw new Error(
      'Pass --artifacts <directory> pointing at a built documentation directory containing manifest.json and raw/.',
    )
  }
  return { artifacts: resolve(artifacts) }
}

export class DocumentationStore {
  readonly #root: string
  readonly #manifest: Manifest

  constructor(root: string) {
    // Resolve so path containment checks hold regardless of caller separators.
    this.#root = resolve(root)
    const manifestPath = resolve(root, 'manifest.json')
    if (!existsSync(manifestPath)) {
      throw new Error(`No manifest.json in ${root}. Run the documentation build first.`)
    }
    this.#manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest
  }

  get manifest(): Manifest {
    return this.#manifest
  }

  /** Reads a file under the artefacts root, refusing anything that escapes it. */
  #readWithin(relativePath: string): string {
    const target = resolve(this.#root, relativePath)
    if (!target.startsWith(this.#root)) {
      throw new Error('Path escapes the artefacts directory.')
    }
    if (!existsSync(target)) throw new Error(`Not found: ${relativePath}`)
    return readFileSync(target, 'utf8')
  }

  search(query: string, locale = 'en', limit = 20) {
    const needle = query.trim().toLowerCase()
    if (!needle) return []
    const terms = needle.split(/\s+/)

    return this.#manifest.pages
      .filter((page) => page.locale === locale)
      .map((page) => {
        const haystack =
          `${page.title} ${page.description} ${page.pageId} ${page.area} ${page.limitations.join(' ')}`.toLowerCase()
        let score = 0
        for (const term of terms) {
          if (page.pageId.toLowerCase().includes(term)) score += 5
          if (page.title.toLowerCase().includes(term)) score += 4
          if (page.description.toLowerCase().includes(term)) score += 2
          if (haystack.includes(term)) score += 1
        }
        return { page, score }
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.page.pageId.localeCompare(b.page.pageId))
      .slice(0, limit)
      .map((entry) => ({
        pageId: entry.page.pageId,
        title: entry.page.title,
        description: entry.page.description,
        area: entry.page.area,
        applicability: entry.page.applicability,
        href: entry.page.href,
        score: entry.score,
      }))
  }

  page(pageId: string, locale = 'en') {
    const page = this.#manifest.pages.find(
      (entry) => entry.pageId === pageId && entry.locale === locale,
    )
    if (!page) throw new Error(`No page with id "${pageId}" in locale "${locale}".`)
    return {
      ...page,
      markdown: this.#readWithin(`raw/${page.routeId || 'index'}.md`),
    }
  }

  protocolStatus(pageId: string, locale = 'en') {
    const page = this.page(pageId, locale)
    return {
      pageId: page.pageId,
      title: page.title,
      applicability: page.applicability,
      authority: page.authority,
      networks: page.networks,
      sources: page.sources,
      verified: page.verified,
      limitations: page.limitations,
      deprecated: page.deprecated,
    }
  }

  apiOperation(operationId: string) {
    const documents = ['arc20', 'atomicals-nfts-realms', 'marketplace-v1']
    for (const name of documents) {
      const document = JSON.parse(this.#readWithin(`contracts/openapi/${name}.json`))
      for (const [path, item] of Object.entries(document.paths ?? {})) {
        for (const [method, operation] of Object.entries(item as Record<string, any>)) {
          if (operation?.operationId === operationId) {
            return { document: name, path, method: method.toUpperCase(), operation }
          }
        }
      }
    }
    throw new Error(`No operation with id "${operationId}".`)
  }

  jsonSchema(definition?: string) {
    const schema = JSON.parse(this.#readWithin('contracts/schemas/common.schema.json'))
    if (!definition) return { definitions: Object.keys(schema.$defs) }
    const found = schema.$defs?.[definition]
    if (!found) throw new Error(`No schema definition named "${definition}".`)
    return { definition, schema: found }
  }

  sourceProvenance(sourceId?: string) {
    if (!sourceId) return { sources: this.#manifest.sources }
    const source = this.#manifest.sources.find((entry) => entry.id === sourceId)
    if (!source) throw new Error(`No source with id "${sourceId}".`)
    return source
  }

  versionMatrix() {
    return {
      documentationVersion: this.#manifest.documentationVersion,
      sources: this.#manifest.sources,
    }
  }

  conformanceVector(caseId?: string) {
    const vectors = JSON.parse(this.#readWithin('conformance/vectors/arc20-allocation.json'))
    if (!caseId) {
      return {
        source: vectors.source,
        cases: vectors.cases.map((entry: any) => ({ id: entry.id, title: entry.title })),
      }
    }
    const found = vectors.cases.find((entry: any) => entry.id === caseId)
    if (!found) throw new Error(`No conformance case with id "${caseId}".`)
    return { source: vectors.source, case: found }
  }

  glossary(locale = 'en') {
    const page = this.page('start/glossary', locale)
    const entries: { term: string; definition: string }[] = []
    const lines = page.markdown.split('\n')
    for (let index = 0; index < lines.length - 1; index += 1) {
      const definition = lines[index + 1]
      if (definition?.startsWith(': ')) {
        entries.push({
          term: lines[index]!.replace(/\*\*/g, '').trim(),
          definition: definition.slice(2).trim(),
        })
      }
    }
    return { count: entries.length, entries }
  }

  knownLimitations(locale = 'en') {
    return this.#manifest.pages
      .filter((page) => page.locale === locale && page.limitations.length > 0)
      .map((page) => ({
        pageId: page.pageId,
        title: page.title,
        applicability: page.applicability,
        limitations: page.limitations,
      }))
  }

  protocolAtlas() {
    return this.#readWithin('contracts/protocol-atlas/atlas.json')
  }

  versionManifest() {
    return this.#readWithin('contracts/versions/manifest.json')
  }

  driftStatus() {
    return this.#readWithin('contracts/drift-status.json')
  }

  workflowCatalog() {
    return this.#readWithin('contracts/generated/workflows.json')
  }

  sdkCoverage() {
    return this.#readWithin('contracts/generated/sdk-coverage.json')
  }

  ecosystemRegistry() {
    return this.#readWithin('contracts/ecosystem.json')
  }

  avmOpcodes() {
    return this.#readWithin('contracts/avm-opcodes.json')
  }

  resourcesList() {
    const entries = [
      ['docs://pages', 'Page manifest with provenance for every documentation page'],
      ['docs://sources', 'Source manifest: every pinned repository and revision'],
      ['docs://contracts/openapi/arc20', 'ARC-20 OpenAPI document'],
      ['docs://contracts/openapi/atomicals-nfts-realms', 'Atomicals NFT and Realm OpenAPI document'],
      ['docs://contracts/openapi/marketplace-v1', 'Marketplace v1 OpenAPI document'],
      ['docs://contracts/schemas/common', 'Shared JSON Schema library'],
      ['docs://contracts/workflows', 'Arazzo workflow catalog summary'],
      ['docs://contracts/protocol-atlas', 'Protocol Atlas evidence dataset'],
      ['docs://contracts/versions', 'Version and provenance manifest'],
      ['docs://contracts/conformance-vectors', 'Executed ARC-20 allocation vectors'],
      ['docs://contracts/ecosystem', 'Ecosystem compatibility registry'],
      ['docs://contracts/avm-opcodes', 'AVM opcode inventory from the pinned interpreter'],
      ['docs://contracts/sdk-coverage', 'Generated SDK operation coverage'],
      ['docs://drift-status', 'Committed upstream drift status'],
    ]
    return { resources: entries.map(([uri, name]) => ({ uri, name })) }
  }

  resourceRead(uri: string) {
    const map: Record<string, () => unknown> = {
      'docs://pages': () => this.#manifest,
      'docs://sources': () => this.sourceProvenance(),
      'docs://contracts/openapi/arc20': () => this.#readWithin('contracts/openapi/arc20.json'),
      'docs://contracts/openapi/atomicals-nfts-realms': () =>
        this.#readWithin('contracts/openapi/atomicals-nfts-realms.json'),
      'docs://contracts/openapi/marketplace-v1': () => this.#readWithin('contracts/openapi/marketplace-v1.json'),
      'docs://contracts/schemas/common': () => this.#readWithin('contracts/schemas/common.schema.json'),
      'docs://contracts/workflows': () => this.workflowCatalog(),
      'docs://contracts/protocol-atlas': () => this.protocolAtlas(),
      'docs://contracts/versions': () => this.versionManifest(),
      'docs://contracts/conformance-vectors': () => this.#readWithin('conformance/vectors/arc20-allocation.json'),
      'docs://contracts/ecosystem': () => this.ecosystemRegistry(),
      'docs://contracts/avm-opcodes': () => this.avmOpcodes(),
      'docs://contracts/sdk-coverage': () => this.sdkCoverage(),
      'docs://drift-status': () => this.driftStatus(),
    }
    const reader = map[uri]
    if (!reader) throw new Error('Unknown resource: '+uri)
    return JSON.parse(reader() as string)
  }

  simulateArc20Allocation(args: {
    outputs: { value: number; unspendable?: boolean }[]
    inputs: { atomicalId: string; txinIndex: number; atomicalValue: number }[]
    options?: { sortByFifo?: boolean; customColoring?: boolean }
  }) {
    if (!Array.isArray(args.outputs) || !Array.isArray(args.inputs) || args.inputs.length === 0) {
      throw new Error('Provide outputs and at least one coloured input.')
    }
    if (args.outputs.length > 64 || args.inputs.length > 64) {
      throw new Error('Simulation is capped at 64 inputs and 64 outputs.')
    }
    const result = allocate(args.outputs, args.inputs, args.options ?? { sortByFifo: true })
    return {
      result,
      source: { id: 'atomicals-electrumx-1.5.2.0', revision: '8df23747835c20230fc8b8097d469e7a1d97c3e0' },
      note: 'Executed by the shared allocation engine at the pinned revision. The same module runs the conformance vectors.',
    }
  }

  analyzeUtxoPlan(args: {
    inputs: { utxoId?: string; value: number; atomicals?: Record<string, number>; confirmed?: boolean }[]
    outputs: { value: number; role?: string; address?: string; unspendable?: boolean }[]
    feeRate?: number
  }) {
    if (!Array.isArray(args.inputs) || !Array.isArray(args.outputs)) {
      throw new Error('Provide inputs and outputs arrays.')
    }
    const analysis = detectRisks({ inputs: args.inputs, outputs: args.outputs, feeRate: args.feeRate ?? 1 })
    const classifications = args.inputs.slice(0, 64).map((input) => classifyUtxo({ utxoId: input.utxoId ?? 'input', value: input.value, confirmed: input.confirmed, atomicals: input.atomicals }))
    return {
      analysis,
      classifications,
      source: { id: 'atomicals-electrumx-1.5.2.0', revision: '8df23747835c20230fc8b8097d469e7a1d97c3e0' },
      note: 'Deterministic analysis only. Nothing here signs, broadcasts, or looks anything up.',
    }
  }
}

export const TOOLS = [
  {
    name: 'search_documentation',
    description:
      'Search the documentation by title, page id, description, and declared limitations. Returns page ids to fetch with get_page.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'What to look for.' },
        locale: { type: 'string', description: 'Locale code. Defaults to en.' },
        limit: { type: 'integer', minimum: 1, maximum: 50 },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_page',
    description:
      'Fetch one page by its stable page id, as raw Markdown, with its provenance metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: { type: 'string' },
        locale: { type: 'string' },
      },
      required: ['pageId'],
    },
  },
  {
    name: 'get_protocol_status',
    description:
      'The applicability, authority, networks, sources, verification date, and limitations for one page. Use this before treating any capability as available.',
    inputSchema: {
      type: 'object',
      properties: { pageId: { type: 'string' }, locale: { type: 'string' } },
      required: ['pageId'],
    },
  },
  {
    name: 'get_api_operation',
    description: 'One OpenAPI operation by operation id, with its parameters and responses.',
    inputSchema: {
      type: 'object',
      properties: { operationId: { type: 'string' } },
      required: ['operationId'],
    },
  },
  {
    name: 'get_json_schema',
    description:
      'One definition from the shared JSON Schema library, or the list of definitions when no name is given.',
    inputSchema: {
      type: 'object',
      properties: { definition: { type: 'string' } },
    },
  },
  {
    name: 'get_source_provenance',
    description:
      'The source manifest entry for a source id, or every source when no id is given. Use this to learn which revision a claim is pinned to.',
    inputSchema: {
      type: 'object',
      properties: { sourceId: { type: 'string' } },
    },
  },
  {
    name: 'get_version_matrix',
    description: 'The documentation version and every pinned source revision with its networks.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_conformance_vector',
    description:
      'One executed allocation conformance case by id, or the case list when no id is given.',
    inputSchema: {
      type: 'object',
      properties: { caseId: { type: 'string' } },
    },
  },
  {
    name: 'list_glossary_entries',
    description: 'Every glossary term and its definition.',
    inputSchema: {
      type: 'object',
      properties: { locale: { type: 'string' } },
    },
  },
  {
    name: 'list_known_limitations',
    description:
      'Every declared limitation across the documentation, with the page that declares it.',
    inputSchema: {
      type: 'object',
      properties: { locale: { type: 'string' } },
    },
  },
  {
    name: 'get_protocol_atlas',
    description:
      'The Protocol Atlas evidence dataset: comparative attributes for Bitcoin token protocols, every cell with status and pinned source revision.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_version_manifest',
    description:
      'The verified source sets with their pinned revisions and API contract versions, plus committed drift status.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'inspect_workflow',
    description:
      'One generated workflow from the Arazzo catalog by id, with its steps, operations, and examples.',
    inputSchema: {
      type: 'object',
      properties: { workflowId: { type: 'string' } },
      required: ['workflowId'],
    },
  },
  {
    name: 'get_avm_opcodes',
    description:
      'The AVM opcode inventory generated from the pinned beta interpreter source. Experimental layer.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'simulate_arc20_allocation',
    description:
      'Execute the shared ARC-20 allocation engine on candidate inputs and outputs. Deterministic, offline, pinned to the reference revision.',
    inputSchema: {
      type: 'object',
      properties: {
        outputs: {
          type: 'array',
          maxItems: 64,
          items: {
            type: 'object',
            properties: { value: { type: 'integer' }, unspendable: { type: 'boolean' } },
            required: ['value'],
          },
        },
        inputs: {
          type: 'array',
          maxItems: 64,
          items: {
            type: 'object',
            properties: {
              atomicalId: { type: 'string' },
              txinIndex: { type: 'integer' },
              atomicalValue: { type: 'integer' },
            },
            required: ['atomicalId', 'txinIndex', 'atomicalValue'],
          },
        },
      },
      required: ['outputs', 'inputs'],
    },
  },
  {
    name: 'analyze_utxo_plan',
    description:
      'Analyze a candidate UTXO plan for asset-bearing risks: accidental burn, mixed assets, dust, fees, and unknown assignment state. Local analysis only.',
    inputSchema: {
      type: 'object',
      properties: {
        inputs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              utxoId: { type: 'string' },
              value: { type: 'integer' },
              atomicals: { type: 'object', additionalProperties: { type: 'integer' } },
              confirmed: { type: 'boolean' },
            },
            required: ['value'],
          },
        },
        outputs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              value: { type: 'integer' },
              role: { type: 'string' },
              address: { type: 'string' },
              unspendable: { type: 'boolean' },
            },
            required: ['value'],
          },
        },
        feeRate: { type: 'integer', minimum: 1 },
      },
      required: ['inputs', 'outputs'],
    },
  },
] as const

export function callTool(store: DocumentationStore, name: string, args: Record<string, any>) {
  switch (name) {
    case 'search_documentation':
      return store.search(args.query, args.locale ?? 'en', args.limit ?? 20)
    case 'get_page':
      return store.page(args.pageId, args.locale ?? 'en')
    case 'get_protocol_status':
      return store.protocolStatus(args.pageId, args.locale ?? 'en')
    case 'get_api_operation':
      return store.apiOperation(args.operationId)
    case 'get_json_schema':
      return store.jsonSchema(args.definition)
    case 'get_source_provenance':
      return store.sourceProvenance(args.sourceId)
    case 'get_version_matrix':
      return store.versionMatrix()
    case 'get_conformance_vector':
      return store.conformanceVector(args.caseId)
    case 'list_glossary_entries':
      return store.glossary(args.locale ?? 'en')
    case 'list_known_limitations':
      return store.knownLimitations(args.locale ?? 'en')
    case 'get_protocol_atlas':
      return JSON.parse(store.protocolAtlas())
    case 'get_version_manifest':
      return { manifest: JSON.parse(store.versionManifest()), drift: JSON.parse(store.driftStatus()) }
    case 'inspect_workflow': {
      const catalog = JSON.parse(store.workflowCatalog()) as any
      const found = catalog.workflows?.find((workflow: any) => workflow.workflowId === args.workflowId)
      if (!found) throw new Error('Unknown workflow id')
      return found
    }
    case 'get_avm_opcodes':
      return JSON.parse(store.avmOpcodes())
    case 'simulate_arc20_allocation':
      return store.simulateArc20Allocation(args as any)
    case 'analyze_utxo_plan':
      return store.analyzeUtxoPlan(args as any)
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}

export function handleRequest(store: DocumentationStore, request: any) {
  const { id, method, params } = request

  const reply = (result: unknown) => ({ jsonrpc: '2.0', id, result })
  const fail = (code: number, message: string) => ({
    jsonrpc: '2.0',
    id,
    error: { code, message },
  })

  switch (method) {
    case 'initialize':
      return reply({
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
      })
    case 'tools/list':
      return reply({ tools: TOOLS })
    case 'tools/call': {
      try {
        const output = callTool(store, params?.name, params?.arguments ?? {})
        return reply({
          content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
          isError: false,
        })
      } catch (error) {
        return reply({
          content: [{ type: 'text', text: (error as Error).message }],
          isError: true,
        })
      }
    }
    case 'resources/list':
      return reply({ resources: store.resourcesList().resources })
    case 'resources/read': {
      try {
        const contents = store.resourceRead(params?.uri)
        return reply({
          contents: [{ uri: params?.uri, mimeType: 'application/json', text: JSON.stringify(contents, null, 2) }],
        })
      } catch (error) {
        return fail(-32002, (error as Error).message)
      }
    }
    case 'ping':
      return reply({})
    default:
      return fail(-32601, `Method not found: ${method}`)
  }
}

function main() {
  const { artifacts } = parseArguments(process.argv.slice(2))
  const store = new DocumentationStore(artifacts)

  const input = createInterface({ input: process.stdin })
  input.on('line', (line) => {
    if (!line.trim()) return
    let request: any
    try {
      request = JSON.parse(line)
    } catch {
      process.stdout.write(
        `${JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } })}\n`,
      )
      return
    }
    // Notifications carry no id and expect no response.
    if (request.id === undefined) return
    process.stdout.write(`${JSON.stringify(handleRequest(store, request))}\n`)
  })
}

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url.endsWith(process.argv[1].split('\\').join('/'))

if (isEntrypoint) main()
