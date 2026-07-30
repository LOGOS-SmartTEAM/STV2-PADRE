namespace bloques {

    // ── Constantes I2C del módulo ultrasónico del proveedor ─────────
    // Verificado en ORIGINAL/block/ultrasonic.ts
    const ULTRASONIDO_I2C_ADDR = 0x23   // 35
    const ULTRASONIDO_BASE = 0x0A       // registro base
    const ULTRASONIDO_PAUSA_MS = 20

    /**
     * STV2-1 — Ultrasonido conectado por I2C.
     *
     * Devuelve la distancia en MILÍMETROS, cruda, tal como la entrega el
     * módulo del proveedor. No se convierte a centímetros a propósito.
     *
     * Origen del código: ORIGINAL/block/ultrasonic.ts -> ultrasonicDistance()
     *
     * IMPORTANTE: el tercer argumento `true` de i2cWriteBuffer es un
     * repeated-start (sin condición de stop). Es obligatorio para que la
     * lectura siguiente devuelva el registro pedido. NO quitarlo.
     */
    //% blockId=sabana_ultrasonido
    //% block="Ultrasonido │ en pin I2C"
    //% group="SENSORES" color="#35BFE9" weight=100 blockGap=8
    export function ultrasonido(): number {
        basic.pause(ULTRASONIDO_PAUSA_MS)

        let buf = pins.createBuffer(1)
        buf[0] = ULTRASONIDO_BASE + 0x00
        pins.i2cWriteBuffer(ULTRASONIDO_I2C_ADDR, buf, true)

        // 2 bytes, big-endian
        let r = pins.i2cReadBuffer(ULTRASONIDO_I2C_ADDR, 2)
        return (r[0] << 8) | r[1]
    }
}
