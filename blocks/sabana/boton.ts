namespace bloques {
    /**
     * STV2-2 — Botón conectado a un puerto GPIO.
     *
     * Devuelve TRUE cuando el botón está PRESIONADO.
     *
     * El botón es de masa activa: presionado lleva el pin a 0. Por eso se
     * activa la resistencia de pull-up interna y se compara contra 0.
     * Sin el setPull el pin queda flotando y la lectura es ruido.
     *
     * Origen del código:
     *   - pull-up: EXT4/blocks/smartteam4/boton.ts -> ext4BotonEnPin()
     *   - comparación == 0: ORIGINAL/block/sensorGPIO.ts -> Button()
     *
     * @param puerto puerto GPIO de la placa, eg: SabanaPuerto.P0
     */
    //% blockId=sabana_boton
    //% block="Botón │ en pin %puerto"
    //% group="SENSORES" color="#FFB800" weight=95 blockGap=8
    export function boton(puerto: SabanaPuerto): boolean {
        const pin = puertoToDigitalPin(puerto)
        pins.setPull(pin, PinPullMode.PullUp)
        return pins.digitalReadPin(pin) == 0
    }
}
