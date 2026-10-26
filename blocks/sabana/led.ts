namespace bloques {
    export enum SabanaEstadoOnOff {
        //% block="ON"
        ON = 0,
        //% block="OFF"
        OFF = 1,
    }

    // STV2-10 — LED simple en un puerto GPIO, con estado ON/OFF.
    /**
     * Turns the LED on or off.
     */
    //% blockId=led
    //% block="LED │ State %estado on pin %puerto"
    //% group="OUTPUTS" color="#FFB800" weight=100 blockGap=8
    export function led(estado: SabanaEstadoOnOff, puerto: SabanaPuerto): void {
        const pin = puertoToDigitalPin(puerto)
        pins.digitalWritePin(pin, estado == SabanaEstadoOnOff.ON ? 0 : 1)
    }

    // NUEVO — LED con intensidad variable (PWM) en un puerto GPIO, 0 a 1023.
    /**
     * Sets the LED brightness: 0 = off, 1023 = maximum.
     */
    //% blockId=led_intensidad
    //% block="LED │ Brightness %intensidad on pin %puerto"
    //% intensidad.min=0 intensidad.max=1023 intensidad.defl=0
    //% group="OUTPUTS" color="#FFB800" weight=99 blockGap=8
    export function ledIntensidad(intensidad: number, puerto: SabanaPuerto): void {
        pins.analogWritePin(puertoToAnalogPin(puerto), Math.constrain(intensidad, 0, 1023))
    }
}
