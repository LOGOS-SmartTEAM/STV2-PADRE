namespace sabana_pantallas {
    export enum SabanaOledFila {
        //% block="0"
        F0 = 0,
        //% block="1"
        F1 = 1,
        //% block="2"
        F2 = 2,
        //% block="3"
        F3 = 3,
    }

    /**
     * STV2-14 — Escribe texto en el OLED (I2C), fila 0-3, columna 0-15.
     * Reutiliza el enum SabanaColumna16 definido en lcd.ts.
     */
    //% blockId=sabana_oled_escribir
    //% block="OLED Escribir %texto en la fila %fila columna %columna en el puerto I2C"
    //% texto.shadow=text texto.defl="abc"
    //% color="#34c2eb" weight=90 blockGap=8
    export function oledEscribir(texto: string, fila: SabanaOledFila, columna: SabanaColumna16): void {
        // TODO: lógica real pendiente
    }

    /**
     * STV2-15 — Borra todos los textos del OLED (I2C).
     */
    //% blockId=sabana_oled_borrar
    //% block="OLED borrar textos en el puerto I2C"
    //% color="#34c2eb" weight=85 blockGap=8
    export function oledBorrar(): void {
        // TODO: lógica real pendiente
    }
}
