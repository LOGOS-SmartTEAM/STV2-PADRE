namespace bloques {
    let _cantidad = 0

    /**
     * Asigna un valor a la variable Cantidad.
     */
    //% blockId=cantidad_set
    //% block="Establecer Cantidad a %valor"
    //% valor.shadow=math_number valor.defl=0
    //% group="VARIABLES" color="#EF506D" weight=100 blockGap=8
    export function establecerCantidad(valor: number): void {
        _cantidad = valor
    }

    /**
     * Devuelve el valor actual de Cantidad.
     */
    //% blockId=cantidad_get
    //% block="Cantidad"
    //% group="VARIABLES" color="#EF506D" weight=99 blockGap=8
    export function leerCantidad(): number {
        return _cantidad
    }

    /**
     * Suma 1 a Cantidad.
     */
    //% blockId=cantidad_sumar
    //% block="Sumar 1"
    //% group="VARIABLES" color="#EF506D" weight=98 blockGap=8
    export function sumarCantidad(): void {
        _cantidad += 1
    }

    /**
     * Resta 1 a Cantidad.
     */
    //% blockId=cantidad_restar
    //% block="Restar 1"
    //% group="VARIABLES" color="#EF506D" weight=97 blockGap=8
    export function restarCantidad(): void {
        _cantidad -= 1
    }
}
