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

    export enum SabanaEstadoSuelo {
        //% block="seco"
        Seco = 0,
        //% block="húmedo"
        Humedo = 1,
    }

    /**
     * Bloque booleano combinado del Sensor de Suelo (hexágono). El bloque
     * redondo "Sensor de Suelo │ en pin" (blockId suelo, con su propio
     * color) queda encajado por defecto dentro del hexágono, como shadow
     * block.
     *
     * Umbral: seco < 400, húmedo >= 400, sobre la lectura analógica 0-1023.
     */
    //% blockId=suelo_logico
    //% block="%medida está %estado"
    //% medida.shadow=suelo
    //% group="SENSORES" color="#006970" weight=97.5 blockGap=8
    export function sueloLogico(medida: number, estado: SabanaEstadoSuelo): boolean {
        const humedo = medida >= 400
        return estado == SabanaEstadoSuelo.Humedo ? humedo : !humedo
    }
}
