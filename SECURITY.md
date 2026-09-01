# Security policy

This repository holds public protocol documentation for Atomicals and ARC-20 as
indexed by Bitcoin Universe. It contains no executable services, but
documentation errors can cause real loss for people who move colored satoshis,
so factual defects in the coloring, splitting, and validity rules are treated as
security issues.

## Reporting

Report vulnerabilities or dangerous documentation errors privately through
GitHub private vulnerability reporting on this repository (Security tab,
"Report a vulnerability"). Do not open a public issue for anything that could
cause loss of funds if acted on before a fix.

In scope:

- Incorrect coloring, splitting, or burn rules that could lead someone to build
  a transaction that destroys or misassigns token value.
- Incorrect envelope, commit and reveal, or bitwork descriptions that would
  produce invalid mints.
- Errors in the transfer outcome simulator's rule engine
  (`assets/simulator.js`).
- Any script behavior in the published pages beyond the documented theme
  toggle, local search, and simulator.

Out of scope: issues in the upstream Atomicals protocol itself, which belong
with the upstream project, and issues in Bitcoin Universe products, which
should go through the product security contact listed at
https://docs.bitcoinuniverse.io.

We aim to acknowledge reports within 7 days.
