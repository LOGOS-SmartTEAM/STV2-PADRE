namespace bloques {
    export enum SabanaDatoDHT11 {
        //% block="Humedad"
        Humedad = 0,
        //% block="Temperatura"
        Temperatura = 1,
    }

    /**
     * STV2-3 — DHT11 (humedad/temperatura) en un puerto GPIO.
     */
    //% blockId=sabana_dht11
    //% block="%dato │ en el puerto %puerto"
    //% group="SENSORES" color="#FFB800" weight=90 blockGap=8
    export function dht11(dato: SabanaDatoDHT11, puerto: SabanaPuerto): number {
        return 0
    }
}
