# Que son los Atomicals?

Objetos digitales que viven dentro de salidas normales de Bitcoin, identificados por la transaccion que los creo e interpretados por un validador Atomicals.

Page ID: start/what-are-atomicals
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: es
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/es/start/what-are-atomicals/

---
Un **Atomical** es un objeto digital creado por una transaccion de Bitcoin y transportado por una
salida de Bitcoin. No hay cadena lateral, ni libro mayor de tokens aparte, ni cuenta de contrato
inteligente. El objeto existe porque un validador lee tu transaccion y le aplica las reglas
Atomicals.

## Las tres partes de un Atomical

**Identidad** es el Atomical ID, escrito como `<txid>i<indice-de-salida>`. Se asigna una sola vez y
nunca cambia. Tambien se asigna un numero segun el orden de acunacion, pero el ID es la identidad
duradera que debes guardar.

**Ubicacion** es la UTXO que transporta el objeto ahora mismo. Gastar esa UTXO mueve el objeto, o
lo destruye, segun como esten dispuestas las salidas.

**Historial** es el conjunto ordenado de operaciones aplicadas al objeto: la acunacion, cada
actualizacion de estado y cada movimiento.

## Como se escribe una operacion

Bitcoin no ejecuta el envoltorio. Son datos dentro de una ruta de script Taproot. Bitcoin no sabe
que significa `atom`. Un validador Atomicals si.

Una transaccion de Bitcoin confirmada solo dice que los bytes estan en un bloque. Si la operacion
fue valida, que salida recibio el objeto y si algo se quemo son respuestas que da un validador.
Comprueba siempre ambas cosas.

## La familia de protocolos

| Tipo | Que es | Lee |
| --- | --- | --- |
| Atomicals NFT | Un objeto no fungible unico con metadatos y medios | [Vision general de NFT](/protocol/nft/overview/) |
| ARC-20 | Tokens fungibles donde una unidad es un satoshi coloreado | [Vision general de ARC-20](/protocol/arc20/overview/) |
| Container | Una coleccion con nombre cuya pertenencia los items pueden demostrar | [Containers](/protocol/containers/overview/) |
| DMINT | Acunacion descentralizada de items de Container contra un manifiesto sellado | [DMINT](/protocol/containers/dmint/) |
| Realm | Un nombre de primer nivel poseido como un Atomical | [Realms](/protocol/realms/overview/) |
| Subrealm | Un nombre hijo reclamado bajo las reglas de un Realm | [Subrealms](/protocol/realms/subrealms/) |
| Payname | Un Realm usado como destino de pago | [Paynames](/protocol/realms/paynames/) |
| AVM | Un interprete de scripts aislado, en beta y con alcance separado | [AVM](/protocol/avm/overview/) |

## Lo que un Atomical no es

- No es prueba de quien creo algo. Un ticker o un nombre de Realm es una asignacion, no una
  verificacion de identidad.
- No es una cuenta de contrato. No hay fila de saldo que debitar.
- No es seguro deducir a partir de los metadatos. Los metadatos son datos arbitrarios aportados por
  quien acuno.
- No es definitivo porque Bitcoin lo confirmara. Ver
  [confirmacion y reorganizaciones](/protocol/core/confirmation-and-reorgs/).
