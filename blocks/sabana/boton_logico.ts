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
     * Bloque booleano combinado del Botón (hexágono, para usar directo en
     * un "si... entonces"). Compara el estado del botón contra un valor
     * usando el operador elegido. Solo validación visual — no hay lógica
     * real todavía.
     */
    //% blockId=sabana_boton_logico
    //% block="Botón │ en pin %puerto %operador %valor"
    //% valor.min=0 valor.max=1 valor.defl=1
    //% group="SENSORES" color="#006970" weight=94 blockGap=8
    export function botonLogico(
        puerto: SabanaPuerto,
        operador: SabanaOperadorComparacion,
        valor: number
    ): boolean {
        // TODO: lógica real pendiente
        return true
    }
}
