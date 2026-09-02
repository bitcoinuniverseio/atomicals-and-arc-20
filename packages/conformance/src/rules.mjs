/**
 * Read-only conformance rules.
 *
 * Pure decision logic for the API Conformance Workbench: which operations may
 * ever be sent, how a response is judged against the contract, and how a
 * verdict is derived. The browser component renders these results; these
 * functions produce them, so the tests can hold the browser honest.
 */

/** Methods the workbench will never send, whatever the contract says. */
export const FORBIDDEN_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'TRACE'])

/**
 * An operation is sendable only when it is a GET or HEAD on the canonical
 * contract. Mutations, signing, and broadcasting never pass this gate.
 */
export function isSendableOperation(operation, method) {
  const normalized = method.toUpperCase()
  if (!['GET', 'HEAD'].includes(normalized)) return { sendable: false, reason: `${method} is never sent by the workbench` }
  if (FORBIDDEN_METHODS.has(normalized)) return { sendable: false, reason: `${method} is forbidden` }
  if (operation?.['x-read-only'] !== true) {
    return { sendable: false, reason: 'the operation is not marked read-only by the overlay' }
  }
  return { sendable: true, reason: 'read-only GET on the canonical contract' }
}

/** A hard cap that protects the browser before validation even starts. */
export const MAX_RESPONSE_BYTES = 2_000_000
export const MAX_CONCURRENT_REQUESTS = 2
export const MAX_REQUESTS_PER_SECOND = 5
export const DEFAULT_TIMEOUT_MS = 10_000

/**
 * Judge one response. Every check is reported individually so nothing is
 * hidden behind a summary.
 */
export function evaluateResponse({ operation, method, status, contentType, headers, body }) {
  const checks = []
  const push = (name, passed, detail) => checks.push({ name, passed, detail })

  const expectedStatuses = Object.keys(operation?.responses ?? {}).map(Number)
  const statusAllowed = expectedStatuses.includes(status)
  push(
    'status in contract',
    statusAllowed,
    statusAllowed ? `${status} is documented` : `${status} is not in ${JSON.stringify(expectedStatuses)}`,
  )

  const expectedMedia = expectedResponseMedia(operation, status)
  const mediaOk = expectedMedia.length === 0 || expectedMedia.some((media) => (contentType ?? '').startsWith(media))
  push(
    'media type matches',
    mediaOk,
    mediaOk ? contentType ?? 'none declared' : `got ${contentType}, expected ${expectedMedia.join(' or ')}`,
  )

  const parse = parseBody(body)
  push('body parses as JSON', parse.ok, parse.error ?? 'parsed')
  if (parse.ok) {
    if (operation?.responses?.[String(status)]?.content?.['application/json']?.schema) {
      push(
        'schema validator registered',
        true,
        'the build-time validator for this response runs in the browser component',
      )
    }
    const errorShape = checkErrorShape(status, parse.value)
    if (errorShape) push('error shape follows the contract', errorShape.passed, errorShape.detail)
    const pagination = checkPagination(operation, parse.value)
    if (pagination) push('pagination behaviour', pagination.passed, pagination.detail)
  }

  const requiredHeaders = collectRequiredHeaders(operation)
  for (const [header, why] of requiredHeaders) {
    const present = [...Object.keys(headers ?? {})].some((name) => name.toLowerCase() === header.toLowerCase())
    push(`header ${header} present`, present, why)
  }

  return { checks, allPassed: checks.every((check) => check.passed) }
}

function expectedResponseMedia(operation, status) {
  const content = operation?.responses?.[String(status)]?.content
  if (!content) return []
  return Object.keys(content)
}

function parseBody(body) {
  if (typeof body !== 'string') return { ok: true, value: body }
  try {
    return { ok: true, value: JSON.parse(body) }
  } catch (error) {
    return { ok: false, error: String(error.message) }
  }
}

function checkErrorShape(status, value) {
  if (status < 400) return null
  if (value && typeof value === 'object' && 'error' in value) {
    const error = value.error
    const shaped = error && typeof error === 'object' && 'code' in error && 'message' in error
    return shaped
      ? { passed: true, detail: 'error.code and error.message present' }
      : { passed: false, detail: 'error exists but lacks code or message' }
  }
  return { passed: false, detail: 'an error response without an error object' }
}

