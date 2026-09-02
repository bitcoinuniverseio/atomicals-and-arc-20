# Fixed DFT deployment

The parameters a fixed decentralised deployment sets, what they bound, and what a client must check before treating one as valid.

Page ID: protocol/arc20/fixed-dft
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: en
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/protocol/arc20/fixed-dft/

---
A fixed DFT deployment is the `dft` operation. It does not create units. It publishes the rules
that later `dmt` claims must satisfy.

## The reference command

```text
yarn cli init-dft <ticker> <mint_amount> <max_mints> <mint_height> <file> <mintbitworkc>
```

There is also `init-dft-fixed`. See the [CLI reference](/reference/cli/#init-dft).

## Deployment parameters at the pinned revision

| Field | Meaning | Pinned behavior |
| --- | --- | --- |
| `request_ticker` | The ticker requested | Validated by the active ticker rule |
| `mint_height` | Earliest block height for claims | Integer from 0 through 10 000 000 |
| `mint_amount` | Satoshis each valid claim places in output zero | 546 through 100 000 000 |
| `max_mints` | Number of valid fixed mode claims | At least 1. The maximum is activation dependent |
| `mint_bitworkc` | Optional commit Bitwork for claimants | Evaluated by the active implementation |
| `mint_bitworkr` | Optional reveal Bitwork for claimants | Evaluated by the active implementation |

## Nominal maximum issuance

```text
maximum issuance = mint_amount * max_mints
```

This is a ceiling on what claims can produce. It is not a promise the ceiling is reached, and it
is not a circulating supply figure. Report actual issuance from claim records, never from the
deployment parameters alone.

## What a client must check before showing a deployment as valid

1. The ticker resolved to a verified winner, not just a request.
2. `mint_height` is within the accepted range for the active rules.
3. `mint_amount` is within the accepted range for the active rules.
4. `max_mints` is within the limit active on that network at that height.
5. Any Bitwork requirement is read from the deployment, not assumed.
6. The active rule set is the one your target validator runs.

Skipping step four is the common failure. The pinned source has legacy and density-activation mint
count limits, and a deployment valid under one is not valid under the other.

## Displaying progress

| Figure | Where it comes from |
| --- | --- |
| Maximum issuance | `mint_amount * max_mints` |
| Claims made | Counted valid `dmt` claims |
| Circulating | Sum of coloured value actually held, after burns |
| Remaining | `max_mints` minus claims made |

Circulating is not claims multiplied by mint amount, because units can burn after they are minted.
