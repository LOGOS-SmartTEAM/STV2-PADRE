namespace bloques {
    /**
     * Operadores aplicables a un valor booleano.
     *
     * Solo = y ≠. Los operadores de orden (< ≤ > ≥) se eliminaron al pasar el
     * botón a booleano (decisión B2): no tienen significado sobre true/false.
     * Los valores 0 y 1 se conservan para no romper proyectos .blocks guardados.
     */
    export enum SabanaOperadorComparacion {
        //% block="="
        Igual = 0,
        //% block="≠"
        Distinto = 1,
    }

    /**
     * Bloque booleano combinado del Botón (hexágono).
     *
     * El bloque "Botón │ en pin %puerto" (blockId sabana_boton, con su propio
     * color amarillo y su propio desplegable de pin P0-P3) queda encajado por
     * defecto dentro del hexágono, como shadow block.
     *
     * El enum SabanaVerdaderoFalso se REUTILIZA de
     * blocks/sabana/ultrasonido_logico.ts — no redeclararlo acá.
     *
     * @param medida lectura del botón, eg: bloques.boton(SabanaPuerto.P0)
     * @param operador operador de comparación
     * @param valor valor esperado
     */
    //% blockId=sabana_boton_logico
    //% block="%medida %operador %valor"
    //% medida.shadow=sabana_boton
    //% group="SENSORES" color="#006970" weight=94 blockGap=8
    export function botonLogico(
        medida: boolean,
        operador: SabanaOperadorComparacion,
        valor: SabanaVerdaderoFalso
    ): boolean {
        const esperado = (valor == SabanaVerdaderoFalso.Verdadero)
        switch (operador) {
            case SabanaOperadorComparacion.Igual:
                return medida == esperado
            case SabanaOperadorComparacion.Distinto:
                return medida != esperado
            default:
                return false
        }
    }
}
