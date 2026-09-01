# Que es ARC-20?

El modelo de tokens fungibles de Atomicals, donde una unidad es un satoshi coloreado y una transferencia es un problema de asignacion, no una actualizacion de cuenta.

Page ID: start/what-is-arc-20
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: es
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/es/start/what-is-arc-20/

---
ARC-20 es el modelo de tokens fungibles dentro de Atomicals. Su regla es corta:

> **Una unidad ARC-20 es un satoshi en una salida de Bitcoin que un validador reconoce como
> coloreada.**

Esa unica frase decide todo lo demas. El suministro se mide en satoshis. Una transferencia es una
pregunta sobre que salidas reciben cuanto valor. El valor que no se puede colocar se destruye.

## Por que esto no es un saldo de cuenta

En un modelo de cuentas, una transferencia resta de una fila y suma a otra, y la transaccion tiene
exito o falla. En ARC-20 la transaccion tiene exito en Bitcoin de todos modos. Lo que cambia es
donde aterriza el valor coloreado.

| Pregunta | Modelo de cuentas | ARC-20 |
| --- | --- | --- |
| Donde esta el saldo? | En una fila de un libro mayor | Repartido entre tus salidas no gastadas |
| Que es una transferencia? | Debito y credito | Asignar valor de entrada a las salidas, en orden |
| Puede desaparecer valor? | No | Si. El valor que no cabe se quema |
| Quien decide el resultado? | El contrato | La revision del validador que ejecuta tu indexador |
| Confirmacion significa exito? | Si | No. Confirmacion y asignacion son respuestas separadas |

Si la siguiente salida elegible es mayor que el valor coloreado que queda por colocar, ese valor no
se arrastra. Se quema. Esto no es un estado de error en Bitcoin: la transaccion confirma con
normalidad. Lee [quemas](/protocol/arc20/burns/) antes de mover nada.

## Las tres formas en que las unidades llegan a existir

| Modo | Operacion | Forma |
| --- | --- | --- |
| Emision directa | `ft` | El suministro completo aterriza en la salida cero de una transaccion |
| Descentralizado fijo | `dft` y luego `dmt` | Un despliegue fija las reglas, y cada reclamante acuna una cantidad fija |
| Descentralizado perpetuo | `dft` con parametros perpetuos | Condicionado a activacion, con Bitwork progresivo y tope global opcional |

Ver [emision directa](/protocol/arc20/direct-issuance/),
[DFT fijo](/protocol/arc20/fixed-dft/) y
[DFT perpetuo](/protocol/arc20/perpetual-dft/).

## Que significa un ticker y que no

Un ticker es un nombre asignado globalmente. Ganarlo significa que las reglas Atomicals resolvieron
un candidato en un ganador verificado. No significa:

- que el proyecto sea quien dice ser;
- que los metadatos sean correctos;
- que la imagen pertenezca a quien acuno;
- que alguien responda por el suministro.

Guarda y muestra siempre el **Atomical ID** resuelto junto a cualquier ticker.
Ver [tickers y candidatos](/protocol/arc20/tickers-and-candidates/).

## Los decimales no crean fracciones

`decimals` es metadato de presentacion. Cambia como una billetera formatea un numero en pantalla.
Nunca crea unidades por debajo del satoshi. Las cantidades nativas ARC-20 son siempre enteras.
Ver [metadatos y decimales](/protocol/arc20/metadata-and-decimals/).
