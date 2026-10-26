namespace bloques {
    export enum SabanaMovimiento {
        //% block="Forward"
        Avanzar = 0,
        //% block="Backward"
        Retroceder = 1,
        //% block="Turn Left"
        GirarIzquierda = 2,
        //% block="Turn Right"
        GirarDerecha = 3,
        //% block="Brake"
        Frenar = 4,
    }

    export enum SabanaAvanceRetroceso {
        //% block="Forward"
        Avanzar = 0,
        //% block="Backward"
        Retroceder = 1,
    }

    export enum SabanaDireccionGiro {
        //% block="Turn left"
        Izquierda = 0,
        //% block="Turn right"
        Derecha = 1,
    }

    // ── Motor real portado de EXT4/blocks/smartteam4/motores.ts ───────

    // Motor IZQUIERDO = ROJO (0x51) o AZUL (0x53)
    // Motor DERECHO   = VERDE (0x52) o AMARILLO (0x54)
    // La orden de cada lado se manda a sus dos colores posibles; el color que
    // no esté conectado no responde (i2cWriteBuffer devuelve error, sin colgar).
    // Polaridad igual a logos-smart (runDual): adelante = izquierdo −, derecho +.
    const MOVIMIENTO_IZQ_ROJO = 0x51
    const MOVIMIENTO_IZQ_AZUL = 0x53
    const MOVIMIENTO_DER_VERDE = 0x52
    const MOVIMIENTO_DER_AMARILLO = 0x54

    // Medidas del robot (confirmadas por el usuario, 2026-10-25)
    const MOVIMIENTO_DIAMETRO_RUEDA_CM = 5.5         // diámetro de la rueda
    const MOVIMIENTO_CIRCUNFERENCIA_RUEDA_CM = 3.14159 * MOVIMIENTO_DIAMETRO_RUEDA_CM
    const MOVIMIENTO_DIST_ENTRE_RUEDAS_CM = 9.5      // de centro a centro de rueda

    // "Por cm" y "girar" usan el modo 0x04 del motor (protocolo del proveedor,
    // igual que logos-smart moveRel/gotoDual): "desplazamiento relativo" — la
    // rueda gira N grados exactos medidos por su propio sensor, frena sola y
    // reporta su estado en el byte 5: 4 = moviendo, 11 = terminó, 10 = trabada.
    const MOVIMIENTO_ESTADO_MOVIENDO = 4
    const MOVIMIENTO_ESTADO_FIN = 11
    const MOVIMIENTO_ESTADO_TRABADO = 10
    // Si ninguna rueda avanza durante este tiempo se corta (nunca se cuelga).
    const MOVIMIENTO_SIN_AVANCE_MS = 2000

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

    // speed1 = rueda derecha, speed2 = rueda izquierda (ver movimientoASpeeds)
    function movimientoRunDual(speed1: number, speed2: number): void {
        movimientoEscribirMotor(MOVIMIENTO_DER_VERDE, speed1)
        movimientoEscribirMotor(MOVIMIENTO_DER_AMARILLO, speed1)
        movimientoEscribirMotor(MOVIMIENTO_IZQ_ROJO, speed2)
        movimientoEscribirMotor(MOVIMIENTO_IZQ_AZUL, speed2)
    }

    // Manda "girar N grados" (modo 0x04) a un motor. Devuelve true si el motor
    // respondió, o sea si ese color está conectado (i2cWriteBuffer devuelve 0).
    // En el simulador de MakeCode no devuelve 0, así que no se espera nada.
    function movimientoGirarRueda(address: number, velocidad: number, grados: number): boolean {
        let g = Math.round(grados)
        if (g > 32400) g = 32400
        if (g < -32400) g = -32400
        let buf = pins.createBuffer(4)
        buf.setNumber(NumberFormat.UInt8BE, 0, 0x04)
        buf.setNumber(NumberFormat.UInt8BE, 1, Math.max(1, Math.round(velocidad / 2)))
        buf.setNumber(NumberFormat.Int16BE, 2, g)
        return pins.i2cWriteBuffer(address, buf) == 0
    }

    // Espera a que todos los motores indicados terminen (o se traben).
    function movimientoEsperarFin(motores: number[]): void {
        // 1) Esperar a que arranquen: justo después de la orden el estado
        //    puede seguir en "terminó" por el movimiento anterior.
        const inicio = control.millis()
        while (control.millis() - inicio < 300) {
            let alguno = false
            for (let a of motores) {
                if (pins.i2cReadBuffer(a, 6)[5] == MOVIMIENTO_ESTADO_MOVIENDO) alguno = true
            }
            if (alguno) break
            basic.pause(5)
        }
        // 2) Esperar fin/trabado de todos, mirando que las ruedas avancen.
        let posAnterior: number[] = []
        for (let i = 0; i < motores.length; i++) posAnterior.push(-99999)
        let ultimoAvance = control.millis()
        while (true) {
            let terminados = 0
            for (let i = 0; i < motores.length; i++) {
                const b = pins.i2cReadBuffer(motores[i], 6)
                const estado = b[5]
                if (estado == MOVIMIENTO_ESTADO_FIN || estado == MOVIMIENTO_ESTADO_TRABADO) terminados++
                const pos = b.getNumber(NumberFormat.Int16BE, 1)
                if (pos != posAnterior[i]) {
                    posAnterior[i] = pos
                    ultimoAvance = control.millis()
                }
            }
            if (terminados == motores.length) return
            if (control.millis() - ultimoAvance > MOVIMIENTO_SIN_AVANCE_MS) {
                movimientoRunDual(0, 0)
                return
            }
            basic.pause(10)
        }
    }

    // Gira la rueda derecha y la izquierda N grados (con signo) y espera.
    function movimientoGradosDual(gradosDerecha: number, gradosIzquierda: number, velocidad: number): void {
        let conectados: number[] = []
        if (movimientoGirarRueda(MOVIMIENTO_DER_VERDE, velocidad, gradosDerecha)) conectados.push(MOVIMIENTO_DER_VERDE)
        if (movimientoGirarRueda(MOVIMIENTO_DER_AMARILLO, velocidad, gradosDerecha)) conectados.push(MOVIMIENTO_DER_AMARILLO)
        if (movimientoGirarRueda(MOVIMIENTO_IZQ_ROJO, velocidad, gradosIzquierda)) conectados.push(MOVIMIENTO_IZQ_ROJO)
        if (movimientoGirarRueda(MOVIMIENTO_IZQ_AZUL, velocidad, gradosIzquierda)) conectados.push(MOVIMIENTO_IZQ_AZUL)
        if (conectados.length > 0) movimientoEsperarFin(conectados)
    }

    // s1 = rueda derecha, s2 = rueda izquierda (motores montados en espejo)
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

    // STV2-17 — Movimiento simple del robot. Bloque directo, sin botón "+".
    /**
     * Moves the robot at the chosen speed (0 to 100).
     */
    //% blockId=movimiento_simple
    //% block="%movimiento │ Speed %velocidad"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% group="MOVEMENT" color="#35BFE9" weight=100 blockGap=8
    export function movimientoSimple(movimiento: SabanaMovimiento, velocidad: number): void {
        velocidad = Math.constrain(velocidad, 0, 100)
        const { s1, s2 } = movimientoASpeeds(movimiento, velocidad)
        movimientoRunDual(s1, s2)
    }

    // STV2-18 — Movimiento por una distancia en cm. Bloque directo, sin
    // botón "+". Solo Avanzar/Retroceder (no incluye giros ni frenar).
    /**
     * Moves forward or backward the chosen centimeters, then stops.
     */
    //% blockId=movimiento_cm
    //% block="%movimiento │ Speed %velocidad for %cm cm"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% cm.min=1 cm.max=500 cm.defl=10
    //% group="MOVEMENT" color="#35BFE9" weight=90 blockGap=8
    export function movimientoCm(movimiento: SabanaAvanceRetroceso, velocidad: number, cm: number): void {
        velocidad = Math.constrain(velocidad, 0, 100)
        if (velocidad <= 0 || cm <= 0) return
        const mov = movimiento == SabanaAvanceRetroceso.Avanzar
            ? SabanaMovimiento.Avanzar
            : SabanaMovimiento.Retroceder
        // Grados de rueda = cm × 360 / circunferencia
        const grados = cm * 360 / MOVIMIENTO_CIRCUNFERENCIA_RUEDA_CM
        const { s1, s2 } = movimientoASpeeds(mov, 1)   // signo de cada rueda
        movimientoGradosDual(s1 * grados, s2 * grados, velocidad)
    }

    // STV2-19 — Gira el robot un ángulo determinado. Bloque directo, sin
    // botón "+". La palabra "Girar" es parte del texto del desplegable
    // (SabanaDireccionGiro), no del texto fijo del bloque.
    /**
     * Turns the robot the chosen degrees, then stops.
     */
    //% blockId=movimiento_girar
    //% block="%direccion │ Speed %velocidad angle %angulo"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% angulo.min=0 angulo.max=360 angulo.defl=90
    //% group="MOVEMENT" color="#35BFE9" weight=80 blockGap=8
    export function movimientoGirar(direccion: SabanaDireccionGiro, velocidad: number, angulo: number): void {
        velocidad = Math.constrain(velocidad, 0, 100)
        if (angulo <= 0 || velocidad <= 0) return
        const mov = direccion == SabanaDireccionGiro.Izquierda
            ? SabanaMovimiento.GirarIzquierda
            : SabanaMovimiento.GirarDerecha
        // Giro en el lugar: cada rueda recorre π·W·ángulo/360, que en grados
        // de rueda es ángulo × W / D.
        const grados = angulo * MOVIMIENTO_DIST_ENTRE_RUEDAS_CM / MOVIMIENTO_DIAMETRO_RUEDA_CM
        const { s1, s2 } = movimientoASpeeds(mov, 1)   // signo de cada rueda
        movimientoGradosDual(s1 * grados, s2 * grados, velocidad)
    }
}
