namespace bloques {
    // STV2-7 — Sensor de luz (fotorresistencia) en un puerto GPIO.
    // Lectura analógica 0-1023, INVERTIDA (2026-10-25, probado en físico en
    // EXT5): el sensor entrega 0 con mucha luz, así que se devuelve
    // 1023 - lectura → 1023 = mucha luz, 0 = oscuridad.
    //
    // Origen del código: ORIGINAL/block/sensorGPIO.ts -> Photosensitive()
    //   return pins.analogReadPin(num)
    //
    // NOTA HISTÓRICA: la tabla original decía "Suelo" por un copiado erróneo de
    // STV2-5. El texto ya fue corregido a "Sensor de Luz" y NO se vuelve a tocar.
    //
    // @param puerto puerto GPIO de la placa, eg: SabanaPuerto.P0
    /**
     * Measures light: 0 = dark, 1023 = very bright.
     */
    //% blockId=luz
    //% block="Light Sensor │ on pin %puerto"
    //% group="SENSORS" color="#FFB800" weight=96 blockGap=8
    export function luz(puerto: SabanaPuerto): number {
        return 1023 - pins.analogReadPin(puertoToAnalogPin(puerto))
    }
}
