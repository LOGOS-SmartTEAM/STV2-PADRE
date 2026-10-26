namespace bloques {
    let _cantidad = 0

    // Asigna un valor a la variable Cantidad.
    /**
     * Stores a number in Quantity.
     */
    //% blockId=cantidad_set
    //% block="Set Quantity to %valor"
    //% valor.shadow=math_number valor.defl=0
    //% group="VARIABLES" color="#EF506D" weight=100 blockGap=8
    export function establecerCantidad(valor: number): void {
        _cantidad = valor
    }

    // Devuelve el valor actual de Cantidad.
    /**
     * The current value of Quantity.
     */
    //% blockId=cantidad_get
    //% block="Quantity"
    //% group="VARIABLES" color="#EF506D" weight=99 blockGap=8
    export function leerCantidad(): number {
        return _cantidad
    }

    // Suma 1 a Cantidad.
    /**
     * Adds 1 to Quantity.
     */
    //% blockId=cantidad_sumar
    //% block="Add 1"
    //% group="VARIABLES" color="#EF506D" weight=98 blockGap=8
    export function sumarCantidad(): void {
        _cantidad += 1
    }

    // Resta 1 a Cantidad.
    /**
     * Subtracts 1 from Quantity.
     */
    //% blockId=cantidad_restar
    //% block="Subtract 1"
    //% group="VARIABLES" color="#EF506D" weight=97 blockGap=8
    export function restarCantidad(): void {
        _cantidad -= 1
    }
}
