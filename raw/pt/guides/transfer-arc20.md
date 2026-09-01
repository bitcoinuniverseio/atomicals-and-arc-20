# Transferir ARC-20

Construa uma transferencia que coloca cada unidade onde pretende e nao queima nada.

Page ID: guides/transfer-arc20
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet
Verified: 2026-08-31
Locale: pt
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/pt/guides/transfer-arc20/

---
## Antes de comecar

- Redes suportadas: mainnet.
- Estado: comportamento de protocolo.
- Precisa de uma carteira ou construtor que trabalhe em outpoints e valores em satoshis, nao num
  campo de montante.

Os tamanhos sao em satoshis, nao numa caixa de montante do token. Erre um e o resto queima.

## A forma que funciona

| Posicao | Conteudo |
| --- | --- |
| Entrada 0 | O lote colorido |
| Entrada 1 e seguintes | Entradas cardinais para a taxa |
| Saida 0 | O destinatario, dimensionada exatamente para as unidades que envia |
| Saida 1 | Troco colorido, dimensionado exatamente para o resto |
| Saida 2 | Troco cardinal, se existir |

## O procedimento

1. Liste os seus outpoints coloridos e escolha o lote a gastar.
2. Decida o montante a enviar. Esse numero e tambem o valor em satoshis da saida 0.
3. Calcule o resto: valor do lote menos montante enviado. Esse e o valor em satoshis da saida 1.
4. Modele o conjunto exato de entradas e saidas no
   [visualizador de alocacao](/tools/allocation-visualizer/).
5. Confirme que o valor queimado e zero.
6. Adicione entradas cardinais para a taxa e uma saida de troco cardinal no fim.
7. Modele de novo com as entradas e saidas de taxa incluidas. O valor queimado tem de continuar a
   ser zero.
8. Construa a transacao, preservando a ordem das entradas e das saidas.
9. Compare o pedido da carteira com o seu modelo, linha a linha.
10. Assine e difunda.

## Por que o passo sete existe

Adicionar uma entrada de taxa ou uma saida de troco muda o conjunto de saidas, e a alocacao percorre
as saidas por ordem. Uma transferencia que estava limpa antes de a carteira adicionar troco pode
queimar depois.

## Os dois vetores que mostram o risco

A mesma intencao, o mesmo lote, o mesmo montante enviado. A unica diferenca e o tamanho da saida de
troco, e uma delas destroi 200 unidades.

## Custo

Uma taxa Bitcoin, paga a partir de uma entrada cardinal. Sem par commit e reveal, e sem mineracao,
para uma transferencia comum.

## Se falhar

- A carteira nao o deixa definir valores de saida em satoshis: use outro construtor.
- A carteira reordena as saidas: use outro construtor. A ordem e o significado.
- O valor queimado nao e zero: mude os tamanhos das saidas, nao prossiga.

## Depois de difundir

Confirme, aguarde a indexacao, leia a localizacao do ativo e verifique o valor queimado registado.
Veja [verificar uma transacao](/guides/verify-a-transaction/).

## Fonte

[Alocacao](/protocol/arc20/allocation/) e [queimas](/protocol/arc20/burns/).
