# SDKs

Generated read-only clients for TypeScript, Python, Go, and Rust, all derived from the same OpenAPI contracts.

Page ID: sdks
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet, regtest
Verified: 2026-09-02
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/sdks/

---
The TypeScript client under packages/client and the Python, Go, and Rust clients under clients/
all derive from the same OpenAPI documents the site validates. A contract change regenerates
every client, and the coverage test fails CI if any operation goes missing.

| Language | Location | Transport | Notes |
| --- | --- | --- | --- |
| TypeScript | `packages/client` | fetch | Generated types for every operation and response |
| Python | `clients/python` | urllib, no runtime dependencies | Type hints, Ruff and mypy clean in CI |
| Go | `clients/go` | net/http with contexts | `gofmt` and `go vet` clean in CI |
| Rust | `clients/rust` | reqwest with rustls | `cargo check` and Clippy clean in CI |

Each client requires an explicit base URL: none of them hides a default production origin.
Retries are absent by default; a caller who wants retries for safe idempotent reads adds them
explicitly.

## Coverage

The generated [coverage manifest](../../site/src/generated/sdk-coverage.json) lists every
read-only operation each client exposes. Regenerating is one command and must leave the working
tree clean:

```
npm run sdk:generate
```

## Quick start (Python)

```python
from atomicals_client.client import Client

client = Client("http://127.0.0.1:3043")
status = client.arc20_get_status()
print(status["coverage"], status["chainTip"])
```

## Quick start (Rust)

```rust
let client = atomicals_client::Client::new("http://127.0.0.1:3043")?;
let status = client.arc20_get_status().await?;
println!("{} at {}", status["coverage"], status["chainTip"]);
```

## Release artifacts

Versioned archives and checksums for every SDK ship with each release so the packages stay
installable without any external registry credential. See [releases](/releases/).
