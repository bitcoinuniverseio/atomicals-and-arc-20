# Qu est-ce que ARC-20 ?

Le modele de jetons fongibles d Atomicals, ou une unite est un satoshi colore et un transfert est un probleme d attribution, pas une mise a jour de compte.

Page ID: start/what-is-arc-20
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: fr
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/fr/start/what-is-arc-20/

---
ARC-20 est le modele de jetons fongibles a l interieur d Atomicals. Sa regle est courte :

> **Une unite ARC-20 est un satoshi dans une sortie Bitcoin qu un validateur reconnait comme
> coloree.**

Cette seule phrase decide de tout le reste. L offre se mesure en satoshis. Un transfert est une
question sur les sorties qui recoivent quelle valeur. La valeur qui ne peut pas etre placee est
detruite.

## Pourquoi ce n est pas un solde de compte

Dans un modele de comptes, un transfert soustrait d une ligne et ajoute a une autre, et la
transaction reussit ou echoue. En ARC-20 la transaction reussit sur Bitcoin dans tous les cas. Ce
qui change, c est ou atterrit la valeur coloree.

| Question | Modele de comptes | ARC-20 |
| --- | --- | --- |
| Ou est le solde ? | Dans une ligne d un registre | Reparti sur vos sorties non depensees |
| Qu est-ce qu un transfert ? | Debit et credit | Attribuer la valeur d entree aux sorties, dans l ordre |
| La valeur peut-elle disparaitre ? | Non | Oui. La valeur qui ne tient pas est brulee |
| Qui decide du resultat ? | Le contrat | La revision du validateur que votre indexeur execute |
| Confirmation signifie reussite ? | Oui | Non. Confirmation et attribution sont deux reponses distinctes |

Si la prochaine sortie eligible est plus grande que la valeur coloree restant a placer, cette
valeur n est pas reportee. Elle est brulee. Ce n est pas un etat d erreur sur Bitcoin : la
transaction confirme normalement. Lisez [brulures](/protocol/arc20/burns/) avant de deplacer quoi
que ce soit.

## Les trois facons dont les unites viennent a exister

| Mode | Operation | Forme |
| --- | --- | --- |
| Emission directe | `ft` | L offre entiere atterrit dans la sortie zero d une transaction |
| Decentralise fixe | `dft` puis `dmt` | Un deploiement fixe les regles, puis chaque demandeur frappe un montant fixe |
| Decentralise perpetuel | `dft` avec parametres perpetuels | Conditionne a l activation, avec Bitwork progressif et plafond global optionnel |

Voir [emission directe](/protocol/arc20/direct-issuance/),
[DFT fixe](/protocol/arc20/fixed-dft/) et
[DFT perpetuel](/protocol/arc20/perpetual-dft/).

## Ce qu un ticker signifie et ne signifie pas

Un ticker est un nom attribue globalement. Le gagner signifie que les regles Atomicals ont resolu un
candidat en un gagnant verifie. Cela ne signifie pas :

- que le projet est bien qui il dit etre ;
- que les metadonnees sont exactes ;
- que l image appartient a celui qui a frappe ;
- que quelqu un repond de l offre.

Conservez et affichez toujours l **Atomical ID** resolu a cote de tout ticker.
Voir [tickers et candidats](/protocol/arc20/tickers-and-candidates/).

## Les decimales ne creent pas de fractions

`decimals` est une metadonnee de presentation. Elle change la facon dont un portefeuille formate un
nombre a l ecran. Elle ne cree jamais d unites sous le satoshi. Les quantites natives ARC-20 sont
toujours entieres. Voir [metadonnees et decimales](/protocol/arc20/metadata-and-decimals/).
