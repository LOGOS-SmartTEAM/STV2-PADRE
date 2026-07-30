<!-- ═══════════════════════════ INICIO MISIÓN M00 ═══════════════════════════ -->
<!-- Cursor: ejecutá SOLO esta misión. No pases a la siguiente hasta que los
     criterios de aceptación estén cumplidos y el proyecto compile.           -->

# MISIÓN M00 — Infraestructura (puertos, helpers, pxt.json)

- **Repo objetivo:** `STV2-PADRE`
- **Componente:** ninguno (base transversal)
- **Fuentes:** `EXT4/blocks/smartteam4/puertos.ts`, `ORIGINAL/main.ts`
- **Prerrequisito de:** M01, M02, M03, M06, M11, M12, M15 (todos los bloques con `%puerto`)
- **Estado:** ⬜ pendiente

---

## 1. Por qué existe esta misión

`PADRE/blocks/sabana/puertos.ts` define hoy:

```ts
enum SabanaPuerto {
    //% block="P0"
    P0 = 0,
    //% block="P1"
    P1 = 1,
    //% block="P2"
    P2 = 2,
    //% block="P3"
    P3 = 3,
}
```

Los valores `0,1,2,3` son **números planos**. No sirven para llamar a la API de pines
de MakeCode, que espera `DigitalPin` o `AnalogPin` (enums con valores propios donde,
por ejemplo, `AnalogPin.P8 = 8`).

Además hay un detalle **no obvio** que se repite en las dos extensiones de referencia:

> El **PUERTO 3** de la placa NO es el pin P3 de la micro:bit. Es el **pin P8**.

Verificado en dos lugares independientes:

- `ORIGINAL/main.ts` línea 13 → `p3 = AnalogPin.P8`
- `EXT4/blocks/smartteam4/puertos.ts` → `case Ext4Puerto.P4: return DigitalPin.P8`

Si esto se implementa mal, **los 4 puertos parecen funcionar pero el puerto 3
lee/escribe en el pin equivocado**, y es un bug carísimo de encontrar.

---

## 2. Confirmación de CATEGORÍAS y TEXTOS

Esta misión **no toca ningún texto de bloque ni ningún color**. No agrega ni quita
bloques de la caja de herramientas. `SabanaPuerto` es un enum de desplegable: sus
etiquetas visibles `P0 / P1 / P2 / P3` quedan **exactamente como están**.

| Elemento | Antes | Después |
|---|---|---|
| Etiquetas del desplegable | `P0` `P1` `P2` `P3` | `P0` `P1` `P2` `P3` (sin cambios) |
| Categoría | — | — |
| Color | — | — |
| Bloques nuevos visibles | — | ninguno |

---

## 3. Cambios a ejecutar

### 3.1 Reescribir `blocks/sabana/puertos.ts`

Reemplazar el contenido completo del archivo por:

```ts
/**
 * Puertos GPIO STV2 — mapeo interno a pines de la micro:bit.
 *
 * ATENCIÓN: el PUERTO 3 de la placa corresponde al pin P8 de la micro:bit,
 * NO al pin P3. Verificado en ORIGINAL/main.ts (p3 = AnalogPin.P8) y en
 * EXT4/blocks/smartteam4/puertos.ts (Ext4Puerto.P4 -> DigitalPin.P8).
 *
 *   PUERTO 0  ->  micro:bit P0
 *   PUERTO 1  ->  micro:bit P1
 *   PUERTO 2  ->  micro:bit P2
 *   PUERTO 3  ->  micro:bit P8   <-- excepción
 */

enum SabanaPuerto {
    //% block="P0"
    P0 = 0,
    //% block="P1"
    P1 = 1,
    //% block="P2"
    P2 = 2,
    //% block="P3"
    P3 = 3,
}

/**
 * Convierte un puerto de la placa al DigitalPin correspondiente.
 * Usar para lectura/escritura digital (botón, LED, hélice).
 */
function puertoToDigitalPin(puerto: SabanaPuerto): DigitalPin {
    switch (puerto) {
        case SabanaPuerto.P0: return DigitalPin.P0
        case SabanaPuerto.P1: return DigitalPin.P1
        case SabanaPuerto.P2: return DigitalPin.P2
        case SabanaPuerto.P3: return DigitalPin.P8
        default: return DigitalPin.P0
    }
}

/**
 * Convierte un puerto de la placa al AnalogPin correspondiente.
 * Usar para lectura analógica (potenciómetro, luz, suelo) y para servo.
 */
function puertoToAnalogPin(puerto: SabanaPuerto): AnalogPin {
    switch (puerto) {
        case SabanaPuerto.P0: return AnalogPin.P0
        case SabanaPuerto.P1: return AnalogPin.P1
        case SabanaPuerto.P2: return AnalogPin.P2
        case SabanaPuerto.P3: return AnalogPin.P8
        default: return AnalogPin.P0
    }
}
```

