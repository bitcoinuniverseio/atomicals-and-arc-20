# Fundamentos de seguranca

As oito verificacoes que separam uma transacao Atomicals limpa de uma perda permanente, e as quatro afirmacoes que nunca deve aceitar como prova.

Page ID: start/safety-fundamentals
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: pt
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/pt/start/safety-fundamentals/

---
A maioria das perdas em Atomicals nao sao exploracoes. Sao transacoes Bitcoin comuns que gastaram
uma saida colorida da forma como uma carteira comum o faria.

## Nunca faca isto

- Nunca entregue uma frase semente, uma chave privada ou um ficheiro de exportacao da carteira a
  nada, incluindo a nos. Nenhuma verificacao legitima precisa deles.
- Nunca deixe uma carteira Bitcoin generica escolher entradas de taxa a partir de um conjunto que
  inclua as suas saidas coloridas.
- Nunca trate um ticker, uma imagem, um nome ou um anuncio de mercado como prova de quem criou algo.
- Nunca trate a resposta de um indexador como verdade final. E a opiniao de uma versao num momento.

## As oito verificacoes antes de assinar

1. **Quais saidas estao coloridas?** Identifique os outpoints exatos que carregam o ativo. Se a sua
   carteira nao consegue dizer, pare.
2. **Qual e a ordem das entradas?** A alocacao percorre entradas e saidas por ordem. A ordem muda o
   resultado.
3. **Quanto vale cada saida em satoshis?** Nao em unidades do token. Em satoshis.
4. **Qual e a ordem das saidas?** A saida zero e especial para emissoes e para a maioria das formas
   de transferencia.
5. **Quanto aterra onde?** Cada saida deve ter um valor esperado em unidades antes de assinar.
6. **O que e queimado?** Se algum valor nao puder ser colocado, e destruido. Deve ser zero, a menos
   que tenha essa intencao.
7. **De onde vem a taxa?** De uma entrada cardinal separada, nunca da colorida.
8. **O que diz de facto o pedido da carteira?** Compare-o com a sua expectativa, linha a linha.

Enviar uma saida colorida para um endereco de deposito de uma exchange, para uma carteira Bitcoin
comum ou para qualquer servico que nao entenda Atomicals significa que o valor e gasto como bitcoin
comum. As unidades desaparecem. Nao existe caminho de recuperacao.

## Qual e o aspeto de uma queima

Uma queima nao e um erro. A transacao Bitcoin e valida, minerada e confirmada. As unidades
simplesmente nao tem para onde ir, e o validador regista-as como destruidas. Leia
[queimas](/protocol/arc20/burns/) para a regra exata e
[evitar queimas](/guides/avoid-burns/) para o procedimento pratico.

## Quatro afirmacoes que nao provam nada

| Afirmacao | O que prova de facto |
| --- | --- |
| O ticker corresponde | Que um nome foi alocado a algum Atomical. Nada sobre quem. |
| Os metadados dizem isso | Que alguem escreveu dados arbitrarios num payload. |
| Esta listado num mercado | Que alguem submeteu um anuncio. A posse e verificada a parte, na liquidacao. |
| O indexador mostra saldo | Que uma implementacao, numa geracao, acredita nisso. Verifique a versao e a atualidade. |

## Depois de difundir

1. Aguarde a confirmacao no Bitcoin.
2. Aguarde que o indice atinja essa altura e reporte uma geracao estavel.
3. Releia a localizacao do ativo e confirme que corresponde a saida pretendida.
4. Verifique as queimas registadas na transacao.

Confirmacao e indexacao sao duas respostas separadas.
Veja [confirmacoes e reorganizacoes](/guides/confirmations-and-reorgs/).

## Se algo ja correu mal

- Uma transacao rejeitada antes da difusao e recuperavel:
  [recuperar de uma rejeicao](/guides/recover-from-a-rejection/).
- Uma carteira que nao assina costuma ser um problema de capacidade ou de codificacao:
  [falhas de assinatura da carteira](/guides/wallet-signing-failures/).
- Um saldo que aparece a zero e muitas vezes um indice indisponivel, nao uma perda:
  [indice indisponivel ou saldo vazio](/guides/unavailable-indexer-vs-empty-balance/).
- Uma queima confirmada nao pode ser revertida. Nada neste site muda isso.
