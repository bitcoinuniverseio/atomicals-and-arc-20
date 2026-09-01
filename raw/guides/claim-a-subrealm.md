# Claim a Subrealm

Satisfy a parent Realm's rules, including any payment, and confirm you actually won the name.

Page ID: guides/claim-a-subrealm
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/guides/claim-a-subrealm/

---
## Before you start

- Supported networks: mainnet.
- Status: protocol behavior.
- The parent controls the rules and can enable or disable claiming.

## The procedure

1. Read the parent Realm's current Subrealm rules, at a current height.
2. Confirm Subrealm claiming is enabled.
3. Confirm the name is available and has no competing candidate.
4. Build a claim that satisfies every rule, including the payment output and its marker if a
   payment is required.
5. Mint:

   ```text
   yarn cli mint-subrealm <realm>
   ```

6. Confirm and wait for indexing.
7. Confirm you are the verified winner.

## Payments

Where a rule requires payment, all of the following must be true in the same transaction:

- the payment goes to the exact output the rule specifies;
- the amount is exact;
- the payment marker is present and well formed.

Paying the right amount to the wrong script makes the claim invalid, and the fee is spent.

## Check before signing

- The rules you built against are the rules currently published.
- The payment output script and value are exactly as required.
- The payment marker is present.
- The name is exactly the string you intend.

## If it fails

| Failure | Meaning |
| --- | --- |
| Claiming disabled | The parent turned it off |
| Rule not satisfied | Re-read the rules and rebuild |
| Payment wrong | Invalid claim, fee spent |
| Already claimed | Another claim won |
| Pending, not resolved | Wait. Do not present it as owned |

## After

Record the Atomical ID and move the output into your protected pool.

## Source

[Subrealms](/protocol/realms/subrealms/) and
[claims and rules](/protocol/realms/claims-and-rules/).
