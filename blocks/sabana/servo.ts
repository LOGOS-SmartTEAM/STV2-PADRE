namespace bloques {
    // STV2-20 — Servo motor en un puerto GPIO, grado de 0 a 180°.
    /**
     * Moves the servo to the chosen angle (0 to 180°).
     */
    //% blockId=servo
    //% block="Servo │ %grado° on pin %puerto"
    //% grado.min=0 grado.max=180 grado.defl=0
    //% group="MOTORS" color="#FFB800" weight=100 blockGap=8
    export function servo(grado: number, puerto: SabanaPuerto): void {
        pins.servoWritePin(puertoToAnalogPin(puerto), Math.constrain(grado, 0, 180))
    }
}
