<!-- ═══════════════════════════ INICIO MISIÓN M03 ═══════════════════════════ -->
<!-- Cursor: ejecutá SOLO esta misión. No pases a la siguiente hasta que los
     criterios de aceptación estén cumplidos y el proyecto compile.
     ATENCIÓN: esta misión cambia el TIPO DE RETORNO de un bloque y reduce un
     desplegable. Leer la sección 1 completa antes de tocar código.           -->

# MISIÓN M03 — Botón + Botón lógico (STV2-2)

- **Repo objetivo:** `STV2-PADRE`
- **Archivos:** `blocks/sabana/boton.ts`, `blocks/sabana/boton_logico.ts`
- **Fuentes del código:** `EXT4/blocks/smartteam4/boton.ts` (pull-up y patrón shadow) +
  `ORIGINAL/block/sensorGPIO.ts` → `Button()` (lógica invertida)
- **Depende de:** **M00** (`puertoToDigitalPin`) y de que exista
  `SabanaVerdaderoFalso` en `blocks/sabana/ultrasonido_logico.ts` (ya existe)
- **Bloques afectados:** 2
- **Decisión aplicada:** **B2 — booleano puro** (ver `DECISIONES.md`)
- **Estado:** ⬜ pendiente

---

## 1. Confirmación de CATEGORÍAS, TEXTOS y VARIABLES

### Bloque 1 — lectura del botón (redondo)

| Propiedad | Antes | Después |
|---|---|---|
| `blockId` | `sabana_boton` | **igual** |
| **Texto** | `Botón │ en pin %puerto` | **igual, sin cambios** |
| Group | `SENSORES` | **igual** |
| Color | `#FFB800` | **igual** |
| `weight` / `blockGap` | `95` / `8` | **igual** |
| **Forma / retorno** | redondo, `number` | 🔶 **hexagonal, `boolean`** |

> 🔶 Único cambio: el bloque pasa de **redondo (número)** a **hexagonal (booleano)**.
> Es consecuencia directa de la decisión B2. El **texto no cambia**.

**Parámetros:**

| Parámetro | Tipo | Desplegable | Valores |
|---|---|---|---|
| `puerto` | `SabanaPuerto` | sí | `P0` `P1` `P2` `P3` |

**Retorno:** `boolean` — `true` = **presionado**.

---

### Bloque 2 — comparación lógica (hexagonal)

| Propiedad | Antes | Después |
|---|---|---|
| `blockId` | `sabana_boton_logico` | **igual** |
| **Texto** | `%medida %operador %valor` | **igual, sin cambios** |
| Group | `SENSORES` | **igual** |
| Color | `#006970` | **igual** |
| `weight` / `blockGap` | `94` / `8` | **igual** |
| Forma / retorno | hexagonal, `boolean` | **igual** |
| Shadow de `%medida` | `sabana_boton` | **igual** |

**Parámetros — acá están los dos cambios:**

| Parámetro | Antes | Después |
|---|---|---|
| `medida` | `number` | 🔶 `boolean` |
| `operador` | `SabanaOperadorComparacion` con **6** opciones: `=` `≠` `<` `≤` `>` `≥` | 🔶 `SabanaOperadorComparacion` con **2** opciones: `=` `≠` |
| `valor` | `number`, `min=0 max=1 defl=1` (campo numérico editable) | 🔶 `SabanaVerdaderoFalso`, desplegable **`Verdadero` / `Falso`** |

**Por qué:** un booleano no admite ordenamiento. `presionado > presionado` no significa
nada. Y `%valor` como campo numérico permitiría escribir `7`, que nunca sería igual a un
booleano. Los 4 operadores de orden y el campo numérico se eliminan por corrección
lógica, no por estética.

**Aspecto final del bloque en la caja de herramientas:**

```
⬡  ( Botón │ en pin [P0▾] )  [ =▾ ]  [ Verdadero▾ ]
```

---

## 2. Estado actual (PADRE)

`blocks/sabana/boton.ts`:

```ts
namespace bloques {
    //% blockId=sabana_boton
    //% block="Botón │ en pin %puerto"
    //% group="SENSORES" color="#FFB800" weight=95 blockGap=8
    export function boton(puerto: SabanaPuerto): number {
        return 0
    }
}
```

`blocks/sabana/boton_logico.ts`:

