/**
 * Utilidades internas compartidas entre bloques STV2.
 * NO contiene bloques visibles.
 */
namespace bloques {

    /**
     * Recorta un valor al rango [min, max].
     */
    export function _clamp(valor: number, min: number, max: number): number {
        if (valor < min) return min
        if (valor > max) return max
        return valor
    }

    /**
     * Recorta un componente de color al rango 0-255.
     * Equivalente a limitRGB() de ORIGINAL/block/rgbLED.ts.
     */
    export function _limit255(valor: number): number {
        return _clamp(Math.round(valor), 0, 255)
    }
}
