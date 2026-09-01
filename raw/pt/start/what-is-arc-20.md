# O que e ARC-20?

O modelo de tokens fungiveis da Atomicals, onde uma unidade e um satoshi colorido e uma transferencia e um problema de alocacao, nao uma atualizacao de conta.

Page ID: start/what-is-arc-20
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: pt
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/pt/start/what-is-arc-20/

---
ARC-20 e o modelo de tokens fungiveis dentro da Atomicals. A sua regra e curta:

> **Uma unidade ARC-20 e um satoshi numa saida Bitcoin que um validador reconhece como colorida.**

Essa unica frase decide tudo o resto. A oferta e medida em satoshis. Uma transferencia e uma
pergunta sobre quais saidas recebem quanto valor. O valor que nao pode ser colocado e destruido.

## Por que isto nao e um saldo de conta

Num modelo de contas, uma transferencia subtrai de uma linha e soma noutra, e a transacao tem
sucesso ou falha. No ARC-20 a transacao tem sucesso no Bitcoin de qualquer forma. O que muda e
onde o valor colorido aterra.

| Pergunta | Modelo de contas | ARC-20 |
| --- | --- | --- |
| Onde esta o saldo? | Numa linha de um livro-razao | Espalhado pelas suas saidas nao gastas |
| O que e uma transferencia? | Debito e credito | Atribuir valor de entrada as saidas, por ordem |
| O valor pode desaparecer? | Nao | Sim. O valor que nao cabe e queimado |
| Quem decide o resultado? | O contrato | A revisao do validador que o seu indexador executa |
| Confirmacao significa sucesso? | Sim | Nao. Confirmacao e alocacao sao respostas separadas |

Se a proxima saida elegivel for maior do que o valor colorido que falta colocar, esse valor nao e
transportado. E queimado. Isto nao e um estado de erro no Bitcoin: a transacao confirma
normalmente. Leia [queimas](/protocol/arc20/burns/) antes de mover qualquer coisa.

## As tres formas de as unidades passarem a existir

| Modo | Operacao | Formato |
| --- | --- | --- |
| Emissao direta | `ft` | A oferta inteira aterra na saida zero de uma transacao |
| Descentralizado fixo | `dft` depois `dmt` | Uma implantacao define as regras, depois cada reivindicante emite um montante fixo |
| Descentralizado perpetuo | `dft` com parametros perpetuos | Condicionado a ativacao, com Bitwork progressivo e limite global opcional |

Veja [emissao direta](/protocol/arc20/direct-issuance/),
[DFT fixo](/protocol/arc20/fixed-dft/) e
[DFT perpetuo](/protocol/arc20/perpetual-dft/).

## O que um ticker significa e o que nao significa

Um ticker e um nome alocado globalmente. Ganha-lo significa que as regras Atomicals resolveram um
candidato num vencedor verificado. Nao significa:

- que o projeto e quem diz ser;
- que os metadados estao corretos;
- que a imagem pertence a quem emitiu;
- que alguem responde pela oferta.

Guarde e mostre sempre o **Atomical ID** resolvido junto de qualquer ticker.
Veja [tickers e candidatos](/protocol/arc20/tickers-and-candidates/).

## Decimais nao criam fracoes

`decimals` e metadado de apresentacao. Muda como uma carteira formata um numero no ecra. Nunca cria
unidades abaixo do satoshi. As quantidades nativas ARC-20 sao sempre inteiras.
Veja [metadados e decimais](/protocol/arc20/metadata-and-decimals/).
