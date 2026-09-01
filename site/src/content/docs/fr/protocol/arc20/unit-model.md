---
title: Le modele d unite
description: Un satoshi colore est une unite, l offre se mesure en satoshis, et les decimales servent uniquement a la presentation.
sidebar:
  order: 2
provenance:
  pageId: protocol/arc20/unit-model
  area: protocol
  audience: [everyone, developer]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: normalFtAllocation
    - id: atomicals-guide
      path: arc20
  verified: '2026-08-31'
  tags: [arc-20, units]
  translationSourceHash: 0e97ff4112c1dc00649dd483dd1b427ff83279aad5ed40de820813457a931eb7
---

## La regle

Une unite ARC-20 est un satoshi dans une sortie qu un validateur reconnait comme coloree pour ce
jeton. Les quantites natives sont entieres. Il n y a pas de division plus petite.

## Ce qui en decoule immediatement

**L offre, ce sont des satoshis.** Un jeton avec 100 000 000 unites a exige 100 000 000 satoshis,
soit un bitcoin, pour exister. Les grandes offres sont couteuses par construction.

**Les limites de poussiere s appliquent.** Une sortie que Bitcoin ne relaie pas ne peut pas porter
d unites. En pratique, une sortie coloree doit se situer au seuil de poussiere de son type de
script ou au-dessus.

**Les soldes sont des sommes, pas des valeurs stockees.** Le total d un portefeuille est la somme
des sorties colorees qu il peut depenser. Rien sur la chaine ne stocke ce total.

**Depenser est tout ou rien par sortie.** Il n y a pas de depense partielle. Deplacer une partie d
un lot signifie construire une transaction dont les sorties recoivent la division souhaitee.

## Chiffres travailles

| Deploiement | Montant par frappe | Frappes maximales | Emission maximale nominale | Bitcoin requis |
| --- | --- | --- | --- | --- |
| Petit | 1 000 sats | 10 000 | 10 000 000 unites | 0,1 BTC |
| Moyen | 10 000 sats | 21 000 | 210 000 000 unites | 2,1 BTC |
| Grand | 100 000 sats | 21 000 | 2 100 000 000 unites | 21 BTC |

L emission maximale nominale est `mint_amount * max_mints`. C est un plafond de ce que les
reclamations peuvent produire, pas une promesse que le plafond est atteint.

## Decimales

`decimals` est une metadonnee optionnelle qui indique a un portefeuille comment formater un nombre
pour un lecteur. Un jeton avec 100 000 unites et `decimals` a 2 peut s afficher comme 1 000,00. La
chaine detient toujours 100 000 unites entieres dans 100 000 satoshis colores.

Ne divisez jamais une quantite native par une puissance de dix avant d y faire de l arithmetique,
et ne laissez jamais un chiffre formate entrer dans un constructeur de transactions. Voir
[metadonnees et decimales](/protocol/arc20/metadata-and-decimals/).

## Poussiere et securite

Une sortie coloree proche du seuil de poussiere est fragile. Tout transfert qui doit laisser un
reste inferieur au seuil ne peut pas placer ce reste dans une nouvelle sortie, donc il brule.

Conseils pratiques :

- Gardez des lots de tailles qui se divisent proprement pour les transferts attendus.
- Preferez quelques gros lots a de nombreux lots de la taille de la poussiere.
- Modelisez toute division avant de la construire. Voir
  [visualiseur d attribution](/tools/allocation-visualizer/).