```ts
namespace bloques {
    export enum SabanaOperadorComparacion {
        //% block="="
        Igual = 0,
        //% block="≠"
        Distinto = 1,
        //% block="<"
        Menor = 2,
        //% block="≤"
        MenorIgual = 3,
        //% block=">"
        Mayor = 4,
        //% block="≥"
        MayorIgual = 5,
    }

    //% blockId=sabana_boton_logico
    //% block="%medida %operador %valor"
    //% medida.shadow=sabana_boton
    //% valor.min=0 valor.max=1 valor.defl=1
    //% group="SENSORES" color="#006970" weight=94 blockGap=8
    export function botonLogico(
        medida: number,
        operador: SabanaOperadorComparacion,
        valor: number
    ): boolean {
        // TODO: lógica real pendiente
        return true
    }
}
```

## 3. Código de referencia

### EXT4 — pull-up + patrón shadow (`EXT4/blocks/smartteam4/boton.ts`)

```ts
export function ext4BotonEnPin(puerto: Ext4Puerto): number {
    const pin = puertoToGpioPin(puerto)
    pins.setPull(pin, PinPullMode.PullUp)
    return 1 - pins.digitalReadPin(pin)
}
```

### ORIGINAL — lógica invertida (`ORIGINAL/block/sensorGPIO.ts`)

```ts
export function Button(num: enGPIOpin): boolean {
    return pins.digitalReadPin(num) == 0
}
```

**Lo que hay que combinar:** el `setPull(PullUp)` de EXT4 (imprescindible: sin resistencia
de pull-up el pin queda flotando y la lectura es ruido aleatorio) + el retorno `boolean`
con comparación `== 0` de ORIGINAL. El botón está cableado a **masa activa**: presionado
lleva el pin a `0`.

---

## 4. Resultado esperado

### 4.1 `blocks/sabana/boton.ts` — contenido completo

```ts
namespace bloques {
    /**
     * STV2-2 — Botón conectado a un puerto GPIO.
     *
     * Devuelve TRUE cuando el botón está PRESIONADO.
     *
     * El botón es de masa activa: presionado lleva el pin a 0. Por eso se
     * activa la resistencia de pull-up interna y se compara contra 0.
     * Sin el setPull el pin queda flotando y la lectura es ruido.
     *
     * Origen del código:
     *   - pull-up: EXT4/blocks/smartteam4/boton.ts -> ext4BotonEnPin()
     *   - comparación == 0: ORIGINAL/block/sensorGPIO.ts -> Button()
     *
     * @param puerto puerto GPIO de la placa, eg: SabanaPuerto.P0
     */
    //% blockId=sabana_boton
    //% block="Botón │ en pin %puerto"
    //% group="SENSORES" color="#FFB800" weight=95 blockGap=8
    export function boton(puerto: SabanaPuerto): boolean {
        const pin = puertoToDigitalPin(puerto)
        pins.setPull(pin, PinPullMode.PullUp)
        return pins.digitalReadPin(pin) == 0
    }
}
```

### 4.2 `blocks/sabana/boton_logico.ts` — contenido completo

```ts
namespace bloques {
    /**
     * Operadores aplicables a un valor booleano.
     *
     * Solo = y ≠. Los operadores de orden (< ≤ > ≥) se eliminaron al pasar el
     * botón a booleano (decisión B2): no tienen significado sobre true/false.
     * Los valores 0 y 1 se conservan para no romper proyectos .blocks guardados.
     */
    export enum SabanaOperadorComparacion {
        //% block="="
        Igual = 0,
        //% block="≠"
        Distinto = 1,
    }

    /**
     * Bloque booleano combinado del Botón (hexágono).
     *
     * El bloque "Botón │ en pin %puerto" (blockId sabana_boton, con su propio
     * color amarillo y su propio desplegable de pin P0-P3) queda encajado por
     * defecto dentro del hexágono, como shadow block.
     *
     * El enum SabanaVerdaderoFalso se REUTILIZA de
     * blocks/sabana/ultrasonido_logico.ts — no redeclararlo acá.
     *
     * @param medida lectura del botón, eg: bloques.boton(SabanaPuerto.P0)
     * @param operador operador de comparación
     * @param valor valor esperado
     */
    //% blockId=sabana_boton_logico
    //% block="%medida %operador %valor"
    //% medida.shadow=sabana_boton
    //% group="SENSORES" color="#006970" weight=94 blockGap=8
    export function botonLogico(
        medida: boolean,
        operador: SabanaOperadorComparacion,
        valor: SabanaVerdaderoFalso
    ): boolean {
        const esperado = (valor == SabanaVerdaderoFalso.Verdadero)
        switch (operador) {
            case SabanaOperadorComparacion.Igual:
                return medida == esperado
            case SabanaOperadorComparacion.Distinto:
                return medida != esperado
            default:
                return false
        }
    }
}
```

