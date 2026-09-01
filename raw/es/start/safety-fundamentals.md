# Fundamentos de seguridad

Las ocho comprobaciones que separan una transaccion Atomicals limpia de una perdida permanente, y las cuatro afirmaciones que nunca debes aceptar como prueba.

Page ID: start/safety-fundamentals
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: es
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/es/start/safety-fundamentals/

---
La mayoria de las perdidas en Atomicals no son exploits. Son transacciones de Bitcoin normales que
gastaron una salida coloreada como lo haria una billetera normal.

## Nunca hagas esto

- Nunca entregues una frase semilla, una clave privada o un archivo de exportacion de billetera a
  nada, incluidos nosotros. Ninguna verificacion legitima los necesita.
- Nunca dejes que una billetera Bitcoin generica elija entradas de comision de un conjunto que
  incluya tus salidas coloreadas.
- Nunca trates un ticker, una imagen, un nombre o un anuncio de mercado como prueba de quien creo
  algo.
- Nunca trates la respuesta de un indexador como verdad definitiva. Es la opinion de una version en
  un momento.

## Las ocho comprobaciones antes de firmar

1. **Que salidas estan coloreadas?** Identifica los outpoints exactos que llevan el activo. Si tu
   billetera no puede decirtelo, para.
2. **Cual es el orden de las entradas?** La asignacion recorre entradas y salidas en orden. El
   orden cambia el resultado.
3. **Cuanto vale cada salida en satoshis?** No en unidades del token. En satoshis.
4. **Cual es el orden de las salidas?** La salida cero es especial para acunaciones y para la
   mayoria de las formas de transferencia.
5. **Cuanto aterriza donde?** Cada salida debe tener una cifra esperada en unidades antes de firmar.
6. **Que se quema?** Si algun valor no se puede colocar, se destruye. Deberia ser cero, salvo que
   asi lo pretendas.
7. **De donde sale la comision?** De una entrada cardinal separada, nunca de la coloreada.
8. **Que dice realmente el aviso de la billetera?** Comparalo con tu expectativa, linea por linea.

Enviar una salida coloreada a una direccion de deposito de un exchange, a una billetera Bitcoin
normal o a cualquier servicio que no entienda Atomicals significa que el valor se gasta como
bitcoin normal. Las unidades desaparecen. No hay ruta de recuperacion.

## Como se ve una quema

Una quema no es un error. La transaccion de Bitcoin es valida, minada y confirmada. Las unidades
simplemente no tienen a donde ir, asi que el validador las registra como destruidas. Lee
[quemas](/protocol/arc20/burns/) para la regla exacta y
[evitar quemas](/guides/avoid-burns/) para el procedimiento practico.

## Cuatro afirmaciones que no prueban nada

| Afirmacion | Que prueba realmente |
| --- | --- |
| El ticker coincide | Que se asigno un nombre a algun Atomical. Nada sobre quien. |
| Los metadatos lo dicen | Que alguien escribio datos arbitrarios en un payload. |
| Esta listado en un mercado | Que alguien envio un anuncio. La propiedad se verifica aparte, en la liquidacion. |
| El indexador muestra saldo | Que una implementacion, en una generacion, lo cree. Comprueba la version y la frescura. |

## Despues de difundir

1. Espera la confirmacion en Bitcoin.
2. Espera a que el indice alcance esa altura y reporte una generacion estable.
3. Vuelve a leer la ubicacion del activo y confirma que coincide con la salida prevista.
4. Comprueba las quemas registradas en la transaccion.

Confirmacion e indexacion son dos respuestas separadas.
Ver [confirmaciones y reorganizaciones](/guides/confirmations-and-reorgs/).

## Si algo ya salio mal

- Una transaccion rechazada antes de difundirse es recuperable:
  [recuperar de un rechazo](/guides/recover-from-a-rejection/).
- Una billetera que no firma suele ser un problema de capacidad o de codificacion:
  [fallos de firma de la billetera](/guides/wallet-signing-failures/).
- Un saldo que aparece a cero suele ser un indice no disponible, no una perdida:
  [indice no disponible o saldo vacio](/guides/unavailable-indexer-vs-empty-balance/).
- Una quema confirmada no se puede revertir. Nada en este sitio cambia eso.
