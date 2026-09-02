/**
 * Offline service worker for the documentation.
 *
 * The cache is a function of the documentation build, the locale, and the
 * source-set version. Precache covers the app shell and the current build's
 * hashed assets; documentation pages are cached as visited, and Pagefind
 * loads on demand so offline search works.
 *
 * Never cached: API credentials or headers, user-supplied endpoints, live API
 * responses, imported UTXO data, question history, anything from the local
 * lab. This worker only ever handles same-origin GET requests for static
 * assets.
 */
let CACHE = 'atomicals-docs-bootstrapping'

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      // The build publishes this manifest alongside the worker; it lists the
      // hashed assets of exactly the build that produced this file.
      const registry = await fetch(new URL('sw-version.json', self.registration.scope), {
        cache: 'no-store',
      }).then((response) => response.json())
      CACHE = `atomicals-docs-${registry.buildId}`
      const cache = await caches.open(CACHE)
      await cache.addAll(['/offline/', ...(registry.precache ?? [])])
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith('atomicals-docs-') && key !== CACHE) {
          await caches.delete(key)
        }
      }
      await self.clients.claim()
    })(),
  )
})

// Inform the page when a new documentation build replaces this worker.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'precache-docs') {
    event.source?.postMessage?.({ type: 'precache-complete', cache: CACHE })
  }
  if (event.data?.type === 'remove-all') {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('atomicals-docs-')).map((key) => caches.delete(key)))))
  }
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  // Explicit exclusions: live workbench calls, lab endpoints, and any fetch
  // the page marks as sensitive must never touch the cache.
  if (request.headers.has('x-lab-target') || url.searchParams.has('live')) return

  // Hashed build assets and Pagefind: cache-first, they are immutable.
  if (url.pathname.includes('/_astro/') || url.pathname.includes('/pagefind/')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((response) => {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
            return response
          }),
      ),
    )
    return
  }

  // Documentation pages: network-first with cache fallback, then the offline page.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.headers.get('accept')?.includes('text/html')) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
        }
        return response
      })
      .catch(async () => (await caches.match(request)) ?? (await caches.match('/offline/')) ?? Response.error()),
  )
})
