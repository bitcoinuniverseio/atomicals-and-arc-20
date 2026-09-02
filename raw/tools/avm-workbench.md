# AVM Workbench

Execute the pinned beta AVM interpreter with hard resource limits, full beta labeling, and honest refusals.

Page ID: tools/avm-workbench
Applicability: experimental
Authority: executed-source
Networks: none
Verified: 2026-09-02
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/tools/avm-workbench/

---
The banner in the workbench is permanent for a reason: the AVM interpreter at the pinned
revision is beta. Running a sample locally proves what that revision does, nothing more.

## Resource limits

Every run is bounded: 64 MiB memory, a five second wall-clock budget with worker termination, a
256 KB program cap, a 1 MB output cap, and a ten million instruction budget metered by the
interpreter build itself. Exceeding any limit terminates the run and says so; the host never
truncates silently.

## Native and WASM parity

The same pinned source builds twice through deterministic container toolchains: a native binary
for the Regtest Lab and CI, and the WASM module for this workbench. The CI gate executes the
golden fixtures on both and requires byte-identical outcomes before either ships.

## Runtime package

The host interface lives in `packages/avm-runtime`: pinned source acquisition with checksum
verification, the narrow host interface, resource limits, and refusal semantics. There is no
JavaScript reimplementation of AVM semantics anywhere in this repository.
