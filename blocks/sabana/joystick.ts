namespace bloques {
    export enum SabanaEjeJoystick {
        //% block="X axis"
        EjeX = 0,
        //% block="Y axis"
        EjeY = 1,
    }

    const JOYSTICK_I2C_ADDR = 0x61

    // STV2-8 — Joystick conectado por I2C (dirección 0x61). Rango −100 a 100
    // (Protocolo-I2C/joystick_en.md). Color celeste I2C (2026-10-25).
    /**
     * Reads the joystick position on the X or Y axis (−100 to 100).
     */
    //% blockId=joystick
    //% block="Joystick │ %eje on I2C pin"
    //% group="SENSORS" color="#35BFE9" weight=89 blockGap=8
    export function joystick(eje: SabanaEjeJoystick): number {
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
