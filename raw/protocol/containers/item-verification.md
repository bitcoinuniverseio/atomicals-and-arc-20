# Item verification

How to prove an item belongs to a Container, what each check establishes, and what a product must show.

Page ID: protocol/containers/item-verification
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/containers/item-verification/

---
## The verification chain

Each step depends on the one before it. A break anywhere means the item is unverified.

1. **Resolve the Container.** By Atomical ID, not by name.
2. **Confirm the manifest is sealed.** An unsealed manifest proves nothing.
3. **Read the manifest entry** for the claimed item identifier.
4. **Compare the item content digest** to the manifest entry.
5. **Check the claim satisfied its rules**, including mint height, Bitwork, and payment.
6. **Check the claim was the winning one** for that identifier, if the identifier is unique.
7. **Confirm the item Atomical exists** and its current location.

The reference CLI exposes `validate-container-item` for this. See the
[CLI reference](/reference/cli/).

## What each check establishes

| Check | Establishes |
| --- | --- |
| Container resolved by ID | You are looking at the right collection |
| Manifest sealed | The rules could not be changed after minting began |
| Manifest entry exists | The item was allowed |
| Digest matches | The content is exactly what was allowed |
| Rules satisfied | The claim was valid |
| Winning claim | No one else holds that identifier |
| Item exists | The object is real and locatable |

## What a product must show

- Verified, with the checks that passed.
- Unverified, with the first check that failed.
- Never a green tick based on a metadata field.

An interface that shows collection membership from metadata alone is misleading, because anyone
can mint an object asserting membership in anything.

## Consumer expectations for an indexer

An index that serves Container items should expose:

- the Container Atomical ID and sealed state;
- the manifest total and the verified item count;
- per item, the verification result and the reason when it failed;
- the generation and source revision the answer came from.

No Universe read projection exposes Containers today. See
[status and known limitations](/start/status-and-limitations/).
