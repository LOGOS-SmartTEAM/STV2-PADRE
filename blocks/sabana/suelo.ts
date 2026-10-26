namespace bloques {
    // STV2-5 — Sensor de suelo (línea) en un puerto GPIO.
    /**
     * Measures soil moisture (0 to 1023).
     */
    //% blockId=suelo
    //% block="Soil Sensor │ on pin %puerto"
    //% group="SENSORS" color="#FFB800" weight=98 blockGap=8
    export function suelo(puerto: SabanaPuerto): number {
        return pins.analogReadPin(puertoToAnalogPin(puerto))
    }

    export enum SabanaEstadoSuelo {
        //% block="dry"
        Seco = 0,
        //% block="wet"
        Humedo = 1,
    }

    // Bloque booleano combinado del Sensor de Suelo (hexágono). El bloque
    // redondo "Sensor de Suelo │ en pin" (blockId suelo, con su propio
    // color) queda encajado por defecto dentro del hexágono, como shadow
    // block.
    //
    // Umbral: seco < 400, húmedo >= 400, sobre la lectura analógica 0-1023.
    /**
     * Tells whether the soil is dry or wet.
     */
    //% blockId=suelo_logico
    //% block="%medida is %estado"
    //% medida.shadow=suelo
    //% group="SENSORS" color="#006970" weight=97.5 blockGap=8
    export function sueloLogico(medida: number, estado: SabanaEstadoSuelo): boolean {
        const humedo = medida >= 400
        return estado == SabanaEstadoSuelo.Humedo ? humedo : !humedo
    }
}
