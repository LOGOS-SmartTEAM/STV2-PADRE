namespace bloques {
    /**
     * STV2-6 — Potenciómetro en un puerto GPIO (lectura analógica 0-1023).
     *
     * Origen del código: ORIGINAL/block/sensorGPIO.ts -> Potentiometer()
     *   return pins.analogReadPin(num)
     *
     * NOTA HISTÓRICA: la tabla original tenía el texto "Suelo en el puerto X"
     * (copiado por error de STV2-5). Se corrigió a "Potenciómetro..." para que
     * coincida con el componente. El texto NO se vuelve a tocar.
     *
     * @param puerto puerto GPIO de la placa, eg: SabanaPuerto.P0
     */
    //% blockId=potenciometro
    //% block="Potenciómetro │ en pin %puerto"
    //% group="SENSORES" color="#FFB800" weight=75 blockGap=8
    export function potenciometro(puerto: SabanaPuerto): number {
        return pins.analogReadPin(puertoToAnalogPin(puerto))
    }
}
