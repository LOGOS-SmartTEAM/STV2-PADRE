<!-- ═══════════════════════════ INICIO MISIÓN M04 ═══════════════════════════ -->
<!-- Cursor: ejecutá SOLO esta misión. No pases a la siguiente hasta que los
     criterios de aceptación estén cumplidos y el proyecto compile.           -->

# MISIÓN M04 — Ultrasonido + Ultrasonido lógico (STV2-1)

- **Repo objetivo:** `STV2-PADRE`
- **Archivos:** `blocks/sabana/ultrasonido.ts`, `blocks/sabana/ultrasonido_logico.ts`
- **Fuentes del código:** `ORIGINAL/block/ultrasonic.ts` (driver I2C) +
  `EXT4/blocks/smartteam4/ultrasonic.ts` (umbral de detección, convertido)
- **Depende de:** nada (es I2C, no usa `%puerto`)
- **Bloques afectados:** 2
- **Decisión aplicada:** **A — driver del proveedor, umbral convertido** (ver `DECISIONES.md`)
- **Estado:** ⬜ pendiente

---

## 1. Confirmación de CATEGORÍAS, TEXTOS y VARIABLES

### Bloque 1 — lectura de distancia (redondo)

| Propiedad | Valor (se conserva) |
|---|---|
| `blockId` | `sabana_ultrasonido` |
| **Texto** | `Ultrasonido │ en pin I2C` |
| Group | `SENSORES` |
| **Color** | `#35BFE9` (celeste = I2C) |
| `weight` / `blockGap` | `100` / `8` |
| Forma | redondo (reporter, `number`) |
| Parámetros | **ninguno** |

**Retorno:** `number` — distancia en **milímetros**, cruda, tal como la entrega el
módulo del proveedor. Sin conversión a cm.

### Bloque 2 — detección de objeto (hexagonal)

| Propiedad | Valor (se conserva) |
|---|---|
| `blockId` | `sabana_ultrasonido_logico` |
| **Texto** | `%medida detecta objeto %valor` |
| Group | `SENSORES` |
| **Color** | `#006970` (lógico) |
| `weight` / `blockGap` | `99` / `8` |
| Forma | hexagonal (`boolean`) |
| Shadow de `%medida` | `sabana_ultrasonido` |

**Parámetros:**

| Parámetro | Tipo | Desplegable | Valores |
|---|---|---|---|
| `medida` | `number` | no (shadow) | viene del bloque redondo |
| `valor` | `SabanaVerdaderoFalso` | sí | `Verdadero` `Falso` |

> ✅ **Cero cambios de diseño en esta misión.** Textos, colores, formas, desplegables y
> pesos quedan exactamente como están. Solo se escribe el cuerpo de las dos funciones.

---

## 2. Decisión A — por qué hay dos drivers y cuál se usa

Las dos extensiones de referencia hablan con **hardware distinto**:

| | ORIGINAL (proveedor) | EXT4 (RCWL-9620) |
|---|---|---|
| Dirección I2C | **`0x23`** | `0x57` |
| Byte de comando | **`0x0A`** (`ULTRASONIC_BASE + 0x00`) | `0x01` |
| Pausa | **20 ms** | 50 ms |
| Bytes leídos | 2, big-endian | 2, big-endian |
| Unidad devuelta | **mm** | cm (dividía por 10) |

**Se usa el driver de ORIGINAL** (`0x23`). El de EXT4 se descarta por completo.

El **umbral de detección** sí viene de EXT4, que usaba `3 cm < d < 25 cm`. Como ahora
trabajamos en milímetros, se convierte multiplicando por 10:

```
ULTRASONIC_MIN_CM = 3   ->  DETECCION_MIN_MM = 30
ULTRASONIC_MAX_CM = 25  ->  DETECCION_MAX_MM = 250
```

Los comparadores siguen siendo **estrictos** (`>` y `<`), igual que en EXT4.

---

## 3. Estado actual (PADRE)

`blocks/sabana/ultrasonido.ts`:

```ts
namespace bloques {
    //% blockId=sabana_ultrasonido
    //% block="Ultrasonido │ en pin I2C"
    //% group="SENSORES" color="#35BFE9" weight=100 blockGap=8
    export function ultrasonido(): number {
        return 0
    }
}
```

`blocks/sabana/ultrasonido_logico.ts`:

