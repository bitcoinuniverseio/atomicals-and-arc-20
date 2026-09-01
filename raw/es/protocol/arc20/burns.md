# Quemas

Como se destruye el valor ARC-20, las cuatro formas que lo causan, y las comprobaciones que evitan cada una.

Page ID: protocol/arc20/burns
Applicability: protocol-behavior
Authority: executed-source
Networks: mainnet
Verified: 2026-08-31
Locale: es
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/es/protocol/arc20/burns/

---
Una quema es valor coloreado que un validador no pudo colocar en ninguna salida elegible. Queda
registrado como destruido. La transaccion de Bitcoin que la causo es valida, minada y confirmada.

Las unidades quemadas no van a ninguna parte. No hay direccion que las tenga ni procedimiento que
las devuelva. La prevencion es el unico control.

## Las cuatro formas que causan una quema

### 1. La siguiente salida es demasiado grande

La mas comun. Quedan 500 unidades por colocar y la siguiente salida tiene 546 satoshis. No cabe,
asi que las 500 unidades se destruyen.

**Prevencion.** Dimensiona la salida de cambio exactamente al resto que quieres conservar.

### 2. No hay suficientes salidas

Todas las salidas quedaron cubiertas y todavia sobra valor. No queda nada donde colocarlo.

**Prevencion.** Incluye siempre una salida de cambio coloreada cuando las entradas superan lo que
estas enviando.

### 3. La primera salida es mayor que el lote entero

No se puede colocar nada, asi que el lote entero se quema.

**Prevencion.** Nunca envies un lote coloreado pequeno a una transaccion cuya primera salida es un
pago cardinal grande.

### 4. El repliegue reorganizo una transaccion con varios tokens

Un token no se pudo colocar limpiamente, asi que el constructor reinicio todos los tokens desde la
salida cero y otro token perdio su hueco.

**Prevencion.** Mueve un token por transaccion salvo que hayas modelado el caso con varios.

## Casos ejecutados

## Las comprobaciones que evitan las cuatro

1. Calcula la asignacion esperada antes de firmar, no despues.
2. Confirma que la cifra de quema es cero.
3. Dimensiona cada salida coloreada deliberadamente, en satoshis.
4. Manten las entradas de comision cardinales y separadas.
5. Mueve un token por transaccion salvo que tengas una razon para no hacerlo.
6. Vuelve a comprobar tras cualquier cambio en el conjunto de salidas, incluido el cambio anadido
   por la billetera.

Usa el [visualizador de asignacion](/tools/allocation-visualizer/) para los pasos uno y dos.

## Detectar una quema despues del hecho

Un validador registra las quemas por transaccion. Lee la transaccion a traves de una fuente que las
reporte, y compara el total coloreado de entrada con la suma de los totales coloreados de salida.
Cualquier diferencia es una quema.

El feed de actividad ARC-20 de Universe publica registros de quema entre su actividad confirmada.
Ver [API ARC-20](/reference/api/arc20/).
