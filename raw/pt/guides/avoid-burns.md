# Evitar queimas

O procedimento pratico que evita todas as formas de queima, com os casos executados que mostram como cada uma se parece.

Page ID: guides/avoid-burns
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet
Verified: 2026-08-31
Locale: pt
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/pt/guides/avoid-burns/

---
## Antes de comecar

- Redes suportadas: mainnet.
- Estado: comportamento de protocolo.
- A prevencao e o unico controlo. Nao existe recuperacao.

## O procedimento

1. Trabalhe em outpoints e satoshis. Nunca numa caixa de montante do token.
2. Mova um token por transacao, a menos que tenha modelado o caso com varios.
3. Inclua sempre uma saida de troco colorida quando o lote excede o que esta a enviar.
4. Dimensione a saida de troco **exatamente** para o resto.
5. Modele o conjunto exato de entradas e saidas, por ordem, antes de construir.
6. Confirme que o valor queimado calculado e zero.
7. Adicione as entradas de taxa e o troco cardinal, e modele de novo.
8. Confirme que o valor queimado continua a ser zero.
9. Compare o pedido da carteira com o seu modelo, linha a linha, antes de assinar.

Os passos sete e oito sao os que as pessoas saltam, e sao onde o troco adicionado pela carteira
muda o resultado sem aviso.

## As quatro formas, executadas

| Forma | Prevencao |
| --- | --- |
| Proxima saida demasiado grande | Dimensione o troco exatamente para o resto |
| Saidas insuficientes | Inclua sempre troco colorido |
| Primeira saida maior do que o lote | Nunca envie um lote pequeno para um primeiro pagamento grande |
| Recuo com varios tokens | Um token por transacao |

Um endereco de deposito de uma exchange, uma carteira Bitcoin comum ou qualquer servico sem suporte
Atomicals gasta a saida como bitcoin comum. As unidades desaparecem, e nenhum registo de queima o
vai consolar. Verifique se o destino suporta Atomicals antes de enviar.

## O unico caso em que uma queima e deliberada

Destruir unidades de proposito e uma acao valida. Faca-o explicitamente: construa a transacao que
queima exatamente o que pretende, confirme o valor e registe a razao. Nunca dependa de uma queima
acidental.

## Depois de difundir

Leia a transacao atraves de uma fonte que reporte queimas e confirme que o valor e o que esperava.
Compare o total colorido de entrada com a soma dos totais coloridos de saida.

## Fonte

[Queimas](/protocol/arc20/burns/) e [alocacao](/protocol/arc20/allocation/).
