export function formatearFecha(fechaISO) {
    if (!fechaISO) return "";

    const [anio, mes, dia] = fechaISO.split("-");
    return `${dia}/${mes}/${anio}`;
}

export function obtenerEstadoVencimiento(fechaISO) {
    const hoy = new Date();
    const vencimiento = new Date(fechaISO + "T00:00:00");

    hoy.setHours(0, 0, 0, 0);

    const diferenciaMs = vencimiento.getTime() - hoy.getTime();
    const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

    if (dias < 0) {
        return {
            texto: `Vencido hace ${Math.abs(dias)} día${Math.abs(dias) === 1 ? "" : "s"}`,
            clase: "estado-rojo",
            dias,
        };
    }

    if (dias === 0) {
        return {
            texto: "Vence hoy",
            clase: "estado-rojo",
            dias,
        };
    }

    if (dias <= 15) {
        return {
            texto: `Vence en ${dias} día${dias === 1 ? "" : "s"}`,
            clase: "estado-amarillo",
            dias,
        };
    }

    return {
        texto: `Vigente / faltan ${dias} días`,
        clase: "estado-verde",
        dias,
    };
}

export function obtenerProximoVencimiento(lista) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const futuros = lista
    .filter((item) => new Date(item.vencimiento + "T00:00:00") >= hoy)
    .sort(
        (a, b) =>
        new Date(a.vencimiento + "T00:00:00") -
        new Date(b.vencimiento + "T00:00:00")
    );

    return futuros[0] || lista[lista.length - 1];
}
