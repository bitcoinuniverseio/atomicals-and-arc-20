# Fondamentaux de securite

Les huit verifications qui separent une transaction Atomicals propre d une perte definitive, et les quatre affirmations qu il ne faut jamais accepter comme preuve.

Page ID: start/safety-fundamentals
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: fr
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/fr/start/safety-fundamentals/

---
La plupart des pertes en Atomicals ne sont pas des exploits. Ce sont des transactions Bitcoin
ordinaires qui ont depense une sortie coloree comme un portefeuille ordinaire le ferait.

## Ne faites jamais ceci

- Ne donnez jamais de phrase de recuperation, de cle privee ou de fichier d export de portefeuille a
  quoi que ce soit, nous compris. Aucune verification legitime n en a besoin.
- Ne laissez jamais un portefeuille Bitcoin generique choisir des entrees de frais dans un ensemble
  qui contient vos sorties colorees.
- Ne traitez jamais un ticker, une image, un nom ou une annonce de marche comme une preuve de qui a
  cree quelque chose.
- Ne traitez jamais la reponse d un indexeur comme une verite definitive. C est l avis d une version
  a un instant donne.

## Les huit verifications avant de signer

1. **Quelles sorties sont colorees ?** Identifiez les outpoints exacts qui portent l actif. Si votre
   portefeuille ne peut pas vous le dire, arretez.
2. **Quel est l ordre des entrees ?** L attribution parcourt entrees et sorties dans l ordre. L
   ordre change le resultat.
3. **Combien vaut chaque sortie en satoshis ?** Pas en unites du jeton. En satoshis.
4. **Quel est l ordre des sorties ?** La sortie zero est particuliere pour les frappes et pour la
   plupart des formes de transfert.
5. **Combien atterrit ou ?** Chaque sortie doit avoir un chiffre attendu en unites avant signature.
6. **Qu est-ce qui brule ?** Si une valeur ne peut pas etre placee, elle est detruite. Cela doit
   etre zero, sauf intention contraire.
7. **D ou viennent les frais ?** D une entree cardinale distincte, jamais de la coloree.
8. **Que dit vraiment l invite du portefeuille ?** Comparez-la a votre attente, ligne par ligne.

Envoyer une sortie coloree vers une adresse de depot d une plateforme d echange, un portefeuille
Bitcoin ordinaire ou tout service qui ne comprend pas Atomicals signifie que la valeur est depensee
comme du bitcoin ordinaire. Les unites disparaissent. Il n existe aucune voie de recuperation.

## A quoi ressemble une brulure

Une brulure n est pas une erreur. La transaction Bitcoin est valide, minee et confirmee. Les unites
n ont simplement nulle part ou aller, alors le validateur les enregistre comme detruites. Lisez
[brulures](/protocol/arc20/burns/) pour la regle exacte et
[eviter les brulures](/guides/avoid-burns/) pour la procedure pratique.

## Quatre affirmations qui ne prouvent rien

| Affirmation | Ce qu elle prouve reellement |
| --- | --- |
| Le ticker correspond | Qu un nom a ete attribue a un Atomical. Rien sur qui. |
| Les metadonnees le disent | Que quelqu un a ecrit des donnees arbitraires dans un payload. |
| C est liste sur un marche | Que quelqu un a soumis une annonce. La propriete est verifiee a part, au reglement. |
| L indexeur affiche un solde | Qu une implementation, dans une generation, le croit. Verifiez la version et la fraicheur. |

## Apres la diffusion

1. Attendez la confirmation sur Bitcoin.
2. Attendez que l index atteigne cette hauteur et signale une generation stable.
3. Relisez l emplacement de l actif et confirmez qu il correspond a la sortie voulue.
4. Verifiez les brulures enregistrees dans la transaction.

Confirmation et indexation sont deux reponses distinctes.
Voir [confirmations et reorganisations](/guides/confirmations-and-reorgs/).

## Si quelque chose a deja mal tourne

- Une transaction rejetee avant diffusion est recuperable :
  [recuperer d un rejet](/guides/recover-from-a-rejection/).
- Un portefeuille qui refuse de signer est souvent un probleme de capacite ou d encodage :
  [echecs de signature du portefeuille](/guides/wallet-signing-failures/).
- Un solde a zero est souvent un index indisponible, pas une perte :
  [index indisponible ou solde vide](/guides/unavailable-indexer-vs-empty-balance/).
- Une brulure confirmee ne peut pas etre annulee. Rien sur ce site ne change cela.
