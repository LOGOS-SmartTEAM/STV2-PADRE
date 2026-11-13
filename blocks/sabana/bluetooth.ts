// Bloques BLUETOOTH — grupo "Bluetooth" (antes de ESPECIAL).
//
// Copia de la extensión STEAMbit bluetooth
// (github.com/smartteamok/pxt-steambit-bluetooth, commit b5823d4):
// mismo protocolo, misma lógica y mismos textos (inglés + es/pt). Todos los
// bloques de esa extensión (conexión, proyecto y joystick) quedan juntos en
// el grupo Bluetooth. Cambios para que entre en PADRE:
//   - Todo dentro de namespace bloques. El núcleo (core.ts) no se exporta:
//     funciones y variables con prefijo bt / BT_ para no chocar con el resto
//     de PADRE (por ejemplo, bloques.joystick ya existe).
//   - Nombres de funciones, enums, parámetros y blockIds al estilo PADRE
//     (castellano). Textos de los bloques sin cambios.
//   - Los 4 bloques que allá estaban en "más" (advanced) quedan al final del
//     grupo, después de los del joystick.
//   - Color #796EB0 (violeta STEAMbit, el de la extensión original) en cada
//     bloque, porque la categoría PADRE es azul.
//
// Requiere la dependencia "bluetooth" en pxt.json (incompatible con radio)
// y "No Pairing Required" en la configuración de cada proyecto de MakeCode.
//
// Protocolo de texto por el servicio UART de Bluetooth, una línea por
// mensaje `TIPO|etiqueta|valor\n` (solo LF):
//   C  comando app → micro:bit (lo único que se procesa al recibir)
//   D  dato micro:bit → app
//   E  evento micro:bit → app
//   R  declaración `R|etiqueta|num/bool/text|r/w/rw|unidad`
// Joystick: `C|joy|U/D/L/R/S`, `C|jx|n`, `C|jy|n`, `C|jr|n` (−100..100),
// `C|btnA|1/0`, `C|btnB|1/0`.
// Saludo: al terminar de conectar la app manda `C|_sync|1` y la micro:bit
// responde con sus `R|`. Las etiquetas `_*` son reservadas.

namespace bloques {

    // =====================================================================
    // Núcleo (sin bloques) — core.ts de la extensión original
    // =====================================================================

    // Eventos CODAL (codal-microbit-v2, inc/bluetooth/ExternalEvents.h).
    const BT_ID_BLE = 1000
    const BT_EVT_ANY = 0
    const BT_EVT_CONNECTED = 1
    const BT_EVT_DISCONNECTED = 2

    const BT_MAX_LABEL_LENGTH = 16
    const BT_MAX_TX_QUEUE = 24
    const BT_TX_IDLE_POLL_MS = 20
    const BT_SYNC_LABEL = "_sync"

    // Tipos de dato de R| ordenados del más específico al más general.
    const BT_DATA_TYPES = ["bool", "num", "text"]

    let btInitialized = false
    let btConnected = false
    let btSynced = false

    // Último valor recibido por etiqueta (se conserva al desconectar).
    let btValueLabels: string[] = []
    let btValueTexts: string[] = []

    // Joystick: cada eje llega en su propio mensaje, se guarda el último.
    let btJoyDirection = "S"
    let btJoyX = 0
    let btJoyY = 0
    let btJoyRotation = 0
    let btJoyButtonA = false
    let btJoyButtonB = false

    // Declaraciones que se mandan como R| al recibir _sync.
    let btDeclLabels: string[] = []
    let btDeclTypes: string[] = []
    let btDeclAccess: string[] = []

    // Cola TX: una línea por entrada. Las de clave no vacía se reemplazan
    // en su lugar (el último dato de una etiqueta pisa al pendiente).
    let btTxLines: string[] = []
    let btTxKeys: string[] = []
    let btTxGapMs = 100

    let btConnectHandlers: (() => void)[] = []
    let btDisconnectHandlers: (() => void)[] = []