```ts
namespace bloques {
    export enum SabanaVerdaderoFalso {
        //% block="Verdadero"
        Verdadero = 0,
        //% block="Falso"
        Falso = 1,
    }

    //% blockId=sabana_ultrasonido_logico
    //% block="%medida detecta objeto %valor"
    //% medida.shadow=sabana_ultrasonido
    //% group="SENSORES" color="#006970" weight=99 blockGap=8
    export function ultrasonidoLogico(medida: number, valor: SabanaVerdaderoFalso): boolean {
        // TODO: lógica real pendiente
        return true
    }
}
```

## 4. Código de referencia

### ORIGINAL — driver (`ORIGINAL/block/ultrasonic.ts`)

```ts
const ultrasonicI2cAddress = 0x23;
const ULTRASONIC_BASE = 0x0A;

export function ultrasonicDistance(): number {
    basic.pause(20);
    let buf = pins.createBuffer(1);
    buf[0] = ULTRASONIC_BASE + 0x00;

    pins.i2cWriteBuffer(ultrasonicI2cAddress, buf, true);

    // leer 2 bytes de distancia
    let r = pins.i2cReadBuffer(ultrasonicI2cAddress, 2);

    // big-endian
    return (r[0] << 8) | r[1];
}
```

Tres detalles del protocolo que **no** hay que "limpiar":

1. `basic.pause(20)` va **antes** de escribir, no después.
2. `pins.i2cWriteBuffer(addr, buf, true)` — el tercer argumento `true` significa
   *repeated start* (no emite condición de stop). Es obligatorio para que la lectura
   siguiente devuelva el registro pedido. **No omitirlo.**
3. El orden es big-endian: `(r[0] << 8) | r[1]`.

### EXT4 — umbral (`EXT4/blocks/smartteam4/ultrasonic.ts`)

```ts
const ULTRASONIC_MIN_CM = 3
const ULTRASONIC_MAX_CM = 25

const detectado = distancia > ULTRASONIC_MIN_CM && distancia < ULTRASONIC_MAX_CM
switch (estado) {
    case Ext4ObjetoDetectado.Verdadero: return detectado
    case Ext4ObjetoDetectado.Falso:     return !detectado
}
```

---

## 5. Resultado esperado

### 5.1 `blocks/sabana/ultrasonido.ts` — contenido completo

```ts
namespace bloques {

    // ── Constantes I2C del módulo ultrasónico del proveedor ─────────
    // Verificado en ORIGINAL/block/ultrasonic.ts
    const ULTRASONIDO_I2C_ADDR = 0x23   // 35
    const ULTRASONIDO_BASE = 0x0A       // registro base
    const ULTRASONIDO_PAUSA_MS = 20

    /**
     * STV2-1 — Ultrasonido conectado por I2C.
     *
     * Devuelve la distancia en MILÍMETROS, cruda, tal como la entrega el
     * módulo del proveedor. No se convierte a centímetros a propósito.
     *
     * Origen del código: ORIGINAL/block/ultrasonic.ts -> ultrasonicDistance()
     *
     * IMPORTANTE: el tercer argumento `true` de i2cWriteBuffer es un
     * repeated-start (sin condición de stop). Es obligatorio para que la
     * lectura siguiente devuelva el registro pedido. NO quitarlo.
     */
    //% blockId=sabana_ultrasonido
    //% block="Ultrasonido │ en pin I2C"
    //% group="SENSORES" color="#35BFE9" weight=100 blockGap=8
    export function ultrasonido(): number {
        basic.pause(ULTRASONIDO_PAUSA_MS)

        let buf = pins.createBuffer(1)
        buf[0] = ULTRASONIDO_BASE + 0x00
        pins.i2cWriteBuffer(ULTRASONIDO_I2C_ADDR, buf, true)

        // 2 bytes, big-endian
        let r = pins.i2cReadBuffer(ULTRASONIDO_I2C_ADDR, 2)
        return (r[0] << 8) | r[1]
    }
}
```

### 5.2 `blocks/sabana/ultrasonido_logico.ts` — contenido completo

