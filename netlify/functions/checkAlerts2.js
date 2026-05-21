const vencimientosIVA2026 = [
    { id: "iva-2026-01-02", periodo: "Enero - Febrero 2026", vencimiento: "2026-03-25" },
{ id: "iva-2026-03-04", periodo: "Marzo - Abril 2026", vencimiento: "2026-05-25" },
{ id: "iva-2026-05-06", periodo: "Mayo - Junio 2026", vencimiento: "2026-07-27" },
{ id: "iva-2026-07-08", periodo: "Julio - Agosto 2026", vencimiento: "2026-09-25" },
{ id: "iva-2026-09-10", periodo: "Setiembre - Octubre 2026", vencimiento: "2026-11-25" },
{ id: "iva-2026-11-12", periodo: "Noviembre - Diciembre 2026", vencimiento: "2027-01-26" },
];

const cronogramaANEP2026 = [
    { id: "anep-enero", mes: "Enero", inicio: "2026-01-16", fin: "2026-01-21" },
{ id: "anep-febrero", mes: "Febrero", inicio: "2026-02-13", fin: "2026-02-20" },
{ id: "anep-marzo", mes: "Marzo", inicio: "2026-03-16", fin: "2026-03-19" },
{ id: "anep-abril", mes: "Abril", inicio: "2026-04-16", fin: "2026-04-21" },
{ id: "anep-mayo", mes: "Mayo", inicio: "2026-05-15", fin: "2026-05-21" },
{ id: "anep-junio", mes: "Junio", inicio: "2026-06-16", fin: "2026-06-22" },
{ id: "anep-julio", mes: "Julio", inicio: "2026-07-17", fin: "2026-07-22" },
{ id: "anep-agosto", mes: "Agosto", inicio: "2026-08-17", fin: "2026-08-20" },
{ id: "anep-setiembre", mes: "Setiembre", inicio: "2026-09-16", fin: "2026-09-21" },
{ id: "anep-octubre", mes: "Octubre", inicio: "2026-10-16", fin: "2026-10-21" },
{ id: "anep-noviembre", mes: "Noviembre", inicio: "2026-11-16", fin: "2026-11-19" },
{ id: "anep-diciembre", mes: "Diciembre", inicio: "2026-12-15", fin: "2026-12-18" },
];

const vencimientosBPS2026 = {
    cobranzaDescentralizada: [
        { periodo: "01/2026", mes: "Enero", vencimiento: "2026-01-23" },
        { periodo: "02/2026", mes: "Febrero", vencimiento: "2026-02-24" },
        { periodo: "03/2026", mes: "Marzo", vencimiento: "2026-03-20" },
        { periodo: "04/2026", mes: "Abril", vencimiento: "2026-04-24" },
        { periodo: "05/2026", mes: "Mayo", vencimiento: "2026-05-25" },
        { periodo: "06/2026", mes: "Junio", vencimiento: "2026-06-22" },
        { periodo: "07/2026", mes: "Julio", vencimiento: "2026-07-21" },
        { periodo: "08/2026", mes: "Agosto", vencimiento: "2026-08-21" },
        { periodo: "09/2026", mes: "Setiembre", vencimiento: "2026-09-21" },
        { periodo: "10/2026", mes: "Octubre", vencimiento: "2026-10-22" },
        { periodo: "11/2026", mes: "Noviembre", vencimiento: "2026-11-23" },
        { periodo: "12/2026", mes: "Diciembre", vencimiento: "2026-12-21" },
    ],

    snisServiciosPersonales: [
        { periodo: "01/2026", mes: "Enero", vencimiento: "2026-01-26" },
        { periodo: "02/2026", mes: "Febrero", vencimiento: "2026-02-24" },
        { periodo: "03/2026", mes: "Marzo", vencimiento: "2026-03-25" },
        { periodo: "04/2026", mes: "Abril", vencimiento: "2026-04-24" },
        { periodo: "05/2026", mes: "Mayo", vencimiento: "2026-05-25" },
        { periodo: "06/2026", mes: "Junio", vencimiento: "2026-06-24" },
        { periodo: "07/2026", mes: "Julio", vencimiento: "2026-07-27" },
        { periodo: "08/2026", mes: "Agosto", vencimiento: "2026-08-24" },
        { periodo: "09/2026", mes: "Setiembre", vencimiento: "2026-09-25" },
        { periodo: "10/2026", mes: "Octubre", vencimiento: "2026-10-26" },
        { periodo: "11/2026", mes: "Noviembre", vencimiento: "2026-11-25" },
        { periodo: "12/2026", mes: "Diciembre", vencimiento: "2026-12-23" },
    ],

    fonasaAnual: {
        vencimiento: "2026-04-30",
        descripcion: "Declaración anual FONASA Servicios Personales",
    },
};

const certificados = {
    bps: { nombre: "Certificado BPS", hasta: "2026-08-04" },
    dgi: { nombre: "Certificado DGI", hasta: "2026-09-30" },
};

function json(statusCode, body) {
    return {
        statusCode,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    };
}

function validarSecret(event) {
    const configuredSecret = process.env.ALERT_SECRET;

    if (!configuredSecret) {
        return {
            ok: false,
            statusCode: 500,
            message: "Falta configurar ALERT_SECRET en Netlify.",
        };
    }

    const receivedSecret =
    event.headers["x-alert-secret"] ||
    event.headers["X-Alert-Secret"] ||
    event.queryStringParameters?.secret;

    if (!receivedSecret || receivedSecret !== configuredSecret) {
        return {
            ok: false,
            statusCode: 401,
            message: "No autorizado. Falta o no coincide ALERT_SECRET.",
        };
    }

    return { ok: true };
}

