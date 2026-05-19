import { useState } from "react";
import { empresa } from "../data/empresa";
import { vencimientosDGI2026 } from "../data/vencimientosDGI";
import {
    formatearFecha,
        obtenerEstadoVencimiento,
        obtenerProximoVencimiento,
} from "../utils/fechas";

const STORAGE_KEY = "contador_personal_iva_pagos";

export default function ControlIVA() {
    const [mostrarDetalle, setMostrarDetalle] = useState(false);

    const [pagosIVA, setPagosIVA] = useState(() => {
        const guardado = localStorage.getItem(STORAGE_KEY);
        return guardado ? JSON.parse(guardado) : {};
    });

    function guardarPagos(nuevosPagos) {
        setPagosIVA(nuevosPagos);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(nuevosPagos)
        );
    }

    function confirmarPago(id) {
        guardarPagos({
            ...pagosIVA,
            [id]: {
                pagado: true,
                fechaConfirmacion: new Date().toISOString(),
            },
        });
    }

    function desmarcarPago(id) {
        const nuevosPagos = { ...pagosIVA };

        delete nuevosPagos[id];

        guardarPagos(nuevosPagos);
    }

    const pendientes =
    vencimientosDGI2026.filter(
        (item) => !pagosIVA[item.id]
    );

    const proximo =
    obtenerProximoVencimiento(pendientes);

    const cantidadPagos =
    vencimientosDGI2026.length -
    pendientes.length;

    return (
        <section className="bloque bloque-iva minimal">
        <div className="bloque-header">
        <div>
        <p className="mini oscuro">
        Control tributario
        </p>

        <h2>IVA bimestral</h2>
        </div>

        <button
        className="boton-secundario"
        onClick={() =>
            window.open(
                empresa.links.dgiCalendario2026,
                "_blank"
            )
        }
        >
        DGI
        </button>
        </div>

        {proximo ? (
            <article className="iva-resumen">
            <div>
            <p className="mini oscuro">
            Próximo pago
            </p>

            <h3>{proximo.periodo}</h3>

            <p>
            Vence:{" "}
            <strong>
            {formatearFecha(
                proximo.vencimiento
            )}
            </strong>
            </p>

            <span
            className={
                obtenerEstadoVencimiento(
                    proximo.vencimiento
                ).clase
            }
            >
            {
                obtenerEstadoVencimiento(
                    proximo.vencimiento
                ).texto
            }
            </span>
            </div>

            <button
            onClick={() =>
                confirmarPago(proximo.id)
            }
            >
            Confirmar pago
            </button>
            </article>
        ) : (
            <article className="iva-resumen">
            <div>
            <h3>IVA al día</h3>

            <p className="nota">
            Todos los bimestres están pagos.
            </p>
            </div>
            </article>
        )}

        <div className="iva-mini-footer">
        <span>
        {cantidadPagos} de{" "}
        {vencimientosDGI2026.length}{" "}
        bimestres pagos
        </span>

        <button
        onClick={() =>
            setMostrarDetalle(
                !mostrarDetalle
            )
        }
        >
        {mostrarDetalle
            ? "Ocultar detalle"
            : "Ver detalle"}
            </button>
            </div>

            {mostrarDetalle && (
                <div className="iva-lista">
                {vencimientosDGI2026.map((item) => {
                    const pago =
                    pagosIVA[item.id];

                    const estadoFecha =
                    obtenerEstadoVencimiento(
                        item.vencimiento
                    );

                    return (
                        <article
                        key={item.id}
                        className={
                            pago
                            ? "iva-item iva-pago"
                            : "iva-item"
                        }
                        >
                        <div>
                        <strong>
                        {item.periodo}
                        </strong>

                        <p>
                        Vence:{" "}
                        {formatearFecha(
                            item.vencimiento
                        )}
                        </p>
                        </div>

                        <div className="iva-acciones">
                        {pago ? (
                            <>
                            <span className="estado-verde">
                            Pagado
                            </span>

                            <button
                            onClick={() =>
                                desmarcarPago(
                                    item.id
                                )
                            }
                            >
                            Desmarcar
                            </button>
                            </>
                        ) : (
                            <>
                            <span
                            className={
                                estadoFecha.clase
                            }
                            >
                            {
                                estadoFecha.texto
                            }
                            </span>

                            <button
                            onClick={() =>
                                confirmarPago(
                                    item.id
                                )
                            }
                            >
                            Confirmar
                            </button>
                            </>
                        )}
                        </div>
                        </article>
                    );
                })}
                </div>
            )}
            </section>
    );
}
