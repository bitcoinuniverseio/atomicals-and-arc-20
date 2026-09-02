---
title: El modelo de unidad
description: Un satoshi coloreado es una unidad, el suministro se mide en satoshis, y los decimales son solo presentacion.
sidebar:
  order: 2
provenance:
  pageId: protocol/arc20/unit-model
  area: protocol
  audience: [everyone, developer]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: normalFtAllocation
    - id: atomicals-guide
      path: arc20
  verified: '2026-08-31'
  tags: [arc-20, units]
  translationSourceHash: 0e97ff4112c1dc00649dd483dd1b427ff83279aad5ed40de820813457a931eb7
---

## La regla

Una unidad ARC-20 es un satoshi en una salida que un validador reconoce como coloreada para ese
token. Las cantidades nativas son enteras. No hay division menor.

## Lo que se sigue de inmediato

**El suministro son satoshis.** Un token con 100 000 000 unidades requirio 100 000 000 satoshis, es
decir un bitcoin, para existir. Los suministros grandes son caros por construccion.

**Se aplican limites de polvo.** Una salida que Bitcoin no retransmite no puede llevar unidades. En
la practica, una salida coloreada debe estar en el umbral de polvo de su tipo de script o por
encima.

**Los saldos son sumas, no valores almacenados.** El total en una billetera es la suma de las
salidas coloreadas que puede gastar. Nada en la cadena almacena ese total.

**Gastar es todo o nada por salida.** No hay gasto parcial. Mover parte de un lote significa
construir una transaccion cuyas salidas reciban la division que quieres.

## Numeros trabajados

| Despliegue | Cantidad por acunacion | Acunaciones maximas | Emision maxima nominal | Bitcoin necesario |
| --- | --- | --- | --- | --- |
| Pequeno | 1 000 sats | 10 000 | 10 000 000 unidades | 0,1 BTC |
| Medio | 10 000 sats | 21 000 | 210 000 000 unidades | 2,1 BTC |
| Grande | 100 000 sats | 21 000 | 2 100 000 000 unidades | 21 BTC |

La emision maxima nominal es `mint_amount * max_mints`. Es un techo de lo que las reclamaciones
pueden producir, no una promesa de que el techo se alcance.

## Decimales

`decimals` es metadato opcional que le dice a una billetera como formatear un numero para un
lector. Un token con 100 000 unidades y `decimals` de 2 puede mostrarse como 1 000,00. La cadena
sigue teniendo 100 000 unidades enteras en 100 000 satoshis coloreados.

Nunca dividas una cantidad nativa por una potencia de diez antes de hacer aritmetica con ella, y
nunca dejes que una cifra formateada entre en un constructor de transacciones. Ver
[metadatos y decimales](/protocol/arc20/metadata-and-decimals/).

## Polvo y seguridad

Una salida coloreada cerca del umbral de polvo es fragil. Cualquier transferencia que necesite
dejar un resto menor que el umbral no puede colocar ese resto en una salida nueva, asi que se quema.

Guia practica:

- Manten lotes con tamanos que se dividan bien para las transferencias que esperas hacer.
- Prefiere pocos lotes grandes a muchos lotes del tamano de polvo.
- Modela cualquier division antes de construirla. Ver
  [visualizador de asignacion](/tools/allocation-visualizer/).
