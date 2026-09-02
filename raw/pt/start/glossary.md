# Glossario

Todos os termos Atomicals e ARC-20 usados neste site, definidos uma vez e usados de forma consistente em todo o lado.

Page ID: start/glossary
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: pt
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/pt/start/glossary/

---
Os termos deste glossario sao os usados em todo o site e em todas as traducoes. Identificadores de
codigo, nomes de propriedades de esquema, nomes de operacoes e hashes nunca sao traduzidos.

## Nucleo

**Atomical**
: Um objeto digital criado por uma transacao Bitcoin e carregado por uma saida Bitcoin.

**Atomical ID**
: A identidade duravel de um Atomical, escrita como `<txid>i<indice-da-saida>`. Atribuida uma vez, nunca muda.

**Numero do Atomical**
: Um numero sequencial atribuido pela ordem de emissao. Util para apresentacao. Nao e a identidade a guardar.

**Localizacao**
: A saida nao gasta que carrega um Atomical neste momento. Muda a cada movimento.

**Envelope**
: A estrutura de script na testemunha que carrega `atom`, uma operacao e um payload CBOR na transacao de reveal.

**Operacao**
: O codigo curto dentro do envelope que diz ao validador o que fazer. Exemplos: `ft`, `dft`, `dmt`, `nft`, `mod`, `sl`.

**Commit e reveal**
: O padrao de duas transacoes. O commit paga a uma saida Taproot; o reveal gasta-a e expoe o envelope.

**Bitwork**
: Um requisito de prefixo no estilo de prova de trabalho sobre um id de transacao, usado para condicionar emissoes e reivindicacoes.

**Candidato**
: Uma reivindicacao pendente de um nome ou ticker alocado globalmente, antes de as regras resolverem um vencedor.

**Vencedor verificado**
: O Atomical que as regras resolveram como detentor de um nome ou ticker.

**Geracao**
: Um instantaneo imutavel de um indice numa posicao consistente da cadeia.

**Reorganizacao**
: Uma reorganizacao da cadeia Bitcoin que pode invalidar resultados previamente indexados.

## ARC-20

**ARC-20**
: O modelo de tokens fungiveis da Atomicals. Uma unidade e um satoshi colorido.

**Ticker**
: Um nome ARC-20 alocado globalmente. Nao e prova da identidade de quem o criou.

**UTXO colorida**
: Uma saida Bitcoin que um validador reconhece como portadora de valor ARC-20.

**UTXO cardinal**
: Uma saida Bitcoin comum sem valor Atomicals. Usada para taxas e troco.

**FT direto**
: Uma emissao `ft` num passo que coloca a oferta inteira na saida zero.

**DFT**
: Uma implantacao de token fungivel descentralizado criada com `dft`.

**Reivindicacao DMT**
: Uma unica emissao contra uma implantacao DFT, usando a operacao `dmt`.

**DFT perpetuo**
: Um modo descentralizado condicionado a ativacao, com Bitwork progressivo e limite global opcional.

**Montante por emissao**
: O valor exato em satoshis que cada reivindicacao DMT valida coloca na saida zero.

**Emissoes maximas**
: O numero de reivindicacoes validas em modo fixo que uma implantacao permite.

**Alocacao**
: A decisao do validador sobre qual saida recebe quanto valor colorido.

**Alocacao normal**
: O comportamento de coloracao por omissao quando nenhum payload de operacao o altera.

**Queima**
: Valor colorido que nao pode ser colocado em nenhuma saida elegivel e e portanto destruido.

**Divisao**
: A operacao `y`, que separa valor fungivel numa saida.

**Coloracao personalizada**
: A operacao `z`, condicionada a ativacao, que atribui valor colorido explicitamente.

**Splat**
: A operacao `x` no ramo nao fungivel, que separa varios Atomicals detidos numa saida.

**Validacao de nao inflacao**
: A regra de que os totais coloridos de saida nao podem exceder os totais coloridos de entrada.

## Nomes e colecoes

**Container**
: Uma identidade de colecao nomeada cuja pertenca os itens conseguem provar.

**DMINT**
: Emissao descentralizada de itens de Container contra um manifesto selado.

**Selagem**
: Tornar um Atomical ou um manifesto de Container permanentemente inalteravel.

**Realm**
: Um nome Atomicals de primeiro nivel detido como um NFT.

**Subrealm**
: Um nome filho reivindicado sob as regras de um Realm pai.

**Payname**
: Um Realm usado como destino de pagamento.

**IDNA**
: As regras de nomes de dominio internacionalizados usadas ao comparar e normalizar nomes.

**Confundivel**
: Dois nomes distintos que sao apresentados de forma suficientemente semelhante para enganar um leitor.

## Integracao

**Cursor**
: Um token de paginacao opaco e assinado que se refere a uma posicao estavel numa geracao.

**Prontidao**
: Se um servico consegue responder corretamente neste momento, distinto de estar configurado ou em execucao.

**Atualidade**
: Quanto um indice esta atrasado em relacao ao topo da cadeia.

**Chave de idempotencia**
: Uma chave fornecida pelo cliente que torna seguro repetir uma mutacao.

**Identificador de pedido**
: Um identificador por pedido devolvido nas respostas e nos registos, usado para rastrear uma chamada.

**PSBT**
: Uma transacao Bitcoin parcialmente assinada, o formato de troca entre um servico e uma carteira.

**BIP-322**
: Um esquema de assinatura de mensagens usado aqui para provar controlo de um endereco sem mover fundos.

**SIGHASH**
: A flag que decide a que partes de uma transacao uma assinatura se compromete.

## Termos que evitamos

Estas palavras aparecem em material de terceiros e nao sao usadas como afirmacoes neste site:
garantido, sem risco, respaldado, colateralizado, piso de preco, resgate. Onde uma fonte as usa, a
pagina cita a fonte e diz que evidencia existe.
