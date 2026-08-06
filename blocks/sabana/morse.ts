/**
 * Bloques MORSE — grupo ESPECIAL.
 *
 * Rediseño del grupo (antes en mensaje.ts): 5 bloques en vez de 3.
 * Por ahora son bloques puramente VISUALES (sin lógica interna real),
 * a la espera de definir la implementación real del codificador/decodificador Morse.
 */

namespace bloques {

    /**
     * Guarda la pulsación del Botón A como código Morse (punto/línea).
     */
    //% blockId=morse_guardar
    //% block="Guardar mensaje MORSE" group="ESPECIAL" weight=100 color=#9C27B0
    export function guardarMensajeMorse(): void {
    }

    /**
     * Traduce el código Morse acumulado a la letra correspondiente.
     */
    //% blockId=morse_traducir
    //% block="Traducir mensaje" group="ESPECIAL" weight=99 color=#9C27B0
    export function traducirMensaje(): void {
    }

    /**
     * Mensaje en código Morse (puntos/líneas) acumulado hasta ahora.
     */
    //% blockId=morse_mensaje
    //% block="Mensaje MORSE" group="ESPECIAL" weight=98 color=#9C27B0
    export function mensajeMorse(): string {
        return ""
    }

    /**
     * Mensaje traducido (texto) acumulado hasta ahora.
     */
    //% blockId=morse_traducido
    //% block="Mensaje TRADUCIDO" group="ESPECIAL" weight=97 color=#9C27B0
    export function mensajeTraducido(): string {
        return ""
    }

    /**
     * Borra el mensaje Morse y el mensaje traducido acumulados.
     */
    //% blockId=morse_borrar
    //% block="Borrar MENSAJES" group="ESPECIAL" weight=96 color=#9C27B0
    export function borrarMensajes(): void {
    }
}
