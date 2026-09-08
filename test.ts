// Pruebas rápidas — esto NO se compila cuando la carpeta se usa como extensión.
bloques.boton(SabanaPuerto.P0)
bloques.led(bloques.SabanaEstadoOnOff.ON, SabanaPuerto.P1)
bloques.seguidorDeLineaAcciones(
    bloques.seguidorAccionDerecha(bloques.SabanaSeguidorAccion.GirarIzquierda, 50),
    bloques.seguidorAccionCentro(bloques.SabanaSeguidorAccion.Avanzar, 50),
    bloques.seguidorAccionIzquierda(bloques.SabanaSeguidorAccion.GirarDerecha, 50)
)
