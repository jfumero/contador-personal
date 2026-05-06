export function formatearFecha(fechaISO) {
    if (!fechaISO) return "-";

    const [anio, mes, dia] = fechaISO.split("-");
    return `${dia}/${mes}/${anio}`;
}

export function obtenerDiasHasta(fechaISO) {
    const hoy = new Date();
    const fecha = new Date(`${fechaISO}T00:00:00`);

    hoy.setHours(0, 0, 0, 0);
    fecha.setHours(0, 0, 0, 0);

    const diferencia = fecha.getTime() - hoy.getTime();

    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

export function obtenerEstadoPorFecha(fechaISO) {
    const dias = obtenerDiasHasta(fechaISO);

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
