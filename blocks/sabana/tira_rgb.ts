namespace bloques {
    const TIRA_RGB_I2C_ADDR = 0x24
    const TIRA_RGB_BASE = 0x0A

    let tiraRgbColores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    function tiraRgbLimitar(valor: number): number {
        return Math.max(0, Math.min(255, valor))
    }

    function tiraRgbActualizar(): void {
        let buf = pins.createBuffer(19)
        buf[0] = TIRA_RGB_BASE + 0x01
        for (let i = 0; i < 18; i++) {
            buf[i + 1] = tiraRgbColores[i]
        }
        pins.i2cWriteBuffer(TIRA_RGB_I2C_ADDR, buf)
    }

    function tiraRgbSetPixel(index: number, colorEmpacado: number): void {
        const r = tiraRgbLimitar((colorEmpacado >> 16) & 0xFF)
        const g = tiraRgbLimitar((colorEmpacado >> 8) & 0xFF)
        const b = tiraRgbLimitar(colorEmpacado & 0xFF)
        tiraRgbColores[index * 3] = r
        tiraRgbColores[index * 3 + 1] = g
        tiraRgbColores[index * 3 + 2] = b
    }

    /**
     * STV2-9 — Tira RGB de 6 LEDs por I2C (dirección 0x24). Cada LED se
     * elige con un selector de color (paleta).
     */
    //% blockId=tira_rgb
    //% block="Tira RGB │ %led1 %led2 %led3 %led4 %led5 %led6 en pin I2C"
    //% led1.shadow="colorNumberPicker" led2.shadow="colorNumberPicker"
    //% led3.shadow="colorNumberPicker" led4.shadow="colorNumberPicker"
    //% led5.shadow="colorNumberPicker" led6.shadow="colorNumberPicker"
    //% inlineInputMode=inline
    //% group="SALIDAS" color="#35BFE9" weight=100 blockGap=8
    export function tiraRgb(
        led1: number, led2: number, led3: number,
        led4: number, led5: number, led6: number
    ): void {
        tiraRgbSetPixel(0, led1)
        tiraRgbSetPixel(1, led2)
        tiraRgbSetPixel(2, led3)
        tiraRgbSetPixel(3, led4)
        tiraRgbSetPixel(4, led5)
        tiraRgbSetPixel(5, led6)
        tiraRgbActualizar()
    }

    /**
     * STV2-11 — Ajusta la tira RGB con valores independientes de R, G y B (0-255).
     */
    //% blockId=tira_rgb_rgb
    //% block="Tira RGB │ ajustada a R %r G %g B %b"
    //% r.min=0 r.max=255 r.defl=255
    //% g.min=0 g.max=255 g.defl=255
    //% b.min=0 b.max=255 b.defl=255
    //% group="SALIDAS" color="#35BFE9" weight=90 blockGap=8
    export function tiraRgbAjustada(r: number, g: number, b: number): void {
        r = tiraRgbLimitar(r)
        g = tiraRgbLimitar(g)
        b = tiraRgbLimitar(b)
        for (let i = 0; i < 6; i++) {
            tiraRgbColores[i * 3] = r
            tiraRgbColores[i * 3 + 1] = g
            tiraRgbColores[i * 3 + 2] = b
        }
        tiraRgbActualizar()
    }

    /**
     * NUEVO — Apaga todos los LEDs de la tira RGB.
     */
    //% blockId=tira_rgb_apagar_todos
    //% block="Tira RGB │ apagar todos"
    //% group="SALIDAS" color="#35BFE9" weight=85 blockGap=8
    export function tiraRgbApagarTodos(): void {
        for (let i = 0; i < 18; i++) {
            tiraRgbColores[i] = 0
        }
        tiraRgbActualizar()
    }
}