    // Handlers de "al recibir": uno a la vez por handler; si llega otro
    // valor mientras corre, se vuelve a ejecutar con el último.
    let btRxLabels: string[] = []
    let btRxHandlers: ((value: number) => void)[] = []
    let btRxBusy: boolean[] = []
    let btRxPending: boolean[] = []
    let btRxPendingValue: number[] = []

    // Inicia el servicio UART y registra los eventos BLE. Idempotente.
    function btInit(): void {
        if (btInitialized) return
        btInitialized = true
        // Siempre primero: sin esto los uart* y onUartDataReceived no andan.
        bluetooth.startUartService()
        bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            btHandleLine(bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine)))
        })
        // Escucha con valor ANY: registrar un evento con el mismo id y valor
        // borra al anterior (registerWithDal hace ignore + listen), pero
        // ignore(id, CONNECTED) no borra un listener ANY. Así un
        // bluetooth.onBluetoothConnected del alumno registrado después
        // convive con este.
        control.onEvent(BT_ID_BLE, BT_EVT_ANY, function () {
            const value = control.eventValue()
            if (value == BT_EVT_CONNECTED) btSetConnected(true)
            else if (value == BT_EVT_DISCONNECTED) btSetConnected(false)
        })
        control.inBackground(btTxLoop)
    }

    // ----- Parser -----

    // true si la etiqueta cumple [A-Za-z0-9_]{1,16}.
    function btIsValidLabel(label: string): boolean {
        if (!label || label.length > BT_MAX_LABEL_LENGTH) return false
        for (let i = 0; i < label.length; i++) {
            const c = label.charCodeAt(i)
            const ok = (c >= 48 && c <= 57) || (c >= 65 && c <= 90)
                || (c >= 97 && c <= 122) || c == 95
            if (!ok) return false
        }
        return true
    }

    // Parsea una línea `C|etiqueta|valor`. Descarta \r y \n. Devuelve
    // [etiqueta, valor] o null si la línea no es un comando válido.
    function btParseCommand(line: string): string[] {
        if (!line) return null
        const clean = line.split("\r").join("").split("\n").join("")
        const parts = clean.split("|")
        if (parts.length != 3 || parts[0] != "C" || !btIsValidLabel(parts[1])) return null
        return [parts[1], parts[2]]
    }

    // Procesa una línea recibida por UART. Las inválidas se ignoran.
    function btHandleLine(line: string): void {
        const cmd = btParseCommand(line)
        if (!cmd) return
        const label = cmd[0]
        const value = cmd[1]
        if (label.charAt(0) == "_") {
            if (label == BT_SYNC_LABEL) btHandleSync()
            return
        }
        if (btHandleJoystick(label, value)) return
        btStoreValue(label, value)
        btDispatchReceive(label, btToNumber(value))
    }

    // Convierte un valor del protocolo a número (0 si no es numérico).
    function btToNumber(text: string): number {
        if (!text) return 0
        const n = parseFloat(text)
        return isNaN(n) ? 0 : n
    }

    // ----- Valores de etiquetas -----

    function btStoreValue(label: string, value: string): void {
        const i = btValueLabels.indexOf(label)
        if (i < 0) {
            btValueLabels.push(label)
            btValueTexts.push(value)
        } else {
            btValueTexts[i] = value
        }
    }

    // Último valor recibido para la etiqueta ("" si nunca llegó).
    function btLastText(label: string): string {
        const i = btValueLabels.indexOf(label)
        return i < 0 ? "" : btValueTexts[i]
    }

    // ----- Joystick -----

    // true si la etiqueta es del joystick (no se guarda como valor común).
    function btIsJoystickLabel(label: string): boolean {
        return label == "joy" || label == "jx" || label == "jy" || label == "jr"
            || label == "btnA" || label == "btnB"
    }

    function btClampAxis(n: number): number {
        return Math.max(-100, Math.min(100, Math.round(n)))
    }

    function btHandleJoystick(label: string, value: string): boolean {
        if (label == "joy") btJoyDirection = value
        else if (label == "jx") btJoyX = btClampAxis(btToNumber(value))
        else if (label == "jy") btJoyY = btClampAxis(btToNumber(value))
        else if (label == "jr") btJoyRotation = btClampAxis(btToNumber(value))
        else if (label == "btnA") btJoyButtonA = value != "0" && value != ""
        else if (label == "btnB") btJoyButtonB = value != "0" && value != ""
        else return false
        return true
    }

    function btResetJoystick(): void {
        btJoyDirection = "S"
        btJoyX = 0
        btJoyY = 0
        btJoyRotation = 0
        btJoyButtonA = false
        btJoyButtonB = false
    }

    // Velocidad de rueda para un robot de dos ruedas (−100..100):
    // izquierda = y + x + giro, derecha = y − x − giro, acotadas.
    function btWheelMix(left: boolean): number {
        const turn = btJoyX + btJoyRotation
        return btClampAxis(left ? btJoyY + turn : btJoyY - turn)
    }

    // ----- Conexión -----

    // Actualiza el estado de conexión y despacha los handlers del alumno.
    // Al desconectar, joystick a detenida y ejes/botones a 0 (seguridad).
    function btSetConnected(value: boolean): void {
        // btHandleSync ya pudo marcar la conexión: no borrar sus R| pendientes.
        if (value != btConnected) {
            btConnected = value
            btSynced = false
            btTxLines = []
            btTxKeys = []
            if (!value) btResetJoystick()
        }
        // En paralelo: una pausa del alumno no demora el reset de seguridad
        // ni el próximo evento de conexión.
        const handlers = value ? btConnectHandlers : btDisconnectHandlers
        for (let i = 0; i < handlers.length; i++) control.runInParallel(handlers[i])
    }

    // ----- Al recibir -----

    function btAddReceiveHandler(label: string, handler: (value: number) => void): void {
        btRxLabels.push(label)
        btRxHandlers.push(handler)
        btRxBusy.push(false)
        btRxPending.push(false)
        btRxPendingValue.push(0)
    }

    function btDispatchReceive(label: string, value: number): void {
        for (let i = 0; i < btRxLabels.length; i++) {
            if (btRxLabels[i] == label) btRunReceiveHandler(i, value)
        }
    }

    function btRunReceiveHandler(i: number, value: number): void {
        if (btRxBusy[i]) {
            btRxPending[i] = true
            btRxPendingValue[i] = value
            return
        }
        btRxBusy[i] = true
        control.runInParallel(function () {
            btRxHandlers[i](value)
            while (btRxPending[i]) {
                btRxPending[i] = false
                btRxHandlers[i](btRxPendingValue[i])
            }
            btRxBusy[i] = false
        })
    }

    // ----- Declaraciones (R|) -----

    // Registra una etiqueta usada por un bloque. type: "num", "bool" o
    // "text"; access desde la app: "r" (la app lee) o "w" (la app escribe).
    // Si se usa de varias formas queda el tipo más general y acceso "rw".
    function btDeclare(label: string, type: string, access: string): void {
        if (!btIsValidLabel(label) || label.charAt(0) == "_" || btIsJoystickLabel(label)) return
        let i = btDeclLabels.indexOf(label)
        if (i < 0) {
            btDeclLabels.push(label)
            btDeclTypes.push(type)
            btDeclAccess.push(access)
            i = btDeclLabels.length - 1
        } else {
            const mergedType = BT_DATA_TYPES.indexOf(type) > BT_DATA_TYPES.indexOf(btDeclTypes[i]) ? type : btDeclTypes[i]
            const mergedAccess = btDeclAccess[i] == access ? access : "rw"
            if (mergedType == btDeclTypes[i] && mergedAccess == btDeclAccess[i]) return
            btDeclTypes[i] = mergedType
            btDeclAccess[i] = mergedAccess
        }
        // Etiqueta nueva o cambiada después del saludo: avisar ya.
        if (btSynced) btEnqueue("R|" + label, btRegisterLine(i))
    }

    function btRegisterLine(i: number): string {
        return "R|" + btDeclLabels[i] + "|" + btDeclTypes[i] + "|" + btDeclAccess[i] + "|\n"
    }

    function btHandleSync(): void {
        btConnected = true
        btSynced = true
        for (let i = 0; i < btDeclLabels.length; i++) {
            btEnqueue("R|" + btDeclLabels[i], btRegisterLine(i))
        }
    }

    // ----- TX -----

    // Quita del valor los caracteres que rompen el protocolo (| \n \r).
    function btCleanValue(value: string): string {
        return value.split("|").join("").split("\n").join("").split("\r").join("")
    }

    // Envía `D|etiqueta|valor` y declara la etiqueta como leída por la app.
    // type: "num", "bool" o "text". Etiquetas inválidas o reservadas se
    // ignoran.
    function btSendDataLine(label: string, value: string, type: string): void {
        if (!btIsValidLabel(label) || label.charAt(0) == "_") return
        btDeclare(label, type, "r")
        btEnqueue("D|" + label, "D|" + label + "|" + btCleanValue(value) + "\n")
    }

    // Envía `E|nombre`. Los eventos no se reemplazan en la cola.
    function btSendEventLine(name: string): void {
        if (!btIsValidLabel(name) || name.charAt(0) == "_") return
        btEnqueue("", "E|" + name + "\n")
    }

    // Encola una línea para enviar a la app. Si key no es vacía y ya hay una
    // línea pendiente con esa clave, la reemplaza. Sin conexión se descarta.
    function btEnqueue(key: string, line: string): void {
        if (!btConnected) return
        if (key) {
            const i = btTxKeys.indexOf(key)
            if (i >= 0) {
                btTxLines[i] = line
                return
            }
        }
        if (btTxLines.length >= BT_MAX_TX_QUEUE) return
        btTxLines.push(line)
        btTxKeys.push(key)
    }

    function btTxLoop(): void {
        while (true) {
            if (btTxLines.length > 0) {
                const line = btTxLines.shift()
                btTxKeys.shift()
                bluetooth.uartWriteString(line)
                basic.pause(btTxGapMs)
            } else {
                basic.pause(BT_TX_IDLE_POLL_MS)
            }
        }
    }

    // Arranca al cargar el programa, antes del código del alumno: así
    // startUartService va primero y los eventos BLE de esta parte quedan
    // registrados antes que los del alumno.
    btInit()

    // =====================================================================
    // Bloques — blocks.ts de la extensión original
    // =====================================================================

    export enum SabanaBluetoothCruceta {
        //% block="forward"
        Adelante = 0,
        //% block="backward"
        Atras = 1,
        //% block="left"
        Izquierda = 2,
        //% block="right"
        Derecha = 3,
        //% block="stopped"
        Detenida = 4,
    }

    export enum SabanaBluetoothEje {
        //% block="x"
        X = 0,
        //% block="y"
        Y = 1,
        //% block="rotation"
        Giro = 2,
    }

    export enum SabanaBluetoothRueda {
        //% block="left"
        Izquierda = 0,
        //% block="right"
        Derecha = 1,
    }

    export enum SabanaBluetoothBoton {
        //% block="A"
        A = 0,
        //% block="B"
        B = 1,
    }

    // Bloque sombra de la etiqueta (oculto): desplegable A–Z como la grilla
    // de la app, y también se puede escribir una etiqueta más larga ("temp").
    /**
     * A label for the STEAMbit app: pick a letter (A–Z, like the app grid)
     * or type a longer one like "temp".
     */
    //% blockId=bluetooth_etiqueta
    //% block="$etiqueta"
    //% blockHidden=true
    //% shim=TD_ID
    //% color="#796EB0" colorSecondary="#FFFFFF"
    //% etiqueta.fieldEditor="textdropdown"
    //% etiqueta.fieldOptions.values="A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z"
    //% etiqueta.fieldOptions.decompileLiterals=true
    //% etiqueta.defl="A"
    export function __bluetoothEtiqueta(etiqueta: string): string {
        return etiqueta
    }

    // ----- Conexión -----

    /**
     * Run code when the STEAMbit app connects.
     */
    //% blockId=bluetooth_al_conectarse
    //% block="on app connected"
    //% group="Bluetooth" color="#796EB0" weight=100 blockGap=8
    export function bluetoothAlConectarse(handler: () => void): void {
        btInit()
        btConnectHandlers.push(handler)
    }

    /**
     * Run code when the STEAMbit app disconnects.
     */
    //% blockId=bluetooth_al_desconectarse
    //% block="on app disconnected"
    //% group="Bluetooth" color="#796EB0" weight=99 blockGap=8
    export function bluetoothAlDesconectarse(handler: () => void): void {
        btInit()
        btDisconnectHandlers.push(handler)
    }

    /**
     * True while the STEAMbit app is connected.
     */
    //% blockId=bluetooth_app_conectada
    //% block="app connected"
    //% group="Bluetooth" color="#796EB0" weight=98
    export function bluetoothAppConectada(): boolean {
        btInit()
        return btConnected
    }

    /**
     * Scroll the Bluetooth name of this board on the screen (for example
     * ZAVIG for "BBC micro:bit [zavig]"), the same name the app shows.
     */
    //% blockId=bluetooth_mostrar_nombre
    //% block="show bluetooth name of the board"
    //% group="Bluetooth" color="#796EB0" weight=97
    export function bluetoothMostrarNombre(): void {
        btInit()
        basic.showString(control.deviceName().toUpperCase())
    }

    // ----- Proyecto (paneles de la app) -----

    /**
     * Run code every time the app sends a value with this label.
     */
    //% blockId=bluetooth_al_recibir
    //% block="on receive label $etiqueta with $value"
    //% etiqueta.shadow=bluetooth_etiqueta
    //% etiqueta.defl="A"
    //% draggableParameters="reporter"
    //% group="Bluetooth" color="#796EB0" weight=95
    export function bluetoothAlRecibir(etiqueta: string, handler: (value: number) => void): void {
        btInit()
        btDeclare(etiqueta, "num", "w")
        btAddReceiveHandler(etiqueta, handler)
    }

    /**
     * The last number the app sent with this label (0 if nothing arrived yet).
     */
    //% blockId=bluetooth_numero
    //% block="number with label $etiqueta"
    //% etiqueta.shadow=bluetooth_etiqueta
    //% etiqueta.defl="A"
    //% group="Bluetooth" color="#796EB0" weight=90 blockGap=8
    export function bluetoothNumero(etiqueta: string): number {
        btInit()
        btDeclare(etiqueta, "num", "w")
        return btToNumber(btLastText(etiqueta))
    }

    /**
     * The last text the app sent with this label ("" if nothing arrived yet).
     */
    //% blockId=bluetooth_texto
    //% block="text with label $etiqueta"
    //% etiqueta.shadow=bluetooth_etiqueta
    //% etiqueta.defl="M"
    //% group="Bluetooth" color="#796EB0" weight=89 blockGap=8
    export function bluetoothTexto(etiqueta: string): string {
        btInit()
        btDeclare(etiqueta, "text", "w")
        return btLastText(etiqueta)
    }

    /**
     * True if the last value the app sent with this label is not "0" and not
     * empty. Works with the app switch (values 1/0).
     */
    //% blockId=bluetooth_activado
    //% block="$etiqueta is on"
    //% etiqueta.shadow=bluetooth_etiqueta
    //% etiqueta.defl="A"
    //% group="Bluetooth" color="#796EB0" weight=88
    export function bluetoothActivado(etiqueta: string): boolean {
        btInit()
        btDeclare(etiqueta, "bool", "w")
        const value = btLastText(etiqueta)
        return value != "0" && value != ""
    }

    /**
     * Send a number to the app. Shows up in gauges, digits and charts that
     * use this label.
     */
    //% blockId=bluetooth_enviar_numero
    //% block="send $valor to app with label $etiqueta"
    //% etiqueta.shadow=bluetooth_etiqueta
    //% etiqueta.defl="T"
    //% group="Bluetooth" color="#796EB0" weight=80
    export function bluetoothEnviarNumero(etiqueta: string, valor: number): void {
        btInit()
        btSendDataLine(etiqueta, "" + valor, "num")
    }

    // ----- Joystick -----

    /**
     * True if the d-pad of the app (differential drive screen) points this
     * way. The d-pad sends only a direction, no speed.
     */
    //% blockId=bluetooth_cruceta
    //% block="app d-pad $direccion"
    //% group="Bluetooth" color="#796EB0" weight=50 blockGap=8
    export function bluetoothCruceta(direccion: SabanaBluetoothCruceta): boolean {
        btInit()
        const code = btJoyDirection
        switch (direccion) {
            case SabanaBluetoothCruceta.Adelante: return code == "U"
            case SabanaBluetoothCruceta.Atras: return code == "D"
            case SabanaBluetoothCruceta.Izquierda: return code == "L"
            case SabanaBluetoothCruceta.Derecha: return code == "R"
            default: return code != "U" && code != "D" && code != "L" && code != "R"
        }
    }

    /**
     * Position of the 360° joystick of the app (omni drive screen), from
     * -100 to 100. y is forward/backward, x is left/right, rotation is the
     * spin control.
     */
    //% blockId=bluetooth_joystick
    //% block="app joystick $eje"
    //% group="Bluetooth" color="#796EB0" weight=49 blockGap=8
    export function bluetoothJoystick(eje: SabanaBluetoothEje): number {
        btInit()
        if (eje == SabanaBluetoothEje.X) return btJoyX
        if (eje == SabanaBluetoothEje.Y) return btJoyY
        return btJoyRotation
    }

    /**
     * Speed for one wheel of a two-wheel robot driven with the 360°
     * joystick, from -100 to 100. Plug it into your motor block.
     */
    //% blockId=bluetooth_velocidad_rueda
    //% block="wheel speed $rueda"
    //% group="Bluetooth" color="#796EB0" weight=48 blockGap=8
    export function bluetoothVelocidadRueda(rueda: SabanaBluetoothRueda): number {
        btInit()
        return btWheelMix(rueda == SabanaBluetoothRueda.Izquierda)
    }

    /**
     * True while button A or B of the app joystick screen is pressed.
     */
    //% blockId=bluetooth_boton_presionado
    //% block="app button $boton pressed"
    //% group="Bluetooth" color="#796EB0" weight=47
    export function bluetoothBotonPresionado(boton: SabanaBluetoothBoton): boolean {
        btInit()
        return boton == SabanaBluetoothBoton.A ? btJoyButtonA : btJoyButtonB
    }

    // ----- Los que en la extensión original estaban en "más" -----

    /**
     * Send a text to the app (for example to a terminal).
     */
    //% blockId=bluetooth_enviar_texto
    //% block="send text $texto to app with label $etiqueta"
    //% etiqueta.shadow=bluetooth_etiqueta
    //% etiqueta.defl="M"
    //% texto.defl="hello"
    //% group="Bluetooth" color="#796EB0" weight=40 blockGap=8
    export function bluetoothEnviarTexto(etiqueta: string, texto: string): void {
        btInit()
        btSendDataLine(etiqueta, texto, "text")
    }

    /**
     * Send true/false to the app (1/0, for a status indicator).
     */
    //% blockId=bluetooth_enviar_si_no
    //% block="send yes/no $valor to app with label $etiqueta"
    //% etiqueta.shadow=bluetooth_etiqueta
    //% etiqueta.defl="L"
    //% valor.shadow=toggleYesNo
    //% group="Bluetooth" color="#796EB0" weight=39 blockGap=8
    export function bluetoothEnviarSiNo(etiqueta: string, valor: boolean): void {
        btInit()
        btSendDataLine(etiqueta, valor ? "1" : "0", "bool")
    }

    /**
     * Send an event to the app (it shows up in the app monitor).
     * Letters, numbers and _ only.
     */
    //% blockId=bluetooth_enviar_evento
    //% block="send event $nombre to app"
    //% nombre.defl="buttonA"
    //% group="Bluetooth" color="#796EB0" weight=38
    export function bluetoothEnviarEvento(nombre: string): void {
        btInit()
        btSendEventLine(nombre)
    }

    /**
     * Minimum pause between messages sent to the app. 100 ms is tested to
     * lose no bytes; lower values send faster but may lose data.
     */
    //% blockId=bluetooth_pausa_envios
    //% block="set pause between sends to $ms ms"
    //% ms.defl=100
    //% group="Bluetooth" color="#796EB0" weight=30
    export function bluetoothPausaEnvios(ms: number): void {
        btInit()
        btTxGapMs = Math.max(0, ms)
    }
}
