#!/usr/bin/env node
/**
 * Stateless Streamable HTTP transport for the documentation MCP core.
 *
 * The same store, tools, and resources the stdio server exposes, served over
 * HTTP with hard limits: JSON body cap, per-IP rate limit, CORS allowlist
 * with Origin validation, structured JSON-RPC errors, and no session state
 * between requests. There is no outbound fetch anywhere in the handler graph,
 * no mutation, and no credential handling; those are structural properties.
 *
 * Endpoints:
 *   POST /mcp                          JSON-RPC request, single JSON response
 *   GET  /mcp                          405 (no SSE stream in stateless mode)
 *   GET  /health                       liveness
 *   GET  /.well-known/mcp-manifest.json capability manifest
 *
 * Usage: node dist/http.js --artifacts <directory> [--port 3111] [--origin <allow,more>]
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { parseArguments } from './server.js'
import { DocumentationStore, handleRequest } from './server.js'

const MAX_BODY_BYTES = 512 * 1024
const RATE_LIMIT_PER_MINUTE = 60

function defaultOrigins(): string[] {
  return ['http://127.0.0.1', 'http://localhost']
}

interface HttpOptions {
  artifacts: string
  port: number
  host: string
  origins: string[]
}

function parseHttpOptions(argv: string[]): HttpOptions {
  const parsed = parseArguments(argv)
  const portIndex = argv.indexOf('--port')
  const originIndex = argv.indexOf('--origin')
  const hostIndex = argv.indexOf('--host')
  return {
    artifacts: parsed.artifacts,
    port: portIndex >= 0 ? Number(argv[portIndex + 1]) || 3111 : 3111,
    host: hostIndex >= 0 ? argv[hostIndex + 1] || '127.0.0.1' : '127.0.0.1',
    origins:
      originIndex >= 0 && argv[originIndex + 1]
        ? String(argv[originIndex + 1]).split(',').map((entry) => entry.trim().replace(/\/$/, '')).filter(Boolean)
        : defaultOrigins(),
  }
}

function sendJson(response: ServerResponse, status: number, payload: unknown) {
  const body = JSON.stringify(payload)
  response.writeHead(status, {
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  })
  response.end(body)
}

function originAllowed(request: IncomingMessage, allowed: string[]): boolean {
  const origin = request.headers.origin
  if (!origin) return true
  return allowed.includes(origin.replace(/\/$/, ''))
}

function corsHeaders(allowed: string[], origin: string | undefined): Record<string, string> {
  const headers: Record<string, string> = {
    'access-control-allow-methods': 'POST, GET, OPTIONS',
    'access-control-allow-headers': 'content-type, mcp-protocol-version',
    vary: 'Origin',
  }
  if (origin && allowed.includes(origin.replace(/\/$/, ''))) {
    headers['access-control-allow-origin'] = origin
  }
  return headers
}

export function createHttpServer(options: HttpOptions) {
  const store = new DocumentationStore(options.artifacts)
  const hits = new Map<string, { count: number; windowStart: number }>()

  function rateLimited(key: string): boolean {
    const now = Date.now()
    const entry = hits.get(key)
    if (!entry || now - entry.windowStart > 60_000) {
      hits.set(key, { count: 1, windowStart: now })
      return false
    }
    entry.count += 1
    return entry.count > RATE_LIMIT_PER_MINUTE
  }

  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1')
    const remote = request.socket.remoteAddress ?? 'unknown'

    if (url.pathname === '/health') {
      sendJson(response, 200, { live: true, service: 'atomicals-docs-mcp-http', version: SERVER_VERSION_HTTP })
      return
    }

    if (url.pathname === '/.well-known/mcp-manifest.json') {
      sendJson(response, 200, {
        manifestVersion: '1.0.0',
        name: SERVER_NAME_HTTP,
        version: SERVER_VERSION_HTTP,
        transport: 'streamable-http (stateless)',
        protocolVersion: PROTOCOL_VERSION_HTTP,
        endpoints: { mcp: '/mcp', health: '/health' },
        capabilities: { tools: true, resources: true, sessions: false, sse: false },
        safety: {
          mutations: 'none',
          outboundRequests: 'none',
          credentialHandling: 'none',
          stateless: true,
        },
        note: 'This service answers only from committed documentation artifacts on local disk.',
      })
      return
    }

    if (url.pathname !== '/mcp') {
      sendJson(response, 404, { error: { code: 'not_found', message: 'Use /mcp for JSON-RPC, /health for liveness.' } })
      return
    }

    if (request.method === 'OPTIONS') {
      response.writeHead(204, corsHeaders(options.origins, request.headers.origin))
      response.end()
      return
    }

    if (request.method === 'GET') {
      sendJson(response, 405, {
        error: { code: 'no_sse', message: 'This stateless deployment answers POST only.' },
      })
      return
    }

    if (request.method !== 'POST') {
      sendJson(response, 405, { error: { code: 'method_not_allowed', message: 'POST only.' } })
      return
    }

    if (!originAllowed(request, options.origins)) {
      sendJson(response, 403, { error: { code: 'origin_not_allowed', message: 'Origin is not on the allowlist.' } })
      return
    }

    if (rateLimited(remote)) {
      sendJson(response, 429, { error: { code: 'rate_limited', message: 'Too many requests; retry in a minute.' } })
      return
    }

    let body = ''
    let oversized = false
    request.on('data', (chunk: Buffer) => {
      body += chunk.toString('utf8')
      if (body.length > MAX_BODY_BYTES) {
        oversized = true
        request.destroy()
      }
    })
    request.on('end', () => {
      if (oversized) return
      let parsed: unknown
      try {
        parsed = JSON.parse(body)
      } catch {
        sendJson(response, 400, { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } })
        return
      }
      try {
        const result = handleRequest(store, parsed)
        sendJson(response, 200, result)
      } catch (error) {
        sendJson(response, 500, {
          jsonrpc: '2.0',
          id: null,
          error: { code: -32603, message: 'Internal error' },
        })
        void error
      }
    })
    request.on('error', () => {
      /* the socket died mid-body; nothing to answer */
    })
  })

  return server
}

const SERVER_NAME_HTTP = 'atomicals-docs'
const SERVER_VERSION_HTTP = '1.0.0'
const PROTOCOL_VERSION_HTTP = '2024-11-05'

const isEntrypoint =
  process.argv[1] !== undefined && import.meta.url.endsWith(process.argv[1].split('\\').join('/'))

if (isEntrypoint) {
  const options = parseHttpOptions(process.argv.slice(2))
  const server = createHttpServer(options)
  server.listen(options.port, options.host, () => {
    process.stdout.write(`atomicals-docs MCP (streamable http, stateless) on http://${options.host}:${options.port}/mcp\n`)
  })
}
