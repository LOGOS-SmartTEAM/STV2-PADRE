// Bloques CRONÓMETRO — grupo ESPECIAL (2026-11-17), después de Morse.
//
// "Iniciar cronómetro" guarda el momento actual (control.millis) y
// "Cronómetro" devuelve los segundos que pasaron desde entonces, con 1
// decimal. Las décimas se truncan, como un cronómetro de verdad: muestra 3,2
// hasta llegar a 3,3, nunca un tiempo que todavía no pasó. Antes del primer
// "Iniciar cronómetro" devuelve 0. Volver a iniciarlo lo pone en cero.
// No usa hilos en segundo plano: no consume nada mientras no se lee.
// Color violeta #9C27B0, igual que Morse.

namespace bloques {
    // Momento (ms desde el encendido) en que se inició; -1 = nunca se inició.
    let cronometroInicio = -1

    /**
     * Resets the stopwatch to zero and starts it.
     */
    //% blockId=cronometro_iniciar
    //% block="Start stopwatch"
    //% group="SPECIAL" color="#9C27B0" weight=95
    export function iniciarCronometro(): void {
        cronometroInicio = control.millis()
    }

    /**
     * Time since the stopwatch was started, in seconds.
     */
    //% blockId=cronometro_valor
    //% block="Stopwatch"
    //% group="SPECIAL" color="#9C27B0" weight=94
    export function cronometro(): number {
        if (cronometroInicio < 0) return 0
        return Math.idiv(control.millis() - cronometroInicio, 100) / 10
    }
}
