import { useState } from "react";
import { cronogramaANEP2026 } from "../data/cronogramaANEP2026";
import { formatearFecha, obtenerEstadoVencimiento } from "../utils/fechas";

const STORAGE_KEY = "contador_personal_anep_facturas";

export default function CronogramaANEP() {
  const [mostrarDetalle, setMostrarDetalle] = useState(false);

  const [facturas, setFacturas] = useState(() => {
    const guardado = localStorage.getItem(STORAGE_KEY);
    return guardado ? JSON.parse(guardado) : {};
  });

  function guardar(nuevasFacturas) {
    setFacturas(nuevasFacturas);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevasFacturas));
  }

  function marcarFacturado(id) {
    guardar({
      ...facturas,
      [id]: {
        facturado: true,
        fecha: new Date().toISOString(),
      },
    });
  }

  function desmarcar(id) {
    const copia = { ...facturas };
    delete copia[id];
    guardar(copia);
  }

  function obtenerPeriodoActual() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const activo = cronogramaANEP2026.find((item) => {
      const inicio = new Date(item.inicio + "T00:00:00");
      const fin = new Date(item.fin + "T00:00:00");
      return hoy >= inicio && hoy <= fin;
    });

    if (activo) return activo;

    const proximo = cronogramaANEP2026.find((item) => {
      const fin = new Date(item.fin + "T00:00:00");
      return fin >= hoy;
    });

    return proximo || cronogramaANEP2026[cronogramaANEP2026.length - 1];
  }

  const actual = obtenerPeriodoActual();
  const estado = obtenerEstadoVencimiento(actual.fin);
  const estaFacturado = facturas[actual.id];

  return (
    <section className="bloque bloque-anep">
      <div className="bloque-header">
        <div>
          <p className="mini oscuro">Facturación honorarios</p>
          <h2>Cronograma ANEP</h2>
        </div>

        <button
          className="boton-secundario"
          onClick={() => setMostrarDetalle(!mostrarDetalle)}
        >
          {mostrarDetalle ? "Ocultar" : "Ver meses"}
        </button>
      </div>

      <article className="anep-resumen">
        <div>
          <p className="mini oscuro">Período actual / próximo</p>
          <h3>{actual.mes} 2026</h3>

          <p>
            Fecha de factura desde: <strong>{formatearFecha(actual.inicio)}</strong>
          </p>

          <p>
            Recepción hasta: <strong>{formatearFecha(actual.fin)}</strong>
          </p>

          {estaFacturado ? (
            <span className="estado-verde">Facturado</span>
          ) : (
            <span className={estado.clase}>{estado.texto}</span>
          )}
        </div>

        {estaFacturado ? (
          <button onClick={() => desmarcar(actual.id)}>Desmarcar</button>
        ) : (
          <button onClick={() => marcarFacturado(actual.id)}>
            Confirmar facturado
          </button>
        )}
      </article>

      {mostrarDetalle && (
        <div className="anep-lista">
          {cronogramaANEP2026.map((item) => {
            const facturado = facturas[item.id];
            const estadoMes = obtenerEstadoVencimiento(item.fin);

            return (
              <article
                key={item.id}
                className={facturado ? "anep-item anep-ok" : "anep-item"}
              >
                <div>
                  <strong>{item.mes}</strong>
                  <p>
                    Desde {formatearFecha(item.inicio)} hasta{" "}
                    {formatearFecha(item.fin)}
                  </p>
                </div>

                <div className="anep-acciones">
                  {facturado ? (
                    <>
                      <span className="estado-verde">Facturado</span>
                      <button onClick={() => desmarcar(item.id)}>Desmarcar</button>
                    </>
                  ) : (
                    <>
                      <span className={estadoMes.clase}>{estadoMes.texto}</span>
                      <button onClick={() => marcarFacturado(item.id)}>
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
