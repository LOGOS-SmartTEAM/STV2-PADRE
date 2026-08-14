/**
 * Bloques MORSE — grupo ESPECIAL.
 *
 * Captura un mensaje Morse a partir de pulsaciones de botón y lo traduce
 * a texto:
 *   - Duración de la pulsación: < 500ms = punto ("."), >= 500ms = línea ("_").
 *     No se escribe nada mientras el botón sigue apretado — se decide una
 *     sola vez, recién al soltar, para no dejar guardado ningún símbolo
 *     prematuro.
 *   - Fin de letra: 1000ms de silencio total sin pulsar nada.
 *   - Fin de palabra / traducción: se marca a mano con "Traducir mensaje",
 *     que reprocesa TODO el mensaje Morse acumulado y arma el texto
 *     traducido letra por letra, sin espacios entre ellas.
 *
 * IMPORTANTE: a diferencia del resto de la extensión, el botón de Morse
 * está fijo por diseño en el pin P0 (MORSE_PIN_BOTON1) — no es
 * configurable por puerto como el resto de los componentes. El vigía en
 * segundo plano lee ese pin directamente cada MORSE_INTERVALO_VIGIA_MS,
 * así que la duración de la pulsación se mide con precisión real, sin
 * depender de con qué frecuencia el programa del usuario llama a
 * "Guardar mensaje MORSE" (esa llamada ahora solo sirve para arrancar el
 * vigía la primera vez; el programa que la usa puede quedar exactamente
 * igual, envuelta en un "si Botón en pin P0 = 1 entonces" o no).
 *
 * "Mensaje MORSE" y "Mensaje TRADUCIDO" siempre arrancan con un espacio
 * (workaround: en el OLED real se pierde la primera escritura I2C tras
 * encenderlo, así que ese primer carácter descartable absorbe el golpe) y
 * devuelven como máximo los últimos MORSE_VENTANA_CHARS caracteres, para
 * que siempre entren en una fila de 16 columnas del OLED sin cortarse.
 */

namespace bloques {

    // Índice i <-> letra 'A' + i. Código real (A = ".-", H = "....", etc.)
    // usando "p" = punto y "l" = línea.
    const MORSE_CODIGOS: string[] = [
        "pl", "lppp", "lplp", "lpp", "p", "pplp", "llp", "pppp", "pp", "plll",
        "lpl", "plpp", "ll", "lp", "lll", "pllp", "llpl", "plp", "ppp", "l",
        "ppl", "pppl", "pll", "lppl", "lpll", "llpp"
    ]
    const MORSE_LETRAS: string[] = [
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
    ]

    const MORSE_PIN_BOTON1: DigitalPin = DigitalPin.P0  // botón de Morse fijo en P0, no configurable
    const MORSE_UMBRAL_PUNTO_MS = 500      // duración < esto = punto, >= esto = línea
    const MORSE_TIMEOUT_LETRA_MS = 1000    // silencio total = fin de letra
    const MORSE_INTERVALO_VIGIA_MS = 20    // frecuencia de sondeo del vigía (lee el pin directamente)
    const MORSE_VENTANA_CHARS = 16         // máximo de caracteres a exponer (ancho de fila del OLED)

    let morseSimboloActual = ""        // "p"/"l" acumulados de la letra en curso
    let morseVector1 = " "             // Mensaje MORSE (puntos/líneas + espacios); arranca con un espacio descartable
    let morseVector2 = " "             // Mensaje TRADUCIDO (letras, sin espacios); arranca con un espacio descartable
    let morsePresionado = false
    let morseInicioPulsacion = 0
    let morseUltimaActividad = 0
    let morseVigiaActivo = false

    function morseDecodificar(codigo: string): string {
        for (let i = 0; i < MORSE_CODIGOS.length; i++) {
            if (MORSE_CODIGOS[i] == codigo) {
                return MORSE_LETRAS[i]
            }
        }
        return "?"
    }

    function morseVentanaPantalla(texto: string): string {
        if (texto.length > MORSE_VENTANA_CHARS) {
            return texto.substr(texto.length - MORSE_VENTANA_CHARS)
        }
        return texto
    }

    // Cierra la letra en curso (si hay alguna) agregando un separador a
    // morseVector1. No toca morseVector2 — la traducción se recalcula
    // entera en traducirMensaje().
    function morseCerrarLetraPendiente(): void {
        if (morseSimboloActual == "") return
        morseVector1 += " "
        morseSimboloActual = ""
    }

