# Queimas

Como o valor ARC-20 e destruido, as quatro formas que o causam, e as verificacoes que evitam cada uma delas.

Page ID: protocol/arc20/burns
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet
Verified: 2026-08-31
Locale: pt
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/pt/protocol/arc20/burns/

---
Uma queima e valor colorido que um validador nao conseguiu colocar em nenhuma saida elegivel. Fica
registado como destruido. A transacao Bitcoin que a causou e valida, minerada e confirmada.

Unidades queimadas nao vao para lado nenhum. Nao existe endereco que as detenha nem procedimento
que as devolva. A prevencao e o unico controlo.

## As quatro formas que causam uma queima

### 1. A proxima saida e demasiado grande

A mais comum. Faltam colocar 500 unidades e a proxima saida tem 546 satoshis. Nao cabe, por isso as
500 unidades sao destruidas.

**Prevencao.** Dimensione a saida de troco exatamente para o resto que pretende manter.

### 2. Nao ha saidas suficientes

Todas as saidas foram cobertas e ainda sobra valor. Nao resta nada onde o colocar.

**Prevencao.** Inclua sempre uma saida de troco colorida quando as entradas excedem o que esta a
enviar.

### 3. A primeira saida e maior do que o lote inteiro

Nada pode ser colocado, por isso o lote inteiro queima.

**Prevencao.** Nunca envie um lote colorido pequeno para uma transacao cuja primeira saida e um
pagamento cardinal grande.

### 4. O recuo reorganizou uma transacao com varios tokens

Um token nao pode ser colocado de forma limpa, por isso o construtor reiniciou todos os tokens a
partir da saida zero e outro token perdeu o seu lugar.

**Prevencao.** Mova um token por transacao, a menos que tenha modelado o caso com varios.

## Casos executados

## As verificacoes que evitam as quatro

1. Calcule a atribuicao esperada antes de assinar, nao depois.
2. Confirme que o valor queimado e zero.
3. Dimensione cada saida colorida deliberadamente, em satoshis.
4. Mantenha as entradas de taxa cardinais e separadas.
5. Mova um token por transacao, a menos que tenha uma razao para nao o fazer.
6. Verifique de novo apos qualquer alteracao ao conjunto de saidas, incluindo troco adicionado pela
   carteira.

Use o [visualizador de alocacao](/tools/allocation-visualizer/) para os passos um e dois.

## Detetar uma queima depois do facto

Um validador regista as queimas por transacao. Leia a transacao atraves de uma fonte que as reporte
e compare o total colorido de entrada com a soma dos totais coloridos de saida. Qualquer diferenca
e uma queima.

O feed de atividade ARC-20 da Universe publica registos de queima entre a sua atividade confirmada.
Veja [API ARC-20](/reference/api/arc20/).
