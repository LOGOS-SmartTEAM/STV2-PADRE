namespace bloques {
    export enum SabanaColorMotor {
        //% block="🔴"
        Rojo = 0,
        //% block="🟢"
        Verde = 1,
        //% block="🟡"
        Amarillo = 2,
        //% block="🔵"
        Azul = 3,
    }

    export enum SabanaMovimientoMotorUnico {
        //% block="Rotar a la derecha"
        Derecha = 0,
        //% block="rotar a la izquierda"
        Izquierda = 1,
        //% block="Frenar"
        Frenar = 2,
    }

    // Direcciones I2C por color, verificadas en version-alex/block/servoMotor.ts
    // (enum MotorAddr: Red=0x51, Green=0x52, Blue=0x53, Yellow=0x54).
    function colorMotorToAddr(color: SabanaColorMotor): number {
        switch (color) {
            case SabanaColorMotor.Rojo: return 0x51
            case SabanaColorMotor.Verde: return 0x52
            case SabanaColorMotor.Azul: return 0x53
            case SabanaColorMotor.Amarillo: return 0x54
        }
        return 0x51
    }

    // Protocolo real portado de EXT4/archivadas/motores-original.ts -> runMotor()
    // (idéntico al run() de version-alex/block/servoMotor.ts).
    function motorMulticolorEnviar(addr: number, speed: number): void {
        speed = speed / 2
        let speedBuff = 0
        if (speed < 0) {
            speed = -speed
            speedBuff = ((~speed) + 1) | 0x80
        } else {
            speedBuff = speed
        }
        let buf = pins.createBuffer(4)
        buf.setNumber(NumberFormat.UInt8BE, 0, 0x11)
        buf.setNumber(NumberFormat.UInt8BE, 1, speedBuff)
        buf.setNumber(NumberFormat.UInt8BE, 2, 0)
        buf.setNumber(NumberFormat.UInt8BE, 3, 0)
        pins.i2cWriteBuffer(addr, buf)
    }

    /**
     * STV2-16 — Controla un motor individual (identificado por color/emoji)
     * conectado por I2C. El botón "+" agrega el parámetro opcional de velocidad.
     * Derecha = velocidad positiva, Izquierda = velocidad negativa, Frenar = 0.
     */
    //% blockId=motor_multicolor
    //% block="Motor │ %color %movimiento en pin I2C || Velocidad %velocidad"
    //% velocidad.min=0 velocidad.max=100 velocidad.defl=50
    //% expandableArgumentMode="toggle"
    //% group="MOTORES" color="#35BFE9" weight=100 blockGap=8
    export function motorMulticolor(
        color: SabanaColorMotor,
        movimiento: SabanaMovimientoMotorUnico,
        velocidad = 50
    ): void {
        const addr = colorMotorToAddr(color)
        let speed = 0
        if (movimiento == SabanaMovimientoMotorUnico.Derecha) speed = velocidad
        else if (movimiento == SabanaMovimientoMotorUnico.Izquierda) speed = -velocidad
        motorMulticolorEnviar(addr, speed)
    }
}
