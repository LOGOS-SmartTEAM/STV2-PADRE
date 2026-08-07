namespace bloques {
    /**
     * STV2-2 — Botón conectado a un puerto GPIO (pull-up, activo en alto
     * lógico: presionado=1, suelto=0).
     */
    //% blockId=boton
    //% block="Botón │ en pin %puerto"
    //% group="SENSORES" color="#FFB800" weight=100 blockGap=8
    export function boton(puerto: SabanaPuerto): number {
        const pin = puertoToDigitalPin(puerto)
        pins.setPull(pin, PinPullMode.PullUp)
        return 1 - pins.digitalReadPin(pin)
    }

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
     * "Botón │ en pin %puerto" (blockId boton, con su propio color
     * amarillo y su propio desplegable de pin P0-P3 adentro) queda
     * encajado por defecto dentro del hexágono, como shadow block.
     */
    //% blockId=boton_logico
    //% block="%medida %operador %valor"
    //% medida.shadow=boton
    //% valor.min=0 valor.max=1 valor.defl=1
    //% group="SENSORES" color="#006970" weight=99 blockGap=8
    export function botonLogico(
        medida: number,
        operador: SabanaOperadorComparacion,
        valor: number
    ): boolean {
        switch (operador) {
            case SabanaOperadorComparacion.Igual: return medida == valor
            case SabanaOperadorComparacion.Distinto: return medida != valor
            case SabanaOperadorComparacion.Menor: return medida < valor
            case SabanaOperadorComparacion.MenorIgual: return medida <= valor
            case SabanaOperadorComparacion.Mayor: return medida > valor
            case SabanaOperadorComparacion.MayorIgual: return medida >= valor
        }
        return false
    }
}
