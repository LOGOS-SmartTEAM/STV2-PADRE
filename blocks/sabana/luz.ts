namespace bloques {
    /**
     * STV2-7 — Sensor de luz (fotorresistencia) en un puerto GPIO.
     * Lectura analógica 0-1023.
     *
     * Origen del código: ORIGINAL/block/sensorGPIO.ts -> Photosensitive()
     *   return pins.analogReadPin(num)
     *
     * NOTA HISTÓRICA: la tabla original decía "Suelo" por un copiado erróneo de
     * STV2-5. El texto ya fue corregido a "Sensor de Luz" y NO se vuelve a tocar.
     *
     * @param puerto puerto GPIO de la placa, eg: SabanaPuerto.P0
     */
    //% blockId=sabana_luz
    //% block="Sensor de Luz │ en pin %puerto"
    //% group="SENSORES" color="#FFB800" weight=70 blockGap=8
    export function luz(puerto: SabanaPuerto): number {
        return pins.analogReadPin(puertoToAnalogPin(puerto))
    }
}
