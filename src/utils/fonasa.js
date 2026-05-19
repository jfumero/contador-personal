export function obtenerPeriodoFonasaActual() {
    const hoy = new Date();

    const mes = hoy.getMonth() + 1;
    const anio = hoy.getFullYear();

    const mesTexto = String(mes).padStart(2, "0");

    return {
        mes,
        anio,
        periodo: `${mesTexto}/${anio}`,
    };
}

export function obtenerFechaPagoSugerida() {
    const hoy = new Date();

    const dia = String(hoy.getDate()).padStart(2, "0");
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const anio = hoy.getFullYear();

    return `${dia}/${mes}/${anio}`;
}
