# Que sont les Atomicals ?

Des objets numeriques qui vivent dans des sorties Bitcoin ordinaires, identifies par la transaction qui les a crees et interpretes par un validateur Atomicals.

Page ID: start/what-are-atomicals
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: fr
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/fr/start/what-are-atomicals/

---
Un **Atomical** est un objet numerique cree par une transaction Bitcoin et porte par une sortie
Bitcoin. Il n y a pas de chaine laterale, pas de registre de jetons separe, pas de compte de
contrat intelligent. L objet existe parce qu un validateur lit votre transaction et lui applique
les regles Atomicals.

## Les trois parties d un Atomical

**Identite** est l Atomical ID, ecrit `<txid>i<index-de-sortie>`. Il est attribue une seule fois et
ne change jamais. Un numero est aussi attribue dans l ordre de frappe, mais l ID est l identite
durable a conserver.

**Emplacement** est l UTXO qui porte l objet en ce moment. Depenser cette UTXO deplace l objet, ou
le detruit, selon la disposition des sorties.

**Historique** est l ensemble ordonne des operations appliquees a l objet : la frappe, chaque mise
a jour d etat et chaque deplacement.

## Comment une operation est ecrite

Bitcoin n execute pas l enveloppe. Ce sont des donnees dans un chemin de script Taproot. Bitcoin ne
sait pas ce que `atom` signifie. Un validateur Atomicals, si.

Une transaction Bitcoin confirmee dit seulement que les octets sont dans un bloc. Savoir si l
operation etait valide, quelle sortie a recu l objet et si quelque chose a brule sont des reponses
que donne un validateur. Verifiez toujours les deux.

## La famille de protocoles

| Type | Ce que c est | A lire |
| --- | --- | --- |
| Atomicals NFT | Un objet non fongible unique avec metadonnees et media | [Vue d ensemble des NFT](/protocol/nft/overview/) |
| ARC-20 | Jetons fongibles ou une unite est un satoshi colore | [Vue d ensemble ARC-20](/protocol/arc20/overview/) |
| Container | Une collection nommee dont les items peuvent prouver l appartenance | [Containers](/protocol/containers/overview/) |
| DMINT | Frappe decentralisee d items de Container contre un manifeste scelle | [DMINT](/protocol/containers/dmint/) |
| Realm | Un nom de premier niveau detenu comme un Atomical | [Realms](/protocol/realms/overview/) |
| Subrealm | Un nom enfant reclame sous les regles d un Realm | [Subrealms](/protocol/realms/subrealms/) |
| Payname | Un Realm utilise comme destination de paiement | [Paynames](/protocol/realms/paynames/) |
| AVM | Un interpreteur de scripts isole, en beta et de portee distincte | [AVM](/protocol/avm/overview/) |

## Ce qu un Atomical n est pas

- Ce n est pas une preuve de qui a cree quelque chose. Un ticker ou un nom de Realm est une
  attribution, pas une verification d identite.
- Ce n est pas un compte de contrat. Il n y a pas de ligne de solde a debiter.
- Il n est pas sur d en deduire quoi que ce soit depuis les metadonnees. Les metadonnees sont des
  donnees arbitraires fournies par celui qui a frappe.
- Ce n est pas definitif parce que Bitcoin a confirme. Voir
  [confirmation et reorganisations](/protocol/core/confirmation-and-reorgs/).
