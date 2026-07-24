namespace bloques {
    /**
     * STV2-9 — Tira RGB de 6 LEDs en un puerto GPIO. Cada LED se elige con un
     * selector de color (paleta). Bloque solo de validación visual.
     */
    //% blockId=sabana_tira_rgb
    //% block="Tira RGB %led1 %led2 %led3 %led4 %led5 %led6 en el puerto %puerto"
    //% led1.shadow="colorNumberPicker" led2.shadow="colorNumberPicker"
    //% led3.shadow="colorNumberPicker" led4.shadow="colorNumberPicker"
    //% led5.shadow="colorNumberPicker" led6.shadow="colorNumberPicker"
    //% inlineInputMode=inline
    //% group="SALIDAS" color="#fcbb2b" weight=100 blockGap=8
    export function tiraRgb(
        led1: number, led2: number, led3: number,
        led4: number, led5: number, led6: number,
        puerto: SabanaPuerto
    ): void {
        // TODO: lógica real pendiente
    }

    /**
     * STV2-11 — Ajusta la tira RGB con valores independientes de R, G y B (0-255).
     */
    //% blockId=sabana_tira_rgb_rgb
    //% block="Tira RGB ajustada a R %r G %g B %b"
    //% r.min=0 r.max=255 r.defl=255
    //% g.min=0 g.max=255 g.defl=255
    //% b.min=0 b.max=255 b.defl=255
    //% group="SALIDAS" color="#fcbb2b" weight=90 blockGap=8
    export function tiraRgbAjustada(r: number, g: number, b: number): void {
        // TODO: lógica real pendiente
    }
}
