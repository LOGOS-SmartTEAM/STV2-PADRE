namespace bloques {

    // Dirección I2C del módulo joystick. Verificado en ORIGINAL/block/joystick.ts
    const JOYSTICK_I2C_ADDR = 0x61   // 97

    /**
     * Ejes del joystick.
     *
     * Los valores 1 y 2 NO son arbitrarios: son el desplazamiento del byte
     * dentro del buffer I2C de 3 bytes que devuelve el módulo.
     *   byte 0 -> descartado
     *   byte 1 -> eje X
     *   byte 2 -> eje Y
     * Misma convención que ORIGINAL (enum rocket: X = 1, Y = 2).
     * NO cambiar estos valores a 0 y 1.
     */
    export enum SabanaEjeJoystick {
        //% block="Eje X"
        EjeX = 1,
        //% block="Eje Y"
        EjeY = 2,
    }

    /**
     * STV2-8 — Joystick conectado por I2C.
     *
     * Devuelve un valor con signo (Int8, aprox. -128 a 127). En reposo el
     * valor está cerca de 0.
     *
     * El eje Y se devuelve NEGADO porque el módulo está montado invertido.
     * Sin esa negación, empujar el joystick hacia arriba daría negativo.
     * Comportamiento heredado de ORIGINAL -> rockerGetValue().
     *
     * @param eje eje a leer, eg: SabanaEjeJoystick.EjeX
     */
    //% blockId=sabana_joystick
    //% block="Joystick │ %eje en pin I2C"
    //% group="SENSORES" color="#35BFE9" weight=65 blockGap=8
    export function joystick(eje: SabanaEjeJoystick): number {
        const buf = pins.i2cReadBuffer(JOYSTICK_I2C_ADDR, 3)
        const valor = buf.getNumber(NumberFormat.Int8BE, eje)

        if (eje == SabanaEjeJoystick.EjeY) {
            return -valor
        }
        return valor
    }
}
