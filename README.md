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
| VARIABLES    | `#EF506D` |
| Bluetooth    | `#796EB0` (en uso) / `#9E9E9E` (sin uso) |
| ESPECIAL     | `#9C27B0` |

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
- El proyecto ya viene en **"No se requiere vincular" (No Pairing Required)**:
  lo pone la extensión (`yotta.optionalConfig` en `pxt.json`). Si se elige
  otro modo en **⚙ Configuración del proyecto**, gana ese.
- La categoría azul **Bluetooth** oficial de MakeCode queda oculta (sus
  bloques chocan con los de la subcategoría Bluetooth). La dependencia sigue
  haciendo falta.
- En uso (violeta): mostrar nombre, al recibir, número, texto, enviar número
  y enviar texto. El resto de la subcategoría queda en gris al final.
- El servicio UART de Bluetooth arranca siempre al iniciar el programa,
  aunque no se use ningún bloque Bluetooth.
- micro:bit V1: Bluetooth ocupa ~16 KB más de memoria de programa. Los
  programas chicos siguen entrando; los que usan OLED ya no entraban en V1.
