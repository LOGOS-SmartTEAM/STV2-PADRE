# MISIÓN — Seguidor de línea: bloque de acción con desplegable + velocidad

**Repositorio:** `LOGOS-SmartTEAM/STV2-PADRE` (fuente canónica)
**Archivo a modificar:** `blocks/sabana/seguidor_linea.ts`
**Archivo que se reutiliza (NO tocar):** `blocks/sabana/movimiento.ts`
**Versión actual:** 3.3.0 → subir a **3.4.0** en `pxt.json`

> Nota: este bloque NO existe en EXT4/EXT5/EXT6/EXT7 (no incluyen seguidor de línea).
> La misión es solo sobre STV2-PADRE.

---

## 1. Contexto

Hoy `seguidor_linea.ts` tiene dos bloques finales (color celeste `#35BFE9`, grupo `SENSORES`):

| blockId | Tipo | Estado |
|---|---|---|
| `seguidor_de_linea` | Devuelve `boolean` por lado (Derecha / Centro / Izquierda) | **Se mantiene igual** |
| `seguidor_de_linea_ramas` | Bloque de acción con 3 ramas tipo IF con "huecos" (`handlerDerecha`, `handlerCentro`, `handlerIzquierda`) | **Se reemplaza por completo** |

También hay bloques viejos en gris `#9E9E9E` (`seguidor_linea`, `seguidor_linea_detecta`, `sensor_grises`, `sensor_grises_comparar`). **No se tocan.**

Protocolo del sensor (I2C `0x28`, lectura de 5 bytes):
- `buf[0]` = Izquierda, `buf[1]` = Centro, `buf[2]` = Derecha, `buf[3..4]` reservado.
- Valor `1` = detecta **negro** (está sobre la línea). Valor `0` = detecta **blanco** (se salió de la línea).

Motores: el bloque `movimientoSimple(movimiento, velocidad)` de `movimiento.ts` ya controla los dos motores del robot por I2C (rojo `0x51` = derecho, verde `0x52` = izquierdo). **Se reutiliza tal cual**, sin copiar la lógica.

---

## 2. Objetivo

Reemplazar `seguidor_de_linea_ramas` por un bloque de acción grande de 4 renglones:

```
Seguidor de líneas │ en pin I2C
Derecha    [▼ Girar a la izquierda] Velocidad [ 50 ]
Centro     [▼ Avanzar            ]  Velocidad [ 50 ]
Izquierda  [▼ Girar a la derecha ]  Velocidad [ 50 ]
```

Reglas:
1. **Renglón 1 (título):** `Seguidor de líneas │ en pin I2C` — misma metodología que el resto de los bloques (nombre │ … en pin I2C). Sin selector de pin (I2C fijo).
2. **Renglones 2, 3 y 4:** texto fijo `Derecha`, `Centro`, `Izquierda` (en ese orden), cada uno con:
   - un **desplegable** con exactamente 3 opciones: `Girar a la derecha`, `Girar a la izquierda`, `Avanzar`;
   - **valores por defecto:** Derecha → `Girar a la izquierda`, Centro → `Avanzar`, Izquierda → `Girar a la derecha` (si un lado se sale de la línea, corrige hacia el lado opuesto);
   - el texto `Velocidad` seguido de un **campo numérico** (0–100, default 50) que acepta una variable arrastrada (ej. la variable "velocidad" del alumno).
3. **Comportamiento:** en cada ejecución se lee el sensor **una sola vez**. Por cada lado cuyo sensor detecta **blanco** (`buf[lado] == 0`, es decir, se salió de la línea negra) se ejecuta la acción de motores configurada en su renglón, con la velocidad de ese renglón, llamando a `bloques.movimientoSimple(...)`.
4. Los tres renglones son IFs **independientes**: se evalúan en orden Derecha → Centro → Izquierda. Si varios sensores ven blanco a la vez, se ejecutan todos y **la última orden enviada a los motores es la que queda vigente** (Izquierda).
5. Si ningún sensor detecta blanco, el bloque **no envía nada** a los motores (mantienen su último estado).
6. Está pensado para ir dentro de `por siempre`.
7. Color `#35BFE9`, grupo `SENSORES`, `weight=85.45` (el mismo lugar que ocupaba el bloque reemplazado).

---

## 3. Cambios exactos

### 3.1 `blocks/sabana/seguidor_linea.ts`

**a) Agregar un enum nuevo** (dentro de `namespace bloques`, debajo de `SabanaSeguidorLineaLado`):

```ts
    /**
     * Acción de motores para cada renglón del bloque
     * seguidor_de_linea_acciones. Solo 3 opciones (sin Retroceder ni Frenar).
     * Se mapea a SabanaMovimiento en seguidorAccionToMovimiento().
     */
    export enum SabanaSeguidorAccion {
        //% block="Girar a la derecha"
        GirarDerecha = 0,
        //% block="Girar a la izquierda"
        GirarIzquierda = 1,
        //% block="Avanzar"
        Avanzar = 2,
    }
```

**b) Eliminar por completo** la función `seguidorDeLineaRamas` junto con su comentario JSDoc y sus anotaciones `//%` (blockId `seguidor_de_linea_ramas`).

**c) En su lugar, agregar** (mismo lugar del archivo, después de `seguidorDeLinea`):

