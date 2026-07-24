namespace bloques {
    export enum SabanaEjeJoystick {
        //% block="Eje X"
        EjeX = 0,
        //% block="Eje Y"
        EjeY = 1,
    }

    /**
     * STV2-8 — Joystick conectado por I2C.
     */
    //% blockId=sabana_joystick
    //% block="%eje Joystick en el puerto I2C"
    //% group="SENSORES" color="#34c2eb" weight=65 blockGap=8
    export function joystick(eje: SabanaEjeJoystick): number {
        return 0
    }
}
