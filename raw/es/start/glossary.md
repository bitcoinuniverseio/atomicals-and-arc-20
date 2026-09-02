# Glosario

Todos los terminos de Atomicals y ARC-20 usados en este sitio, definidos una vez y usados de forma coherente en todas partes.

Page ID: start/glossary
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: es
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/es/start/glossary/

---
Los terminos de este glosario son los que se usan en todo el sitio y en todas las traducciones. Los
identificadores de codigo, los nombres de propiedades de esquema, los nombres de operaciones y los
hashes nunca se traducen.

## Nucleo

**Atomical**
: Un objeto digital creado por una transaccion de Bitcoin y transportado por una salida de Bitcoin.

**Atomical ID**
: La identidad duradera de un Atomical, escrita como `<txid>i<indice-de-salida>`. Asignada una vez, nunca cambia.

**Numero del Atomical**
: Un numero secuencial asignado por orden de acunacion. Util para mostrar. No es la identidad que hay que guardar.

**Ubicacion**
: La salida no gastada que transporta un Atomical ahora mismo. Cambia en cada movimiento.

**Envoltorio**
: La estructura de script en el testigo que lleva `atom`, una operacion y un payload CBOR en la transaccion de reveal.

**Operacion**
: El codigo corto dentro del envoltorio que le dice al validador que hacer. Ejemplos: `ft`, `dft`, `dmt`, `nft`, `mod`, `sl`.

**Commit y reveal**
: El patron de dos transacciones. El commit paga a una salida Taproot; el reveal la gasta y expone el envoltorio.

**Bitwork**
: Un requisito de prefijo al estilo de prueba de trabajo sobre un id de transaccion, usado para condicionar acunaciones y reclamaciones.

**Candidato**
: Una reclamacion pendiente de un nombre o ticker asignado globalmente, antes de que las reglas resuelvan un ganador.

**Ganador verificado**
: El Atomical que las reglas resolvieron como poseedor de un nombre o ticker.

**Generacion**
: Una instantanea inmutable de un indice en una posicion coherente de la cadena.

**Reorganizacion**
: Una reorganizacion de la cadena de Bitcoin que puede invalidar resultados previamente indexados.

## ARC-20

**ARC-20**
: El modelo de tokens fungibles de Atomicals. Una unidad es un satoshi coloreado.

**Ticker**
: Un nombre ARC-20 asignado globalmente. No es prueba de la identidad de quien lo creo.

**UTXO coloreada**
: Una salida de Bitcoin que un validador reconoce como portadora de valor ARC-20.

**UTXO cardinal**
: Una salida de Bitcoin normal sin valor Atomicals. Se usa para comisiones y cambio.

**FT directo**
: Una acunacion `ft` en un paso que coloca todo el suministro en la salida cero.

**DFT**
: Un despliegue de token fungible descentralizado creado con `dft`.

**Reclamacion DMT**
: Una unica acunacion contra un despliegue DFT, usando la operacion `dmt`.

**DFT perpetuo**
: Un modo descentralizado condicionado a activacion, con Bitwork progresivo y tope global opcional.

**Cantidad por acunacion**
: El valor exacto en satoshis que cada reclamacion DMT valida coloca en la salida cero.

**Acunaciones maximas**
: El numero de reclamaciones validas en modo fijo que permite un despliegue.

**Asignacion**
: La decision del validador sobre que salida recibe cuanto valor coloreado.

**Asignacion normal**
: El comportamiento de coloreado por defecto cuando ningun payload de operacion lo cambia.

**Quema**
: Valor coloreado que no se pudo colocar en ninguna salida elegible y por tanto se destruye.

**Division**
: La operacion `y`, que separa valor fungible en una salida.

**Coloreado personalizado**
: La operacion `z`, condicionada a activacion, que asigna valor coloreado explicitamente.

**Splat**
: La operacion `x` en la rama no fungible, que separa varios Atomicals que estan en una salida.

**Validacion de no inflacion**
: La regla de que los totales coloreados de salida no pueden exceder los totales coloreados de entrada.

## Nombres y colecciones

**Container**
: Una identidad de coleccion con nombre cuya pertenencia los items pueden demostrar.

**DMINT**
: Acunacion descentralizada de items de Container contra un manifiesto sellado.

**Sellado**
: Hacer que un Atomical o un manifiesto de Container sea permanentemente inmutable.

**Realm**
: Un nombre Atomicals de primer nivel poseido como un NFT.

**Subrealm**
: Un nombre hijo reclamado bajo las reglas de un Realm padre.

**Payname**
: Un Realm usado como destino de pago.

**IDNA**
: Las reglas de nombres de dominio internacionalizados usadas al comparar y normalizar nombres.

**Confundible**
: Dos nombres distintos que se muestran de forma lo bastante parecida para enganar a un lector.

## Integracion

**Cursor**
: Un token de paginacion opaco y firmado que se refiere a una posicion estable dentro de una generacion.

**Preparacion**
: Si un servicio puede responder correctamente ahora mismo, distinto de estar configurado o en ejecucion.

**Frescura**
: Cuanto va por detras un indice respecto a la punta de la cadena.

**Clave de idempotencia**
: Una clave aportada por el cliente que hace seguro repetir una mutacion.

**Identificador de peticion**
: Un identificador por peticion devuelto en las respuestas y en los registros, usado para rastrear una llamada.

**PSBT**
: Una transaccion de Bitcoin parcialmente firmada, el formato de intercambio entre un servicio y una billetera.

**BIP-322**
: Un esquema de firma de mensajes usado aqui para demostrar el control de una direccion sin mover fondos.

**SIGHASH**
: La bandera que decide a que partes de una transaccion se compromete una firma.

## Terminos que evitamos

Estas palabras aparecen en material de terceros y no se usan como afirmaciones en este sitio:
garantizado, sin riesgo, respaldado, colateralizado, suelo de precio, rescate. Donde una fuente las
usa, la pagina cita la fuente y dice que evidencia existe.
