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

    export enum SabanaDireccionGiro {
        //% block="Izquierda"
        Izquierda = 0,
        //% block="Derecha"
        Derecha = 1,
    }

    /**
     * STV2-17 — Movimiento simple del robot. El botón "+" agrega la velocidad.
     */
    //% blockId=sabana_movimiento_simple
    //% block="Movimiento %movimiento || Velocidad %velocidad"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% expandableArgumentMode="toggle"
    //% group="MOVIMIENTO" color="#34c2eb" weight=100 blockGap=8
    export function movimientoSimple(movimiento: SabanaMovimiento, velocidad = 50): void {
        // TODO: lógica real pendiente
    }

    /**
     * STV2-18 — Movimiento por una distancia en cm. El botón "+" agrega la velocidad.
     */
    //% blockId=sabana_movimiento_cm
    //% block="Movimiento %movimiento por %cm cm || Velocidad %velocidad"
    //% cm.min=1 cm.max=500 cm.defl=10
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% expandableArgumentMode="toggle"
    //% group="MOVIMIENTO" color="#34c2eb" weight=90 blockGap=8
    export function movimientoCm(movimiento: SabanaMovimiento, cm: number, velocidad = 50): void {
        // TODO: lógica real pendiente
    }

    /**
     * STV2-19 — Gira el robot un ángulo determinado. El botón "+" agrega
     * velocidad y ángulo juntos (igual que en EXT5).
     */
    //% blockId=sabana_movimiento_girar
    //% block="Movimiento Girar a la %direccion || Velocidad %velocidad ángulo de %angulo"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% angulo.min=0 angulo.max=360 angulo.defl=90
    //% expandableArgumentMode="toggle"
    //% group="MOVIMIENTO" color="#34c2eb" weight=80 blockGap=8
    export function movimientoGirar(direccion: SabanaDireccionGiro, velocidad = 50, angulo = 90): void {
        // TODO: lógica real pendiente
    }
}
