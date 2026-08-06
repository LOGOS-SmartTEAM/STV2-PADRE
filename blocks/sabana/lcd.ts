namespace bloques {
    export enum SabanaLcdFila {
        //% block="0"
        F0 = 0,
        //% block="1"
        F1 = 1,
    }

    export enum SabanaColumna16 {
        //% block="0"
        C0 = 0,
        //% block="1"
        C1 = 1,
        //% block="2"
        C2 = 2,
        //% block="3"
        C3 = 3,
        //% block="4"
        C4 = 4,
        //% block="5"
        C5 = 5,
        //% block="6"
        C6 = 6,
        //% block="7"
        C7 = 7,
        //% block="8"
        C8 = 8,
        //% block="9"
        C9 = 9,
        //% block="10"
        C10 = 10,
        //% block="11"
        C11 = 11,
        //% block="12"
        C12 = 12,
        //% block="13"
        C13 = 13,
        //% block="14"
        C14 = 14,
        //% block="15"
        C15 = 15,
    }

    const LCD_I2C_ADDR = 0x20
    let lcdBacklightBits = 0x08
    let lcdInicializado = false
    let lcdUltimaEscritura = 0
    const LCD_INTERVALO_MS = 150

    function lcdEscribir4Bits(value: number): void {
        let buf = pins.createBuffer(3)
        buf[0] = value | lcdBacklightBits
        buf[1] = value | lcdBacklightBits | 0x04
        buf[2] = value | lcdBacklightBits
        pins.i2cWriteBuffer(LCD_I2C_ADDR, buf)
    }

    function lcdEnviar(value: number, modo: number): void {
        const rs = modo ? 0x01 : 0x00
        const alto = (value & 0xF0) | lcdBacklightBits | rs
        const bajo = ((value << 4) & 0xF0) | lcdBacklightBits | rs
        lcdEscribir4Bits(alto)
        lcdEscribir4Bits(bajo)
    }

    function lcdComando(cmd: number): void {
        lcdEnviar(cmd, 0)
    }

    function lcdDato(value: number): void {
        lcdEnviar(value, 1)
    }

    function lcdSetCursor(col: number, fila: number): void {
        const offsets = [0x00, 0x40]
        lcdComando(0x80 | (col + offsets[fila]))
    }

    function lcdInicializar(): void {
        basic.pause(50)
        lcdEscribir4Bits(0x30)
        basic.pause(5)
        lcdEscribir4Bits(0x30)
        basic.pause(1)
        lcdEscribir4Bits(0x30)
        lcdEscribir4Bits(0x20)
        lcdComando(0x28)
        lcdComando(0x0C)
        lcdComando(0x06)
        lcdComando(0x01)
        basic.pause(5)
    }

    function lcdAsegurarInit(): void {
        if (!lcdInicializado) {
            lcdInicializar()
            lcdInicializado = true
        }
    }

    /**
     * STV2-12 — Escribe texto en el LCD por I2C (dirección 0x20, protocolo
     * HD44780 4-bit). LCD1602 real es de 16 columnas x 2 filas.
     */
    //% blockId=lcd_escribir
    //% block="LCD │ Escribir %texto en fila %fila en columna %columna en pin I2C"
    //% texto.shadow=text texto.defl="abc"
    //% group="PANTALLAS" color="#35BFE9" weight=100 blockGap=8
    export function lcdEscribir(texto: string | number, fila: SabanaLcdFila, columna: SabanaColumna16): void {
        lcdAsegurarInit()
        const ahora = control.millis()
        if (ahora - lcdUltimaEscritura < LCD_INTERVALO_MS) return
        lcdUltimaEscritura = ahora

        const cadena = "" + texto
        lcdSetCursor(columna, fila)
        for (let i = 0; i < cadena.length; i++) {
            lcdDato(cadena.charCodeAt(i))
        }
    }

    /**
     * STV2-13 — Borra todos los textos del LCD (I2C).
     */
    //% blockId=lcd_borrar
    //% block="LCD │ borrar textos en pin I2C"
    //% group="PANTALLAS" color="#35BFE9" weight=95 blockGap=8
    export function lcdBorrar(): void {
        lcdAsegurarInit()
        lcdComando(0x01)
        basic.pause(2)
    }
}
