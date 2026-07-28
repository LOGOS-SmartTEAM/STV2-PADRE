namespace bloques {
    export enum SabanaLcdFila {
        //% block="0"
        F0 = 0,
        //% block="1"
        F1 = 1,
        //% block="2"
        F2 = 2,
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

    /**
     * STV2-12 — Escribe texto en el LCD (I2C), fila 0-2, columna 0-15.
     */
    //% blockId=sabana_lcd_escribir
    //% block="LCD │ Escribir %texto en fila %fila en columna %columna en pin I2C"
    //% texto.shadow=text texto.defl="abc"
    //% group="PANTALLAS" color="#35BFE9" weight=100 blockGap=8
    export function lcdEscribir(texto: string | number, fila: SabanaLcdFila, columna: SabanaColumna16): void {
        // TODO: lógica real pendiente
    }

    /**
     * STV2-13 — Borra todos los textos del LCD (I2C).
     */
    //% blockId=sabana_lcd_borrar
    //% block="LCD │ borrar textos en pin I2C"
    //% group="PANTALLAS" color="#35BFE9" weight=95 blockGap=8
    export function lcdBorrar(): void {
        // TODO: lógica real pendiente
    }
}
