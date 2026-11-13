namespace bloques {
    export enum SabanaEjeJoystick {
        //% block="X axis"
        EjeX = 0,
        //% block="Y axis"
        EjeY = 1,
        //% block="Button"
        Boton = 2,
    }

    const JOYSTICK_I2C_ADDR = 0x61
    // Byte del botón en la lectura de 4 bytes. ⚠️ SIN CONFIRMAR EN HARDWARE:
    // Protocolo-I2C/joystick_en.md marca los bytes 0 y 3 como "Reserved" y
    // ni logos-smart ni version-alex leen el botón. Se eligió el 3 (el que
    // sigue a X e Y); si la prueba con el módulo real indica otro byte o
    // polaridad invertida, cambiar solo esta constante / la comparación.
    const JOYSTICK_BYTE_BOTON = 3

    // STV2-8 — Joystick conectado por I2C (dirección 0x61). Ejes: rango −100
    // a 100 (Protocolo-I2C/joystick_en.md). Botón (2026-11-12): 1 si está
    // presionado, 0 si no. Color celeste I2C (2026-10-25).
    /**
     * Reads the joystick position on the X or Y axis (−100 to 100) or its button (1 = pressed, 0 = released).
     */
    //% blockId=joystick
    //% block="Joystick │ %eje on I2C pin"
    //% group="SENSORS" color="#35BFE9" weight=89 blockGap=8
    export function joystick(eje: SabanaEjeJoystick): number {
        if (eje == SabanaEjeJoystick.Boton) {
            // El protocolo define una lectura de 4 bytes; el botón está en
            // uno de los "reservados" (ver JOYSTICK_BYTE_BOTON).
            let paquete = pins.i2cReadBuffer(JOYSTICK_I2C_ADDR, 4)
            return paquete[JOYSTICK_BYTE_BOTON] != 0 ? 1 : 0
        }
        let buf = pins.i2cReadBuffer(JOYSTICK_I2C_ADDR, 3)
        if (eje == SabanaEjeJoystick.EjeY) {
            let value = buf.getNumber(NumberFormat.Int8BE, 2)
            return -value
        }
        return buf.getNumber(NumberFormat.Int8BE, 1)
    }

    export enum SabanaDireccionJoystick {
        //% block="Up"
        Arriba = 0,
        //% block="Down"
        Abajo = 1,
        //% block="Left"
        Izquierda = 2,
        //% block="Right"
        Derecha = 3,
    }

    // STV2-8b — Detección de dirección del Joystick (bloque redondo, no
    // hexágono: devuelve number 1/0 en vez de boolean). Traducción de
    // version-alex/block/joystick.ts -> rockerDetect(). Umbral ±50 sobre
    // el valor crudo (sin la inversión de signo del eje Y del reporter
    // de arriba). Color celeste I2C, igual que el resto del Joystick.
    /**
     * Returns 1 if the joystick points in that direction and 0 if not.
     */
    //% blockId=joystick_detecta
    //% block="Joystick │ detects direction %direccion"
    //% group="SENSORS" color="#35BFE9" weight=88 blockGap=8
    export function joystickDetecta(direccion: SabanaDireccionJoystick): number {
        let buf = pins.i2cReadBuffer(JOYSTICK_I2C_ADDR, 3)
        let ud = buf.getNumber(NumberFormat.Int8BE, 2)
        let lr = buf.getNumber(NumberFormat.Int8BE, 1)

        let detectado = false
        switch (direccion) {
            case SabanaDireccionJoystick.Abajo: detectado = ud > 50; break
            case SabanaDireccionJoystick.Arriba: detectado = ud < -50; break
            case SabanaDireccionJoystick.Derecha: detectado = lr > 50; break
            case SabanaDireccionJoystick.Izquierda: detectado = lr < -50; break
        }
        return detectado ? 1 : 0
    }
}
