namespace bloques {
    export enum SabanaRobitGiro {
        //% block="⬅️ Izquierda"
        Izquierda = 9,
        //% block="➡️ Derecha"
        Derecha = 10,
    }

    const ULTRASONIDO_RGB_I2C_ADDR = 0x57
    const ROBIT_I2C_ADDR = 0x09
    const ROBIT_LED_BASE = 0x0A
    const ROBIT_MOTORES_BASE = 0x8C

    /**
     * Ultrasonido RGB conectado por I2C (dirección 0x57). Devuelve la
     * distancia en centímetros, rango 0 a 200.
     *
     * Protocolo igual a logos-smart (ultrasonicRgbGetDistance): comando 0x01
     * con repeated-start, lectura de 3 bytes (24 bits) y /1000 → mm.
     * Entre dos lecturas deben pasar más de 50 ms (pausa de 60 ms).
     */
    //% blockId=ultrasonido_rgb
    //% block="Ultrasonido RGB │ distancia (cm)"
    //% group="SENSORES" color="#9C27B0" weight=101 blockGap=8
    export function ultrasonidoRgb(): number {
        let cmdBuff = pins.createBuffer(1)
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, 0x01)
        pins.i2cWriteBuffer(ULTRASONIDO_RGB_I2C_ADDR, cmdBuff, true)

        let readBuff = pins.i2cReadBuffer(ULTRASONIDO_RGB_I2C_ADDR, 3)
        let rawDistance = (readBuff[0] << 16) | (readBuff[1] << 8) | readBuff[2]
        let mm = Math.round(rawDistance / 1000)
        basic.pause(60)

