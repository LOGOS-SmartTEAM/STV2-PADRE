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

    // ── Motor real portado de EXT4/blocks/smartteam4/motores.ts ───────

    // Motor ROJO = derecho = 0x51, Motor VERDE = izquierdo = 0x52
    const MOVIMIENTO_MOTOR_ROJO = 0x51
    const MOVIMIENTO_MOTOR_VERDE = 0x52

    // Diámetro de rueda en cm (medido: 55mm) y circunferencia (π × diámetro)
    const MOVIMIENTO_DIAMETRO_RUEDA_CM = 5.5
    const MOVIMIENTO_CIRCUNFERENCIA_RUEDA_CM = 3.14159 * MOVIMIENTO_DIAMETRO_RUEDA_CM

    // Distancia entre centros de rueda en cm (medido: 120mm)
    const MOVIMIENTO_DIST_ENTRE_RUEDAS_CM = 12.0

    // RPM del motor a velocidad 100 (después de la caja reductora).
    // Calibrar con el robot real: avanzar 100cm a velocidad 100, contar
    // vueltas de una rueda marcada, RPM = vueltas × 60000 / tiempo_real_ms.
    const MOVIMIENTO_RPM_A_VEL_100 = 150

    function movimientoEscribirMotor(address: number, speedRaw: number): void {
        const half = speedRaw / 2
        let speedBuff = 0
        if (half < 0) {
            const s = -half
            speedBuff = ((~s) + 1) | 0x80
        } else {
            speedBuff = half
        }
        let buf = pins.createBuffer(4)
        buf.setNumber(NumberFormat.UInt8BE, 0, 0x11)
        buf.setNumber(NumberFormat.UInt8BE, 1, speedBuff)
        buf.setNumber(NumberFormat.UInt8BE, 2, 0)
        buf.setNumber(NumberFormat.UInt8BE, 3, 0)
        pins.i2cWriteBuffer(address, buf)
    }

    function movimientoRunDual(speed1: number, speed2: number): void {
        movimientoEscribirMotor(MOVIMIENTO_MOTOR_ROJO, speed1)
        movimientoEscribirMotor(MOVIMIENTO_MOTOR_VERDE, speed2)
    }

    function movimientoASpeeds(movimiento: SabanaMovimiento, velocidad: number): { s1: number; s2: number } {
        switch (movimiento) {
            case SabanaMovimiento.Avanzar:
                return { s1: velocidad, s2: -velocidad }
            case SabanaMovimiento.Retroceder:
                return { s1: -velocidad, s2: velocidad }
            case SabanaMovimiento.GirarDerecha:
                return { s1: -velocidad, s2: -velocidad }
            case SabanaMovimiento.GirarIzquierda:
                return { s1: velocidad, s2: velocidad }
            case SabanaMovimiento.Frenar:
                return { s1: 0, s2: 0 }
        }
        return { s1: 0, s2: 0 }
    }

    /**
     * STV2-17 — Movimiento simple del robot. Bloque directo, sin botón "+".
     */
    //% blockId=movimiento_simple
    //% block="%movimiento │ Velocidad %velocidad"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% group="MOVIMIENTO" color="#35BFE9" weight=100 blockGap=8
    export function movimientoSimple(movimiento: SabanaMovimiento, velocidad: number): void {
        const { s1, s2 } = movimientoASpeeds(movimiento, velocidad)
        movimientoRunDual(s1, s2)
    }

    /**
     * STV2-18 — Movimiento por una distancia en cm. Bloque directo, sin
     * botón "+". Solo Avanzar/Retroceder (no incluye giros ni frenar).
     */
    //% blockId=movimiento_cm
    //% block="%movimiento │ Velocidad %velocidad por %cm cm"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% cm.min=1 cm.max=500 cm.defl=10
    //% group="MOVIMIENTO" color="#35BFE9" weight=90 blockGap=8
    export function movimientoCm(movimiento: SabanaAvanceRetroceso, velocidad: number, cm: number): void {
        if (velocidad <= 0 || cm <= 0) return
        const mov = movimiento == SabanaAvanceRetroceso.Avanzar
            ? SabanaMovimiento.Avanzar
            : SabanaMovimiento.Retroceder
        const rpmEfectivas = MOVIMIENTO_RPM_A_VEL_100 * velocidad / 100
        const tiempo = (cm * 60000) / (MOVIMIENTO_CIRCUNFERENCIA_RUEDA_CM * rpmEfectivas)
        const { s1, s2 } = movimientoASpeeds(mov, velocidad)
        movimientoRunDual(s1, s2)
        basic.pause(tiempo)
        movimientoRunDual(0, 0)
    }

    /**
     * STV2-19 — Gira el robot un ángulo determinado. Bloque directo, sin
     * botón "+". La palabra "Girar" es parte del texto del desplegable
     * (SabanaDireccionGiro), no del texto fijo del bloque.
     */
    //% blockId=movimiento_girar
    //% block="%direccion │ Velocidad %velocidad ángulo de %angulo"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% angulo.min=0 angulo.max=360 angulo.defl=90
    //% group="MOVIMIENTO" color="#35BFE9" weight=80 blockGap=8
    export function movimientoGirar(direccion: SabanaDireccionGiro, velocidad: number, angulo: number): void {
        if (angulo <= 0 || velocidad <= 0) return
        const rpmEfectivas = MOVIMIENTO_RPM_A_VEL_100 * velocidad / 100
        const arcoCm = 3.14159 * MOVIMIENTO_DIST_ENTRE_RUEDAS_CM * angulo / 360
        const tiempo = (arcoCm * 60000) / (MOVIMIENTO_CIRCUNFERENCIA_RUEDA_CM * rpmEfectivas)
        const mov = direccion == SabanaDireccionGiro.Izquierda
            ? SabanaMovimiento.GirarIzquierda
            : SabanaMovimiento.GirarDerecha
        const { s1, s2 } = movimientoASpeeds(mov, velocidad)
        movimientoRunDual(s1, s2)
        basic.pause(tiempo)
        movimientoRunDual(0, 0)
    }
}
