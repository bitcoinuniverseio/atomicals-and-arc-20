# Local Regtest execution

`npm run lab:up`, `npm run lab:seed`, `npm run lab:test`, `npm run lab:down`
in the documentation repository. The lab binds 127.0.0.1, generates ephemeral
regtest credentials, and mines past the activation height derived from the
pinned source (2505238 on regtest) before seeding. Mutation examples run
here, never on mainnet.
