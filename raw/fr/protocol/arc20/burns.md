# Brulures

Comment la valeur ARC-20 est detruite, les quatre formes qui la causent, et les verifications qui evitent chacune d elles.

Page ID: protocol/arc20/burns
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet
Verified: 2026-08-31
Locale: fr
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/fr/protocol/arc20/burns/

---
Une brulure est de la valeur coloree qu un validateur n a pas pu placer dans une sortie eligible.
Elle est enregistree comme detruite. La transaction Bitcoin qui l a causee est valide, minee et
confirmee.

Les unites brulees ne vont nulle part. Aucune adresse ne les detient et aucune procedure ne les
rend. La prevention est le seul controle.

## Les quatre formes qui causent une brulure

### 1. La sortie suivante est trop grande

La plus courante. Il reste 500 unites a placer et la sortie suivante fait 546 satoshis. Cela ne
tient pas, donc les 500 unites sont detruites.

**Prevention.** Dimensionnez la sortie de monnaie exactement au reste que vous voulez garder.

### 2. Il n y a pas assez de sorties

Toutes les sorties ont ete couvertes et il reste de la valeur. Il ne reste rien ou la placer.

**Prevention.** Incluez toujours une sortie de monnaie coloree lorsque les entrees depassent ce que
vous envoyez.

### 3. La premiere sortie est plus grande que le lot entier

Rien ne peut etre place, donc le lot entier brule.

**Prevention.** N envoyez jamais un petit lot colore dans une transaction dont la premiere sortie
est un gros paiement cardinal.

### 4. Le repli a reorganise une transaction a plusieurs jetons

Un jeton n a pas pu etre place proprement, donc le constructeur a redemarre tous les jetons depuis
la sortie zero et un autre jeton a perdu sa place.

**Prevention.** Deplacez un jeton par transaction, sauf si vous avez modelise le cas a plusieurs.

## Cas executes

## Les verifications qui evitent les quatre

1. Calculez l attribution attendue avant de signer, pas apres.
2. Confirmez que le chiffre de brulure est zero.
3. Dimensionnez chaque sortie coloree deliberement, en satoshis.
4. Gardez les entrees de frais cardinales et separees.
5. Deplacez un jeton par transaction, sauf raison contraire.
6. Reverifiez apres toute modification de l ensemble des sorties, y compris la monnaie ajoutee par
   le portefeuille.

Utilisez le [visualiseur d attribution](/tools/allocation-visualizer/) pour les etapes un et deux.

## Detecter une brulure apres coup

Un validateur enregistre les brulures par transaction. Lisez la transaction via une source qui les
signale, et comparez le total colore d entree a la somme des totaux colores de sortie. Toute
difference est une brulure.

Le flux d activite ARC-20 d Universe publie les enregistrements de brulure parmi son activite
confirmee. Voir [API ARC-20](/reference/api/arc20/).
