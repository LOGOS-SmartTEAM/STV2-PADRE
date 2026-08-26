namespace bloques {
    const SEGUIDOR_LINEA_I2C_ADDR = 0x28
    const SENSOR_GRISES_I2C_ADDR = 0x29

    export enum SabanaSensor3Vias {
        //% block="1"
        Sensor1 = 0,
        //% block="2"
        Sensor2 = 1,
        //% block="3"
        Sensor3 = 2,
    }

    export enum SabanaSeguidorLineaLado {
        //% block="Derecha"
        Derecha = 2,
        //% block="Centro"
        Centro = 1,
        //% block="Izquierda"
        Izquierda = 0,
    }

    /**
     * NUEVO — Seguidor de línea por I2C (dirección 0x28), traducción directa
     * de version-alex/block/lineFollower.ts. COLOR GRIS: placeholder,
     * diseño visual (texto/id/color final) pendiente de definición.
     */
    //% blockId=seguidor_linea
    //% block="Seguidor de línea │ Leer sensor %sensor en pin I2C"
    //% group="SENSORES" color="#9E9E9E" weight=87 blockGap=8
    export function seguidorLinea(sensor: SabanaSensor3Vias): number {
        let buf = pins.i2cReadBuffer(SEGUIDOR_LINEA_I2C_ADDR, 3)
        return buf[sensor]
    }

    //% blockId=seguidor_linea_detecta
    //% block="Seguidor de línea │ Sensor %sensor detecta negro en pin I2C"
    //% group="SENSORES" color="#9E9E9E" weight=86 blockGap=8
    export function seguidorLineaDetecta(sensor: SabanaSensor3Vias): boolean {
        let buf = pins.i2cReadBuffer(SEGUIDOR_LINEA_I2C_ADDR, 3)
        return buf[sensor] == 1
    }

    /**
     * Diseño visual final (confirmado 2026-08-26): lectura booleana por lado
     * (Derecha/Centro/Izquierda), color celeste I2C. Lectura de 5 bytes según
     * protocolo real (Protocolo-I2C/line_foollower_en.md): Byte0=Izquierda,
     * Byte1=Centro, Byte2=Derecha, Byte3-4=Reservado. El dropdown muestra las
     * opciones en orden Derecha/Centro/Izquierda.
     */
    //% blockId=seguidor_de_linea
    //% block="Seguidor de líneas │ %lado en pin I2C"
    //% group="SENSORES" color="#35BFE9" weight=85.5 blockGap=8
    export function seguidorDeLinea(lado: SabanaSeguidorLineaLado): boolean {
        let buf = pins.i2cReadBuffer(SEGUIDOR_LINEA_I2C_ADDR, 5)
        return buf[lado] == 1
    }

    /**
     * NUEVO — Sensor de grises 3 vías por I2C (dirección 0x29), traducción
     * directa de version-alex/block/therrWayGray.ts. COLOR GRIS: placeholder,
     * diseño visual pendiente de definición.
     */
    //% blockId=sensor_grises
    //% block="Sensor de grises │ Leer sensor %sensor en pin I2C"
    //% group="SENSORES" color="#9E9E9E" weight=85 blockGap=8
    export function sensorGrises(sensor: SabanaSensor3Vias): number {
        let buf = pins.i2cReadBuffer(SENSOR_GRISES_I2C_ADDR, 3)
        return buf[sensor]
    }

    //% blockId=sensor_grises_comparar
    //% block="Sensor de grises │ Sensor %sensor valor %operador %valor en pin I2C"
    //% valor.min=0 valor.max=255
    //% group="SENSORES" color="#9E9E9E" weight=84 blockGap=8
    export function sensorGrisesComparar(
        sensor: SabanaSensor3Vias,
        operador: SabanaOperadorComparacion,
        valor: number
    ): boolean {
        let buf = pins.i2cReadBuffer(SENSOR_GRISES_I2C_ADDR, 3)
        const dato = buf[sensor]
        switch (operador) {
            case SabanaOperadorComparacion.Igual: return dato == valor
            case SabanaOperadorComparacion.Distinto: return dato != valor
            case SabanaOperadorComparacion.Menor: return dato < valor
            case SabanaOperadorComparacion.MenorIgual: return dato <= valor
            case SabanaOperadorComparacion.Mayor: return dato > valor
            case SabanaOperadorComparacion.MayorIgual: return dato >= valor
        }
        return false
    }
}
