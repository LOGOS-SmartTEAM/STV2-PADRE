namespace bloques {
    export enum SabanaColorMotor {
        //% block="🔴"
        Rojo = 0,
        //% block="🟢"
        Verde = 1,
        //% block="🟡"
        Amarillo = 2,
        //% block="🔵"
        Azul = 3,
    }

    export enum SabanaMovimientoMotorUnico {
        //% block="Rotar a la derecha"
        Derecha = 0,
        //% block="rotar a la izquierda"
        Izquierda = 1,
        //% block="Frenar"
        Frenar = 2,
    }

    /**
     * STV2-16 — Controla un motor individual (identificado por color/emoji)
     * conectado por I2C. El botón "+" agrega el parámetro opcional de velocidad.
     */
    //% blockId=sabana_motor_multicolor
    //% block="Motor │ %color %movimiento en puerto I2C || Velocidad %velocidad"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% expandableArgumentMode="toggle"
    //% group="MOTORES" color="#35BFE9" weight=100 blockGap=8
    export function motorMulticolor(
        color: SabanaColorMotor,
        movimiento: SabanaMovimientoMotorUnico,
        velocidad = 50
    ): void {
        // TODO: lógica real pendiente
    }
}
