# Transferir ARC-20

Construye una transferencia que coloca cada unidad donde quieres y no quema nada.

Page ID: guides/transfer-arc20
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet
Verified: 2026-08-31
Locale: es
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/es/guides/transfer-arc20/

---
## Antes de empezar

- Redes soportadas: mainnet.
- Estado: comportamiento de protocolo.
- Necesitas una billetera o constructor que trabaje en outpoints y valores en satoshis, no en un
  campo de importe.

Los tamanos son en satoshis, no en una caja de importe del token. Falla uno y el resto se quema.

## La forma que funciona

| Posicion | Contenido |
| --- | --- |
| Entrada 0 | El lote coloreado |
| Entrada 1 y siguientes | Entradas cardinales para la comision |
| Salida 0 | El destinatario, dimensionada exactamente a las unidades que envias |
| Salida 1 | Cambio coloreado, dimensionado exactamente al resto |
| Salida 2 | Cambio cardinal, si lo hay |

## El procedimiento

1. Lista tus outpoints coloreados y elige el lote a gastar.
2. Decide el importe a enviar. Ese numero es tambien el valor en satoshis de la salida 0.
3. Calcula el resto: valor del lote menos importe enviado. Ese es el valor en satoshis de la
   salida 1.
4. Modela el conjunto exacto de entradas y salidas en el
   [visualizador de asignacion](/tools/allocation-visualizer/).
5. Confirma que la cifra de quema es cero.
6. Anade entradas cardinales para la comision y una salida de cambio cardinal al final.
7. Modela de nuevo con las entradas y salidas de comision incluidas. La cifra de quema debe seguir
   siendo cero.
8. Construye la transaccion, preservando el orden de entradas y salidas.
9. Compara el aviso de la billetera con tu modelo, linea por linea.
10. Firma y difunde.

## Por que existe el paso siete

Anadir una entrada de comision o una salida de cambio cambia el conjunto de salidas, y la
asignacion recorre las salidas en orden. Una transferencia que estaba limpia antes de que la
billetera anadiera cambio puede quemar despues.

## Los dos vectores que muestran el riesgo

La misma intencion, el mismo lote, el mismo importe enviado. La unica diferencia es el tamano de la
salida de cambio, y una de ellas destruye 200 unidades.

## Coste

Una comision de Bitcoin, pagada desde una entrada cardinal. Sin par commit y reveal, y sin mineria,
para una transferencia normal.

## Si falla

- La billetera no te deja fijar valores de salida en satoshis: usa otro constructor.
- La billetera reordena las salidas: usa otro constructor. El orden es el significado.
- La cifra de quema no es cero: cambia los tamanos de las salidas, no sigas.

## Despues de difundir

Confirma, espera la indexacion, lee la ubicacion del activo y comprueba la cifra de quema
registrada. Ver [verificar una transaccion](/guides/verify-a-transaction/).

## Fuente

[Asignacion](/protocol/arc20/allocation/) y [quemas](/protocol/arc20/burns/).
