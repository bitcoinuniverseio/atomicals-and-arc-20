# O modelo de unidade

Um satoshi colorido e uma unidade, a oferta e medida em satoshis, e os decimais servem apenas para apresentacao.

Page ID: protocol/arc20/unit-model
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: pt
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/pt/protocol/arc20/unit-model/

---
## A regra

Uma unidade ARC-20 e um satoshi numa saida que um validador reconhece como colorida para esse
token. As quantidades nativas sao inteiras. Nao existe divisao menor.

## O que se segue imediatamente

**A oferta e satoshis.** Um token com 100 000 000 unidades exigiu 100 000 000 satoshis, ou seja um
bitcoin, para existir. Ofertas grandes sao caras por construcao.

**Limites de poeira aplicam-se.** Uma saida que o Bitcoin nao retransmite nao pode carregar
unidades. Na pratica, uma saida colorida tem de estar no limiar de poeira do seu tipo de script ou
acima dele.

**Saldos sao somas, nao valores guardados.** O total numa carteira e a soma das saidas coloridas
que ela consegue gastar. Nada na cadeia guarda esse total.

**Gastar e tudo ou nada por saida.** Nao existe gasto parcial. Mover parte de um lote significa
construir uma transacao cujas saidas recebem a divisao que pretende.

## Numeros trabalhados

| Implantacao | Montante por emissao | Emissoes maximas | Emissao maxima nominal | Bitcoin necessario |
| --- | --- | --- | --- | --- |
| Pequena | 1 000 sats | 10 000 | 10 000 000 unidades | 0,1 BTC |
| Media | 10 000 sats | 21 000 | 210 000 000 unidades | 2,1 BTC |
| Grande | 100 000 sats | 21 000 | 2 100 000 000 unidades | 21 BTC |

A emissao maxima nominal e `mint_amount * max_mints`. E um teto do que as reivindicacoes podem
produzir, nao uma promessa de que o teto e atingido.

## Decimais

`decimals` e metadado opcional que diz a uma carteira como formatar um numero para um leitor. Um
token com 100 000 unidades e `decimals` de 2 pode ser mostrado como 1 000,00. A cadeia continua a
ter 100 000 unidades inteiras em 100 000 satoshis coloridos.

Nunca divida uma quantidade nativa por uma potencia de dez antes de fazer aritmetica com ela, e
nunca deixe um valor formatado entrar num construtor de transacoes. Veja
[metadados e decimais](/protocol/arc20/metadata-and-decimals/).

## Poeira e seguranca

Uma saida colorida perto do limiar de poeira e fragil. Qualquer transferencia que precise de deixar
um resto menor do que o limiar nao consegue colocar esse resto numa nova saida, por isso ele queima.

Orientacao pratica:

- Mantenha lotes com tamanhos que se dividam bem para as transferencias que espera fazer.
- Prefira poucos lotes maiores a muitos lotes do tamanho de poeira.
- Modele qualquer divisao antes de a construir. Veja
  [visualizador de alocacao](/tools/allocation-visualizer/).
