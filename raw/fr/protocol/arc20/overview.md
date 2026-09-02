# ARC-20

Le modele ARC-20 complet en une page, de l emission a l attribution et a la limite de securite, avec des liens vers la regle exacte de chaque partie.

Page ID: protocol/arc20/overview
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: fr
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/fr/protocol/arc20/overview/

---
ARC-20 est le modele de jetons fongibles d Atomicals sur Bitcoin. Une unite est un satoshi colore.
Tout le reste en decoule.

## Le modele complet en sept affirmations

1. Une unite est un satoshi dans une sortie qu un validateur reconnait comme coloree pour un jeton.
2. L offre se mesure donc en satoshis, et elle est bornee par du bitcoin reel.
3. L emission a lieu une fois, directement, ou de facon repetee via un deploiement contre lequel d
   autres frappent.
4. Un ticker est un nom attribue globalement, resolu vers exactement un Atomical.
5. Un transfert est une attribution sur les entrees et sorties de la transaction, dans l ordre.
6. La valeur qui ne peut pas etre placee dans une sortie eligible est detruite.
7. Les totaux colores de sortie ne peuvent jamais depasser les totaux colores d entree.

Lisez [brulures](/protocol/arc20/burns/) avant de construire ou de signer quoi que ce soit.

## Ou chaque regle est documentee

| Domaine | Page |
| --- | --- |
| Le modele d unite et pourquoi les decimales ne creent pas de fractions | [Modele d unite](/protocol/arc20/unit-model/) |
| Attribution des tickers, candidats et gagnants verifies | [Tickers et candidats](/protocol/arc20/tickers-and-candidates/) |
| Emission d une offre complete en une etape | [Emission directe](/protocol/arc20/direct-issuance/) |
| Deploiements avec un nombre fixe de frappes | [DFT fixe](/protocol/arc20/fixed-dft/) |
| Reclamer une frappe contre un deploiement | [Frappe decentralisee](/protocol/arc20/decentralized-mint/) |
| Deploiements progressifs conditionnes a l activation | [DFT perpetuel](/protocol/arc20/perpetual-dft/) |
| Exigences de travail sur commit et reveal | [Exigences Bitwork](/protocol/arc20/bitwork-requirements/) |
| Metadonnees optionnelles et decimales de presentation | [Metadonnees et decimales](/protocol/arc20/metadata-and-decimals/) |
| Comment la valeur est placee dans les sorties | [Attribution](/protocol/arc20/allocation/) |
| Separer et recombiner des lots colores | [Diviser et combiner](/protocol/arc20/split-and-combine/) |
| Comment la valeur est detruite | [Brulures](/protocol/arc20/burns/) |
| Deplacer des jetons et les echanger de facon atomique | [Transferts et echanges](/protocol/arc20/transfers-and-swaps/) |
| Ce qu un PSBT doit contenir | [Exigences PSBT](/protocol/arc20/psbt-requirements/) |
| Ce qu un portefeuille doit faire pour etre sur | [Securite du portefeuille](/protocol/arc20/wallet-safety/) |
| L etat du materiel du Substantiation Factor | [Substantiation Factor](/protocol/arc20/substantiation-factor/) |

## Ce que ARC-20 n est pas

- Ce n est pas un contrat ERC-20. Il n y a ni contrat ni compte.
- Ce n est pas un solde d inscription. La valeur est la valeur en satoshis des sorties, pas un
  nombre ecrit en texte.
- Ce n est pas un droit sur quoi que ce soit. Rien ne garantit une unite sauf accord juridique
  distinct, et frapper n en cree aucun.
- Ce n est pas une norme ARC-721. Aucune source officielle trouvee pendant la revue n en etablit
  une.

## Limite du produit Universe

Le protocole prend en charge l emission directe `mint-ft`. Aucune surface produit Universe ne l
expose aujourd hui. Universe expose la resolution de ticker verifie, les details de jeton, les
detenteurs, l activite confirmee, les soldes de portefeuille, les UTXO colorees et les flux
Marketplace v1. Voir [etat et limitations connues](/start/status-and-limitations/).
