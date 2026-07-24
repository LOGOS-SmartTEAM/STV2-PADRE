namespace sabana_sensores {
    export enum SabanaColorCanal {
        //% block="Rojo"
        Rojo = 0,
        //% block="Verde"
        Verde = 1,
        //% block="Azul"
        Azul = 2,
    }

    /**
     * STV2-4 — Sensor de color conectado por I2C.
     */
    //% blockId=sabana_color
    //% block="Intensidad de color %canal en el pin I2C"
    //% color="#34c2eb" weight=85 blockGap=8
    export function colorSensor(canal: SabanaColorCanal): number {
        return 0
    }
}
