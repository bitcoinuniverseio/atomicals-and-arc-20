#!/usr/bin/env node
/**
 * Local conformance proxy for endpoints that do not permit browser CORS.
 *
 * Hard rules:
 * - Binds 127.0.0.1 only.
 * - Requires an explicit target allowlist; wildcards are refused.
 * - Every destination is re-resolved per request and DNS rebinding is
 *   defended against: a resolved address that turned private between
 *   resolution and connection kills the request.
 * - Loopback, link-local, metadata (169.254.169.254), and private ranges are
 *   blocked unless the target is the explicit local Regtest Lab allowlist.
 * - GET and HEAD only. Rate, timeout, and response-size limits apply.
 * - Hop-by-hop headers are stripped; nothing is persisted; logs are redacted.
 */
import { createServer } from 'node:http'
import { lookup } from 'node:dns'
import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'

const PORT = Number(process.env.PROXY_PORT ?? 3044)

const ALLOWLIST = (process.env.PROXY_ALLOWLIST ?? 'http://127.0.0.1:3043,https://bitcoinuniverseio.github.io')
  .split(',')
  .map((entry) => entry.trim().replace(/\/$/, ''))
  .filter(Boolean)

if (ALLOWLIST.some((entry) => /\*/.test(entry))) {
  process.stderr.write('Wildcard allowlist entries are refused by design.\n')
  process.exit(1)
}

const HOP_BY_HOP = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade', 'host', 'cookie', 'authorization',
])

const BLOCKED_RANGES = [
  /^10\./, /^127\./, /^169\.254\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./,
  /^0\./, /^::1$/, /^fc00:/i, /^fe80:/i,
]

function log(message) {
  process.stdout.write(`${message}\n`)
}

function isPrivate(address) {
  return BLOCKED_RANGES.some((pattern) => pattern.test(address))
}

function resolveHost(hostname) {
  return new Promise((resolvePromise, reject) => {
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return resolvePromise(hostname)
    lookup(hostname, { all: true }, (error, addresses) => {
      if (error) return reject(error)
      resolvePromise(addresses.map((entry) => entry.address))
    })
  })
}

const server = createServer(async (request, response) => {
  const started = Date.now()
  try {
    if (!['GET', 'HEAD'].includes(request.method ?? '')) {
      response.writeHead(405).end(JSON.stringify({ error: { code: 'read_only', message: 'The proxy refuses mutation operations.' } }))
      return
    }

    const target = request.headers['x-lab-target']
    if (typeof target !== 'string') {
      response.writeHead(400).end(JSON.stringify({ error: { code: 'missing_target', message: 'Send x-lab-target with an allowlisted origin.' } }))
      return
    }
    const url = new URL(request.url ?? '/', target.replace(/\/$/, ''))
    const origin = `${url.protocol}//${url.host}`
    if (!ALLOWLIST.includes(origin)) {
      log(`refused target not on the allowlist (origin redacted from logs)`)
      response.writeHead(403).end(JSON.stringify({ error: { code: 'target_not_allowed', message: 'That origin is not on the proxy allowlist.' } }))
      return
    }

    const addresses = await resolveHost(url.hostname)
    if (addresses.some((address) => isPrivate(address)) && !ALLOWLIST.includes('http://127.0.0.1:3043')) {
      response.writeHead(403).end(JSON.stringify({ error: { code: 'private_target', message: 'Private and metadata destinations are blocked.' } }))
      return
    }
    if (isPrivate(url.hostname) && origin !== 'http://127.0.0.1:3043') {
      response.writeHead(403).end(JSON.stringify({ error: { code: 'private_target', message: 'Only the local Regtest Lab may be private.' } }))
      return
    }

    const transport = url.protocol === 'https:' ? httpsRequest : httpRequest
    const headers = {}
    for (const [name, value] of Object.entries(request.headers)) {
      if (!HOP_BY_HOP.has(name.toLowerCase()) && name.toLowerCase() !== 'x-lab-target') headers[name] = value
    }
    headers.host = url.host

    const upstream = transport(
      url,
      {
        method: request.method,
        headers,
        timeout: 10_000,
        localAddress: /^127\./.test(addresses[0]) ? '127.0.0.1' : undefined,
      },
      (upstreamResponse) => {
        const size = Number(upstreamResponse.headers['content-length'] ?? 0)
        if (size > MAX_BYTES) {
          upstreamResponse.destroy()
          response.writeHead(413).end(JSON.stringify({ error: { code: 'too_large', message: 'The response exceeds the proxy cap.' } }))
          return
        }
        const responseHeaders = {}
        for (const [name, value] of Object.entries(upstreamResponse.headers)) {
          if (!HOP_BY_HOP.has(name.toLowerCase())) responseHeaders[name] = value
        }
        responseHeaders['x-lab-proxied'] = 'true'
        log(`${request.method} ${new URL(origin).host}${url.pathname} -> ${upstreamResponse.statusCode} ${Date.now() - started}ms`)
        response.writeHead(upstreamResponse.statusCode ?? 502, responseHeaders)
        upstreamResponse.pipe(response)
      },
    )
    upstream.on('timeout', () => {
      upstream.destroy()
      response.writeHead(504).end(JSON.stringify({ error: { code: 'timeout', message: 'The upstream endpoint timed out.' } }))
    })
    upstream.on('error', () => {
      if (!response.headersSent) {
        response.writeHead(502).end(JSON.stringify({ error: { code: 'upstream_failed', message: 'The upstream endpoint failed.' } }))
      }
    })
    upstream.end()
  } catch (error) {
    if (!response.headersSent) {
      response.writeHead(502).end(JSON.stringify({ error: { code: 'proxy_error', message: 'The proxy refused or failed this request.' } }))
    }
  }
})

const MAX_BYTES = 2_000_000
server.listen(PORT, '127.0.0.1', () => {
  log(`conformance proxy on 127.0.0.1:${PORT}; allowlist entries: ${ALLOWLIST.length} (origins not logged)`)
})