        let cm = Math.round(mm / 10)
        if (cm < 0) cm = 0
        if (cm > 200) cm = 200
        return cm
    }

    /**
     * Bloque booleano combinado del Ultrasonido RGB (hexágono). El bloque
     * redondo "Ultrasonido RGB │ distancia (cm)" (blockId ultrasonido_rgb)
     * queda encajado por defecto dentro del hexágono, como shadow block.
     *
     * Umbral de detección igual que PA-12: 3 a 25 cm (inclusive), sobre la
     * lectura en cm.
     */
    //% blockId=ultrasonido_rgb_logico
    //% block="%medida detecta objeto %valor"
    //% medida.shadow=ultrasonido_rgb
    //% group="SENSORES" color="#9C27B0" weight=100.5 blockGap=8
    export function ultrasonidoRgbLogico(medida: number, valor: SabanaVerdaderoFalso): boolean {
        const detectado = medida >= 3 && medida <= 25
        return valor == SabanaVerdaderoFalso.Verdadero ? detectado : !detectado
    }

    /**
     * LED RGB (luz ambiental) del chasis Robit por I2C (dirección 0x09). Toda
     * la tira se enciende del mismo color, elegido con la paleta.
     *
     * Protocolo igual a logos-smart: primero brillo fijo 255
     * (ambientLightSetBrightness, registro 0x0A) y luego el color
     * (ambientLightSetColor, registro 0x0B).
     */
    //% blockId=robit_led_rgb
    //% block="Robit LED RGB │ Color %color"
    //% color.shadow="colorNumberPicker"
    //% group="SALIDAS" color="#9C27B0" weight=101 blockGap=8
    export function robitLedRgb(color: number): void {
        let brilloBuff = pins.createBuffer(2)
        brilloBuff.setNumber(NumberFormat.UInt8BE, 0, ROBIT_LED_BASE + 0x00)
        brilloBuff.setNumber(NumberFormat.UInt8BE, 1, 255)
        pins.i2cWriteBuffer(ROBIT_I2C_ADDR, brilloBuff)
        basic.pause(20)

        const r = (color >> 16) & 0xFF
        const g = (color >> 8) & 0xFF
        const b = color & 0xFF
        let colorBuff = pins.createBuffer(4)
        colorBuff.setNumber(NumberFormat.UInt8BE, 0, ROBIT_LED_BASE + 0x01)
        colorBuff.setNumber(NumberFormat.UInt8BE, 1, r)
        colorBuff.setNumber(NumberFormat.UInt8BE, 2, g)
        colorBuff.setNumber(NumberFormat.UInt8BE, 3, b)
        pins.i2cWriteBuffer(ROBIT_I2C_ADDR, colorBuff)
    }

    /**
     * Movimiento del chasis Robit por una distancia en cm (I2C 0x09). Solo
     * Avanzar/Retroceder. El bloque espera hasta que el robot termina.
     *
     * Protocolo igual a logos-smart (motionDistance): velocidad en 0x8D,
     * distancia en 0x8E, orden en 0x8C (5 = avanzar, 6 = retroceder) y
     * lectura del estado en 0x91 hasta que valga 0.
     * Con velocidad 0 o distancia 0 no hace nada (si no, quedaría esperando
     * para siempre porque el robot nunca termina).
     */
    //% blockId=robit_movimiento_cm
    //% block="Robit %movimiento │ Velocidad %velocidad por %cm cm"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% cm.min=0 cm.max=50 cm.defl=10
    //% group="MOVIMIENTO" color="#9C27B0" weight=101 blockGap=8
    export function robitMovimientoCm(movimiento: SabanaAvanceRetroceso, velocidad: number, cm: number): void {
        if (velocidad < 0) velocidad = 0
        if (velocidad > 100) velocidad = 100
        if (cm < 0) cm = 0
        if (cm > 50) cm = 50
        if (velocidad == 0 || cm == 0) return

        const tipo = movimiento == SabanaAvanceRetroceso.Avanzar ? 5 : 6

        let spBuff = pins.createBuffer(5)
        spBuff.setNumber(NumberFormat.UInt8BE, 0, ROBIT_MOTORES_BASE + 0x01)
        spBuff.setNumber(NumberFormat.UInt8BE, 1, (velocidad >> 8) & 0xFF)
        spBuff.setNumber(NumberFormat.UInt8BE, 2, velocidad & 0xFF)
        spBuff.setNumber(NumberFormat.UInt8BE, 3, (velocidad >> 8) & 0xFF)
        spBuff.setNumber(NumberFormat.UInt8BE, 4, velocidad & 0xFF)
        pins.i2cWriteBuffer(ROBIT_I2C_ADDR, spBuff)

        let disBuff = pins.createBuffer(3)
        disBuff.setNumber(NumberFormat.UInt8BE, 0, ROBIT_MOTORES_BASE + 0x02)
        disBuff.setNumber(NumberFormat.UInt8BE, 1, (cm >> 8) & 0xFF)
        disBuff.setNumber(NumberFormat.UInt8BE, 2, cm & 0xFF)
        pins.i2cWriteBuffer(ROBIT_I2C_ADDR, disBuff)

        let cmdBuff = pins.createBuffer(2)
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, ROBIT_MOTORES_BASE + 0x00)
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, tipo)
        pins.i2cWriteBuffer(ROBIT_I2C_ADDR, cmdBuff)

        robitEsperarFin()
    }

    /**
     * Giro del chasis Robit sobre su propio eje (I2C 0x09): 90° fijos a
     * velocidad 50 fija, a la izquierda o a la derecha. El bloque espera
     * hasta que el robot termina.
     *
     * Protocolo igual a logos-smart (motionAngle): velocidad en 0x8D,
     * ángulo en 0x90, orden en 0x8C (9 = izquierda, 10 = derecha) y
     * lectura del estado en 0x91 hasta que valga 0.
     */
    //% blockId=robit_girar
    //% block="Robit │ Girar a la %direccion"
    //% group="MOVIMIENTO" color="#9C27B0" weight=100.5 blockGap=8
    export function robitGirar(direccion: SabanaRobitGiro): void {
        const velocidad = 50
        const angulo = 90

        let spBuff = pins.createBuffer(5)
        spBuff.setNumber(NumberFormat.UInt8BE, 0, ROBIT_MOTORES_BASE + 0x01)
        spBuff.setNumber(NumberFormat.UInt8BE, 1, (velocidad >> 8) & 0xFF)
        spBuff.setNumber(NumberFormat.UInt8BE, 2, velocidad & 0xFF)
        spBuff.setNumber(NumberFormat.UInt8BE, 3, (velocidad >> 8) & 0xFF)
        spBuff.setNumber(NumberFormat.UInt8BE, 4, velocidad & 0xFF)
        pins.i2cWriteBuffer(ROBIT_I2C_ADDR, spBuff)

        let angBuff = pins.createBuffer(3)
        angBuff.setNumber(NumberFormat.UInt8BE, 0, ROBIT_MOTORES_BASE + 0x04)
        angBuff.setNumber(NumberFormat.UInt8BE, 1, (angulo >> 8) & 0xFF)
        angBuff.setNumber(NumberFormat.UInt8BE, 2, angulo & 0xFF)
        pins.i2cWriteBuffer(ROBIT_I2C_ADDR, angBuff)

        let cmdBuff = pins.createBuffer(2)
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, ROBIT_MOTORES_BASE + 0x00)
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, direccion)
        pins.i2cWriteBuffer(ROBIT_I2C_ADDR, cmdBuff)

        robitEsperarFin()
    }

    /**
     * Frena el chasis Robit (I2C 0x09).
     *
     * Protocolo igual a logos-smart (motionStop): orden 0 en 0x8C.
     */
    //% blockId=robit_frenar
    //% block="Robit │ Frenar"
    //% group="MOVIMIENTO" color="#9C27B0" weight=100.25 blockGap=8
    export function robitFrenar(): void {
        let cmdBuff = pins.createBuffer(2)
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, ROBIT_MOTORES_BASE + 0x00)
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, 0)
        pins.i2cWriteBuffer(ROBIT_I2C_ADDR, cmdBuff)
    }

    // Espera (bloqueante) hasta que el chasis informa estado 0 en 0x91.
    function robitEsperarFin(): void {
        basic.pause(100)
        while (true) {
            pins.i2cWriteNumber(ROBIT_I2C_ADDR, ROBIT_MOTORES_BASE + 0x05, NumberFormat.UInt8BE)
            let estado = pins.i2cReadNumber(ROBIT_I2C_ADDR, NumberFormat.UInt8BE)
            if (estado == 0) break
            basic.pause(20)
        }
    }
}
