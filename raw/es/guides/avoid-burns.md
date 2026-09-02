# Evitar quemas

El procedimiento practico que evita todas las formas de quema, con los casos ejecutados que muestran como se ve cada una.

Page ID: guides/avoid-burns
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet
Verified: 2026-08-31
Locale: es
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/es/guides/avoid-burns/

---
## Antes de empezar

- Redes soportadas: mainnet.
- Estado: comportamiento de protocolo.
- La prevencion es el unico control. No hay recuperacion.

## El procedimiento

1. Trabaja en outpoints y satoshis. Nunca en una caja de importe del token.
2. Mueve un token por transaccion salvo que hayas modelado el caso con varios.
3. Incluye siempre una salida de cambio coloreada cuando el lote supera lo que estas enviando.
4. Dimensiona la salida de cambio **exactamente** al resto.
5. Modela el conjunto exacto de entradas y salidas, en orden, antes de construir.
6. Confirma que la cifra de quema calculada es cero.
7. Anade las entradas de comision y el cambio cardinal, y modela de nuevo.
8. Confirma que la cifra de quema sigue siendo cero.
9. Compara el aviso de la billetera con tu modelo, linea por linea, antes de firmar.

Los pasos siete y ocho son los que la gente se salta, y son donde el cambio anadido por la
billetera altera el resultado sin avisar.

## Las cuatro formas, ejecutadas

| Forma | Prevencion |
| --- | --- |
| Siguiente salida demasiado grande | Dimensiona el cambio exactamente al resto |
| Salidas insuficientes | Incluye siempre cambio coloreado |
| Primera salida mayor que el lote | Nunca envies un lote pequeno a un primer pago grande |
| Repliegue con varios tokens | Un token por transaccion |

Una direccion de deposito de un exchange, una billetera Bitcoin normal o cualquier servicio sin
soporte Atomicals gasta la salida como bitcoin normal. Las unidades desaparecen, y ningun registro
de quema te va a consolar. Comprueba que el destino soporta Atomicals antes de enviar.

## El unico caso en que una quema es deliberada

Destruir unidades a proposito es una accion valida. Hazlo explicitamente: construye la transaccion
que quema exactamente lo que pretendes, confirma la cifra y registra la razon. Nunca dependas de
una quema accidental.

## Despues de difundir

Lee la transaccion a traves de una fuente que reporte quemas y confirma que la cifra es la que
esperabas. Compara el total coloreado de entrada con la suma de los totales coloreados de salida.

## Fuente

[Quemas](/protocol/arc20/burns/) y [asignacion](/protocol/arc20/allocation/).
