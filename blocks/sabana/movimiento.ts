namespace bloques {
    export enum SabanaMovimiento {
        //% block="Avanzar"
        Avanzar = 0,
        //% block="Retroceder"
        Retroceder = 1,
        //% block="Girar a la Izquierda"
        GirarIzquierda = 2,
        //% block="Girar a la Derecha"
        GirarDerecha = 3,
        //% block="Frenar"
        Frenar = 4,
    }

    export enum SabanaAvanceRetroceso {
        //% block="Avanzar"
        Avanzar = 0,
        //% block="Retroceder"
        Retroceder = 1,
    }

    export enum SabanaDireccionGiro {
        //% block="Girar a la izquierda"
        Izquierda = 0,
        //% block="Girar a la derecha"
        Derecha = 1,
    }

    /**
     * STV2-17 — Movimiento simple del robot. Bloque directo, sin botón "+".
     */
    //% blockId=sabana_movimiento_simple
    //% block="%movimiento │ Velocidad %velocidad"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% group="MOVIMIENTO" color="#35BFE9" weight=100 blockGap=8
    export function movimientoSimple(movimiento: SabanaMovimiento, velocidad: number): void {
        // TODO: lógica real pendiente
    }

    /**
     * STV2-18 — Movimiento por una distancia en cm. Bloque directo, sin
     * botón "+". Solo Avanzar/Retroceder (no incluye giros ni frenar).
     */
    //% blockId=sabana_movimiento_cm
    //% block="%movimiento │ Velocidad %velocidad por %cm cm"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% cm.min=1 cm.max=500 cm.defl=10
    //% group="MOVIMIENTO" color="#35BFE9" weight=90 blockGap=8
    export function movimientoCm(movimiento: SabanaAvanceRetroceso, velocidad: number, cm: number): void {
        // TODO: lógica real pendiente
    }

    /**
     * STV2-19 — Gira el robot un ángulo determinado. Bloque directo, sin
     * botón "+". La palabra "Girar" ahora es parte del texto del
     * desplegable (SabanaDireccionGiro), no del texto fijo del bloque.
     */
    //% blockId=sabana_movimiento_girar
    //% block="%direccion │ Velocidad %velocidad ángulo de %angulo"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% angulo.min=0 angulo.max=360 angulo.defl=90
    //% group="MOVIMIENTO" color="#35BFE9" weight=80 blockGap=8
    export function movimientoGirar(direccion: SabanaDireccionGiro, velocidad: number, angulo: number): void {
        // TODO: lógica real pendiente
    }
}
