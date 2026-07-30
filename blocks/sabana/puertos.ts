/**
 * Puertos GPIO STV2 — mapeo interno a pines de la micro:bit.
 *
 * ATENCIÓN: el PUERTO 3 de la placa corresponde al pin P8 de la micro:bit,
 * NO al pin P3. Verificado en ORIGINAL/main.ts (p3 = AnalogPin.P8) y en
 * EXT4/blocks/smartteam4/puertos.ts (Ext4Puerto.P4 -> DigitalPin.P8).
 *
 *   PUERTO 0  ->  micro:bit P0
 *   PUERTO 1  ->  micro:bit P1
 *   PUERTO 2  ->  micro:bit P2
 *   PUERTO 3  ->  micro:bit P8   <-- excepción
 */

enum SabanaPuerto {
    //% block="P0"
    P0 = 0,
    //% block="P1"
    P1 = 1,
    //% block="P2"
    P2 = 2,
    //% block="P3"
    P3 = 3,
}

/**
 * Convierte un puerto de la placa al DigitalPin correspondiente.
 * Usar para lectura/escritura digital (botón, LED, hélice).
 */
function puertoToDigitalPin(puerto: SabanaPuerto): DigitalPin {
    switch (puerto) {
        case SabanaPuerto.P0: return DigitalPin.P0
        case SabanaPuerto.P1: return DigitalPin.P1
        case SabanaPuerto.P2: return DigitalPin.P2
        case SabanaPuerto.P3: return DigitalPin.P8
        default: return DigitalPin.P0
    }
}

/**
 * Convierte un puerto de la placa al AnalogPin correspondiente.
 * Usar para lectura analógica (potenciómetro, luz, suelo) y para servo.
 */
function puertoToAnalogPin(puerto: SabanaPuerto): AnalogPin {
    switch (puerto) {
        case SabanaPuerto.P0: return AnalogPin.P0
        case SabanaPuerto.P1: return AnalogPin.P1
        case SabanaPuerto.P2: return AnalogPin.P2
        case SabanaPuerto.P3: return AnalogPin.P8
        default: return AnalogPin.P0
    }
}
