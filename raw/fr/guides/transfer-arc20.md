# Transferer de l ARC-20

Construisez un transfert qui place chaque unite ou vous le voulez et ne brule rien.

Page ID: guides/transfer-arc20
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet
Verified: 2026-08-31
Locale: fr
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/fr/guides/transfer-arc20/

---
## Avant de commencer

- Reseaux pris en charge : mainnet.
- Etat : comportement de protocole.
- Il vous faut un portefeuille ou un constructeur qui travaille en outpoints et en valeurs en
  satoshis, pas dans un champ de montant.

Les tailles sont en satoshis, pas dans une case de montant du jeton. Trompez-vous sur une seule et
le reste brule.

## La forme qui fonctionne

| Position | Contenu |
| --- | --- |
| Entree 0 | Le lot colore |
| Entree 1 et suivantes | Entrees cardinales pour les frais |
| Sortie 0 | Le destinataire, dimensionnee exactement aux unites envoyees |
| Sortie 1 | Monnaie coloree, dimensionnee exactement au reste |
| Sortie 2 | Monnaie cardinale, s il y en a |

## La procedure

1. Listez vos outpoints colores et choisissez le lot a depenser.
2. Decidez du montant a envoyer. Ce nombre est aussi la valeur en satoshis de la sortie 0.
3. Calculez le reste : valeur du lot moins montant envoye. C est la valeur en satoshis de la
   sortie 1.
4. Modelisez l ensemble exact d entrees et de sorties dans le
   [visualiseur d attribution](/tools/allocation-visualizer/).
5. Confirmez que le chiffre de brulure est zero.
6. Ajoutez des entrees cardinales pour les frais et une sortie de monnaie cardinale a la fin.
7. Modelisez de nouveau avec les entrees et sorties de frais incluses. Le chiffre de brulure doit
   toujours etre zero.
8. Construisez la transaction en preservant l ordre des entrees et des sorties.
9. Comparez l invite du portefeuille a votre modele, ligne par ligne.
10. Signez et diffusez.

## Pourquoi l etape sept existe

Ajouter une entree de frais ou une sortie de monnaie change l ensemble des sorties, et l attribution
parcourt les sorties dans l ordre. Un transfert propre avant que le portefeuille n ajoute la monnaie
peut bruler apres.

## Les deux vecteurs qui montrent le risque

Meme intention, meme lot, meme montant envoye. La seule difference est la taille de la sortie de
monnaie, et l une des deux detruit 200 unites.

## Cout

Des frais Bitcoin, payes depuis une entree cardinale. Pas de paire commit et reveal, et pas de
minage, pour un transfert ordinaire.

## En cas d echec

- Le portefeuille ne vous laisse pas fixer les valeurs de sortie en satoshis : utilisez un autre
  constructeur.
- Le portefeuille reordonne les sorties : utilisez un autre constructeur. L ordre est le sens.
- Le chiffre de brulure n est pas zero : changez les tailles des sorties, ne continuez pas.

## Apres diffusion

Confirmez, attendez l indexation, lisez l emplacement de l actif et verifiez le chiffre de brulure
enregistre. Voir [verifier une transaction](/guides/verify-a-transaction/).

## Source

[Attribution](/protocol/arc20/allocation/) et [brulures](/protocol/arc20/burns/).