### 4.3 Verificación de orden de archivos en `pxt.json`

`SabanaVerdaderoFalso` se declara en `ultrasonido_logico.ts`. En el array `files` ese
archivo ya aparece **antes** de `boton_logico.ts`:

```
"blocks/sabana/ultrasonido_logico.ts",   <-- declara SabanaVerdaderoFalso
"blocks/sabana/boton.ts",
"blocks/sabana/boton_logico.ts",         <-- lo consume
```

✅ El orden ya es correcto. **No modificar `pxt.json` en esta misión.**

### 4.4 Comprobación de que no quedaron usos huérfanos

Después de reducir el enum, buscar en todo el repo:

```
grep -rn "SabanaOperadorComparacion" blocks/
```

Debe aparecer **únicamente** en `boton_logico.ts`. Si aparece en otro archivo, ese
archivo dejará de compilar al eliminar los miembros `Menor`, `MenorIgual`, `Mayor`,
`MayorIgual`.

También buscar quién consumía `boton()` como número:

```
grep -rn "bloques.boton(" .
```

Si `main.ts`, `test.ts` o `main.blocks` lo usan en un contexto numérico, hay que
actualizarlos.

---

## 5. Criterios de aceptación

- [ ] `Botón │ en pin %puerto` sigue mostrando el **mismo texto** y el color `#FFB800`.
- [ ] El bloque del botón ahora tiene **forma hexagonal** (booleano) y encaja
      directamente en un `si ... entonces`.
- [ ] El desplegable de operadores muestra **exactamente 2 opciones**: `=` y `≠`.
- [ ] El desplegable de `%valor` muestra **`Verdadero` / `Falso`**, y **no** es un campo
      numérico editable.
- [ ] Al arrastrar `sabana_boton_logico` a la mesa de trabajo, viene **precargado** con
      el bloque del botón adentro (shadow).
- [ ] Presionando el botón físico, `Botón en pin P0 = Verdadero` da **verdadero**;
      suelto da **falso**.
- [ ] Sin tocar nada, la lectura es **estable** (no titila) — confirma que el pull-up funciona.
- [ ] Funciona en los 4 puertos, verificando el **puerto 3** (pin P8).
- [ ] Compila sin warnings.

### Prueba manual sugerida

```ts
basic.forever(function () {
    if (bloques.botonLogico(
            bloques.boton(SabanaPuerto.P0),
            bloques.SabanaOperadorComparacion.Igual,
            bloques.SabanaVerdaderoFalso.Verdadero)) {
        basic.showIcon(IconNames.Yes)
    } else {
        basic.showIcon(IconNames.No)
    }
})
```

---

## 6. Riesgos y advertencias

| Riesgo | Detalle / mitigación |
|---|---|
| **Rompe proyectos `.blocks` guardados** | Cambiar `boton()` de `number` a `boolean` invalida cualquier programa existente que lo usara como número. Es inevitable y fue aceptado en la decisión B2. Avisar al equipo antes de publicar la versión. |
| **Eliminar miembros del enum** | Los valores `0` y `1` de `Igual` y `Distinto` **se conservan** a propósito. Si se renumeraran, los `.blocks` guardados apuntarían al operador equivocado en silencio. |
| **El bloque redondo ya no muestra número** | Antes se podía mandar `boton()` directo a la OLED o a `showNumber`. Ahora no. Si el equipo lo necesita, hace falta un bloque **nuevo** → nueva misión, no un parche acá. |
| **Pull-up en cada llamada** | `setPull` se ejecuta en cada lectura. Es idempotente y baratísimo; EXT4 lo hace igual. No optimizar moviéndolo a un init: complica el flujo sin beneficio medible. |
| **Colisión de modo de pin** | Si el mismo puerto se usó antes con `analogReadPin` (M01/M02/M12), la lectura digital puede quedar rara. Documentar: un puerto, un componente. |

---

<!-- ═══════════════════════════ FIN MISIÓN M03 ═══════════════════════════ -->
<!-- Fin de "MISIÓN M03 — Botón + Botón lógico (STV2-2)". Detenete acá. -->
