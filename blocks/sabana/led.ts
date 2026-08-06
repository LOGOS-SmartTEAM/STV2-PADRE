namespace bloques {
    export enum SabanaEstadoOnOff {
        //% block="ON"
        ON = 0,
        //% block="OFF"
        OFF = 1,
    }

    /**
     * STV2-10 — LED simple en un puerto GPIO, con estado ON/OFF.
     */
    //% blockId=led
    //% block="LED │ Estado %estado en pin %puerto"
    //% group="SALIDAS" color="#FFB800" weight=95 blockGap=8
    export function led(estado: SabanaEstadoOnOff, puerto: SabanaPuerto): void {
        const pin = puertoToDigitalPin(puerto)
        pins.digitalWritePin(pin, estado == SabanaEstadoOnOff.ON ? 0 : 1)
    }
}