```ts
    /**
     * Mapea la opción del desplegable del seguidor de línea al enum real
     * de movimiento del robot (movimiento.ts).
     */
    function seguidorAccionToMovimiento(accion: SabanaSeguidorAccion): SabanaMovimiento {
        switch (accion) {
            case SabanaSeguidorAccion.GirarDerecha: return SabanaMovimiento.GirarDerecha
            case SabanaSeguidorAccion.GirarIzquierda: return SabanaMovimiento.GirarIzquierda
            case SabanaSeguidorAccion.Avanzar: return SabanaMovimiento.Avanzar
        }
        return SabanaMovimiento.Frenar
    }

    /**
     * Bloque de acción del seguidor de línea (I2C 0x28). Reemplaza al
     * antiguo seguidor_de_linea_ramas (ramas con huecos).
     *
     * Un renglón por sensor (Derecha / Centro / Izquierda), cada uno con
     * desplegable de acción (Girar a la derecha / Girar a la izquierda /
     * Avanzar) y velocidad propia (0-100, admite variable).
     *
     * Lectura única por ejecución (para usar dentro de "por siempre").
     * Un renglón se activa cuando SU sensor detecta BLANCO (buf == 0), es
     * decir, cuando ese lado se salió de la línea negra. Los 3 renglones
     * son IFs independientes, evaluados en orden Derecha → Centro →
     * Izquierda; la última orden enviada a los motores es la que queda.
     * Si ningún sensor ve blanco, no se envía nada a los motores.
     *
     * La lógica de motores NO se duplica: se reutiliza movimientoSimple()
     * de movimiento.ts (motor rojo 0x51 = derecho, verde 0x52 = izquierdo).
     */
    //% blockId=seguidor_de_linea_acciones
    //% block="Seguidor de líneas │ en pin I2C\nDerecha %accionDerecha Velocidad %velDerecha\nCentro %accionCentro Velocidad %velCentro\nIzquierda %accionIzquierda Velocidad %velIzquierda"
    //% accionDerecha.defl=SabanaSeguidorAccion.GirarIzquierda
    //% accionCentro.defl=SabanaSeguidorAccion.Avanzar
    //% accionIzquierda.defl=SabanaSeguidorAccion.GirarDerecha
    //% velDerecha.min=0 velDerecha.max=100 velDerecha.defl=50
    //% velCentro.min=0 velCentro.max=100 velCentro.defl=50
    //% velIzquierda.min=0 velIzquierda.max=100 velIzquierda.defl=50
    //% inlineInputMode=external
    //% group="SENSORES" color="#35BFE9" weight=85.45 blockGap=8
    export function seguidorDeLineaAcciones(
        accionDerecha: SabanaSeguidorAccion, velDerecha: number,
        accionCentro: SabanaSeguidorAccion, velCentro: number,
        accionIzquierda: SabanaSeguidorAccion, velIzquierda: number
    ): void {
        let buf = pins.i2cReadBuffer(SEGUIDOR_LINEA_I2C_ADDR, 5)

        // 0 = blanco = se salió de la línea negra → ejecutar acción del renglón
        if (buf[SabanaSeguidorLineaLado.Derecha] == 0) {
            movimientoSimple(seguidorAccionToMovimiento(accionDerecha), velDerecha)
        }
        if (buf[SabanaSeguidorLineaLado.Centro] == 0) {
            movimientoSimple(seguidorAccionToMovimiento(accionCentro), velCentro)
        }
        if (buf[SabanaSeguidorLineaLado.Izquierda] == 0) {
            movimientoSimple(seguidorAccionToMovimiento(accionIzquierda), velIzquierda)
        }
    }
```

> Si al compilar en MakeCode los saltos de línea (`\n`) no renderizan los 4 renglones,
> alternativa: quitar los `\n` del `block=` y dejar solo `inlineInputMode=external`,
> que fuerza un parámetro por fila. Probar primero con `\n` (ya lo usaba el bloque anterior).

### 3.2 `pxt.json`

- Cambiar `"version": "3.3.0"` → `"version": "3.4.0"`.
- No hay que agregar archivos: `seguidor_linea.ts` y `movimiento.ts` ya están listados.

### 3.3 `README.md`

En la tabla de bloques de SENSORES, reemplazar la mención al bloque de ramas del seguidor de línea por:
`Seguidor de líneas (acción por sensor: Derecha/Centro/Izquierda con desplegable + velocidad)`.

### 3.4 `test.ts` (opcional)

Agregar una línea de prueba para que compile como proyecto:

```ts
bloques.seguidorDeLineaAcciones(
    bloques.SabanaSeguidorAccion.GirarIzquierda, 50,
    bloques.SabanaSeguidorAccion.Avanzar, 50,
    bloques.SabanaSeguidorAccion.GirarDerecha, 50
)
```

---

## 4. Lo que NO hay que hacer

- No modificar `movimiento.ts` ni copiar `movimientoEscribirMotor` / `movimientoRunDual` a otro archivo.
- No tocar `seguidor_de_linea` (el bloque booleano).
- No tocar los bloques grises placeholder.
- No agregar `Retroceder` ni `Frenar` al desplegable nuevo.
- No agregar selector de pin.

---

## 5. Verificación

1. `pxt build` (o abrir el repo como extensión en MakeCode) sin errores de TypeScript.
2. En la categoría **PADRE → SENSORES** aparece un solo bloque de acción del seguidor de línea, de 4 renglones, celeste, con texto fijo `Derecha` / `Centro` / `Izquierda`.
3. Cada renglón muestra: desplegable de 3 opciones + `Velocidad` + campo numérico (default 50). Defaults: Derecha = Girar a la izquierda, Centro = Avanzar, Izquierda = Girar a la derecha.
4. Se puede arrastrar una variable al campo de velocidad.
5. El bloque `seguidor_de_linea_ramas` ya no existe en la paleta.
6. Con el robot real, dentro de `por siempre`: al levantar el sensor derecho de la línea negra (ve blanco) el robot ejecuta la acción del renglón Derecha con esa velocidad; ídem centro e izquierda.
7. Commit sugerido: `feat(seguidor_linea): bloque de acción por sensor con desplegable y velocidad (3.4.0)`.