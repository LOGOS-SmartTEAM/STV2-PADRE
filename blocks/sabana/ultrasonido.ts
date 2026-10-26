namespace bloques {
    const ULTRASONIDO_I2C_ADDR = 0x23

    // STV2-1 — Ultrasonido conectado por I2C (dirección 0x23). Devuelve la
    // distancia en centímetros, rango 0 a 200.
    //
    // IMPORTANTE: el tercer argumento `true` de i2cWriteBuffer es un
    // repeated-start (sin condición de stop). Es obligatorio para que la
    // lectura siguiente devuelva el registro pedido. NO quitarlo.
    /**
     * Measures the distance to an object in centimeters (0 to 200).
     */
    //% blockId=ultrasonido
    //% block="Ultrasonic │ on I2C pin"
    //% group="SENSORS" color="#35BFE9" weight=95 blockGap=8
    export function ultrasonido(): number {
        basic.pause(20)

        let buf = pins.createBuffer(1)
        buf[0] = 0x0A
        pins.i2cWriteBuffer(ULTRASONIDO_I2C_ADDR, buf, true)

        let r = pins.i2cReadBuffer(ULTRASONIDO_I2C_ADDR, 2)
        let mm = (r[0] << 8) | r[1]
        let cm = Math.round(mm / 10)
        if (cm < 0) cm = 0
        if (cm > 200) cm = 200
        return cm
    }

    // Bloque booleano del Ultrasonido con umbral configurable (hexágono).
    // El bloque redondo "Ultrasonido │ en pin I2C" (blockId ultrasonido)
    // queda encajado por defecto dentro del hexágono, como shadow block.
    //
    // Lecturas por debajo de 3cm no son fiables en este sensor, así que
    // se ajustan (clamp) a 3cm antes de comparar contra el umbral. Umbral
    // configurable entre 3 y 25 cm.
    /**
     * Detects whether an object is at the chosen distance or closer.
     */
    //% blockId=ultrasonido_logico_hasta
    //% block="%medida detects up to %distancia cm %valor"
    //% medida.shadow=ultrasonido
    //% distancia.min=3 distancia.max=25 distancia.defl=25
    //% group="SENSORS" color="#006970" weight=93 blockGap=8
    export function ultrasonidoLogicoHasta(medida: number, distancia: number, valor: SabanaVerdaderoFalso): boolean {
        let medidaAjustada = medida
        if (medidaAjustada < 3) medidaAjustada = 3
        const detectado = medidaAjustada <= distancia
        return valor == SabanaVerdaderoFalso.Verdadero ? detectado : !detectado
    }
}
