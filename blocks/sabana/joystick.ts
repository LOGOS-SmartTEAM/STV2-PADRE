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
    //% block="Joystick │ %eje en pin I2C"
    //% group="SENSORES" color="#35BFE9" weight=65 blockGap=8
    export function joystick(eje: SabanaEjeJoystick): number {
        return 0
    }
}
