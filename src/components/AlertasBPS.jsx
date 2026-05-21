import { useEffect, useMemo, useState } from "react";
import { Building2, HeartPulse, CalendarDays } from "lucide-react";
import { vencimientosBPS2026 } from "../data/vencimientosBPS2026";
import { formatearFecha, obtenerEstadoVencimiento } from "../utils/fechas";

const STORAGE_KEY = "contador_personal_bps_pagos";

function obtenerPagosGuardados() {
    const guardado = localStorage.getItem(STORAGE_KEY);

    if (!guardado) return {};

    try {
        return JSON.parse(guardado);
    } catch {
        return {};
    }
}

function obtenerProximoPendiente(lista, pagos, tipo) {
    const hoy = new Date();

    return lista.find((item) => {
        const clave = `${tipo}_${item.periodo}`;
        const estaPago = pagos[clave];

        return !estaPago && new Date(item.vencimiento) >= hoy;
    });
}

function construirClave(tipo, periodo) {
    return `${tipo}_${periodo}`;
}

export default function AlertasBPS() {
    const [pagos, setPagos] = useState(() => obtenerPagosGuardados());
    const [mostrarDetalle, setMostrarDetalle] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pagos));
    }, [pagos]);

    const proximoBPS = useMemo(() => {
        return obtenerProximoPendiente(
            vencimientosBPS2026.cobranzaDescentralizada.meses,
            pagos,
            "bps"
        );
    }, [pagos]);

    const proximoSNS = useMemo(() => {
        return obtenerProximoPendiente(
            vencimientosBPS2026.snisServiciosPersonales.meses,
            pagos,
            "sns"
        );
    }, [pagos]);

    function alternarPago(tipo, periodo) {
        const clave = construirClave(tipo, periodo);

        setPagos((actual) => ({
            ...actual,
            [clave]: !actual[clave],
        }));
    }

    function renderResumen(tipo, titulo, descripcion, item, icono) {
        const estado = item
        ? obtenerEstadoVencimiento(item.vencimiento)
        : {
            clase: "estado-verde",
            texto: "Sin pendientes",
        };

        return (
            <article className="bps-alerta-card">
            <div className="bps-alerta-icon">{icono}</div>

            <div className="bps-alerta-contenido">
            <p className="mini">{titulo}</p>

            <h3>{item ? item.mes : "Sin pendientes"}</h3>

            <p className="oscuro">{descripcion}</p>

            {item && (
                <>
                <p>
                <strong>Periodo:</strong> {item.periodo}
                </p>

                <p>
                <strong>Vence:</strong> {formatearFecha(item.vencimiento)}
                </p>

                <span className={estado.clase}>{estado.texto}</span>
                </>
            )}
            </div>

            {item && (
                <button
                type="button"
                onClick={() => alternarPago(tipo, item.periodo)}
                >
                Confirmar pago
                </button>
            )}
            </article>
        );
    }

    return (
        <section className="bloque bloque-bps-alertas">
        <div className="bloque-header">
        <div>
        <p className="mini">Alertas BPS / Salud</p>
        <h2>BPS mensual y SNS / FONASA</h2>
        <p className="oscuro">
        Control de vencimientos 2026 para Cobranza Descentralizada y SNS
        Servicios Personales.
        </p>
        </div>

        <button
        type="button"
        className="boton-secundario"
        onClick={() => setMostrarDetalle(!mostrarDetalle)}
        >
        {mostrarDetalle ? "Ocultar meses" : "Ver meses"}
        </button>
        </div>

        <div className="bps-alertas-grid">
        {renderResumen(
            "bps",
            "Cobranza Descentralizada",
            "Aportes BPS de Industria y Comercio.",
            proximoBPS,
            <Building2 size={24} />
        )}

        {renderResumen(
            "sns",
            "SNS / FONASA",
            "Salud por Servicios Personales · CAAMEPA.",
            proximoSNS,
            <HeartPulse size={24} />
        )}
        </div>

        <article className="fonasa-anual-card">
        <div>
        <p className="mini">FONASA anual</p>

        <h3>Declaración anual Servicios Personales</h3>

        <p>
        Disponible desde:{" "}
        <strong>
        {formatearFecha(vencimientosBPS2026.fonasaAnual.disponibleDesde)}
        </strong>
        </p>

        <p>
        Vencimiento dígito 9:{" "}
        <strong>
        {formatearFecha(vencimientosBPS2026.fonasaAnual.vencimiento)}
        </strong>
        </p>
        </div>

        <CalendarDays size={28} />
        </article>

        {mostrarDetalle && (
            <div className="bps-detalle-grid">
            <div>
            <h3>Cobranza Descentralizada</h3>

            <div className="bps-lista">
            {vencimientosBPS2026.cobranzaDescentralizada.meses.map((item) => {
                const clave = construirClave("bps", item.periodo);
                const pago = pagos[clave];

                return (
                    <article
                    key={clave}
                    className={pago ? "bps-item bps-item-pago" : "bps-item"}
                    >
                    <div>
                    <strong>{item.mes}</strong>
                    <p>{item.periodo}</p>
                    <p>Vence: {formatearFecha(item.vencimiento)}</p>
                    </div>

                    <button
                    type="button"
                    onClick={() => alternarPago("bps", item.periodo)}
                    >
                    {pago ? "Pagado" : "Pendiente"}
                    </button>
                    </article>
                );
            })}
            </div>
            </div>

            <div>
            <h3>SNS / FONASA</h3>

            <div className="bps-lista">
            {vencimientosBPS2026.snisServiciosPersonales.meses.map((item) => {
                const clave = construirClave("sns", item.periodo);
                const pago = pagos[clave];

                return (
                    <article
                    key={clave}
                    className={pago ? "bps-item bps-item-pago" : "bps-item"}
                    >
                    <div>
                    <strong>{item.mes}</strong>
                    <p>{item.periodo}</p>
                    <p>Vence: {formatearFecha(item.vencimiento)}</p>
                    </div>

                    <button
                    type="button"
                    onClick={() => alternarPago("sns", item.periodo)}
                    >
                    {pago ? "Pagado" : "Pendiente"}
                    </button>
                    </article>
                );
            })}
            </div>
            </div>
            </div>
        )}
        </section>
    );
}
