# @bitcoin-universe/atomicals-client

Typed read client for the public Universe Atomicals APIs, generated from the published OpenAPI
contracts.

Full documentation:
[TypeScript client](https://bitcoinuniverseio.github.io/atomicals-and-arc-20/reference/client-sdk/).

## What it does

- Covers the public read surfaces of the ARC-20 index, the NFT and Realm index, and the read side
  of Marketplace v1.
- Returns freshness metadata with every response: the generation identifier, the indexed height,
  and the request identifier.
- Throws a typed error carrying the machine readable code, so you branch on `error.code` rather
  than on a message.
- Paginates cursor listings and refuses to continue across a generation change, because a cursor
  is only valid inside the generation that produced it.

## What it never does

It does not sign, broadcast, request key material, or embed a credential. It has no default base
URL, because a default becomes a production host in someone else's build.

Marketplace mutations need an HMAC over exact body bytes and a short lived owner session. Those
belong in your own server, where the secret lives. The client exposes the types so you can build
the request, and deliberately does not sign it for you.

## Use it

```ts
import { AtomicalsClient, AtomicalsApiError } from '@bitcoin-universe/atomicals-client'

const client = new AtomicalsClient({
  baseUrl: process.env.ATOMICALS_API_URL!,
})

const asset = await client.call('getAsset', {
  path: { atomicalId: '4d0b1f1c9c53a5b1e0b1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5061i0' },
})

// Store these three with anything you cache. Without them a later disagreement
// cannot be explained.
console.log(asset.generationId, asset.indexedHeight, asset.requestId)
```

Paginate a listing:

```ts
for await (const page of client.paginate('listNfts', { query: { limit: 100 } })) {
  for (const item of page.data.items) {
    // page.generationId is stable across this loop.
  }
}
```

Handle a failure:

```ts
try {
  await client.call('getNft', { path: { atomicalId } })
} catch (error) {
  if (error instanceof AtomicalsApiError) {
    if (error.code === 'NFT_NOT_FOUND') {
      // Not in the active generation. Check readiness before concluding it is gone.
    }
    if (error.retryable) {
      // 429, 503, or 5xx. Back off and try again.
    }
  }
  throw error
}
```

## Regenerating

The typed surface in `src/generated` is produced by `scripts/generate-client.mjs` from the OpenAPI
documents in `contracts/openapi`. Do not edit it. Run `npm run generate` at the repository root,
and CI fails if the committed output differs from the contract.

## Licence

MIT. See the repository [LICENSE](../../LICENSE).

