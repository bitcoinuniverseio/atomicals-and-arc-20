# OpenAPI and downloads

Validated OpenAPI 3.1 documents, JSON Schemas, and every machine readable artefact this site publishes.

Page ID: reference/openapi
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/reference/openapi/

---
Every document here is validated in CI. A route present in a document but absent from its source
inventory fails the build, and so does the reverse.

## Documents

## What CI checks

| Check | Effect when it fails |
| --- | --- |
| OpenAPI 3.1 structure | Build fails |
| Operation identifier uniqueness within and across documents | Build fails |
| Every operation has a summary, a declared tag, and responses | Build fails |
| Route inventory equals the documented paths, in both directions | Build fails |
| Every response example validates against its own schema | Build fails |
| Every deprecated route names a replacement | Build fails |
| No production host or routable address appears | Build fails |

Publishing an origin in a contract invites people to point production traffic at it from a browser
with a credential in the page. The server is a variable. Set it to the origin your deployment
exposes.

## Amount encoding

Every satoshi and protocol quantity is a decimal string in these contracts. JSON numbers are
rejected, so no precision is lost in transit and no client silently converts a large integer into
a float.

## Using the documents

1. Download the document for the surface you integrate with.
2. Generate a client rather than hand writing calls.
   See [TypeScript client](/reference/client-sdk/).
3. Run the [conformance vectors](/reference/conformance/) against your build.
4. Pin the document version alongside your service revision.
5. Regenerate on every upgrade and diff the generated types.
