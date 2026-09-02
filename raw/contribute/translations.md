# Translations

The required page set, the shared glossary, the prohibited translations, and how staleness is detected automatically.

Page ID: contribute/translations
Applicability: editorial
Authority: none
Networks: none
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/contribute/translations/

---
## English is the source

Every translation is made from the English page, and records the hash of the English body it was
made from in `translationSourceHash`.

When the English body changes, the recorded hash no longer matches, and the site shows a notice on
the translated page automatically. Nobody has to remember to flag it.

## The required set

Eight locales are configured: English, Portuguese, Spanish, French, Japanese, Russian, Simplified
Chinese, and Traditional Chinese.

A defined set of core pages must exist in every locale, listed in
`site/src/data/site.json` under `requiredLocalizedPages`. CI fails when one is missing.

Pages outside that set fall back to English, and Starlight shows a fallback notice, which is honest
rather than pretending a translation exists.

## What is never translated

| Never translated | Why |
| --- | --- |
| Operation names such as `ft`, `dft`, `dmt`, `nft`, `mod`, `sl` | They are protocol literals |
| Schema property names | They are wire format |
| Route paths and query parameter names | They are the contract |
| Header names | They are the contract |
| Error codes | Clients branch on them |
| Hashes, transaction ids, Atomical ids | They are data |
| Code blocks, in full | Copying a translated identifier breaks the reader's build |
| Product and repository names | They are names |

CI compares code blocks between a translation and its English source and fails on a mismatch.

## Shared glossary

The [glossary](/start/glossary/) is the reference for every term. Translate a term the same way
everywhere, and add the English term in brackets on first use in a page when the translation is not
already established.

## Prohibited mistranslations

| English | Do not translate as |
| --- | --- |
| burn | spend, lose, send |
| candidate | owner, holder |
| verified winner | applicant, requester |
| coloured output | any word implying it is ordinary bitcoin |
| ready | running, live, configured |
| deprecated | removed, deleted |
| proposed | planned, upcoming, coming soon |
| partial coverage | complete, full |

Each pair exists because the wrong word changes what a reader will do.

## Adding a translation

1. Copy the English page into the locale directory.
2. Translate the prose. Leave every code block, identifier, and route untouched.
3. Compute the English body hash and record it in `translationSourceHash`.
4. Keep the same `pageId`.
5. Run `npm run check`.

## Reviewing a translation

- Does every status word still mean exactly what it means in English?
- Are all code blocks byte-identical to the English source?
- Are the safety warnings as strong as the English ones? A softened warning is a defect.
- Does it read as though a person wrote it?

Do not merge an obviously machine-produced translation with inconsistent terminology.
