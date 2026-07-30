namespace bloques {

    /**
     * Enum booleano genérico. Se declara acá y se REUTILIZA en otros bloques
     * lógicos (por ejemplo sabana_boton_logico en M03). No redeclararlo.
     */
    export enum SabanaVerdaderoFalso {
        //% block="Verdadero"
        Verdadero = 0,
        //% block="Falso"
        Falso = 1,
    }

    // ── Umbral de detección, en MILÍMETROS ──────────────────────────
    // Origen: EXT4 usaba 3 cm y 25 cm. Como el driver del proveedor
    // devuelve mm, los valores se multiplicaron por 10.
    // Ajustar acá si en el aula hace falta otro rango.
    const DETECCION_MIN_MM = 30    // 3 cm
    const DETECCION_MAX_MM = 250   // 25 cm

    /**
     * Bloque booleano combinado del Ultrasonido (hexágono). El bloque
     * redondo "Ultrasonido │ en pin I2C" (blockId sabana_ultrasonido, con
     * su propio color celeste) queda encajado por defecto dentro del
     * hexágono, como shadow block.
     *
     * Se considera que HAY OBJETO cuando la distancia está estrictamente
     * dentro del rango 30-250 mm. Por debajo de 30 mm se descarta como
     * lectura espuria del sensor (zona ciega); por encima de 250 mm se
     * considera que no hay nada cerca.
     *
     * Origen de la lógica: EXT4/blocks/smartteam4/ultrasonic.ts
     *                      -> ext4UltrasonicDetecta()
     *
     * @param medida distancia en mm
     * @param valor Verdadero = hay objeto; Falso = no hay objeto
     */
    //% blockId=sabana_ultrasonido_logico
    //% block="%medida detecta objeto %valor"
    //% medida.shadow=sabana_ultrasonido
    //% group="SENSORES" color="#006970" weight=99 blockGap=8
    export function ultrasonidoLogico(medida: number, valor: SabanaVerdaderoFalso): boolean {
        const detectado = medida > DETECCION_MIN_MM && medida < DETECCION_MAX_MM
        switch (valor) {
            case SabanaVerdaderoFalso.Verdadero:
                return detectado
            case SabanaVerdaderoFalso.Falso:
                return !detectado
            default:
                return false
        }
    }
}
