/**
 * Mensaje en código Morse — copiado tal cual de EXT5/blocks/sabana/mensaje.ts
 * (grupo ESPECIAL).
 * Codifica pulsaciones cortas/largas del Botón A como código Morse (p = punto, l = línea)
 * y decodifica letras completas en un mensaje de texto.
 *
 * Uso esperado en bloques:
 * - Colocar "Guardar mensaje" y "Decodificar mensaje" dentro de un bucle "por siempre".
 * - Leer "Mensaje decodificado" cuando se quiera mostrar/usar el texto acumulado
 *   (se vacía automáticamente al leerlo).
 */

namespace bloques {

    const CODIGOS_MORSE: string[] = [
        "pl", "lppp", "lplp", "lpp", "p", "pplp", "llp", "pppp", "pp", "plll",
        "lpl", "plpp", "ll", "lp", "lll", "pllp", "llpl", "plp", "ppp", "l",
        "ppl", "pppl", "pll", "lppl", "lpll", "llpp"
    ]; // índice 0 = a, 1 = b, ... 25 = z

    const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const UMBRAL_PUNTO_MS = 350;
    const PAUSA_LETRA_MS = 2000;

    let _presionado = false;
    let _tiempo = 0;
    let _palabra = "";
    let _mensaje = "";

    /**
     * Registra la pulsación del Botón A y acumula el código Morse (punto/línea)
     * de la letra en curso. Colocar dentro de un bucle "por siempre".
     */
    //% blockId=ext5_mensaje_guardar block="Guardar mensaje" group="ESPECIAL" weight=100 color=#9C27B0
    export function ext5GuardarMensaje(): void {
        const presionadoAhora = input.buttonIsPressed(Button.A);

        if (presionadoAhora && !_presionado) {
            // flanco de bajada: empieza la pulsación
            _tiempo = input.runningTime();
            _presionado = true;
        } else if (!presionadoAhora && _presionado) {
            // flanco de subida: termina la pulsación, se clasifica punto/línea
            const duracion = input.runningTime() - _tiempo;
            _palabra += duracion < UMBRAL_PUNTO_MS ? "p" : "l";
            _presionado = false;
            _tiempo = input.runningTime();
        }
    }

    /**
     * Si pasó suficiente tiempo sin pulsar el botón, busca la letra correspondiente
     * al código acumulado y la agrega al mensaje decodificado.
     * Colocar dentro del mismo bucle "por siempre", después de "Guardar mensaje".
     */
    //% blockId=ext5_mensaje_decodificar block="Decodificar mensaje" group="ESPECIAL" weight=99 color=#9C27B0
    export function ext5DecodificarMensaje(): void {
        if (_palabra.length == 0 || _presionado) return;
        if (input.runningTime() - _tiempo < PAUSA_LETRA_MS) return;

        for (let i = 0; i < CODIGOS_MORSE.length; i++) {
            if (_palabra == CODIGOS_MORSE[i]) {
                _mensaje += ALFABETO.charAt(i);
                break;
            }
        }
        _palabra = "";
    }

    /**
     * Devuelve el mensaje decodificado acumulado hasta ahora y lo vacía.
     */
    //% blockId=ext5_mensaje_decodificado block="Mensaje decodificado" group="ESPECIAL" weight=98 color=#9C27B0
    export function ext5MensajeDecodificado(): string {
        const resultado = _mensaje;
        _mensaje = "";
        return resultado;
    }
}
