namespace bloques {
    export enum SabanaVerdaderoFalso {
        //% block="Verdadero"
        Verdadero = 0,
        //% block="Falso"
        Falso = 1,
    }

    /**
     * Bloque booleano combinado del Ultrasonido (hexágono). El bloque
     * redondo "Ultrasonido │ en pin I2C" (blockId ultrasonido, con
     * su propio color celeste) queda encajado por defecto dentro del
     * hexágono, como shadow block.
     *
     * Umbral de detección: 3 a 25 cm (inclusive), sobre la lectura en cm.
     */
    //% blockId=ultrasonido_logico
    //% block="%medida detecta objeto %valor"
    //% medida.shadow=ultrasonido
    //% group="SENSORES" color="#006970" weight=99 blockGap=8
    export function ultrasonidoLogico(medida: number, valor: SabanaVerdaderoFalso): boolean {
        const detectado = medida >= 3 && medida <= 25
        return valor == SabanaVerdaderoFalso.Verdadero ? detectado : !detectado
    }
}
