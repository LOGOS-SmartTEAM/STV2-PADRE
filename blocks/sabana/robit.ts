namespace bloques {
    export enum SabanaSiNo {
        //% block="Yes"
        Si = 0,
        //% block="No"
        No = 1,
    }

    export enum SabanaRobitGiro {
        //% block="↺ Left"
        Izquierda = 9,
        //% block="↻ Right"
        Derecha = 10,
    }

    // Valor = milisegundos por paso del desplazamiento (basic.showString).
    // 150 ms es la velocidad normal de MakeCode.
    export enum SabanaVelocidadTexto {
        //% block="slow"
        Lenta = 150,
        //% block="fast"
        Rapida = 75,
    }

    const ULTRASONIDO_RGB_I2C_ADDR = 0x57
    const ROBIT_I2C_ADDR = 0x09
    const ROBIT_LED_BASE = 0x0A
    const ROBIT_MOTORES_BASE = 0x8C

    // Ultrasonido RGB conectado por I2C (dirección 0x57). Devuelve la
    // distancia en centímetros, rango 0 a 200.
    //
    // Protocolo igual a logos-smart (ultrasonicRgbGetDistance): comando 0x01
    // con repeated-start, lectura de 3 bytes (24 bits) y /1000 → mm.
    // Entre dos lecturas deben pasar más de 50 ms (pausa de 60 ms).
    /**
     * ROBIT measures the distance to an object in centimeters (0 to 200).
     */
    //% blockId=ultrasonido_rgb
    //% block="ROBIT │ Ultrasonic"
    //% group="SENSORS" color="#9C27B0" weight=101 blockGap=8
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

    // Bloque booleano combinado del Ultrasonido RGB (hexágono). El bloque
    // redondo "ROBIT │ Ultrasonido" (blockId ultrasonido_rgb) queda
    // encajado por defecto dentro del hexágono, como shadow block.
    //
    // Umbral de detección igual que PA-12: 3 a 25 cm (inclusive), sobre la
    // lectura en cm. "Si" = hay objeto, "No" = no hay objeto.
    /**
     * Detects whether there is an object 3 to 25 cm from ROBIT.
     */
    //% blockId=ultrasonido_rgb_logico
    //% block="%medida detects object: %valor"
    //% medida.shadow=ultrasonido_rgb
    //% group="SENSORS" color="#9C27B0" weight=100.5 blockGap=8
    export function ultrasonidoRgbLogico(medida: number, valor: SabanaSiNo): boolean {
        const detectado = medida >= 3 && medida <= 25
        return valor == SabanaSiNo.Si ? detectado : !detectado
    }

    // Luces del chasis Robit (I2C 0x09) — protocolo igual a logos-smart:
    // brillo en registro 0x0A (ambientLightSetBrightness), color en 0x0B
    // (ambientLightSetColor).
    function robitLucesChasis(brillo: number, r: number, g: number, b: number): void {
        let brilloBuff = pins.createBuffer(2)
        brilloBuff.setNumber(NumberFormat.UInt8BE, 0, ROBIT_LED_BASE + 0x00)
        brilloBuff.setNumber(NumberFormat.UInt8BE, 1, brillo)
        pins.i2cWriteBuffer(ROBIT_I2C_ADDR, brilloBuff)
        basic.pause(20)

        let colorBuff = pins.createBuffer(4)
        colorBuff.setNumber(NumberFormat.UInt8BE, 0, ROBIT_LED_BASE + 0x01)
        colorBuff.setNumber(NumberFormat.UInt8BE, 1, r)
        colorBuff.setNumber(NumberFormat.UInt8BE, 2, g)
        colorBuff.setNumber(NumberFormat.UInt8BE, 3, b)
        pins.i2cWriteBuffer(ROBIT_I2C_ADDR, colorBuff)
    }

    // Luces internas del Ultrasonido RGB (I2C 0x57) — protocolo igual a
    // logos-smart (ultrasonicRgbSetColor): comando 0x02 + brillo + R + G + B.
    function robitLucesUltrasonido(brillo: number, r: number, g: number, b: number): void {
        let cmdBuff = pins.createBuffer(5)
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, 0x02)
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, brillo)
        cmdBuff.setNumber(NumberFormat.UInt8BE, 2, r)
        cmdBuff.setNumber(NumberFormat.UInt8BE, 3, g)
        cmdBuff.setNumber(NumberFormat.UInt8BE, 4, b)
        pins.i2cWriteBuffer(ULTRASONIDO_RGB_I2C_ADDR, cmdBuff)
    }

    // Prende las luces RGB del chasis ROBIT y del Ultrasonido RGB con el
    // color elegido en la paleta (brillo fijo 255 en ambos).
    /**
     * Turns on ROBIT's and the ultrasonic sensor's LEDs with the chosen color.
     */
    //% blockId=robit_led_rgb
    //% block="ROBIT │ Turn on LEDs color %color"
    //% color.shadow="colorNumberPicker"
    //% group="OUTPUTS" color="#9C27B0" weight=101 blockGap=8
    export function robitLedRgb(color: number): void {
        const r = (color >> 16) & 0xFF
        const g = (color >> 8) & 0xFF
        const b = color & 0xFF
        robitLucesChasis(255, r, g, b)
        robitLucesUltrasonido(255, r, g, b)
    }

    // Apaga las luces RGB del chasis ROBIT y del Ultrasonido RGB.
    /**
     * Turns off ROBIT's and the ultrasonic sensor's LEDs.
     */
    //% blockId=robit_apagar_leds
    //% block="ROBIT │ Turn off LEDs"
    //% group="OUTPUTS" color="#9C27B0" weight=100.5 blockGap=8
    export function robitApagarLeds(): void {
        robitLucesChasis(0, 0, 0, 0)
        robitLucesUltrasonido(0, 0, 0, 0)
    }

    // Movimiento del chasis ROBIT por una distancia en cm (I2C 0x09). Solo
    // Avanzar/Retroceder. El bloque espera hasta que el robot termina.
    //
    // Protocolo igual a logos-smart (motionDistance): velocidad en 0x8D,
    // distancia en 0x8E, orden en 0x8C (5 = avanzar, 6 = retroceder) y
    // lectura del estado en 0x91 hasta que valga 0.
    // Con velocidad 0 o distancia 0 no hace nada (si no, quedaría esperando
    // para siempre porque el robot nunca termina).
    /**
     * ROBIT moves forward or backward the chosen centimeters (up to 50).
     */
    //% blockId=robit_movimiento_cm
    //% block="ROBIT │ %movimiento at speed %velocidad for %cm cm"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% cm.min=0 cm.max=50 cm.defl=10
    //% group="MOVEMENT" color="#9C27B0" weight=101 blockGap=8
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

    // Frena el chasis ROBIT (I2C 0x09): orden 0 en el registro de motores
    // 0x8C, igual que logos-smart (motionStop). Pone los motores en cero.
    /**
     * Stops ROBIT (sets the motors to zero).
     */
    //% blockId=robit_frenar
    //% block="ROBIT │ Brake"
    //% group="MOVEMENT" color="#9C27B0" weight=100.75 blockGap=8
    export function robitFrenar(): void {
        let cmdBuff = pins.createBuffer(2)
        cmdBuff.setNumber(NumberFormat.UInt8BE, 0, ROBIT_MOTORES_BASE + 0x00)
        cmdBuff.setNumber(NumberFormat.UInt8BE, 1, 0)
        pins.i2cWriteBuffer(ROBIT_I2C_ADDR, cmdBuff)
    }

    // Giro del chasis ROBIT sobre su propio eje (I2C 0x09): 90° fijos a
    // velocidad 50 fija, a la izquierda o a la derecha. El bloque espera
    // hasta que el robot termina.
    //
    // Protocolo igual a logos-smart (motionAngle): velocidad en 0x8D,
    // ángulo en 0x90, orden en 0x8C (9 = izquierda, 10 = derecha) y
    // lectura del estado en 0x91 hasta que valga 0.
    /**
     * ROBIT turns 90° to the left or right.
     */
    //% blockId=robit_girar
    //% block="ROBIT │ Turn 90° to the %direccion"
    //% group="MOVEMENT" color="#9C27B0" weight=100.5 blockGap=8
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

    // Muestra un texto en la matriz de LEDs de la micro:bit, desplazándolo
    // a velocidad lenta o rápida.
    /**
     * Shows text on the micro:bit LED matrix, slow or fast.
     */
    //% blockId=robit_mostrar_cadena
    //% block="ROBIT │ Show string %texto at speed %velocidad"
    //% texto.shadow=text texto.defl="HOLA"
    //% group="SCREENS" color="#9C27B0" weight=101 blockGap=8
    export function robitMostrarCadena(texto: string | number, velocidad: SabanaVelocidadTexto): void {
        basic.showString("" + texto, velocidad)
    }
}
