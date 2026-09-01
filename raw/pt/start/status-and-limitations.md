# Estado e limitacoes conhecidas

O que esta ativo, o que esta em beta, o que e apenas proposta, o que nao esta exposto, e as limitacoes que conhecemos e nao escondemos.

Page ID: start/status-and-limitations
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: pt
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/pt/start/status-and-limitations/

---
## ARC-20

| Capacidade | Estado | Notas |
| --- | --- | --- |
| Resolucao de ticker verificado e detalhes do token | Implementacao Universe | O Atomical ID vencedor e publicado, nao apenas o nome |
| Instantaneos de detentores | Implementacao Universe | As linhas de detentores tem de somar exatamente a oferta em circulacao ou a varredura aborta |
| Historico de atividade confirmada | Implementacao Universe | Implantacao, emissao direta e descentralizada, transferencia, queima, operacoes de protocolo |
| Cobertura de atividade pendente | Limitada | Sem feed exaustivo de mempool com tratamento estavel do ciclo de vida pendente |
| Saldos de carteira e UTXOs coloridas | Implementacao Universe | Vistas de leitura, nao prova de liquidacao |
| Emissao direta `mint-ft` a partir de um produto Universe | Nao exposta | O protocolo suporta. Nenhuma superficie Universe oferece |
| Material do Substantiation Factor | Preliminar | Veja [Substantiation Factor](/protocol/arc20/substantiation-factor/) |

A fonte ARC-20 reporta cobertura `partial` com uma razao explicita: historico confirmado
autoritativo e instantaneos completos e provados de detentores estao indexados, mas o adaptador
enviado nao tem um feed exaustivo de mempool com tratamento estavel do ciclo de vida pendente e do
desaparecimento. Essa limitacao aplica-se apenas a atividade pendente. Nao enfraquece a varredura
confirmada nem os requisitos de prova de detentores.

## Atomicals NFTs, Realms e Subrealms

| Capacidade | Estado | Notas |
| --- | --- | --- |
| Modelo de leitura de NFT simples, Realm e Subrealm | Implementacao Universe | Uma varredura, geracao, ponto de controlo e ponteiro ativo partilhados |
| Resolucao de Realm, hierarquia e listagem de Subrealms | Implementacao Universe | Evidencia de candidatura e pagamento retida por ativo |
| Consulta por transacao, bloco e UTXO | Implementacao Universe | Limitada a geracao ativa |
| Entrega de midia com verificacao de integridade | Implementacao Universe | Restricoes de MIME e limites de tamanho aplicam-se |
| Tokens fungiveis nesta projecao | Excluidos por desenho | Servidos pelo lado ARC-20 |
| Containers e itens DMINT nesta projecao | Excluidos por desenho | Declarado no manifesto de proveniencia do indice |
| Operacoes de escrita | Nenhuma | A projecao e apenas de leitura |

## Mercado

| Capacidade | Estado | Notas |
| --- | --- | --- |
| Quatro autoridades de protocolo isoladas | Implementacao Universe | `arc20`, `atomicals_nft`, `realms`, `subrealms` |
| Anuncio, reserva, compra, oferta, liquidacao | Implementacao Universe | Cada portao de acao esta desligado por omissao |
| Prova de posse | Implementacao Universe | Prova BIP-322 simples para P2WPKH e P2TR por caminho de chave |
| Colateral misto, queimas, saidas gastas, desvio de ponto de controlo | Rejeitados | As quatro vias falham fechadas |
| Aliases legados `/buys` e `/orders/{orderId}/reconcile` | Descontinuados | Use `/reservations`, `/purchases`, `/settlements` |

## AVM

| Camada | Estado |
| --- | --- |
| Conceitos arquiteturais do white paper | Proposto |
| Interpretador beta oficial | Experimental ou beta |
| Integracao no runtime Universe | Nao exposta |
| Atestacao do runtime Universe | Nenhuma publicada |

Nada sobre o AVM neste site deve ser lido como suporte de producao em mainnet. Veja
[estado e limitacoes do AVM](/protocol/avm/status-and-limitations/).

## Limitacoes que conhecemos

1. A atividade ARC-20 pendente nao tem cobertura exaustiva. O historico confirmado tem.
2. Containers e DMINT estao documentados como comportamento de protocolo. Nenhuma projecao de
   leitura Universe os expoe hoje.
3. A emissao direta de FT e comportamento de protocolo sem superficie de produto Universe.
4. O AVM esta em beta a montante e nao esta exposto aqui. Qualquer alegacao de implementacao
   exigiria uma atestacao que nao publicamos.
5. Alguns servicos do ecossistema Atomicals listados no [registo](/ecosystem/) nao puderam ser
   verificados a partir de uma fonte alcancavel. Essas linhas dizem `unknown` em vez de adivinhar.
6. Limites de taxa sao documentados apenas onde existem de facto. Onde um servico nao tem nenhum, a
   pagina diz isso em vez de inventar uma politica.

## Como reportar algo errado

Abra uma issue no [repositorio da documentacao](https://github.com/bitcoinuniverseio/atomicals-and-arc-20/issues).
Use o modelo **incorrect protocol claim** ou **API mismatch** e inclua o page ID do painel de
fontes.
