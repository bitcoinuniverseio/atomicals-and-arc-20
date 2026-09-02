# Protocol lookup and source verification

1. Search the page manifest (dist/manifest.json) for the concept.
2. Fetch the page with get_page or read dist/raw/<route>.md.
3. Check the page provenance: applicability, authority, networks, verified date.
4. Resolve every cited source id in contracts/source-manifest.json to get the
   repository and exact revision.
5. Quote the claim with its revision. If the drift status file records upstream
   movement, say the documentation remains pinned and the source has moved.

Comparative questions (Atomicals versus Ordinals, Runes, BRC-20, and so on)
are answered from contracts/protocol-atlas/atlas.json. Cells carry status
values; unknown means unknown.
