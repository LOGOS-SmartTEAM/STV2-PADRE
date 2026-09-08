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

> **DIAGNÓSTICO REAL DEL BUG DE LAYOUT (verificado contra el código fuente real de**
> **pxt: `pxtblocks/loader.ts`, función `splitInputs`, versión v12.3.29 — la que usa**
> **este repo — confirmado vía GitHub, no solo el parser local minificado):**
>
> ```ts
> function splitInputs(def) {
>     const res = []; let current = [];
>     def.parts.forEach(part => {
>         switch (part.kind) {
>             case "break": newInput(); break;
>             case "param": current.push(part); newInput(); break;
>             case "image": case "label": current.push(part); break;
>         }
>     });
>     newInput();
>     return res;
>     function newInput() {
>         if (current.length) { res.push(current); current = []; }
>     }
> }
> ```
>
> Esto prueba que **cada `%param` fuerza SIEMPRE su propia fila** (Blockly Input),
> sin importar qué separadores (`\n`, `|`, nada) pongas entre medio. Es
> estructuralmente imposible que dos parámetros sueltos (desplegable + número)
> compartan un renglón. `inlineInputMode` es una palanca binaria por bloque:
> `external` apila TODAS las filas verticalmente, `inline` las junta TODAS en una
> sola línea horizontal — no hay término medio. Por eso:
> - La primera versión (6 parámetros sueltos + `external`) dio 6 filas (una por
>   parámetro): demasiado partido.
> - Cambiar a `inline` (intento fallido de esta sesión) juntó TODO en una sola
>   fila corrida hacia la derecha: la corrección estaba mal.
> - **La única forma real de que 2 parámetros (desplegable+velocidad) compartan
>   un renglón es que sean UN SOLO parámetro**: un *shadow block* que empaqueta
>   ambos valores en un solo número, con `inlineInputMode=inline` puesto en el
>   shadow (para que sus 2 sub-campos queden juntos) y el bloque principal con
>   `inlineInputMode=external` (para que cada shadow —cada renglón— caiga en su
>   propia fila). Es el mismo patrón que ya usa este repo en `tira_rgb.ts` y que
>   usa MakeCode oficialmente en `color.rgb()` (pxt-common-packages) para
>   empaquetar red/green/blue en un solo número.
> - Se usa bit-packing (`accion << 8 | velocidad`) en vez de `accion*1000+velocidad`
>   por prolijidad y para ser consistente con el estilo de bit-shifting que ya usa
>   `tira_rgb.ts` en este mismo archivo del repo.

```ts
    /**
     * Empaqueta acción (bits altos) + velocidad 0-100 (bits bajos) en un
     * solo número. Blockly no permite que dos parámetros sueltos compartan
     * una fila (cada %param fuerza su propia fila — confirmado en
     * pxt/pxtblocks/loader.ts, función splitInputs); agrupar accion+
     * velocidad en un shadow con inlineInputMode=inline es la forma
     * estándar de MakeCode de tener "desplegable + campo" en un renglón
     * (mismo patrón que tira_rgb.ts usa para empaquetar RGB en un color).
     */
    function seguidorAccionCodificar(accion: SabanaSeguidorAccion, velocidad: number): number {
        let v = Math.round(velocidad)
        if (v < 0) v = 0
        if (v > 100) v = 100
        return (accion << 8) | v
    }

    //% blockId=seguidor_accion_derecha
    //% block="$accion Velocidad $velocidad"
    //% accion.defl=SabanaSeguidorAccion.GirarIzquierda
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% inlineInputMode=inline blockHidden=1
    export function seguidorAccionDerecha(accion: SabanaSeguidorAccion, velocidad: number): number {
        return seguidorAccionCodificar(accion, velocidad)
    }

    //% blockId=seguidor_accion_centro
    //% block="$accion Velocidad $velocidad"
    //% accion.defl=SabanaSeguidorAccion.Avanzar
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% inlineInputMode=inline blockHidden=1
    export function seguidorAccionCentro(accion: SabanaSeguidorAccion, velocidad: number): number {
        return seguidorAccionCodificar(accion, velocidad)
    }

    //% blockId=seguidor_accion_izquierda
    //% block="$accion Velocidad $velocidad"
    //% accion.defl=SabanaSeguidorAccion.GirarDerecha
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% inlineInputMode=inline blockHidden=1
    export function seguidorAccionIzquierda(accion: SabanaSeguidorAccion, velocidad: number): number {
        return seguidorAccionCodificar(accion, velocidad)
    }

    /** Decodifica el número empaquetado del shadow y ejecuta el movimiento. */
    function seguidorEjecutarCodificado(codigo: number): void {
        const accion = (codigo >> 8) as SabanaSeguidorAccion
        const velocidad = codigo & 0xFF
        movimientoSimple(seguidorAccionToMovimiento(accion), velocidad)
    }

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
     * Un renglón por sensor (Derecha / Centro / Izquierda). Cada renglón
     * recibe un shadow block "desplegable + Velocidad" (arriba) como único
     * parámetro; el bloque principal usa inlineInputMode=external para que
     * cada renglón (cada shadow) caiga en su propia fila.
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
    //% block="Seguidor de líneas │ en pin I2C|Derecha $derecha|Centro $centro|Izquierda $izquierda"
    //% derecha.shadow=seguidor_accion_derecha
    //% centro.shadow=seguidor_accion_centro
    //% izquierda.shadow=seguidor_accion_izquierda
    //% inlineInputMode=external
    //% group="SENSORES" color="#35BFE9" weight=85.45 blockGap=8
    export function seguidorDeLineaAcciones(derecha: number, centro: number, izquierda: number): void {
        let buf = pins.i2cReadBuffer(SEGUIDOR_LINEA_I2C_ADDR, 5)

        // 0 = blanco = se salió de la línea negra → ejecutar acción del renglón
        if (buf[SabanaSeguidorLineaLado.Derecha] == 0) seguidorEjecutarCodificado(derecha)
        if (buf[SabanaSeguidorLineaLado.Centro] == 0) seguidorEjecutarCodificado(centro)
        if (buf[SabanaSeguidorLineaLado.Izquierda] == 0) seguidorEjecutarCodificado(izquierda)
    }
```

