# BLOQUES SABANA

Extensión de MakeCode para micro:bit creada para **validar con el equipo**
los textos, colores y formas de cada bloque, antes de programar la lógica
real. Ningún bloque controla hardware todavía.

## Cómo se ve en MakeCode

Una sola categoría padre **PADRE** (icono de cohete, igual que SmartTEAM5).
Al hacer clic, aparecen las subcategorías (groups) con sus bloques.

## Subcategorías

| Subcategoría | Color de bloques |
|--------------|------------------|
| SENSORES     | `#FFB800` (GPIO) / `#35BFE9` (I2C) |
| SALIDAS      | `#FFB800` |
| MOVIMIENTO   | `#35BFE9` |
| MOTORES      | `#35BFE9` (I2C) / `#FFB800` (Servo, Hélice GPIO) |
| PANTALLAS    | `#35BFE9` |
| VARIABLES    | `#796EB0` |
| Bluetooth    | `#796EB0` |
| ESPECIAL     | `#EF506D` |

Ver la tabla de bloques (`BLOQUE_ID`) en el archivo de especificación del
equipo para el detalle de cada uno.

## Bluetooth (app STEAMbit)

Los bloques de la subcategoría **Bluetooth** (`blocks/sabana/bluetooth.ts`)
son los de la extensión
[pxt-steambit-bluetooth](https://github.com/smartteamok/pxt-steambit-bluetooth)
(conexión, valores de la app, envíos y joystick), con la misma lógica y
protocolo. Por eso PADRE depende de **bluetooth**:

- **bluetooth es incompatible con radio**: un proyecto con PADRE no puede
  usar los bloques de radio (MakeCode ofrece quitar radio al agregar PADRE).
- En cada proyecto hay que activar **⚙ Configuración del proyecto → "No
  Pairing Required: Anyone can connect via Bluetooth"**; la extensión no
  puede hacerlo sola y se pierde al crear un proyecto nuevo.
- El servicio UART de Bluetooth arranca siempre al iniciar el programa,
  aunque no se use ningún bloque Bluetooth.
- micro:bit V1: Bluetooth ocupa ~16 KB más de memoria de programa. Los
  programas chicos siguen entrando; los que usan OLED ya no entraban en V1.