```ts
namespace bloques {

    /**
     * Enum booleano genérico. Se declara acá y se REUTILIZA en otros bloques
     * lógicos (por ejemplo sabana_boton_logico en M03). No redeclararlo.
     */
    export enum SabanaVerdaderoFalso {
        //% block="Verdadero"
        Verdadero = 0,
        //% block="Falso"
        Falso = 1,
    }

    // ── Umbral de detección, en MILÍMETROS ──────────────────────────
    // Origen: EXT4 usaba 3 cm y 25 cm. Como el driver del proveedor
    // devuelve mm, los valores se multiplicaron por 10.
    // Ajustar acá si en el aula hace falta otro rango.
    const DETECCION_MIN_MM = 30    // 3 cm
    const DETECCION_MAX_MM = 250   // 25 cm

    /**
     * Bloque booleano combinado del Ultrasonido (hexágono). El bloque
     * redondo "Ultrasonido │ en pin I2C" (blockId sabana_ultrasonido, con
     * su propio color celeste) queda encajado por defecto dentro del
     * hexágono, como shadow block.
     *
     * Se considera que HAY OBJETO cuando la distancia está estrictamente
     * dentro del rango 30-250 mm. Por debajo de 30 mm se descarta como
     * lectura espuria del sensor (zona ciega); por encima de 250 mm se
     * considera que no hay nada cerca.
     *
     * Origen de la lógica: EXT4/blocks/smartteam4/ultrasonic.ts
     *                      -> ext4UltrasonicDetecta()
     *
     * @param medida distancia en mm
     * @param valor Verdadero = hay objeto; Falso = no hay objeto
     */
    //% blockId=sabana_ultrasonido_logico
    //% block="%medida detecta objeto %valor"
    //% medida.shadow=sabana_ultrasonido
    //% group="SENSORES" color="#006970" weight=99 blockGap=8
    export function ultrasonidoLogico(medida: number, valor: SabanaVerdaderoFalso): boolean {
        const detectado = medida > DETECCION_MIN_MM && medida < DETECCION_MAX_MM
        switch (valor) {
            case SabanaVerdaderoFalso.Verdadero:
                return detectado
            case SabanaVerdaderoFalso.Falso:
                return !detectado
            default:
                return false
        }
    }
}
```

---

## 6. Criterios de aceptación

- [ ] Los dos bloques mantienen textos, colores (`#35BFE9` y `#006970`), formas, pesos
      y desplegables **exactamente** como estaban.
- [ ] `Ultrasonido │ en pin I2C` devuelve un número que **crece** al alejar la mano y
      **decrece** al acercarla.
- [ ] Los valores son coherentes con **milímetros**: a ~10 cm del sensor debe leerse
      cerca de **100**, no de **10**. Si lee ~10, el driver está dividiendo por 10 o la
      dirección I2C es la incorrecta.
- [ ] Con la mano a ~10 cm, `detecta objeto Verdadero` da **verdadero**.
- [ ] Con la mano a ~50 cm (fuera de rango), `detecta objeto Verdadero` da **falso** y
      `detecta objeto Falso` da **verdadero**.
- [ ] Pegando la mano al sensor (< 3 cm) da **falso** — comportamiento intencional (zona ciega).
- [ ] El hexágono viene precargado con el bloque redondo adentro al arrastrarlo.
- [ ] Compila sin warnings.

### Prueba manual sugerida

```ts
basic.forever(function () {
    basic.showNumber(bloques.ultrasonido())   // debe leerse en mm
    basic.pause(400)
})
```

---

## 7. Riesgos y advertencias

| Riesgo | Detalle / mitigación |
|---|---|
| **Dirección I2C equivocada** | Si el bloque devuelve siempre `0` o `65535`, lo más probable es que el módulo físico no esté en `0x23`. Antes de tocar el código, correr un escaneo I2C. Si aparece en `0x57`, entonces el hardware es el RCWL-9620 y hay que usar el driver de EXT4 (comando `0x01`, pausa 50 ms) **manteniendo el retorno en mm** (o sea, sin el `/10` que hacía EXT4). Esto reabriría la decisión A. |
| **Quitar el `true` del `i2cWriteBuffer`** | Es el error más fácil de cometer al "prolijear" el código. Sin repeated-start la lectura devuelve basura. |
| **Mover el `basic.pause(20)`** | Va antes de la escritura. Moverlo después parece más lógico pero no es lo que hace el driver del proveedor. |
| **Llamadas muy seguidas** | Cada lectura cuesta ~20 ms. Dentro de un `forever` sin pausa extra, el ultrasonido monopoliza el bus I2C y puede degradar la OLED o los motores. Documentar en el manual: agregar `basic.pause()`. |
| **Umbral en mm vs cm** | Si alguien cambia `DETECCION_MIN_MM = 3` pensando en centímetros, el bloque va a "detectar" absolutamente todo. Las constantes llevan el sufijo `_MM` justamente para eso. |
| **Zona ciega** | La condición es estricta (`> 30`), así que un objeto pegado al sensor cuenta como "no detectado". Es intencional (heredado de EXT4) pero puede sorprender a un alumno. |

---

<!-- ═══════════════════════════ FIN MISIÓN M04 ═══════════════════════════ -->
<!-- Fin de "MISIÓN M04 — Ultrasonido + Ultrasonido lógico (STV2-1)". Detenete acá. -->
