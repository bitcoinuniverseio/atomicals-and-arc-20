# Security

## Reporting

Report a security problem through a
[private security advisory](https://github.com/bitcoinuniverseio/atomicals-and-arc-20/security/advisories/new)
rather than a public issue.

Please include what you found, how to reproduce it, and what you think the impact is. Do not
include a credential or any private data in the report.

## What is in scope

This repository publishes documentation, contracts, and two small packages. In scope:

- A credential, hostname, or operator-only detail that appears in the published output.
- A documented protocol claim that would cause a reader to lose value if followed.
- A documented API contract that does not match the running service in a way that is unsafe.
- A defect in the interactive tools, the generated client, or the documentation MCP server.
- A supply chain problem in the dependencies this repository ships.

Out of scope here, and better reported to the owning repository:

- A defect in a Universe runtime service.
- A defect in the upstream Atomicals implementation.
- A defect in a third-party product listed in the ecosystem registry.

## What the published artefacts must never contain

Passwords, tokens, private keys, seed phrases, bearer credentials, HMAC secrets, private RPC URLs,
private indexer origins, SSH endpoints, private hostnames, database credentials, internal network
topology, recovery secrets, operator-only command history, or customer data.

If you find any of these in the published output, that is a security report, not a documentation
defect.

## Properties this repository maintains deliberately

**The interactive tools never leave the browser.** The allocation visualizer, the transaction
inspector, the Bitwork estimator, the command builder, and the API explorer all run locally. None
of them uploads what you paste, signs anything, broadcasts anything, or asks for key material.

**The API explorer never sends a request.** It renders the contract and hands you a command to run
in your own environment, with your own credential, against an origin you chose. An explorer that
sends requests needs a credential in the page, and that credential ends up in browser history and
logs.

**The generated client has no default origin and holds no credential.**

**The documentation MCP server is read only by construction.** It has no mutation, signing,
broadcast, or wallet code paths at all.

**No third-party script or stylesheet is loaded on any page.** A test fails the build if one
appears.

**Public pull request validation never uses a private credential.** Checks that need one run only
on a trusted scheduled path, never on code from a fork.

## Never asked for

Nothing on this site, and nothing in these packages, ever needs a seed phrase, a private key, or a
wallet export file. Anything that asks for one is not us.
