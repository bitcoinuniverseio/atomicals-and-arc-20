# Read-only API lookup

Use the MCP tools get_api_operation and get_json_schema, or read the documents
directly: contracts/openapi/arc20.json, atomicals-nfts-realms.json,
marketplace-v1.json. Only GET operations marked x-read-only in the overlay are
permitted surfaces for live calls. Generated clients live in packages/client
(TypeScript) and clients/python, clients/go, clients/rust.
