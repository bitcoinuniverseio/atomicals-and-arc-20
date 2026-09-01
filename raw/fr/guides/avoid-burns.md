# Eviter les brulures

La procedure pratique qui evite toutes les formes de brulure, avec les cas executes qui montrent a quoi chacune ressemble.

Page ID: guides/avoid-burns
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet
Verified: 2026-08-31
Locale: fr
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/fr/guides/avoid-burns/

---
## Avant de commencer

- Reseaux pris en charge : mainnet.
- Etat : comportement de protocole.
- La prevention est le seul controle. Il n y a pas de recuperation.

## La procedure

1. Travaillez en outpoints et en satoshis. Jamais dans une case de montant du jeton.
2. Deplacez un jeton par transaction, sauf si vous avez modelise le cas a plusieurs.
3. Incluez toujours une sortie de monnaie coloree lorsque le lot depasse ce que vous envoyez.
4. Dimensionnez la sortie de monnaie **exactement** au reste.
5. Modelisez l ensemble exact d entrees et de sorties, dans l ordre, avant de construire.
6. Confirmez que le chiffre de brulure calcule est zero.
7. Ajoutez les entrees de frais et la monnaie cardinale, puis modelisez de nouveau.
8. Confirmez que le chiffre de brulure est toujours zero.
9. Comparez l invite du portefeuille a votre modele, ligne par ligne, avant de signer.

Les etapes sept et huit sont celles que l on saute, et ce sont celles ou la monnaie ajoutee par le
portefeuille change le resultat sans prevenir.

## Les quatre formes, executees

| Forme | Prevention |
| --- | --- |
| Sortie suivante trop grande | Dimensionnez la monnaie exactement au reste |
| Sorties insuffisantes | Incluez toujours de la monnaie coloree |
| Premiere sortie plus grande que le lot | N envoyez jamais un petit lot vers un gros premier paiement |
| Repli a plusieurs jetons | Un jeton par transaction |

Une adresse de depot d une plateforme d echange, un portefeuille Bitcoin ordinaire ou tout service
sans support Atomicals depense la sortie comme du bitcoin ordinaire. Les unites disparaissent, et
aucun enregistrement de brulure ne vous consolera. Verifiez que la destination prend en charge
Atomicals avant d envoyer.

## Le seul cas ou une brulure est deliberee

Detruire des unites volontairement est une action valide. Faites-le explicitement : construisez la
transaction qui brule exactement ce que vous voulez, confirmez le chiffre et notez pourquoi. Ne
comptez jamais sur une brulure accidentelle.

## Apres diffusion

Lisez la transaction via une source qui signale les brulures et confirmez que le chiffre est celui
attendu. Comparez le total colore d entree a la somme des totaux colores de sortie.

## Source

[Brulures](/protocol/arc20/burns/) et [attribution](/protocol/arc20/allocation/).
