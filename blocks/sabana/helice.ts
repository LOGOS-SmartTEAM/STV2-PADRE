namespace bloques {
    // STV2-21 — Hélice en un puerto GPIO, simple ON/OFF. Reutiliza el enum
    // SabanaEstadoOnOff definido en led.ts (se descarta el control de
    // dirección de SabanaMovimientoMotorUnico).
    /**
     * Turns the propeller on or off.
     */
    //% blockId=helice
    //% block="Propeller │ %estado on pin %puerto"
    //% group="MOTORS" color="#FFB800" weight=99 blockGap=8
    export function helice(estado: SabanaEstadoOnOff, puerto: SabanaPuerto): void {
        const pin = puertoToDigitalPin(puerto)
        pins.digitalWritePin(pin, estado == SabanaEstadoOnOff.ON ? 1 : 0)
    }
}