**Notas de implementación:**

- Los valores del enum (`0,1,2,3`) **se conservan**. MakeCode serializa los
  desplegables por nombre de miembro, no por valor, así que no rompe proyectos
  `.blocks` guardados; y conservarlos mantiene el diff mínimo.
- EXT4 usa un `default` con `const _exhaustiveCheck: never = puerto`. Acá se usa un
  `default` con retorno concreto porque es más tolerante y no rompe si más adelante
  se agrega un puerto 4 al enum.
- Las dos funciones son de **ámbito global** (fuera de `namespace bloques`), igual que
  el enum y igual que en EXT4. Así son visibles desde cualquier archivo de bloques
  sin necesidad de importar nada.

### 3.2 Crear `blocks/sabana/_util.ts`

Archivo nuevo con los helpers que van a compartir varias misiones. Se crea vacío de
lógica de componentes: solo utilidades.

```ts
/**
 * Utilidades internas compartidas entre bloques STV2.
 * NO contiene bloques visibles.
 */
namespace bloques {

    /**
     * Recorta un valor al rango [min, max].
     */
    export function _clamp(valor: number, min: number, max: number): number {
        if (valor < min) return min
        if (valor > max) return max
        return valor
    }

    /**
     * Recorta un componente de color al rango 0-255.
     * Equivalente a limitRGB() de ORIGINAL/block/rgbLED.ts.
     */
    export function _limit255(valor: number): number {
        return _clamp(Math.round(valor), 0, 255)
    }
}
```

> El helper de comparación (`compareValues` de EXT4) **no** se agrega acá todavía:
> depende de la decisión abierta sobre el botón (pregunta B del barrido). Se define
> en la misión M03.

### 3.3 Actualizar `pxt.json`

En el array `files`, insertar `"blocks/sabana/_util.ts"` **inmediatamente después** de
`"blocks/categorias/bloques.ts"` y **antes** de `"blocks/sabana/puertos.ts"`.

Resultado del tramo afectado:

```json
"files": [
    "main.ts",
    "blocks/categorias/bloques.ts",
    "blocks/sabana/_util.ts",
    "blocks/sabana/puertos.ts",
    "blocks/sabana/ultrasonido.ts",
    ...
]
```

**No** cambiar `dependencies`. ORIGINAL declara `"microphone": "*"` pero ningún bloque
que vamos a portar usa el micrófono; agregarlo solo infla el binario.

**No** cambiar `preferredEditor` (queda `blocksprj`).

---

## 4. Criterios de aceptación

- [ ] `puertos.ts` exporta `puertoToDigitalPin()` y `puertoToAnalogPin()`.
- [ ] Ambas funciones devuelven **P8** para `SabanaPuerto.P3`.
- [ ] `_util.ts` existe y está listado en `pxt.json`.
- [ ] El proyecto **compila** en MakeCode sin errores.
- [ ] La caja de herramientas se ve **exactamente igual que antes**: mismos bloques,
      mismos textos, mismos colores, mismo orden. Esta misión es invisible para el usuario.
- [ ] Los desplegables de puerto siguen mostrando `P0 P1 P2 P3`.

---

## 5. Riesgos y advertencias

| Riesgo | Mitigación |
|---|---|
| Alguien "corrige" P3→`DigitalPin.P3` pensando que P8 es un error | El comentario en cabecera del archivo lo explica y cita las dos fuentes |
| `analogReadPin` sobre un pin ya usado como digital por otro bloque | No se resuelve acá; cada misión de componente declara qué modo usa |
| Colisión de nombres si EXT4 se importa alguna vez en el mismo proyecto | Los helpers de PADRE usan prefijo `puertoTo...` sin `Ext4`; si aparece colisión, renombrar a `sabanaPuertoTo...` |

---

<!-- ═══════════════════════════ FIN MISIÓN M00 ═══════════════════════════ -->
<!-- Fin de "MISIÓN M00 — Infraestructura (puertos, helpers, pxt.json)". Detenete acá. -->
