# ARC-20

El modelo ARC-20 completo en una pagina, de la emision a la asignacion y al limite de seguridad, con enlaces a la regla exacta de cada parte.

Page ID: protocol/arc20/overview
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: es
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/es/protocol/arc20/overview/

---
ARC-20 es el modelo de tokens fungibles de Atomicals en Bitcoin. Una unidad es un satoshi
coloreado. Todo lo demas se deriva de ahi.

## El modelo completo en siete afirmaciones

1. Una unidad es un satoshi en una salida que un validador reconoce como coloreada para un token.
2. El suministro se mide por tanto en satoshis, y esta limitado por bitcoin real.
3. La emision ocurre una vez, directamente, o repetidamente a traves de un despliegue contra el que
   otros acunan.
4. Un ticker es un nombre asignado globalmente, resuelto a exactamente un Atomical.
5. Una transferencia es una asignacion sobre las entradas y salidas de la transaccion, en orden.
6. El valor que no se puede colocar en una salida elegible se destruye.
7. Los totales coloreados de salida nunca pueden exceder los totales coloreados de entrada.

Lee [quemas](/protocol/arc20/burns/) antes de construir o firmar nada.

## Donde esta documentada cada regla

| Area | Pagina |
| --- | --- |
| El modelo de unidad y por que los decimales no crean fracciones | [Modelo de unidad](/protocol/arc20/unit-model/) |
| Asignacion de tickers, candidatos y ganadores verificados | [Tickers y candidatos](/protocol/arc20/tickers-and-candidates/) |
| Emision de un suministro completo en un paso | [Emision directa](/protocol/arc20/direct-issuance/) |
| Despliegues con un numero fijo de acunaciones | [DFT fijo](/protocol/arc20/fixed-dft/) |
| Reclamar una acunacion contra un despliegue | [Acunacion descentralizada](/protocol/arc20/decentralized-mint/) |
| Despliegues progresivos condicionados a activacion | [DFT perpetuo](/protocol/arc20/perpetual-dft/) |
| Requisitos de trabajo en commit y reveal | [Requisitos de Bitwork](/protocol/arc20/bitwork-requirements/) |
| Metadatos opcionales y decimales de presentacion | [Metadatos y decimales](/protocol/arc20/metadata-and-decimals/) |
| Como se coloca el valor en las salidas | [Asignacion](/protocol/arc20/allocation/) |
| Separar y recombinar lotes coloreados | [Dividir y combinar](/protocol/arc20/split-and-combine/) |
| Como se destruye el valor | [Quemas](/protocol/arc20/burns/) |
| Mover tokens e intercambiarlos atomicamente | [Transferencias e intercambios](/protocol/arc20/transfers-and-swaps/) |
| Que debe contener un PSBT | [Requisitos de PSBT](/protocol/arc20/psbt-requirements/) |
| Que debe hacer una billetera para ser segura | [Seguridad de la billetera](/protocol/arc20/wallet-safety/) |
| El estado del material del Substantiation Factor | [Substantiation Factor](/protocol/arc20/substantiation-factor/) |

## Lo que ARC-20 no es

- No es un contrato ERC-20. No hay contrato ni cuenta.
- No es un saldo de inscripcion. El valor es el valor en satoshis de las salidas, no un numero
  escrito en texto.
- No es un derecho sobre nada. Nada respalda una unidad salvo que exista un acuerdo legal separado,
  y acunar no crea ninguno.
- No es un estandar ARC-721. Ninguna fuente oficial localizada durante la revision establece uno.

## Limite del producto Universe

El protocolo soporta la emision directa `mint-ft`. Ninguna superficie de producto Universe la
expone hoy. Universe expone resolucion de ticker verificado, detalles de token, tenedores,
actividad confirmada, saldos de cartera, UTXOs coloreadas y flujos de Marketplace v1.
Ver [estado y limitaciones conocidas](/start/status-and-limitations/).
