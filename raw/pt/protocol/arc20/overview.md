# ARC-20

O modelo ARC-20 completo numa pagina, da emissao a alocacao e ao limite de seguranca, com ligacoes para a regra exata de cada parte.

Page ID: protocol/arc20/overview
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: pt
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/pt/protocol/arc20/overview/

---
ARC-20 e o modelo de tokens fungiveis da Atomicals no Bitcoin. Uma unidade e um satoshi colorido.
Tudo o resto decorre disso.

## O modelo completo em sete afirmacoes

1. Uma unidade e um satoshi numa saida que um validador reconhece como colorida para um token.
2. A oferta e portanto medida em satoshis, e limitada por bitcoin real.
3. A emissao acontece uma vez, diretamente, ou repetidamente atraves de uma implantacao contra a
   qual outros emitem.
4. Um ticker e um nome alocado globalmente, resolvido para exatamente um Atomical.
5. Uma transferencia e uma alocacao sobre as entradas e saidas da transacao, por ordem.
6. Valor que nao pode ser colocado numa saida elegivel e destruido.
7. Os totais coloridos de saida nunca podem exceder os totais coloridos de entrada.

Leia [queimas](/protocol/arc20/burns/) antes de construir ou assinar qualquer coisa.

## Onde cada regra esta documentada

| Area | Pagina |
| --- | --- |
| O modelo de unidade e por que os decimais nao criam fracoes | [Modelo de unidade](/protocol/arc20/unit-model/) |
| Alocacao de tickers, candidatos e vencedores verificados | [Tickers e candidatos](/protocol/arc20/tickers-and-candidates/) |
| Emissao de uma oferta completa num passo | [Emissao direta](/protocol/arc20/direct-issuance/) |
| Implantacoes com um numero fixo de emissoes | [DFT fixo](/protocol/arc20/fixed-dft/) |
| Reivindicar uma emissao contra uma implantacao | [Emissao descentralizada](/protocol/arc20/decentralized-mint/) |
| Implantacoes progressivas condicionadas a ativacao | [DFT perpetuo](/protocol/arc20/perpetual-dft/) |
| Requisitos de trabalho no commit e no reveal | [Requisitos de Bitwork](/protocol/arc20/bitwork-requirements/) |
| Metadados opcionais e decimais de apresentacao | [Metadados e decimais](/protocol/arc20/metadata-and-decimals/) |
| Como o valor e colocado nas saidas | [Alocacao](/protocol/arc20/allocation/) |
| Separar e recombinar lotes coloridos | [Dividir e combinar](/protocol/arc20/split-and-combine/) |
| Como o valor e destruido | [Queimas](/protocol/arc20/burns/) |
| Mover tokens e troca-los atomicamente | [Transferencias e trocas](/protocol/arc20/transfers-and-swaps/) |
| O que um PSBT tem de conter | [Requisitos de PSBT](/protocol/arc20/psbt-requirements/) |
| O que uma carteira tem de fazer para ser segura | [Seguranca da carteira](/protocol/arc20/wallet-safety/) |
| O estado do material do Substantiation Factor | [Substantiation Factor](/protocol/arc20/substantiation-factor/) |

## O que ARC-20 nao e

- Nao e um contrato ERC-20. Nao existe contrato nem conta.
- Nao e um saldo de inscricao. O valor e o valor em satoshis das saidas, nao um numero escrito em
  texto.
- Nao e um direito sobre nada. Nada suporta uma unidade a menos que exista um acordo juridico
  separado, e a emissao nao cria nenhum.
- Nao e um padrao ARC-721. Nenhuma fonte oficial localizada durante a revisao estabelece um.

## Limite do produto Universe

O protocolo suporta emissao direta `mint-ft`. Nenhuma superficie de produto Universe a expoe hoje.
A Universe expoe resolucao de ticker verificado, detalhes de token, detentores, atividade
confirmada, saldos de carteira, UTXOs coloridas e fluxos do Marketplace v1.
Veja [estado e limitacoes conhecidas](/start/status-and-limitations/).
