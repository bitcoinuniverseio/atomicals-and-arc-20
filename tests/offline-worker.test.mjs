import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const source = readFileSync(new URL('../site/public/sw.js', import.meta.url), 'utf8')
const buildId = '0123456789abcdef'
const scope = 'https://example.test/atomicals-and-arc-20/'

function worker({ online = true, registryId = buildId, cached = true } = {}) {
  const handlers = {}, opened = [], added = [], matches = []
  const context = {
    URL, Response,
    self: {
      registration: { scope }, location: { origin: 'https://example.test' },
      addEventListener: (name, handler) => { handlers[name] = handler },
      skipWaiting: async () => {}, clients: { claim: async () => {} },
    },
    fetch: async () => {
      if (!online) throw new Error('offline')
      return { json: async () => ({ buildId: registryId, precache: ['_astro/styles.css'] }) }
    },
    caches: {
      open: async (name) => { opened.push(name); return { addAll: async (urls) => { added.push(...urls) }, match: async () => cached ? new Response('Offline documentation') : undefined } },
      keys: async () => [], delete: async () => true,
      match: async (request) => {
        matches.push(request)
        return request === `${scope}offline/` ? new Response('Offline documentation') : undefined
      },
    },
  }
  vm.runInNewContext(source.replace('__BUILD_ID__', buildId), context)
  return { handlers, opened, added, matches }
}

test('installation caches only scope-relative shell and stylesheet URLs', async () => {
  const state = worker(); let done
  state.handlers.install({ waitUntil: (promise) => { done = promise } })
  await done
  assert.deepEqual(state.opened, [`atomicals-docs-${buildId}`])
  assert.deepEqual(state.added, [`${scope}offline/`, `${scope}_astro/styles.css`])
})

test('a restarted worker retains its build identity while offline', async () => {
  const state = worker({ online: false }); let done
  state.handlers.fetch({ request: new Request(`${scope}guides/unvisited/`), respondWith: (promise) => { done = promise } })
  assert.equal(await (await done).text(), 'Offline documentation')
  let message
  state.handlers.message({ data: { type: 'precache-docs' }, source: { postMessage: (value) => { message = value } }, waitUntil: (promise) => { done = promise } })
  await done
  assert.equal(message.cache, `atomicals-docs-${buildId}`)
  assert.equal(message.type, 'precache-complete')
})

test('removed offline data cannot produce a ready status', async () => {
  const state = worker({ cached: false }); let done, message
  state.handlers.message({ data: { type: 'precache-docs' }, source: { postMessage: (value) => { message = value } }, waitUntil: (promise) => { done = promise } })
  await done
  assert.equal(message.type, 'precache-unavailable')
})

test('installation refuses a manifest from a different publication', async () => {
  const state = worker({ registryId: 'fedcba9876543210' }); let done
  state.handlers.install({ waitUntil: (promise) => { done = promise } })
  await assert.rejects(done, /changed during installation/)
  assert.equal(state.opened.length, 0)
})
