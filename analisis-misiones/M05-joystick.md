<!-- ═══════════════════════════ INICIO MISIÓN M05 ═══════════════════════════ -->
<!-- Cursor: ejecutá SOLO esta misión. No pases a la siguiente hasta que los
     criterios de aceptación estén cumplidos y el proyecto compile.           -->

# MISIÓN M05 — Joystick (STV2-8)

- **Repo objetivo:** `STV2-PADRE`
- **Archivo:** `blocks/sabana/joystick.ts`
- **Fuente del código:** `ORIGINAL/block/joystick.ts` → `rockerGetValue()`
- **Depende de:** nada (es I2C)
- **Bloques afectados:** 1
- **Estado:** ⬜ pendiente

---

## 1. Confirmación de CATEGORÍAS, TEXTOS y VARIABLES

| Propiedad | Valor (se conserva) |
|---|---|
| `blockId` | `sabana_joystick` |
| **Texto** | `Joystick │ %eje en pin I2C` |
| Group | `SENSORES` |
| **Color** | `#35BFE9` (celeste = I2C) |
| `weight` / `blockGap` | `65` / `8` |
| Forma | redondo (reporter, `number`) |

**Variables / parámetros:**

| Parámetro | Tipo | Desplegable | **Etiquetas visibles** | Valor interno antes | Valor interno después |
|---|---|---|---|---|---|
| `eje` | `SabanaEjeJoystick` | sí | `Eje X` / `Eje Y` | `0` / `1` | 🔶 **`1` / `2`** |

> 🔶 **Cambian los valores internos del enum, NO las etiquetas.** El desplegable sigue
> mostrando `Eje X` y `Eje Y`, idéntico. El motivo es técnico: en el protocolo del
> proveedor esos números son **desplazamientos dentro del buffer I2C** (byte 1 = X,
> byte 2 = Y). ORIGINAL usa el valor del enum directamente como índice, y seguimos esa
> regla. Con `0` y `1` el eje X leería el byte de estado y el eje Y leería el eje X.

**Retorno:** `number` — valor con signo, aproximadamente **−128 a 127** (`Int8`).
Centrado ≈ `0`.

---

## 2. Estado actual (PADRE)

```ts
namespace bloques {
    export enum SabanaEjeJoystick {
        //% block="Eje X"
        EjeX = 0,
        //% block="Eje Y"
        EjeY = 1,
    }

    //% blockId=sabana_joystick
    //% block="Joystick │ %eje en pin I2C"
    //% group="SENSORES" color="#35BFE9" weight=65 blockGap=8
    export function joystick(eje: SabanaEjeJoystick): number {
        return 0
    }
}
```

## 3. Código de referencia (ORIGINAL)

`ORIGINAL/block/joystick.ts`:

```ts
const rockerI2cAddress = 0x61;

enum rocket {
    //% block="X"
    X = 1,
    //% block="Y"
    Y = 2,
}

export function rockerGetValue(direction: rocket): number {
    let buf = pins.createBuffer(3)
    buf = pins.i2cReadBuffer(rockerI2cAddress, 3)

    let value = buf.getNumber(NumberFormat.Int8BE, direction)

    if (direction == 2) {
        return -value
    } else {
        return value
    }
}
```

Dos cosas a preservar:

1. Se leen **3 bytes** aunque solo se usen los índices 1 y 2. El byte 0 se descarta.
2. El **eje Y viene invertido** por el montaje del módulo, y ORIGINAL lo corrige
   devolviendo `-value`. Hay que mantener esa inversión, si no "arriba" da negativo.

La primera línea (`let buf = pins.createBuffer(3)`) es un desperdicio: se sobreescribe
de inmediato. Se puede omitir sin cambiar el comportamiento.

---

## 4. Resultado esperado

Reemplazar el contenido completo de `blocks/sabana/joystick.ts` por:

