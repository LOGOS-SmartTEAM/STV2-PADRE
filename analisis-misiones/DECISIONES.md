# DECISIONES DEL BARRIDO — STV2-PADRE

Documento de referencia transversal. **No es una misión**, no contiene cambios a ejecutar.
Cursor debe leerlo antes de ejecutar cualquier misión.

---

## Regla maestra

> **El diseño de PADRE es intocable.** Textos de bloque, colores, `weight`, `blockGap`,
> groups y forma del bloque se conservan carácter por carácter.
> Se importa **únicamente el código** de las extensiones de referencia.
>
> Única excepción: cuando el hardware físicamente no puede cumplir lo que el texto
> promete. En ese caso se ajusta el desplegable (nunca el texto fijo) y se registra
> la excepción en este documento.

---

## Repositorios de referencia

| Repo | Rol | Cuándo es la fuente |
|---|---|---|
| `LOGOS-SmartTEAM/STV2-PADRE` | **objetivo** — se edita | siempre |
| `LOGOS-SmartTEAM/original-alex` (`logos-smart`) | drivers del proveedor | sensores I2C/GPIO, LCD, tira RGB, servo, motores individuales |
| `LOGOS-SmartTEAM/EXT4` (`ext4`) | ancestro de diseño de PADRE, código ya probado | OLED, movimiento del robot, botón, cantidad, umbral del ultrasonido |

Los textos de bloque de PADRE son **copia literal de EXT4** en 14 bloques. Cuando EXT4
tiene el componente, EXT4 gana como fuente.

---

## Convención de colores por tipo de conexión

| Color | Significado | Ejemplos |
|---|---|---|
| `#FFB800` | componente **GPIO** | botón, LED, luz, suelo, potenciómetro, servo, hélice |
| `#35BFE9` | componente **I2C** | ultrasonido, color, joystick, LCD, OLED, motores, tira RGB |
| `#006970` | bloque **lógico hexagonal** (booleano) | `%medida detecta objeto %valor`, `%medida %operador %valor` |
| `#FF6680` | **variables** | Cantidad (4 bloques) |

> Si un componente pasa de GPIO a I2C durante la migración, **el color debe cambiar de
> `#FFB800` a `#35BFE9`** y el texto pasa de `en pin %puerto` a `en pin I2C`.

---

## Decisiones cerradas

### A — Ultrasonido: driver del proveedor, umbral convertido
Se usa el driver de **ORIGINAL**: I2C `0x23`, comando `0x0A`, pausa 20 ms, devuelve
**milímetros** crudos. Se descarta el driver de EXT4 (`0x57` / RCWL-9620, devolvía cm).
El umbral de detección de EXT4 (**3–25 cm**) se convierte a **30–250 mm**.
→ Misión **M04**.

### B — Botón: booleano puro (opción B2)
`sabana_boton` deja de devolver `number` y devuelve **`boolean`**.
Consecuencias:
- `SabanaOperadorComparacion` se reduce de 6 a **2 miembros**: `=` y `≠`.
- El parámetro `%valor` deja de ser numérico y pasa a desplegable **Verdadero / Falso**,
  reutilizando el enum `SabanaVerdaderoFalso` ya existente en `ultrasonido_logico.ts`.
- Se conserva el `pins.setPull(PullUp)` de EXT4, que ORIGINAL no tiene.
→ Misión **M03**.

### C — Servo: rango 0–180°
PADRE limitaba a `grado.max=90`. Se sube a **180** siguiendo a ORIGINAL
(`value.min=0 value.max=180`). El texto `Servo │ en el grado %grado en pin %puerto`
no cambia.
→ Misión **M11**.

### D — Hélice: desplegable ON / OFF (opción D2)
El hardware del proveedor es **digital sin dirección** (`FanOn` = `digitalWrite 1`,
`FanOff` = `digitalWrite 0`). El desplegable *Rotar a la derecha / rotar a la izquierda /
Frenar* es físicamente imposible y se reemplaza por **ON / OFF**.
El texto fijo `Hélice │ %sentido en pin %puerto` **no cambia**.
Efecto colateral: `sabana_helice` deja de usar `SabanaMovimientoMotorUnico`.
→ Misión **M15**.

