namespace bloques {
    export enum SabanaVerdaderoFalso {
        //% block="Verdadero"
        Verdadero = 0,
        //% block="Falso"
        Falso = 1,
    }

    /**
     * Bloque booleano combinado del Ultrasonido (hexágono, para usar
     * directo en un "si... entonces"). Solo validación visual — no hay
     * lógica real todavía.
     */
    //% blockId=sabana_ultrasonido_logico
    //% block="Ultrasonido │ en pin I2C detecta objeto %valor"
    //% group="SENSORES" color="#006970" weight=99 blockGap=8
    export function ultrasonidoLogico(valor: SabanaVerdaderoFalso): boolean {
        // TODO: lógica real pendiente
        return true
    }
}
