namespace bloques {
    /**
     * STV2-20 — Servo motor en un puerto GPIO, grado de 0 a 180°.
     */
    //% blockId=servo
    //% block="Servo │ %grado° en pin %puerto"
    //% grado.min=0 grado.max=180 grado.defl=0
    //% group="MOTORES" color="#FFB800" weight=100 blockGap=8
    export function servo(grado: number, puerto: SabanaPuerto): void {
        pins.servoWritePin(puertoToAnalogPin(puerto), grado)
    }
}
