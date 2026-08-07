namespace bloques {
    export enum SabanaEjeJoystick {
        //% block="Eje X"
        EjeX = 0,
        //% block="Eje Y"
        EjeY = 1,
    }

    const JOYSTICK_I2C_ADDR = 0x61

    /**
     * STV2-8 — Joystick conectado por I2C (dirección 0x61). COLOR GRIS:
     * placeholder, el usuario tiene pendiente definir el diseño final.
     */
    //% blockId=joystick
    //% block="Joystick │ %eje en pin I2C"
    //% group="SENSORES" color="#9E9E9E" weight=89 blockGap=8
    export function joystick(eje: SabanaEjeJoystick): number {
        let buf = pins.i2cReadBuffer(JOYSTICK_I2C_ADDR, 3)
        if (eje == SabanaEjeJoystick.EjeY) {
            let value = buf.getNumber(NumberFormat.Int8BE, 2)
            return -value
        }
        return buf.getNumber(NumberFormat.Int8BE, 1)
    }

    export enum SabanaDireccionJoystick {
        //% block="Arriba"
        Arriba = 0,
        //% block="Abajo"
        Abajo = 1,
        //% block="Izquierda"
        Izquierda = 2,
        //% block="Derecha"
        Derecha = 3,
    }

    /**
     * STV2-8b — Detección de dirección del Joystick (bloque redondo, no
     * hexágono: devuelve number 1/0 en vez de boolean). Traducción de
     * version-alex/block/joystick.ts -> rockerDetect(). Umbral ±50 sobre
     * el valor crudo (sin la inversión de signo del eje Y del reporter
     * de arriba). COLOR GRIS: placeholder, mismo criterio que el resto
     * del Joystick.
     */
    //% blockId=joystick_detecta
    //% block="Joystick │ detecta dirección %direccion"
    //% group="SENSORES" color="#9E9E9E" weight=88 blockGap=8
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
