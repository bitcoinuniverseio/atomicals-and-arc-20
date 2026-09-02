# O que sao Atomicals?

Objetos digitais que vivem dentro de saidas comuns do Bitcoin, identificados pela transacao que os criou e interpretados por um validador Atomicals.

Page ID: start/what-are-atomicals
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: pt
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/pt/start/what-are-atomicals/

---
Um **Atomical** e um objeto digital criado por uma transacao Bitcoin e carregado por uma saida
Bitcoin. Nao existe cadeia paralela, nem livro-razao separado de tokens, nem conta de contrato
inteligente. O objeto existe porque um validador le a sua transacao e aplica as regras Atomicals a
ela.

## As tres partes de um Atomical

**Identidade** e o Atomical ID, escrito como `<txid>i<indice-da-saida>`. E atribuido uma unica vez
e nunca muda. Um numero tambem e atribuido na ordem de emissao, mas o ID e a identidade duravel
que voce deve guardar.

**Localizacao** e a UTXO que carrega o objeto neste momento. Gastar essa UTXO move o objeto, ou o
destroi, conforme o arranjo das saidas.

**Historico** e o conjunto ordenado de operacoes aplicadas ao objeto: a emissao, cada atualizacao
de estado e cada movimento.

## Como uma operacao e escrita

O envelope nao e executado pelo Bitcoin. Sao dados dentro de um caminho de script Taproot. O
Bitcoin nao sabe o que `atom` significa. Um validador Atomicals sabe.

Uma transacao Bitcoin confirmada apenas diz que os bytes estao num bloco. Se a operacao foi valida,
qual saida recebeu o objeto e se algo foi queimado sao respostas que um validador da. Verifique
sempre as duas coisas.

## A familia de protocolos

| Tipo | O que e | Leia |
| --- | --- | --- |
| Atomicals NFT | Um objeto nao fungivel unico com metadados e midia | [Visao geral dos NFTs](/protocol/nft/overview/) |
| ARC-20 | Tokens fungiveis onde uma unidade e um satoshi colorido | [Visao geral do ARC-20](/protocol/arc20/overview/) |
| Container | Uma colecao nomeada cuja pertenca os itens conseguem provar | [Containers](/protocol/containers/overview/) |
| DMINT | Emissao descentralizada de itens de Container contra um manifesto selado | [DMINT](/protocol/containers/dmint/) |
| Realm | Um nome de primeiro nivel detido como um Atomical | [Realms](/protocol/realms/overview/) |
| Subrealm | Um nome filho reivindicado sob as regras de um Realm | [Subrealms](/protocol/realms/subrealms/) |
| Payname | Um Realm usado como destino de pagamento | [Paynames](/protocol/realms/paynames/) |
| AVM | Um interpretador de scripts em ambiente isolado, em beta e com escopo separado | [AVM](/protocol/avm/overview/) |

## O que um Atomical nao e

- Nao e prova de quem criou algo. Um ticker ou um nome de Realm e uma alocacao, nao uma verificacao
  de identidade.
- Nao e uma conta de contrato. Nao existe linha de saldo a debitar.
- Nao e seguro deduzir a partir dos metadados. Metadados sao dados arbitrarios fornecidos por quem
  emitiu.
- Nao esta final porque o Bitcoin confirmou. Veja
  [confirmacao e reorganizacoes](/protocol/core/confirmation-and-reorgs/).