**Detalles a respetar en el código anterior:**
- El separador visual del título (`│`, U+2502, barra de caja) es solo texto decorativo. El `|` ASCII es distinto: es el separador de fila real de pxt (confirmado en `splitInputs`); los `|` extra entre renglones son inofensivos (no crean filas vacías: `newInput()` chequea que `current` no esté vacío).
- Los tres shadow blocks son idénticos salvo `accion.defl`; existen por separado únicamente para que cada renglón arranque con un default distinto.
- `blockHidden=1` evita que los shadows aparezcan sueltos en la paleta.
- El alumno puede arrastrar una variable al campo numérico de velocidad dentro del shadow (funciona igual que cualquier campo numérico); por eso `seguidorAccionCodificar` recorta el valor a 0-100 antes de empaquetar (si no, un valor fuera de rango corrompería los bits de `accion`).
- Si alguien arrastra un bloque numérico plano encima del shadow completo (tapándolo), el valor se interpreta como código empaquetado: mismo comportamiento aceptado que ya tiene `color.rgb()` de MakeCode o el picker de `tira_rgb.ts` en este repo; no es un caso de uso esperado, no hace falta contemplarlo.

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
    bloques.seguidorAccionDerecha(bloques.SabanaSeguidorAccion.GirarIzquierda, 50),
    bloques.seguidorAccionCentro(bloques.SabanaSeguidorAccion.Avanzar, 50),
    bloques.seguidorAccionIzquierda(bloques.SabanaSeguidorAccion.GirarDerecha, 50)
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

0. **Importante — caché de MakeCode:** MakeCode guarda la extensión por versión. Después de subir el cambio, en el proyecto de prueba hay que **quitar la extensión y volver a agregarla** (o crear un proyecto nuevo) para que tome la 3.4.0. Si no, seguirá mostrando el bloque viejo y los defaults viejos.
1. `pxt build` (o abrir el repo como extensión en MakeCode) sin errores de TypeScript.
2. En la categoría **PADRE → SENSORES** aparece un solo bloque de acción del seguidor de línea, de 4 renglones, celeste, con texto fijo `Derecha` / `Centro` / `Izquierda`.
3. Cada renglón muestra: desplegable de 3 opciones + `Velocidad` + campo numérico (default 50). Defaults: Derecha = Girar a la izquierda, Centro = Avanzar, Izquierda = Girar a la derecha.
4. Se puede arrastrar una variable al campo de velocidad.
5. El bloque `seguidor_de_linea_ramas` ya no existe en la paleta, y los shadows `seguidor_accion_*` tampoco aparecen sueltos.
6. Con el robot real, dentro de `por siempre`: al levantar el sensor derecho de la línea negra (ve blanco) el robot ejecuta la acción del renglón Derecha con esa velocidad; ídem centro e izquierda.
7. Commit sugerido: `feat(seguidor_linea): bloque de acción por sensor con desplegable y velocidad (3.4.0)`.