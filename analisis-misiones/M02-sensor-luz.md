<!-- ═══════════════════════════ INICIO MISIÓN M02 ═══════════════════════════ -->
<!-- Cursor: ejecutá SOLO esta misión. No pases a la siguiente hasta que los
     criterios de aceptación estén cumplidos y el proyecto compile.           -->

# MISIÓN M02 — Sensor de Luz (STV2-7)

- **Repo objetivo:** `STV2-PADRE`
- **Archivo:** `blocks/sabana/luz.ts`
- **Fuente del código:** `ORIGINAL/block/sensorGPIO.ts` → `Photosensitive()`
- **Depende de:** **M00** (necesita `puertoToAnalogPin`)
- **Bloques afectados:** 1
- **Estado:** ⬜ pendiente

---

## 1. Confirmación de CATEGORÍAS, TEXTOS y VARIABLES

Sin cambios de diseño. Solo se reemplaza el cuerpo de la función.

| Propiedad | Valor (se conserva) |
|---|---|
| `blockId` | `sabana_luz` |
| **Texto del bloque** | `Sensor de Luz │ en pin %puerto` |
| Categoría | `BLOQUES` |
| **Group** | `SENSORES` |
| **Color** | `#FFB800` (amarillo = GPIO) |
| `weight` | `70` |
| `blockGap` | `8` |
| Forma | bloque **redondo** (reporter, devuelve `number`) |

**Variables / parámetros:**

| Parámetro | Tipo | Desplegable | Valores |
|---|---|---|---|
| `puerto` | `SabanaPuerto` | sí | `P0` `P1` `P2` `P3` |

**Retorno:** `number` — lectura analógica cruda **0–1023**.

> ✅ Sin conflictos. GPIO analógico en ambas extensiones, el texto ya dice
> `en pin %puerto`, el color `#FFB800` ya corresponde a GPIO.

---

## 2. Estado actual (PADRE)

```ts
namespace bloques {
    /**
     * STV2-7 — Sensor de luz en un puerto GPIO.
     * NOTA: mismo ajuste de texto que STV2-6 (la tabla decía "Suelo").
     */
    //% blockId=sabana_luz
    //% block="Sensor de Luz │ en pin %puerto"
    //% group="SENSORES" color="#FFB800" weight=70 blockGap=8
    export function luz(puerto: SabanaPuerto): number {
        return 0
    }
}
```

## 3. Código de referencia (ORIGINAL)

`ORIGINAL/block/sensorGPIO.ts`:

```ts
//% blockId=LogosSmart_Photosensitive
//% block="photosensitive pin %num value"
//% group="Photosensitive Sensor"
//% weight=99
//% color="#f1bd42"
export function Photosensitive(num: enGPIOpin): number {
    return pins.analogReadPin(num)
}
```

---

## 4. Resultado esperado

Reemplazar el contenido completo de `blocks/sabana/luz.ts` por:

```ts
namespace bloques {
    /**
     * STV2-7 — Sensor de luz (fotorresistencia) en un puerto GPIO.
     * Lectura analógica 0-1023.
     *
     * Origen del código: ORIGINAL/block/sensorGPIO.ts -> Photosensitive()
     *   return pins.analogReadPin(num)
     *
     * NOTA HISTÓRICA: la tabla original decía "Suelo" por un copiado erróneo de
     * STV2-5. El texto ya fue corregido a "Sensor de Luz" y NO se vuelve a tocar.
     *
     * @param puerto puerto GPIO de la placa, eg: SabanaPuerto.P0
     */
    //% blockId=sabana_luz
    //% block="Sensor de Luz │ en pin %puerto"
    //% group="SENSORES" color="#FFB800" weight=70 blockGap=8
    export function luz(puerto: SabanaPuerto): number {
        return pins.analogReadPin(puertoToAnalogPin(puerto))
    }
}
```

### Diff conceptual

| | Antes | Después |
|---|---|---|
| Anotaciones `//%` | 3 líneas | **idénticas** |
| Firma | `luz(puerto: SabanaPuerto): number` | **idéntica** |
| Cuerpo | `return 0` | `return pins.analogReadPin(puertoToAnalogPin(puerto))` |

---

## 5. Criterios de aceptación

- [ ] El bloque aparece en `BLOQUES → SENSORES`, amarillo `#FFB800`, texto
      `Sensor de Luz │ en pin P0` sin cambios.
- [ ] Tapando el sensor con la mano el valor **cambia de forma notoria**.
- [ ] El valor se mantiene dentro de **0–1023**.
- [ ] Funciona en los 4 puertos, verificando explícitamente el **puerto 3** (pin P8).
- [ ] Compila sin warnings.

### Prueba manual sugerida

```ts
basic.forever(function () {
    basic.showNumber(bloques.luz(SabanaPuerto.P0))
    basic.pause(300)
})
```

---

## 6. Riesgos y advertencias

| Riesgo | Detalle |
|---|---|
| **Sentido de la lectura** | Según el divisor resistivo del módulo, "más luz" puede dar valor **más alto o más bajo**. ORIGINAL no lo normaliza y nosotros tampoco. Verificar empíricamente y documentarlo en el manual del alumno, **no** invertirlo en código sin nueva misión. |
| **Sin bloque lógico** | PADRE no define un hexágono tipo `%medida está Claro/Oscuro`. No se agrega: agregar bloques nuevos es cambio de diseño. |
| **Mismo código que M01** | `luz()` y `potenciometro()` son idénticos por dentro (`analogReadPin`). Es correcto: son módulos distintos con el mismo tipo de señal. **No** unificarlos en una sola función. |

---

<!-- ═══════════════════════════ FIN MISIÓN M02 ═══════════════════════════ -->
<!-- Fin de "MISIÓN M02 — Sensor de Luz (STV2-7)". Detenete acá. -->
