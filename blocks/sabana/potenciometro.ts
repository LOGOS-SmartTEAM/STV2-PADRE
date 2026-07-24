namespace sabana_sensores {
    /**
     * STV2-6 — Potenciómetro en un puerto GPIO.
     * NOTA: la tabla original tenía el texto "Suelo en el puerto X" (copiado por
     * error de STV2-5). Se corrigió a "Potenciómetro..." para que coincida con
     * el componente.
     */
    //% blockId=sabana_potenciometro
    //% block="Potenciómetro en el puerto %puerto"
    //% color="#fcbb2b" weight=75 blockGap=8
    export function potenciometro(puerto: SabanaPuerto): number {
        return 0
    }
}
