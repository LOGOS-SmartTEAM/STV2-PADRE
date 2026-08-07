namespace bloques {
    /**
     * STV2-5 — Sensor de suelo (línea) en un puerto GPIO.
     */
    //% blockId=suelo
    //% block="Sensor de Suelo │ en pin %puerto"
    //% group="SENSORES" color="#FFB800" weight=98 blockGap=8
    export function suelo(puerto: SabanaPuerto): number {
        return pins.analogReadPin(puertoToAnalogPin(puerto))
    }
}