    // Convierte un trozo visual ("."/"_") a la notación interna ("p"/"l")
    // que espera morseDecodificar contra MORSE_CODIGOS.
    function morseVisualAInterno(codigoVisual: string): string {
        let resultado = ""
        for (let i = 0; i < codigoVisual.length; i++) {
            resultado += (codigoVisual.charAt(i) == "_") ? "l" : "p"
        }
        return resultado
    }

    // Reprocesa todo morseVector1 de punta a punta y reconstruye
    // morseVector2 (sin espacios entre letras).
    function morseRecalcularTraduccion(): void {
        const partes = morseVector1.split(" ")
        let resultado = ""
        for (let i = 0; i < partes.length; i++) {
            if (partes[i] != "") {
                resultado += morseDecodificar(morseVisualAInterno(partes[i]))
            }
        }
        morseVector2 = " " + resultado
    }

    function morseVigilante(): void {
        pins.setPull(MORSE_PIN_BOTON1, PinPullMode.PullUp)
        while (true) {
            basic.pause(MORSE_INTERVALO_VIGIA_MS)
            const ahora = input.runningTime()
            const presionadoAhora = pins.digitalReadPin(MORSE_PIN_BOTON1) == 0

            if (presionadoAhora && !morsePresionado) {
                // Flanco de bajada real en el pin: arranca la pulsación.
                morsePresionado = true
                morseInicioPulsacion = ahora
            } else if (!presionadoAhora && morsePresionado) {
                // Flanco de subida real: se soltó. Se decide punto o línea
                // una sola vez, con la duración real medida — nada se
                // escribe antes de este momento.
                const duracion = ahora - morseInicioPulsacion
                if (duracion < MORSE_UMBRAL_PUNTO_MS) {
                    morseSimboloActual += "p"
                    morseVector1 += "."
                } else {
                    morseSimboloActual += "l"
                    morseVector1 += "_"
                }
                morsePresionado = false
                morseUltimaActividad = ahora
            }

            if (!morsePresionado && morseSimboloActual != "" && (ahora - morseUltimaActividad) > MORSE_TIMEOUT_LETRA_MS) {
                morseCerrarLetraPendiente()
            }
        }
    }

    /**
     * Arranca (la primera vez que se llama) el vigía que lee el pin del
     * botón de Morse (P0) directamente y mide la duración real de cada
     * pulsación. Se puede seguir llamando en cada vuelta del loop, dentro
     * de un "si Botón en pin P0 = 1 entonces" o no — no hace falta
     * cambiar el programa existente, esta llamada ya no necesita saber
     * si el botón está presionado o no.
     */
    //% blockId=morse_guardar
    //% block="Guardar mensaje MORSE" group="ESPECIAL" weight=100 color=#9C27B0
    export function guardarMensajeMorse(): void {
        if (!morseVigiaActivo) {
            morseVigiaActivo = true
            control.inBackground(morseVigilante)
        }
    }

    /**
     * Cierra la letra pendiente (si quedó alguna a medio tipear) y
     * reconstruye por completo el mensaje traducido a partir de todo el
     * mensaje Morse acumulado hasta ahora.
     */
    //% blockId=morse_traducir
    //% block="Traducir mensaje" group="ESPECIAL" weight=98 color=#9C27B0
    export function traducirMensaje(): void {
        morseCerrarLetraPendiente()
        if (morseVector1.length > 0 && morseVector1.charAt(morseVector1.length - 1) != " ") {
            morseVector1 += " "
        }
        morseRecalcularTraduccion()
    }

    /**
     * Mensaje en código Morse (puntos/líneas) acumulado hasta ahora
     * (últimos MORSE_VENTANA_CHARS caracteres como máximo).
     */
    //% blockId=morse_mensaje
    //% block="Mensaje MORSE" group="ESPECIAL" weight=99 color=#9C27B0
    export function mensajeMorse(): string {
        return morseVentanaPantalla(morseVector1)
    }

    /**
     * Mensaje traducido (texto) acumulado hasta ahora (últimos
     * MORSE_VENTANA_CHARS caracteres como máximo).
     */
    //% blockId=morse_traducido
    //% block="Mensaje TRADUCIDO" group="ESPECIAL" weight=97 color=#9C27B0
    export function mensajeTraducido(): string {
        return morseVentanaPantalla(morseVector2)
    }

    /**
     * Borra el mensaje Morse y el mensaje traducido acumulados, incluyendo
     * cualquier letra que se estuviera tipeando en ese momento.
     */
    //% blockId=morse_borrar
    //% block="Borrar MENSAJES" group="ESPECIAL" weight=96 color=#9C27B0
    export function borrarMensajes(): void {
        morseSimboloActual = ""
        morseVector1 = " "
        morseVector2 = " "
        morsePresionado = false
    }
}
