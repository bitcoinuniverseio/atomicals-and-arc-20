/**
 * Hand written runtime for the generated Atomicals client.
 *
 * This file is deliberately small and reviewed rather than generated. A generated HTTP
 * runtime that nobody reads is exactly where a default origin, an embedded credential, or a
 * silent retry ends up.
 *
 * Rules this runtime keeps:
 *   - There is no default base URL. A default becomes a production host in someone's build.
 *   - It never signs, broadcasts, or handles key material.
 *   - Freshness metadata travels with every response, because a cached answer without its
 *     generation cannot be explained later.
 *   - Errors carry the machine readable code and the request identifier.
 */

import { operations, type OperationDefinition, type OperationId } from './generated/operations.js'
import type { OperationResponses } from './generated/responses.js'

export interface AtomicalsClientOptions {
  /** Required. The origin your deployment exposes. There is no default. */
  baseUrl: string
  /**
   * Optional bearer token for surfaces that require one.
   * Never ship this in browser delivered code.
   */
  bearerToken?: string
  /** Extra headers applied to every request. */
  headers?: Record<string, string>
  /** Injected for tests, or to add your own timeout and retry policy. */
  fetch?: typeof globalThis.fetch
  /** Request timeout in milliseconds. Defaults to 30 seconds. */
  timeoutMs?: number
}

export interface RequestOptions {
  path?: Record<string, string | number>
  query?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  body?: unknown
  signal?: AbortSignal
}

/** Freshness metadata returned alongside every parsed body. */
export interface ResponseEnvelope<T> {
  data: T
  status: number
  requestId: string | null
  generationId: string | null
  indexedHeight: number | null
  /** Raw response headers, for anything this envelope does not surface. */
  headers: Headers
}

export class AtomicalsApiError extends Error {
  readonly status: number
  readonly code: string
  readonly requestId: string | null
  readonly details: unknown

  constructor(init: {
    status: number
    code: string
    message: string
    requestId: string | null
    details?: unknown
  }) {
    super(init.message)
    this.name = 'AtomicalsApiError'
    this.status = init.status
    this.code = init.code
    this.requestId = init.requestId
    this.details = init.details
  }

  /** True for statuses where retrying with backoff is appropriate. */
  get retryable(): boolean {
    return this.status === 429 || this.status === 503 || this.status >= 500
  }
}

export class AtomicalsClient {
  readonly #baseUrl: string
  readonly #bearerToken: string | undefined
  readonly #headers: Record<string, string>
  readonly #fetch: typeof globalThis.fetch
  readonly #timeoutMs: number

  constructor(options: AtomicalsClientOptions) {
    if (!options?.baseUrl) {
      throw new Error(
        'baseUrl is required. This client has no default origin, deliberately: a default becomes a production host in someone else build.',
      )
    }
    this.#baseUrl = options.baseUrl.replace(/\/$/, '')
    this.#bearerToken = options.bearerToken
    this.#headers = options.headers ?? {}
    this.#fetch = options.fetch ?? globalThis.fetch.bind(globalThis)
    this.#timeoutMs = options.timeoutMs ?? 30_000
  }

  /** Every documented operation, for callers that want to iterate the contract. */
  static get operations(): Readonly<Record<string, OperationDefinition>> {
    return operations
  }

  buildUrl(operationId: OperationId, options: RequestOptions = {}): string {
    const operation = operations[operationId]
    if (!operation) throw new Error(`Unknown operation: ${String(operationId)}`)

    let path: string = operation.path
    for (const parameter of operation.parameters) {
      if (parameter.in !== 'path') continue
      const value = options.path?.[parameter.name]
      if (value === undefined) {
        throw new Error(`Missing path parameter "${parameter.name}" for ${operation.operationId}`)
      }
      path = path.split(`{${parameter.name}}`).join(encodeURIComponent(String(value)))
    }

    const url = new URL(`${this.#baseUrl}${path}`)
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value === undefined) continue
      url.searchParams.set(key, String(value))
    }
    return url.toString()
  }

  async call<Id extends OperationId>(
    operationId: Id,
    options: RequestOptions = {},
  ): Promise<ResponseEnvelope<OperationResponses[Id]>> {
    const operation = operations[operationId]
    if (!operation) throw new Error(`Unknown operation: ${String(operationId)}`)

    const url = this.buildUrl(operationId, options)
    const headers = new Headers({ accept: 'application/json', ...this.#headers, ...options.headers })
    if (this.#bearerToken) headers.set('authorization', `Bearer ${this.#bearerToken}`)
    if (options.body !== undefined) headers.set('content-type', 'application/json')

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.#timeoutMs)
    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort(), { once: true })
    }

    let response: Response
    try {
      response = await this.#fetch(url, {
        method: operation.method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeout)
    }

    const requestId =
      response.headers.get('x-request-id') ?? response.headers.get('request-id') ?? null
    const generationId = response.headers.get('x-generation-id')
    const indexedHeightHeader = response.headers.get('x-indexed-height')

    const contentType = response.headers.get('content-type') ?? ''
    let payload: unknown = null
    if (contentType.includes('application/json')) payload = await response.json()
    else if (contentType.startsWith('text/')) payload = await response.text()
    else if (response.status !== 204) payload = await response.arrayBuffer()

    if (!response.ok) {
      const envelope = payload as { error?: { code?: string; message?: string; details?: unknown } }
      throw new AtomicalsApiError({
        status: response.status,
        code: envelope?.error?.code ?? `HTTP_${response.status}`,
        message: envelope?.error?.message ?? `Request failed with status ${response.status}`,
        requestId: (payload as { requestId?: string })?.requestId ?? requestId,
        details: envelope?.error?.details,
      })
    }

    const body = payload as Record<string, unknown> | null

    return {
      data: payload as OperationResponses[Id],
      status: response.status,
      requestId: (body && typeof body === 'object' && typeof body.requestId === 'string'
        ? body.requestId
        : null) ?? requestId,
      generationId:
        generationId ??
        (body && typeof body === 'object' && typeof body.generationId === 'string'
          ? body.generationId
          : null),
      indexedHeight:
        indexedHeightHeader !== null
          ? Number(indexedHeightHeader)
          : body && typeof body === 'object' && typeof body.indexedHeight === 'number'
            ? body.indexedHeight
            : null,
      headers: response.headers,
    }
  }

  /**
   * Walk a cursor paginated listing.
   *
   * Restarts are the caller's decision, so this yields the generation identifier with every
   * page and stops when it changes, rather than silently continuing with a cursor that is no
   * longer valid for the new generation.
   */
  async *paginate<Id extends OperationId>(
    operationId: Id,
    options: RequestOptions = {},
    limits: { maxPages?: number } = {},
  ): AsyncGenerator<ResponseEnvelope<OperationResponses[Id]>, void, void> {
    const maxPages = limits.maxPages ?? 1000
    let cursor: string | undefined
    let firstGeneration: string | null | undefined

    for (let page = 0; page < maxPages; page += 1) {
      const envelope = await this.call(operationId, {
        ...options,
        query: { ...options.query, ...(cursor ? { cursor } : {}) },
      })

      if (firstGeneration === undefined) firstGeneration = envelope.generationId
      else if (envelope.generationId !== firstGeneration) {
        throw new AtomicalsApiError({
          status: 409,
          code: 'GENERATION_CHANGED',
          message:
            'The generation changed mid listing. Restart the listing rather than continuing with a cursor from the previous generation.',
          requestId: envelope.requestId,
        })
      }

      yield envelope

      const next = (envelope.data as { nextCursor?: string | null } | null)?.nextCursor
      if (!next) return
      cursor = next
    }
  }
}
