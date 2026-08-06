namespace bloques {
    export enum SabanaDatoDHT11 {
        //% block="Humedad"
        Humedad = 0,
        //% block="Temperatura"
        Temperatura = 1,
    }

    const DHT11_I2C_ADDR = 0x27

    /**
     * STV2-3 — DHT11 (humedad/temperatura) por I2C (dirección 0x27).
     * Rangos del sensor: Humedad 20% a 90% RH · Temperatura 0°C a 50°C
     * (enteros, sin decimales).
     */
    //% blockId=dht11
    //% block="%dato │ en pin I2C"
    //% group="SENSORES" color="#35BFE9" weight=90 blockGap=8
    export function dht11(dato: SabanaDatoDHT11): number {
        let trigger = pins.createBuffer(1)
        trigger[0] = 0xAC
        pins.i2cWriteBuffer(DHT11_I2C_ADDR, trigger)
        let buf = pins.i2cReadBuffer(DHT11_I2C_ADDR, 5)
        if (dato == SabanaDatoDHT11.Humedad) {
            return buf[2]
        }
        return buf[0]
    }
}