```ts
namespace bloques {

    // Dirección I2C del módulo joystick. Verificado en ORIGINAL/block/joystick.ts
    const JOYSTICK_I2C_ADDR = 0x61   // 97

    /**
     * Ejes del joystick.
     *
     * Los valores 1 y 2 NO son arbitrarios: son el desplazamiento del byte
     * dentro del buffer I2C de 3 bytes que devuelve el módulo.
     *   byte 0 -> descartado
     *   byte 1 -> eje X
     *   byte 2 -> eje Y
     * Misma convención que ORIGINAL (enum rocket: X = 1, Y = 2).
     * NO cambiar estos valores a 0 y 1.
     */
    export enum SabanaEjeJoystick {
        //% block="Eje X"
        EjeX = 1,
        //% block="Eje Y"
        EjeY = 2,
    }

    /**
     * STV2-8 — Joystick conectado por I2C.
     *
     * Devuelve un valor con signo (Int8, aprox. -128 a 127). En reposo el
     * valor está cerca de 0.
     *
     * El eje Y se devuelve NEGADO porque el módulo está montado invertido.
     * Sin esa negación, empujar el joystick hacia arriba daría negativo.
     * Comportamiento heredado de ORIGINAL -> rockerGetValue().
     *
     * @param eje eje a leer, eg: SabanaEjeJoystick.EjeX
     */
    //% blockId=sabana_joystick
    //% block="Joystick │ %eje en pin I2C"
    //% group="SENSORES" color="#35BFE9" weight=65 blockGap=8
    export function joystick(eje: SabanaEjeJoystick): number {
        const buf = pins.i2cReadBuffer(JOYSTICK_I2C_ADDR, 3)
        const valor = buf.getNumber(NumberFormat.Int8BE, eje)

        if (eje == SabanaEjeJoystick.EjeY) {
            return -valor
        }
        return valor
    }
}
```

### Diff conceptual

| | Antes | Después |
|---|---|---|
| Etiquetas del desplegable | `Eje X` / `Eje Y` | **idénticas** |
| Valores del enum | `0` / `1` | 🔶 `1` / `2` |
| Anotaciones `//%` del bloque | 3 líneas | **idénticas** |
| Firma | `joystick(eje): number` | **idéntica** |
| Cuerpo | `return 0` | lectura I2C + inversión de Y |

---

## 5. Criterios de aceptación

- [ ] El bloque mantiene texto `Joystick │ Eje X en pin I2C` y color `#35BFE9`.
- [ ] El desplegable sigue mostrando **`Eje X`** y **`Eje Y`** (no `X` / `Y`).
- [ ] En reposo, **ambos ejes** leen un valor cercano a **0** (tolerancia ±10 por deriva
      del potenciómetro interno).
- [ ] Empujando el joystick a la **derecha**, el `Eje X` da un valor claramente
      **positivo**; a la izquierda, **negativo**.
- [ ] Empujando **hacia arriba**, el `Eje Y` da **positivo**; hacia abajo, **negativo**.
      ⚠️ Si sale al revés, revisar la negación del eje Y — no "arreglarlo" invirtiendo el
      signo del eje X.
- [ ] Los dos ejes leen **valores distintos** al mover solo uno. Si al mover X también
      cambia Y (o si un eje siempre lee lo mismo), los valores del enum quedaron mal.
- [ ] Compila sin warnings.

### Prueba manual sugerida

```ts
basic.forever(function () {
    basic.showNumber(bloques.joystick(bloques.SabanaEjeJoystick.EjeX))
    basic.pause(300)
    basic.showNumber(bloques.joystick(bloques.SabanaEjeJoystick.EjeY))
    basic.pause(300)
})
```

---

## 6. Riesgos y advertencias

| Riesgo | Detalle / mitigación |
|---|---|
| **Valores del enum** | Es el punto crítico. Si alguien los "normaliza" a `0` y `1`, el bloque compila igual y devuelve números que parecen razonables, pero **son los ejes equivocados**. El comentario del enum lo advierte explícitamente. |
| **Inversión del eje Y** | Está pegada al valor `2` del enum. Si el enum cambia, la condición `eje == SabanaEjeJoystick.EjeY` sigue siendo correcta porque usa el miembro y no el número literal — mejor que el `if (direction == 2)` de ORIGINAL. |
| **Sin bloque de dirección** | ORIGINAL tiene además `rockerDetect()` (hexágono `joystick detected arriba/abajo/izq/der` con umbral ±50). **PADRE no tiene ese bloque y no se agrega**: sería diseño nuevo. Queda anotado como candidato futuro. |
| **Ruido / deriva** | En reposo puede leer ±5 en vez de 0 exacto. Para usarlo en aula conviene una zona muerta, pero eso sería un bloque nuevo → no acá. |
| **Bus I2C compartido** | Comparte bus con ultrasonido (`0x23`), OLED (`0x3C`), motores (`0x51`-`0x54`), LCD (`0x20`), tira RGB (`0x24`), color (`0x10`), DHT11 (`0x27`). Ninguna colisión de direcciones. ✅ |

---

<!-- ═══════════════════════════ FIN MISIÓN M05 ═══════════════════════════ -->
<!-- Fin de "MISIÓN M05 — Joystick (STV2-8)". Detenete acá. -->
