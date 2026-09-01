# Contributing

This repository is the source of the Atomicals + ARC-20 protocol documentation
site published at https://bitcoinuniverseio.github.io/atomicals-and-arc-20/.

## Ground rules

- Every protocol claim must be grounded in code: the Bitcoin Universe Atomicals
  indexers or the upstream Atomicals reference implementation. Cite the rule you
  verified in your pull request description.
- Universe-specific indexing decisions must be labeled as such and kept in the
  reference page's dedicated section, separate from upstream protocol rules.
- Do not add claims about wallet, marketplace, or product support that you
  cannot verify in Bitcoin Universe code.
- No build step. Pages are hand-authored HTML with one shared stylesheet
  (`assets/site.css`) and small vanilla JavaScript enhancements. Everything must
  work with JavaScript disabled except search, the theme toggle, and the
  simulator.
- Keep both color themes readable to WCAG 2.2 AA and pages usable at 320 px with
  no horizontal page overflow.

## Workflow

1. Branch from `main`.
2. Edit the HTML directly. Update `search-index.json` when you add or rename
   headings, and `sitemap.xml` plus `llms.txt` when you add pages.
3. Update `changelog.html` and the footer version metadata for normative
   changes.
4. Open a pull request against `main`. Pages deploy from `main` at the
   repository root.

## Simulator changes

`assets/simulator.js` encodes the ARC-20 coloring rules. Any change there must
be matched by the written rules on `specification.html`, by the worked vectors
on `test-vectors.html`, and must state which indexer behavior it reflects.
