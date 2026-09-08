namespace bloques {
    const SEGUIDOR_LINEA_I2C_ADDR = 0x28
    const SENSOR_GRISES_I2C_ADDR = 0x29

    export enum SabanaSensor3Vias {
        //% block="1"
        Sensor1 = 0,
        //% block="2"
        Sensor2 = 1,
        //% block="3"
        Sensor3 = 2,
    }

    export enum SabanaSeguidorLineaLado {
        //% block="Derecha"
        Derecha = 2,
        //% block="Centro"
        Centro = 1,
        //% block="Izquierda"
        Izquierda = 0,
    }

    /**
     * Acción de motores para cada renglón del bloque
     * seguidor_de_linea_acciones. Solo 3 opciones (sin Retroceder ni Frenar).
     * Se mapea a SabanaMovimiento en seguidorAccionToMovimiento().
     */
    export enum SabanaSeguidorAccion {
        //% block="Girar a la derecha"
        GirarDerecha = 0,
        //% block="Girar a la izquierda"
        GirarIzquierda = 1,
        //% block="Avanzar"
        Avanzar = 2,
    }

    /**
     * NUEVO — Seguidor de línea por I2C (dirección 0x28), traducción directa
     * de version-alex/block/lineFollower.ts. COLOR GRIS: placeholder,
     * diseño visual (texto/id/color final) pendiente de definición.
     */
    //% blockId=seguidor_linea
    //% block="Seguidor de línea │ Leer sensor %sensor en pin I2C"
    //% group="SENSORES" color="#9E9E9E" weight=87 blockGap=8
    export function seguidorLinea(sensor: SabanaSensor3Vias): number {
        let buf = pins.i2cReadBuffer(SEGUIDOR_LINEA_I2C_ADDR, 3)
        return buf[sensor]
    }

    //% blockId=seguidor_linea_detecta
    //% block="Seguidor de línea │ Sensor %sensor detecta negro en pin I2C"
    //% group="SENSORES" color="#9E9E9E" weight=86 blockGap=8
    export function seguidorLineaDetecta(sensor: SabanaSensor3Vias): boolean {
        let buf = pins.i2cReadBuffer(SEGUIDOR_LINEA_I2C_ADDR, 3)
        return buf[sensor] == 1
    }

    /**
     * Diseño visual final (confirmado 2026-08-26): lectura booleana por lado
     * (Derecha/Centro/Izquierda), color celeste I2C. Lectura de 5 bytes según
     * protocolo real (Protocolo-I2C/line_foollower_en.md): Byte0=Izquierda,
     * Byte1=Centro, Byte2=Derecha, Byte3-4=Reservado. El dropdown muestra las
     * opciones en orden Derecha/Centro/Izquierda.
     */
    //% blockId=seguidor_de_linea
    //% block="Seguidor de líneas │ %lado en pin I2C"
    //% group="SENSORES" color="#35BFE9" weight=85.5 blockGap=8
    export function seguidorDeLinea(lado: SabanaSeguidorLineaLado): boolean {
        let buf = pins.i2cReadBuffer(SEGUIDOR_LINEA_I2C_ADDR, 5)
        return buf[lado] == 1
    }

    /**
     * Mapea la opción del desplegable del seguidor de línea al enum real
     * de movimiento del robot (movimiento.ts).
     */
    function seguidorAccionToMovimiento(accion: SabanaSeguidorAccion): SabanaMovimiento {
        switch (accion) {
            case SabanaSeguidorAccion.GirarDerecha: return SabanaMovimiento.GirarDerecha
            case SabanaSeguidorAccion.GirarIzquierda: return SabanaMovimiento.GirarIzquierda
            case SabanaSeguidorAccion.Avanzar: return SabanaMovimiento.Avanzar
        }
        return SabanaMovimiento.Frenar
    }

    /**
     * Empaqueta acción (bits altos) + velocidad 0-100 (bits bajos) en un
     * solo número. Blockly no permite que dos parámetros sueltos compartan
     * una fila (cada %param fuerza su propia fila — confirmado en
     * pxt/pxtblocks/loader.ts, función splitInputs); agrupar accion+
     * velocidad en un shadow con inlineInputMode=inline es la forma
     * estándar de MakeCode de tener "desplegable + campo" en un renglón
     * (mismo patrón que tira_rgb.ts usa para empaquetar RGB en un color).
     */
    function seguidorAccionCodificar(accion: SabanaSeguidorAccion, velocidad: number): number {
        let v = Math.round(velocidad)
        if (v < 0) v = 0
        if (v > 100) v = 100
        return (accion << 8) | v
    }

    //% blockId=seguidor_accion_derecha
    //% block="$accion Velocidad $velocidad"
    //% accion.defl=SabanaSeguidorAccion.GirarIzquierda
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% inlineInputMode=inline blockHidden=1 color="#7FD4F0"
    export function seguidorAccionDerecha(accion: SabanaSeguidorAccion, velocidad: number): number {
        return seguidorAccionCodificar(accion, velocidad)
    }

    //% blockId=seguidor_accion_centro
    //% block="$accion Velocidad $velocidad"
    //% accion.defl=SabanaSeguidorAccion.Avanzar
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% inlineInputMode=inline blockHidden=1 color="#7FD4F0"
    export function seguidorAccionCentro(accion: SabanaSeguidorAccion, velocidad: number): number {
        return seguidorAccionCodificar(accion, velocidad)
    }

    //% blockId=seguidor_accion_izquierda
    //% block="$accion Velocidad $velocidad"
    //% accion.defl=SabanaSeguidorAccion.GirarDerecha
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% inlineInputMode=inline blockHidden=1 color="#7FD4F0"
    export function seguidorAccionIzquierda(accion: SabanaSeguidorAccion, velocidad: number): number {
        return seguidorAccionCodificar(accion, velocidad)
    }

    /** Decodifica el número empaquetado del shadow y ejecuta el movimiento. */
    function seguidorEjecutarCodificado(codigo: number): void {
        const accion = (codigo >> 8) as SabanaSeguidorAccion
        const velocidad = codigo & 0xFF
        movimientoSimple(seguidorAccionToMovimiento(accion), velocidad)
    }

    /**
     * Bloque de acción del seguidor de línea (I2C 0x28). Reemplaza al
     * antiguo seguidor_de_linea_ramas (ramas con huecos).
     *
     * Un renglón por sensor (Derecha / Centro / Izquierda). Cada renglón
     * recibe un shadow block "desplegable + Velocidad" (arriba) como único
     * parámetro; el bloque principal usa inlineInputMode=external para que
     * cada renglón (cada shadow) caiga en su propia fila.
     *
     * Lectura única por ejecución (para usar dentro de "por siempre"). Un
     * renglón se activa cuando SU sensor detecta BLANCO (buf == 0), es
     * decir, cuando ese lado se salió de la línea negra. Los 3 renglones
     * son IFs independientes, evaluados en orden Derecha → Centro →
     * Izquierda; la última orden enviada a los motores es la que queda.
     * Si ningún sensor ve blanco, no se envía nada a los motores.
     *
     * La lógica de motores NO se duplica: se reutiliza movimientoSimple()
     * de movimiento.ts (motor rojo 0x51 = derecho, verde 0x52 = izquierdo).
     */
    //% blockId=seguidor_de_linea_acciones
    //% block="Seguidor de líneas │ en pin I2C|Derecha $derecha|Centro $centro|Izquierda $izquierda"
    //% derecha.shadow=seguidor_accion_derecha
    //% centro.shadow=seguidor_accion_centro
    //% izquierda.shadow=seguidor_accion_izquierda
    //% inlineInputMode=external
    //% group="SENSORES" color="#35BFE9" weight=85.45 blockGap=8
    export function seguidorDeLineaAcciones(derecha: number, centro: number, izquierda: number): void {
        let buf = pins.i2cReadBuffer(SEGUIDOR_LINEA_I2C_ADDR, 5)

        // 0 = blanco = se salió de la línea negra → ejecutar acción del renglón
        if (buf[SabanaSeguidorLineaLado.Derecha] == 0) seguidorEjecutarCodificado(derecha)
        if (buf[SabanaSeguidorLineaLado.Centro] == 0) seguidorEjecutarCodificado(centro)
        if (buf[SabanaSeguidorLineaLado.Izquierda] == 0) seguidorEjecutarCodificado(izquierda)
    }

    /**
     * NUEVO — Sensor de grises 3 vías por I2C (dirección 0x29), traducción
     * directa de version-alex/block/therrWayGray.ts. COLOR GRIS: placeholder,
     * diseño visual pendiente de definición.
     */
    //% blockId=sensor_grises
    //% block="Sensor de grises │ Leer sensor %sensor en pin I2C"
    //% group="SENSORES" color="#9E9E9E" weight=85 blockGap=8
    export function sensorGrises(sensor: SabanaSensor3Vias): number {
        let buf = pins.i2cReadBuffer(SENSOR_GRISES_I2C_ADDR, 3)
        return buf[sensor]
    }

    //% blockId=sensor_grises_comparar
    //% block="Sensor de grises │ Sensor %sensor valor %operador %valor en pin I2C"
    //% valor.min=0 valor.max=255
    //% group="SENSORES" color="#9E9E9E" weight=84 blockGap=8
    export function sensorGrisesComparar(
        sensor: SabanaSensor3Vias,
        operador: SabanaOperadorComparacion,
        valor: number
    ): boolean {
        let buf = pins.i2cReadBuffer(SENSOR_GRISES_I2C_ADDR, 3)
        const dato = buf[sensor]
        switch (operador) {
            case SabanaOperadorComparacion.Igual: return dato == valor
            case SabanaOperadorComparacion.Distinto: return dato != valor
            case SabanaOperadorComparacion.Menor: return dato < valor
            case SabanaOperadorComparacion.MenorIgual: return dato <= valor
            case SabanaOperadorComparacion.Mayor: return dato > valor
            case SabanaOperadorComparacion.MayorIgual: return dato >= valor
        }
        return false
    }
}