### E — Motor individual: signo crudo, sin espejo
En `sabana_motor_multicolor`:
- **Rotar a la derecha** → velocidad **positiva**
- **rotar a la izquierda** → velocidad **negativa**
- **Frenar** → `0`

Se sigue la regla de ORIGINAL (`run(motoraddress, speed)` con `speed.min=-100 max=100`).
**No** se aplica la negación del motor rojo que hace EXT4 en `movimientoToSpeeds()`: esa
negación existe solo porque en el robot armado los motores están montados en espejo, y
aquí el bloque controla un motor suelto.
→ Misión **M13**. La negación del espejo **sí** se conserva en M14 (movimiento del robot).

### F — Cantidad va a VARIABLES con los colores de EXT4
Los 4 bloques de `cantidad.ts` se mueven del group `ESPECIAL` (`#EF506D`) al group
**`VARIABLES`** con color **`#FF6680`** (convención de EXT4). El group `ESPECIAL`
desaparece de la lista `groups=[...]` de `blocks/categorias/bloques.ts`.
→ Misión **M17**.

---

## Decisiones ABIERTAS (no bloquean las misiones M00–M11)

| # | Tema | Estado |
|---|---|---|
| G | Los 2 bloques placeholder de `variables.ts` (`sabana_var_establecer`, `sabana_var_obtener`) — EXT4 no los tiene. **Propuesta: eliminarlos.** | ⬜ a confirmar en M17 |
| H | `sabana_dht11` tiene `%puerto` pero el driver es I2C `0x27`. **Propuesta: quitar el pin, texto → `%dato │ en pin I2C`, color → `#35BFE9`.** | ⬜ a confirmar en M07 |
| I | `sabana_tira_rgb` tiene `%puerto` pero el driver es I2C `0x24`. **Propuesta: quitar el pin, texto → `... en pin I2C`, color → `#35BFE9`.** | ⬜ a confirmar en M09 |
| J | Sensor de color: ORIGINAL no expone R/G/B por canal como bloque (están en `cacheR/G/B` interno). Hay que exponerlos. **¿Escala 0–255 como `readWhiteValue`, o crudo 0–65535?** | ⬜ a confirmar en M08 |
| K | LCD: falta el bloque de init. **Propuesta: auto-init interno (`ensureLcdInit()`) como hace el OLED de EXT4, sin agregar bloque visible.** | ⬜ a confirmar en M10 |

---

## Excepciones al diseño de PADRE (registro)

| Bloque | Qué se cambió | Por qué | Misión |
|---|---|---|---|
| `sabana_boton_logico` | desplegable de operadores: 6 → 2 | booleanos no admiten `< ≤ > ≥` | M03 |
| `sabana_boton_logico` | `%valor` numérico → desplegable V/F | consecuencia de B2 | M03 |
| `sabana_lcd_escribir` | desplegable de fila: 0-1-2 → **0-1** | el LCD1602 es 16×2, no tiene fila 2 | M10 |
| `sabana_servo` | `grado.max`: 90 → **180** | rango real del componente | M11 |
| `sabana_helice` | desplegable: D/I/Frenar → **ON/OFF** | la hélice no tiene control de dirección | M15 |
| `cantidad.ts` (×4) | group `ESPECIAL` → `VARIABLES`, color `#EF506D` → `#FF6680` | unificar con EXT4 | M17 |

**Ningún texto fijo de bloque se modifica en ninguna de estas excepciones.**

---

## Orden de ejecución

```
M00  Infraestructura (puertos + helpers)      ← prerrequisito de casi todo
├── M01  Potenciómetro
├── M02  Sensor de Luz
├── M03  Botón + botón lógico
├── M04  Ultrasonido + ultrasonido lógico
├── M05  Joystick
├── M06  LED
├── M07  DHT11                    (abre H)
├── M08  Sensor de Color          (abre J)
├── M09  Tira RGB                 (abre I)
├── M10  LCD                      (abre K)
├── M11  Servo
├── M12  Sensor de Suelo
├── M13  Motor multicolor
├── M14  Movimiento (3 bloques)
├── M15  Hélice
├── M16  OLED
└── M17  Variables / Cantidad     (abre G)
```
