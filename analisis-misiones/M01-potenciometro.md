<!-- ═══════════════════════════ INICIO MISIÓN M01 ═══════════════════════════ -->
<!-- Cursor: ejecutá SOLO esta misión. No pases a la siguiente hasta que los
     criterios de aceptación estén cumplidos y el proyecto compile.           -->

# MISIÓN M01 — Potenciómetro (STV2-6)

- **Repo objetivo:** `STV2-PADRE`
- **Archivo:** `blocks/sabana/potenciometro.ts`
- **Fuente del código:** `ORIGINAL/block/sensorGPIO.ts` → `Potentiometer()`
- **Depende de:** **M00** (necesita `puertoToAnalogPin`)
- **Bloques afectados:** 1
- **Estado:** ⬜ pendiente

---

## 1. Confirmación de CATEGORÍAS, TEXTOS y VARIABLES

Todo el diseño de PADRE se mantiene **sin un solo cambio**. Solo se reemplaza el cuerpo
de la función.

| Propiedad | Valor (se conserva) |
|---|---|
| `blockId` | `sabana_potenciometro` |
| **Texto del bloque** | `Potenciómetro │ en pin %puerto` |
| Categoría | `BLOQUES` |
| **Group (subcategoría)** | `SENSORES` |
| **Color** | `#FFB800` (amarillo = GPIO) |
| `weight` | `75` |
| `blockGap` | `8` |
| Forma | bloque **redondo** (reporter, devuelve `number`) |

**Variables / parámetros:**

| Parámetro | Tipo | Desplegable | Valores |
|---|---|---|---|
| `puerto` | `SabanaPuerto` | sí | `P0` `P1` `P2` `P3` |

**Retorno:** `number` — lectura analógica cruda, rango **0–1023**.

> ✅ Sin conflictos. Este componente es GPIO analógico en las dos extensiones, el texto
> ya dice `en pin %puerto`, y el color amarillo `#FFB800` ya corresponde al tipo GPIO.
> No hay nada que negociar.

---

## 2. Estado actual (PADRE)

```ts
namespace bloques {
    /**
     * STV2-6 — Potenciómetro en un puerto GPIO.
     * NOTA: la tabla original tenía el texto "Suelo en el puerto X" (copiado por
     * error de STV2-5). Se corrigió a "Potenciómetro..." para que coincida con
     * el componente.
     */
    //% blockId=sabana_potenciometro
    //% block="Potenciómetro │ en pin %puerto"
    //% group="SENSORES" color="#FFB800" weight=75 blockGap=8
    export function potenciometro(puerto: SabanaPuerto): number {
        return 0
    }
}
```

## 3. Código de referencia (ORIGINAL)

`ORIGINAL/block/sensorGPIO.ts`:

```ts
//% blockId=LogosSmart_Potentiometer
//% block="potentiometer pin %num value"
//% group="Potentiometer Module"
//% weight=99
//% color="#f1bd42"
export function Potentiometer( num: enGPIOpin): number {
    return pins.analogReadPin(num)
}
```

Es una línea. Lo único que hay que traducir es el tipo del parámetro: `enGPIOpin`
(cuyos miembros **ya son** valores de `AnalogPin`) → `SabanaPuerto` (números planos),
que es exactamente lo que resuelve `puertoToAnalogPin()` de M00.

---

## 4. Resultado esperado

Reemplazar el contenido completo de `blocks/sabana/potenciometro.ts` por:

```ts
namespace bloques {
    /**
     * STV2-6 — Potenciómetro en un puerto GPIO (lectura analógica 0-1023).
     *
     * Origen del código: ORIGINAL/block/sensorGPIO.ts -> Potentiometer()
     *   return pins.analogReadPin(num)
     *
     * NOTA HISTÓRICA: la tabla original tenía el texto "Suelo en el puerto X"
     * (copiado por error de STV2-5). Se corrigió a "Potenciómetro..." para que
     * coincida con el componente. El texto NO se vuelve a tocar.
     *
     * @param puerto puerto GPIO de la placa, eg: SabanaPuerto.P0
     */
    //% blockId=sabana_potenciometro
    //% block="Potenciómetro │ en pin %puerto"
    //% group="SENSORES" color="#FFB800" weight=75 blockGap=8
    export function potenciometro(puerto: SabanaPuerto): number {
        return pins.analogReadPin(puertoToAnalogPin(puerto))
    }
}
```

### Diff conceptual

| | Antes | Después |
|---|---|---|
| Anotaciones `//%` | 4 líneas | **idénticas, sin cambios** |
| Firma | `potenciometro(puerto: SabanaPuerto): number` | **idéntica** |
| Cuerpo | `return 0` | `return pins.analogReadPin(puertoToAnalogPin(puerto))` |

**Una sola línea de código cambia.** Todo lo demás son comentarios.

---

## 5. Criterios de aceptación

- [ ] El bloque aparece en `BLOQUES → SENSORES`, amarillo `#FFB800`, con el texto
      `Potenciómetro │ en pin P0` exactamente igual que antes.
- [ ] Girando el potenciómetro, el valor cambia de forma continua en el rango **0–1023**.
- [ ] Con el potenciómetro al mínimo el valor tiende a **0**; al máximo tiende a **1023**.
- [ ] Funciona en los **4 puertos** — verificar explícitamente el **puerto 3**, que
      físicamente es el pin **P8** (ver M00).
- [ ] El proyecto compila sin warnings.

### Prueba manual sugerida

```ts
basic.forever(function () {
    basic.showNumber(bloques.potenciometro(SabanaPuerto.P0))
    basic.pause(300)
})
```

---

## 6. Riesgos y advertencias

| Riesgo | Detalle |
|---|---|
| **Conflicto de modo de pin** | Si otro bloque hizo `pins.digitalWritePin()` sobre el mismo puerto antes, la lectura analógica puede quedar pegada. No es un bug de este bloque; documentar para el manual de uso. |
| **Escala sin normalizar** | Devuelve 0–1023 crudo, igual que el proveedor. Si más adelante se quiere 0–100 %, es un cambio de diseño y necesita **nueva misión** (cambiaría lo que ve el chico en pantalla). |
| **Puerto 3 = P8** | Depende de M00. Si M00 no está aplicada, este bloque **no compila** (no existe `puertoToAnalogPin`). |

---

<!-- ═══════════════════════════ FIN MISIÓN M01 ═══════════════════════════ -->
<!-- Fin de "MISIÓN M01 — Potenciómetro (STV2-6)". Detenete acá. -->
