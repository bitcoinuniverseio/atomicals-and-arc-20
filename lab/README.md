# Local Regtest Lab

One-command, disposable, loopback-only Atomicals environment running real pinned software.

| Command | What it does |
| --- | --- |
| `npm run lab:up` | Generate ephemeral regtest credentials, boot Bitcoin Core, ElectrumX, and the read-only adapter, then print working endpoints |
| `npm run lab:seed` | Mine past the activation height derived from the pinned source, create labelled wallets and plain UTXOs, write the fixture feed |
| `npm run lab:status` | Service state plus the adapter status document |
| `npm run lab:test` | Execute the critical read-only expectations against the running lab |
| `npm run lab:reset` | `down -v`, up, seed: back to exactly the same deterministic state |
| `npm run lab:logs` | Follow compose logs |
| `npm run lab:down` | Stop everything |

## What is pinned

- Bitcoin Core v27.0 by image digest (see `docker-compose.yml`).
- Atomicals ElectrumX at the exact revision the source manifest pins, built from source by `electrumx.Dockerfile`.
- The adapter is this repository's own code, read-only by construction: it refuses every non-GET request.

## Why the seeder mines 2.5 million blocks

In the pinned source, `BitcoinRegtest` declares no activation overrides and inherits the testnet
heights from `electrumx/lib/coins.py`: `ATOMICALS_ACTIVATION_HEIGHT = 2505238`. The seeder derives
that constant from the pinned revision and mines past it before creating any fixture. Regtest
mining is fast, and the runner asserts the derivation instead of guessing a mainnet height.

## Safety model

- Everything binds `127.0.0.1`. No port is published.
- Credentials are generated per `lab:up`, kept only in `lab/.env` (gitignored), and are valid on
  regtest only.
- Wallets are clearly labelled (`lab-miner`, `lab-arc20-holder`, `lab-receiver`) and disposable.
- Every transaction passes `testmempoolaccept` before broadcast, and the runner verifies that both
  policy and protocol checks behave.
- No mainnet key is ever imported, reused, or requested.
