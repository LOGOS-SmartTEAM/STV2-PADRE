namespace bloques {
    const VEML6040_ADDR = 0x10

    const REG_CONF = 0x00
    const REG_RED = 0x08
    const REG_GREEN = 0x09
    const REG_BLUE = 0x0A
    const REG_WHITE = 0x0B

    const IT_320MS = 0x30
    const AF_AUTO = 0x00
    const SD_ENABLE = 0x00

    const COLOR_READ_INTERVAL = 320
    const GAIN_R = 1.85
    const GAIN_G = 1.5
    const GAIN_B = 2.6

    export enum SabanaColorDetectado {
        //% block="🔴 Rojo"
        Rojo,
        //% block="🟡 Amarillo"
        Amarillo,
        //% block="🟢 Verde"
        Verde,
        //% block="🔵 Azul"
        Azul,
        //% block="⚪ Blanco"
        Blanco,
        //% block="⚫ Negro"
        Negro,
    }

    let colorInicializado = false
    let cacheR = 0
    let cacheG = 0
    let cacheB = 0
    let cacheW = 0
    let colorUltimaLectura = 0

    function colorSetConfiguracion() {
        let buf = pins.createBuffer(3)
        buf[0] = REG_CONF
        buf[1] = IT_320MS | AF_AUTO | SD_ENABLE
        buf[2] = 0
        pins.i2cWriteBuffer(VEML6040_ADDR, buf, false)
    }

    function colorLeerRegistro(reg: number): number {
        let regBuf = pins.createBuffer(1)
        regBuf[0] = reg
        pins.i2cWriteBuffer(VEML6040_ADDR, regBuf, true)
        basic.pause(5)
        let data = pins.i2cReadBuffer(VEML6040_ADDR, 2, false)
        return data[0] | (data[1] << 8)
    }

    function colorActualizarRGB() {
        if (!colorInicializado) {
            colorIniciar()
        }

        let ahora = control.millis()
        if (ahora - colorUltimaLectura < COLOR_READ_INTERVAL) return

        let r = colorLeerRegistro(REG_RED)
        let g = colorLeerRegistro(REG_GREEN)
        let b = colorLeerRegistro(REG_BLUE)
        let w = colorLeerRegistro(REG_WHITE)

        if (r == 0 && g == 0 && b == 0 && w == 0) return

        cacheR = r
        cacheG = g
        cacheB = b
        cacheW = w
        colorUltimaLectura = ahora
    }

    function colorMax3(a: number, b: number, c: number): number {
        let m = a
        if (b > m) m = b
        if (c > m) m = c
        return m
    }

    function colorMin3(a: number, b: number, c: number): number {
        let m = a
        if (b < m) m = b
        if (c < m) m = c
        return m
    }

    /**
     * Inicialización del VEML6040, llamada automáticamente por
     * colorActualizarRGB() en la primera lectura. No es un bloque: la
     * inicialización se fusionó dentro de sensor_color_detecta (única
     * decisión confirmada, ver mision.md).
     */
    function colorIniciar(): void {
        if (!colorInicializado) {
            colorSetConfiguracion()
            basic.pause(320)
            colorInicializado = true
        }
    }

    /**
     * Diseño visual final (confirmado): un solo bloque, inicializa el
     * sensor automáticamente en la primera lectura. Naranja/Cian/Púrpura
     * eliminados; sus rangos de tono (hue) se repartieron entre los
     * vecinos que quedaron (Rojo absorbe el hueco de Púrpura, Verde/Azul
     * absorben el hueco de Cian), conservando los límites originales de
     * Rojo/Amarillo/Verde/Azul. Color celeste = convención de bloques I2C.
     */
    //% blockId=sensor_color_detecta
    //% block="Sensor de Color │ Detecta %color en pin I2C"
    //% group="SENSORES" color="#35BFE9" weight=92 blockGap=8
    export function sensorColorDetecta(color: SabanaColorDetectado): boolean {
        colorActualizarRGB()

        let r = cacheR
        let g = cacheG
        let b = cacheB
        let w = cacheW

        let nr = (r / w) * GAIN_R
        let ng = (g / w) * GAIN_G
        let nb = (b / w) * GAIN_B

        let sum = nr + ng + nb
        nr /= sum
        ng /= sum
        nb /= sum

        let max = colorMax3(nr, ng, nb)
        let min = colorMin3(nr, ng, nb)

        if (max == 0) return false
        let s = 0
        if (max != min) {
            s = (max - min) / max
        }

        if (w < 8500) {
            return color == SabanaColorDetectado.Negro
        }
        if (s < 0.07) {
            return color == SabanaColorDetectado.Blanco
        }

        let h = 0
        if (max == nr) {
            h = 60 * ((ng - nb) / (max - min))
        } else if (max == ng) {
            h = 60 * (2 + (nb - nr) / (max - min))
        } else {
            h = 60 * (4 + (nr - ng) / (max - min))
        }
        if (h < 0) h += 360

        if (color == SabanaColorDetectado.Rojo) {
            return h < 35 || h >= 240
        } else if (color == SabanaColorDetectado.Amarillo) {
            return h >= 35 && h < 70
        } else if (color == SabanaColorDetectado.Verde) {
            return h >= 70 && h < 205
        } else if (color == SabanaColorDetectado.Azul) {
            return h >= 205 && h < 240
        }
        return false
    }

    //% blockId=color_brillo
    //% block="Leer brillo"
    //% group="SENSORES" color="#9E9E9E" weight=90 blockGap=8
    export function colorBrillo(): number {
        colorActualizarRGB()
        let nw = Math.round(cacheW * 255 / 65535)
        if (nw > 255) nw = 255
        if (nw < 0) nw = 0
        return nw
    }
}
