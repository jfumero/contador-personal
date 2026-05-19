import { useState } from "react";
import { empresa } from "./data/empresa";
import ControlIVA from "./components/ControlIVA";
import AutomatizacionBPS from "./components/AutomatizacionBPS";
import CronogramaANEP from "./components/CronogramaANEP";
import {
  formatearFecha,
    obtenerEstadoVencimiento,
} from "./utils/fechas";

const STORAGE_KEY = "contador_personal_obligaciones";
const ALERT_SECRET_STORAGE_KEY = "contador_personal_alert_secret";

function obtenerAlertSecret() {
  const guardado = localStorage.getItem(ALERT_SECRET_STORAGE_KEY);

  if (guardado) return guardado;

  const ingresado = prompt(
    "Ingresá ALERT_SECRET. Es la clave interna que configuraste en Netlify."
  );

  if (!ingresado) return null;

  localStorage.setItem(ALERT_SECRET_STORAGE_KEY, ingresado.trim());

  return ingresado.trim();
}

export default function App() {
  const [obligaciones, setObligaciones] = useState(() => {
    const guardadas = localStorage.getItem(STORAGE_KEY);

    if (guardadas) {
      return JSON.parse(guardadas);
    }

    return [
      {
        id: crypto.randomUUID(),
                                                   titulo: "Revisar pago FONASA / BPS",
                                                   tipo: "BPS",
                                                   vencimiento: "2026-06-20",
                                                   estado: "pendiente",
                                                   notas: "Carga manual inicial. Ajustar según tu caso.",
      },
    ];
  });

  const [formulario, setFormulario] = useState({
    titulo: "",
    tipo: "Otro",
    vencimiento: "",
    notas: "",
  });

  async function probarTelegram() {
    try {
      const alertSecret = obtenerAlertSecret();

      if (!alertSecret) {
        alert("No se puede probar Telegram sin ALERT_SECRET.");
        return;
      }

      const response = await fetch("/.netlify/functions/sendTelegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-alert-secret": alertSecret,
        },
        body: JSON.stringify({
          message:
          "✅ Prueba exitosa desde Contador Personal. Telegram ya está conectado.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Error enviando Telegram:\n" + JSON.stringify(data, null, 2));
        return;
      }

      alert("Mensaje enviado a Telegram.");
    } catch (error) {
      alert("Error conectando con Netlify Function:\n" + error.message);
    }
  }

  async function revisarAlertas() {
    try {
      const alertSecret = obtenerAlertSecret();

      if (!alertSecret) {
        alert("No se pueden revisar alertas sin ALERT_SECRET.");
        return;
      }

      const pagosIVA = JSON.parse(
        localStorage.getItem("contador_personal_iva_pagos") || "{}"
      );

      const facturasANEP = JSON.parse(
        localStorage.getItem("contador_personal_anep_facturas") || "{}"
      );

      const response = await fetch("/.netlify/functions/checkAlerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-alert-secret": alertSecret,
        },
        body: JSON.stringify({
          pagosIVA,
          facturasANEP,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Error revisando alertas:\n" + JSON.stringify(data, null, 2));
        return;
      }

      alert("Revisión enviada a Telegram.");
    } catch (error) {
      alert("Error revisando alertas:\n" + error.message);
    }
  }

  function guardarObligaciones(nuevasObligaciones) {
    setObligaciones(nuevasObligaciones);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevasObligaciones));
  }

  function agregarObligacion(evento) {
    evento.preventDefault();

    if (!formulario.titulo || !formulario.vencimiento) {
      alert("Completá al menos título y vencimiento.");
      return;
    }

    const nuevaObligacion = {
      id: crypto.randomUUID(),
      ...formulario,
      estado: "pendiente",
    };

    guardarObligaciones([nuevaObligacion, ...obligaciones]);

    setFormulario({
      titulo: "",
      tipo: "Otro",
      vencimiento: "",
      notas: "",
    });
  }

  function cambiarEstado(id) {
    const nuevasObligaciones = obligaciones.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          estado: item.estado === "pagado" ? "pendiente" : "pagado",
        };
      }

      return item;
    });

    guardarObligaciones(nuevasObligaciones);
  }

  function eliminarObligacion(id) {
    const confirma = confirm("¿Seguro que querés eliminar esta obligación?");

    if (!confirma) return;

    const nuevasObligaciones = obligaciones.filter((item) => item.id !== id);
    guardarObligaciones(nuevasObligaciones);
  }

  function abrirLink(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const estadoBPS = obtenerEstadoVencimiento(empresa.certificados.bps.hasta);
  const estadoDGI = obtenerEstadoVencimiento(empresa.certificados.dgi.hasta);

  return (
    <main className="app">
    <section className="hero">
    <div>
    <p className="mini">Contador personal Uruguay</p>

    <h1>{empresa.nombre}</h1>

    <p className="datos-principales">
    RUT: {empresa.rut} · Empresa BPS: {empresa.empresaBPS}
    </p>

    <button className="boton-hero" onClick={probarTelegram}>
    Probar Telegram
    </button>

    <button className="boton-hero secundario" onClick={revisarAlertas}>
    Revisar alertas
    </button>
    </div>
    </section>

    <section className="grid">
    <article className="card">
    <div className="card-header">
    <h2>Certificado BPS</h2>

    <span className={estadoBPS.clase}>{estadoBPS.texto}</span>
    </div>

    <p>
    <strong>Desde:</strong>{" "}
    {formatearFecha(empresa.certificados.bps.desde)}
    </p>

    <p>
    <strong>Hasta:</strong>{" "}
    {formatearFecha(empresa.certificados.bps.hasta)}
    </p>

    <button onClick={() => abrirLink(empresa.links.bpsConsulta)}>
    Abrir consulta BPS
    </button>
    </article>

    <article className="card">
    <div className="card-header">
    <h2>Certificado DGI</h2>

    <span className={estadoDGI.clase}>{estadoDGI.texto}</span>
    </div>

    <p>
    <strong>Desde:</strong>{" "}
    {formatearFecha(empresa.certificados.dgi.desde)}
    </p>

    <p>
    <strong>Hasta:</strong>{" "}
    {formatearFecha(empresa.certificados.dgi.hasta)}
    </p>

    <button onClick={() => abrirLink(empresa.links.dgiCertificado)}>
    Abrir certificado DGI
    </button>

    <p className="nota">
    Requiere clave. No guardar usuario ni contraseña en la app.
    </p>
    </article>
    </section>

    <AutomatizacionBPS />

    <ControlIVA />

    <CronogramaANEP />

    <section className="bloque">
    <h2>Obligaciones manuales</h2>

    <form className="formulario" onSubmit={agregarObligacion}>
    <input
    type="text"
    placeholder="Ej: pagar timbre profesional"
    value={formulario.titulo}
    onChange={(e) =>
      setFormulario({
        ...formulario,
        titulo: e.target.value,
      })
    }
    />

    <select
    value={formulario.tipo}
    onChange={(e) =>
      setFormulario({
        ...formulario,
        tipo: e.target.value,
      })
    }
    >
    <option value="DGI">DGI</option>
    <option value="BPS">BPS</option>
    <option value="FONASA">FONASA</option>
    <option value="ANEP">ANEP</option>
    <option value="Otro">Otro</option>
    </select>

    <input
    type="date"
    value={formulario.vencimiento}
    onChange={(e) =>
      setFormulario({
        ...formulario,
        vencimiento: e.target.value,
      })
    }
    />

    <input
    type="text"
    placeholder="Notas"
    value={formulario.notas}
    onChange={(e) =>
      setFormulario({
        ...formulario,
        notas: e.target.value,
      })
    }
    />

    <button type="submit">Agregar</button>
    </form>

    <div className="lista">
    {obligaciones.map((item) => {
      const estado = obtenerEstadoVencimiento(item.vencimiento);

      return (
        <article key={item.id} className="obligacion">
        <div>
        <div className="fila-titulo">
        <h3>{item.titulo}</h3>

        <span className="tag">{item.tipo}</span>
        </div>

        <p>
        <strong>Vencimiento:</strong>{" "}
        {formatearFecha(item.vencimiento)}
        </p>

        <p className={estado.clase}>{estado.texto}</p>

        {item.notas && <p className="nota">{item.notas}</p>}
        </div>

        <div className="acciones">
        <button
        className={
          item.estado === "pagado" ? "boton-pagado" : "boton-alerta"
        }
        onClick={() => cambiarEstado(item.id)}
        >
        {item.estado === "pagado" ? "Pagado" : "Pendiente"}
        </button>

        <button
        className="boton-eliminar"
        onClick={() => eliminarObligacion(item.id)}
        >
        Eliminar
        </button>
        </div>
        </article>
      );
    })}
    </div>
    </section>

    <footer>
    <p>
    Las fechas tributarias deben verificarse siempre contra fuentes
    oficiales de DGI, BPS y FONASA.
    </p>
    </footer>
    </main>
  );
}
