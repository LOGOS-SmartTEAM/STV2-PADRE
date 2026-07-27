namespace bloques {
    export enum SabanaVerdaderoFalso {
        //% block="Verdadero"
        Verdadero = 0,
        //% block="Falso"
        Falso = 1,
    }

    /**
     * Bloque booleano combinado del Ultrasonido (hexágono). El bloque
     * redondo "Ultrasonido │ en pin I2C" (blockId sabana_ultrasonido, con
     * su propio color celeste) queda encajado por defecto dentro del
     * hexágono, como shadow block.
     */
    //% blockId=sabana_ultrasonido_logico
    //% block="%medida detecta objeto %valor"
    //% medida.shadow=sabana_ultrasonido
    //% group="SENSORES" color="#006970" weight=99 blockGap=8
    export function ultrasonidoLogico(medida: number, valor: SabanaVerdaderoFalso): boolean {
        // TODO: lógica real pendiente
        return true
    }
}