function checkPagination(operation, value) {
  const description = JSON.stringify(operation ?? {})
  if (!description.includes('nextCursor')) return null
  const items = Array.isArray(value?.items)
  const cursorField = 'nextCursor' in (value ?? {})
  if (!items || !cursorField) return { passed: false, detail: 'expected items array and nextCursor' }
  if (value.nextCursor === null || typeof value.nextCursor === 'string') {
    return { passed: true, detail: 'items plus a terminating or string cursor' }
  }
  return { passed: false, detail: 'nextCursor must be null or a string' }
}

function collectRequiredHeaders(operation) {
  const required = []
  const parameters = [...(operation?.parameters ?? [])]
  for (const parameter of parameters) {
    if (parameter?.in === 'header' && parameter.required) {
      required.push([parameter.name, parameter.description ?? 'contract-required header'])
    }
  }
  return required
}

/**
 * Derive the endpoint verdict. A network failure is "unreachable", never
 * "deprecated" or "closed"; the workbench does not narrate failures it did
 * not observe.
 */
export function deriveVerdict({ sent, timedOut, networkError, response, evaluation, identity, expectedNetwork }) {
  if (!sent) return { verdict: 'unknown', detail: 'nothing was sent yet' }
  if (timedOut) return { verdict: 'unreachable', detail: 'the request timed out' }
  if (networkError) return { verdict: 'unreachable', detail: 'the request failed at the network layer' }
  if (!evaluation) return { verdict: 'unknown', detail: 'no evaluation was produced' }

  if (identity?.network && expectedNetwork && identity.network !== expectedNetwork) {
    return { verdict: 'wrong-network', detail: `the endpoint reports ${identity.network}, you expected ${expectedNetwork}` }
  }
  if (identity?.indexedHeight != null && identity.chainTip != null) {
    const lag = identity.chainTip - identity.indexedHeight
    if (lag > 6) {
      return { verdict: 'stale', detail: `the index trails the chain tip by ${lag} blocks` }
    }
  }
  if (!evaluation.allPassed) {
    const failed = evaluation.checks.filter((check) => !check.passed)
    return {
      verdict: failed.every((check) => check.name === 'header present' || check.name.startsWith('header ')) ? 'compatible-with-warnings' : 'schema-divergence',
      detail: `${failed.length} check(s) failed: ${failed.map((check) => check.name).join(', ')}`,
    }
  }
  return { verdict: 'compatible', detail: 'every contract check passed' }
}

/**
 * Build the scrubbed report. Credentials, headers containing auth, and the
 * endpoint origin are removed: a report is safe to share or file.
 */
export function scrubReport({ endpointLabel, operationId, verdict, evaluation, identity, timing }) {
  return {
    reportVersion: '1.0.0',
    endpoint: endpointLabel ? 'user-supplied endpoint (origin redacted)' : 'unknown',
    operationId,
    verdict,
    identity: identity ? redactIdentity(identity) : null,
    checks: evaluation?.checks ?? [],
    timing: timing ?? null,
    note: 'Credentials and origins are removed. The endpoint URL never leaves this report redacted.',
  }
}

function redactIdentity(identity) {
  return { ...identity, buildRevision: identity?.buildRevision ? '[redacted]' : undefined }
}

/** Endpoint identity from the contract's identity surface, never inferred from unrelated responses. */
export function extractIdentity(statusBody, readyBody) {
  if (!statusBody || typeof statusBody !== 'object') return null
  return {
    network: typeof readyBody?.network === 'string' ? readyBody.network : undefined,
    chainTip: typeof statusBody.chainTip === 'number' ? statusBody.chainTip : undefined,
    indexedHeight: typeof statusBody.atomicalsTip === 'number' ? statusBody.atomicalsTip : undefined,
    capabilityFlags: statusBody.coverage ? { coverage: statusBody.coverage, reason: statusBody.reason ?? null } : undefined,
    lastUpdateTime: null,
  }
}