function parseBody(event) {
    if (!event.body) return {};

    try {
        return JSON.parse(event.body);
    } catch {
        return {};
    }
}

function diasHasta(fechaISO) {
    const hoy = new Date();
    const fecha = new Date(fechaISO + "T00:00:00");

    hoy.setHours(0, 0, 0, 0);

    return Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
}

function formatearFecha(fechaISO) {
    const [anio, mes, dia] = fechaISO.split("-");
    return `${dia}/${mes}/${anio}`;
}

function debeAlertar(dias, maximo) {
    return dias >= 0 && dias <= maximo;
}

async function enviarTelegram(message) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        throw new Error("Faltan variables TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID");
    }

    const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(JSON.stringify(data));
    }

    return data;
}

function generarAlertasBPS(pagosBPS) {
    const alertas = [];

    for (const item of vencimientosBPS2026.cobranzaDescentralizada) {
        const clave = `bps_${item.periodo}`;
        const pagado = pagosBPS[clave];
        const dias = diasHasta(item.vencimiento);

        if (!pagado && debeAlertar(dias, 7)) {
            alertas.push(
                `⚠️ BPS pendiente - Cobranza Descentralizada\nPeríodo: ${item.periodo}\nMes: ${item.mes} 2026\nVence: ${formatearFecha(
                    item.vencimiento
                )}\nFaltan ${dias} día${dias === 1 ? "" : "s"}.`
            );
        }
    }

    for (const item of vencimientosBPS2026.snisServiciosPersonales) {
        const clave = `sns_${item.periodo}`;
        const pagado = pagosBPS[clave];
        const dias = diasHasta(item.vencimiento);

        if (!pagado && debeAlertar(dias, 7)) {
            alertas.push(
                `⚠️ SNS / FONASA pendiente\nPeríodo: ${item.periodo}\nMes: ${item.mes} 2026\nPrestador: CAAMEPA\nVence: ${formatearFecha(
                    item.vencimiento
                )}\nFaltan ${dias} día${dias === 1 ? "" : "s"}.`
            );
        }
    }

    const diasFonasaAnual = diasHasta(vencimientosBPS2026.fonasaAnual.vencimiento);

    if (debeAlertar(diasFonasaAnual, 15)) {
        alertas.push(
            `⚠️ Declaración anual FONASA\nServicios Personales\nVence: ${formatearFecha(
                vencimientosBPS2026.fonasaAnual.vencimiento
            )}\nFaltan ${diasFonasaAnual} día${diasFonasaAnual === 1 ? "" : "s"}.`
        );
    }

    return alertas;
}

export async function handler(event) {
    if (!["GET", "POST"].includes(event.httpMethod)) {
        return json(405, { error: "Método no permitido" });
    }

    const auth = validarSecret(event);

    if (!auth.ok) {
        return json(auth.statusCode, { ok: false, error: auth.message });
    }

    try {
        const body = parseBody(event);

        const pagosIVA = body.pagosIVA || {};
        const facturasANEP = body.facturasANEP || {};
        const pagosBPS = body.pagosBPS || {};
        const modoAutomatico = Object.keys(body).length === 0;

        const alertas = [];

        for (const item of vencimientosIVA2026) {
            const dias = diasHasta(item.vencimiento);
            const pagado = pagosIVA[item.id]?.pagado;

            if (!pagado && debeAlertar(dias, 7)) {
                alertas.push(
                    `⚠️ IVA pendiente\nPeríodo: ${item.periodo}\nVence: ${formatearFecha(
                        item.vencimiento
                    )}\nFaltan ${dias} día${dias === 1 ? "" : "s"}.`
                );
            }
        }

        for (const key of Object.keys(certificados)) {
            const cert = certificados[key];
            const dias = diasHasta(cert.hasta);

            if (debeAlertar(dias, 15)) {
                alertas.push(
                    `⚠️ ${cert.nombre} próximo a vencer\nVence: ${formatearFecha(
                        cert.hasta
                    )}\nFaltan ${dias} día${dias === 1 ? "" : "s"}.`
                );
            }
        }

        for (const item of cronogramaANEP2026) {
            const dias = diasHasta(item.fin);
            const facturado = facturasANEP[item.id]?.facturado;

            if (!facturado && debeAlertar(dias, 3)) {
                alertas.push(
                    `⚠️ Facturación ANEP pendiente\nMes: ${item.mes} 2026\nRecepción hasta: ${formatearFecha(
                        item.fin
                    )}\nFaltan ${dias} día${dias === 1 ? "" : "s"}.`
                );
            }
        }

        alertas.push(...generarAlertasBPS(pagosBPS));

        if (alertas.length === 0) {
            await enviarTelegram(
                modoAutomatico
                ? "✅ Revisión automática OK: no hay alertas críticas hoy."
                : "✅ Revisión OK: no hay alertas críticas hoy."
            );

            return json(200, {
                ok: true,
                modoAutomatico,
                alertas: [],
                message: "Sin alertas",
            });
        }

        const encabezado = modoAutomatico
        ? "📌 Alertas automáticas Contador Personal"
        : "📌 Alertas Contador Personal";

        const mensaje = `${encabezado}\n\n${alertas.join("\n\n---\n\n")}`;

        await enviarTelegram(mensaje);

        return json(200, {
            ok: true,
            modoAutomatico,
            alertas,
        });
    } catch (error) {
        return json(500, {
            ok: false,
            error: error.message,
        });
    }
}
