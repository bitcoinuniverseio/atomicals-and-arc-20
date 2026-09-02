# Glossaire

Tous les termes Atomicals et ARC-20 utilises sur ce site, definis une fois et employes de facon coherente partout.

Page ID: start/glossary
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: fr
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/fr/start/glossary/

---
Les termes de ce glossaire sont ceux utilises sur tout le site et dans toutes les traductions. Les
identifiants de code, les noms de proprietes de schema, les noms d operations et les hachages ne
sont jamais traduits.

## Noyau

**Atomical**
: Un objet numerique cree par une transaction Bitcoin et porte par une sortie Bitcoin.

**Atomical ID**
: L identite durable d un Atomical, ecrite `<txid>i<index-de-sortie>`. Attribuee une fois, ne change jamais.

**Numero de l Atomical**
: Un numero sequentiel attribue dans l ordre de frappe. Utile a l affichage. Ce n est pas l identite a conserver.

**Emplacement**
: La sortie non depensee qui porte un Atomical en ce moment. Change a chaque deplacement.

**Enveloppe**
: La structure de script dans le temoin qui porte `atom`, une operation et un payload CBOR dans la transaction de reveal.

**Operation**
: Le code court dans l enveloppe qui indique au validateur quoi faire. Exemples : `ft`, `dft`, `dmt`, `nft`, `mod`, `sl`.

**Commit et reveal**
: Le schema a deux transactions. Le commit paie vers une sortie Taproot ; le reveal la depense et expose l enveloppe.

**Bitwork**
: Une exigence de prefixe de type preuve de travail sur un identifiant de transaction, utilisee pour conditionner frappes et reclamations.

**Candidat**
: Une reclamation en attente d un nom ou d un ticker attribue globalement, avant que les regles ne designent un gagnant.

**Gagnant verifie**
: L Atomical que les regles ont designe comme detenteur d un nom ou d un ticker.

**Generation**
: Un instantane immuable d un index a une position coherente de la chaine.

**Reorganisation**
: Une reorganisation de la chaine Bitcoin qui peut invalider des resultats deja indexes.

## ARC-20

**ARC-20**
: Le modele de jetons fongibles d Atomicals. Une unite est un satoshi colore.

**Ticker**
: Un nom ARC-20 attribue globalement. Ce n est pas une preuve de l identite de son createur.

**UTXO coloree**
: Une sortie Bitcoin qu un validateur reconnait comme portant de la valeur ARC-20.

**UTXO cardinale**
: Une sortie Bitcoin ordinaire sans valeur Atomicals. Utilisee pour les frais et la monnaie.

**FT direct**
: Une frappe `ft` en une etape qui place l offre entiere dans la sortie zero.

**DFT**
: Un deploiement de jeton fongible decentralise cree avec `dft`.

**Reclamation DMT**
: Une frappe unique contre un deploiement DFT, avec l operation `dmt`.

**DFT perpetuel**
: Un mode decentralise conditionne a l activation, avec Bitwork progressif et plafond global optionnel.

**Montant par frappe**
: La valeur exacte en satoshis que chaque reclamation DMT valide place dans la sortie zero.

**Frappes maximales**
: Le nombre de reclamations valides en mode fixe qu un deploiement autorise.

**Attribution**
: La decision du validateur sur la sortie qui recoit quelle valeur coloree.

**Attribution normale**
: Le comportement de coloration par defaut quand aucun payload d operation ne le modifie.

**Brulure**
: De la valeur coloree qui n a pu etre placee dans aucune sortie eligible et est donc detruite.

**Division**
: L operation `y`, qui separe de la valeur fongible sur une sortie.

**Coloration personnalisee**
: L operation `z`, conditionnee a l activation, qui attribue explicitement de la valeur coloree.

**Splat**
: L operation `x` de la branche non fongible, qui separe plusieurs Atomicals detenus sur une sortie.

**Validation de non inflation**
: La regle selon laquelle les totaux colores de sortie ne peuvent pas depasser les totaux colores d entree.

## Noms et collections

**Container**
: Une identite de collection nommee dont les items peuvent prouver l appartenance.

**DMINT**
: Frappe decentralisee d items de Container contre un manifeste scelle.

**Scellement**
: Rendre un Atomical ou un manifeste de Container definitivement immuable.

**Realm**
: Un nom Atomicals de premier niveau detenu comme un NFT.

**Subrealm**
: Un nom enfant reclame sous les regles d un Realm parent.

**Payname**
: Un Realm utilise comme destination de paiement.

**IDNA**
: Les regles de noms de domaine internationalises utilisees pour comparer et normaliser des noms.

**Confondable**
: Deux noms distincts qui s affichent de facon assez semblable pour tromper un lecteur.

## Integration

**Curseur**
: Un jeton de pagination opaque et signe qui designe une position stable dans une generation.

**Disponibilite**
: Si un service peut repondre correctement en ce moment, distinct d etre configure ou en cours d execution.

**Fraicheur**
: Le retard d un index par rapport a la pointe de la chaine.

**Cle d idempotence**
: Une cle fournie par le client qui rend sur de rejouer une mutation.

**Identifiant de requete**
: Un identifiant par requete renvoye dans les reponses et les journaux, utilise pour tracer un appel.

**PSBT**
: Une transaction Bitcoin partiellement signee, le format d echange entre un service et un portefeuille.

**BIP-322**
: Un schema de signature de message utilise ici pour prouver le controle d une adresse sans deplacer de fonds.

**SIGHASH**
: L indicateur qui decide a quelles parties d une transaction une signature s engage.

## Termes que nous evitons

Ces mots apparaissent dans des materiels tiers et ne sont pas employes comme affirmations sur ce
site : garanti, sans risque, adosse, collateralise, plancher de prix, remboursement. La ou une
source les emploie, la page cite la source et precise quelles preuves existent.
