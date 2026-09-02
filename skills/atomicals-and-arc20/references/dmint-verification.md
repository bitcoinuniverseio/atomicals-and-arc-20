# DMINT verification

Verify container items against the sealed DMINT manifest: fetch the container
and item (contracts/openapi/atomicals-nfts-realms.json operations), then
check the item hash against the committed manifest per
/protocol/containers/item-verification/. A signature or a listing is not
authenticity. Verification is local and deterministic.
