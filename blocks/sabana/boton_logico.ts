namespace bloques {
    export enum SabanaOperadorComparacion {
        //% block="="
        Igual = 0,
        //% block="≠"
        Distinto = 1,
        //% block="<"
        Menor = 2,
        //% block="≤"
        MenorIgual = 3,
        //% block=">"
        Mayor = 4,
        //% block="≥"
        MayorIgual = 5,
    }

    /**
     * Bloque booleano combinado del Botón (hexágono). El bloque redondo
     * "Botón │ en pin %puerto" (blockId sabana_boton, con su propio color
     * amarillo y su propio desplegable de pin P0-P3 adentro) queda
     * encajado por defecto dentro del hexágono, como shadow block.
     */
    //% blockId=sabana_boton_logico
    //% block="%medida %operador %valor"
    //% medida.shadow=sabana_boton
    //% valor.min=0 valor.max=1 valor.defl=1
    //% group="SENSORES" color="#006970" weight=94 blockGap=8
    export function botonLogico(
        medida: number,
        operador: SabanaOperadorComparacion,
        valor: number
    ): boolean {
        // TODO: lógica real pendiente
        return true
    }
}
