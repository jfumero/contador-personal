import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  PieChart,
  Users,
  CalendarDays,
  Database,
  ListChecks,
  Send,
  CheckCircle2,
  AlertCircle,
  Shield,
  BellRing,
  FileCheck2,
} from "lucide-react";

import { empresa } from "./data/empresa";
import ControlIVA from "./components/ControlIVA";
import AutomatizacionBPS from "./components/AutomatizacionBPS";
import CronogramaANEP from "./components/CronogramaANEP";
import BackupDatos from "./components/BackupDatos";
import { formatearFecha, obtenerEstadoVencimiento } from "./utils/fechas";

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

function obtenerNombreCorto(nombre) {
  return (
    nombre
    ?.split(" ")
    ?.[0]
    ?.toLowerCase()
    ?.replace(/^./, (letra) => letra.toUpperCase()) || "Jonathan"
  );
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

  const obligacionesPendientes = obligaciones.filter(
    (item) => item.estado !== "pagado"
  );

  const certificadosPorVencer = [estadoBPS, estadoDGI].filter(
    (estado) => estado.clase !== "estado-verde"
  ).length;

  const proximaObligacion = useMemo(() => {
    return obligacionesPendientes
    .filter((item) => item.vencimiento)
    .sort((a, b) => new Date(a.vencimiento) - new Date(b.vencimiento))[0];
  }, [obligacionesPendientes]);

  const nombreCorto = obtenerNombreCorto(empresa.nombre);

  return (
    <main className="dashboard-shell">
    <aside className="sidebar">
    <div className="brand">
    <div className="brand-icon">CP</div>
    <div>
    <h1>Contador Personal</h1>
    <p>Sistema de gestión</p>
    </div>
    </div>

    <nav className="side-nav" aria-label="Navegación principal">
    <a className="active" href="#dashboard">
    <LayoutDashboard size={20} />
    Dashboard
    </a>

    <a href="#certificados">
    <ShieldCheck size={20} />
    Certificados
    </a>

    <a href="#iva">
    <PieChart size={20} />
    IVA
    </a>

    <a href="#bps">
    <Users size={20} />
    BPS / FONASA
    </a>

    <a href="#anep">
    <CalendarDays size={20} />
    ANEP
    </a>

    <a href="#backup">
    <Database size={20} />
    Backup & Datos
    </a>

    <a href="#obligaciones">
    <ListChecks size={20} />
    Obligaciones
    </a>
    </nav>

    <div className="profile-card">
    <div className="avatar">FJ</div>
    <h2>{empresa.nombre}</h2>
    <p>RUT: {empresa.rut}</p>
    <span>Monotributista</span>
    </div>

    <div className="version-card">
    <p>Versión</p>
    <strong>2.1.0</strong>
    </div>
    </aside>

    <section className="main-panel" id="dashboard">
    <header className="topbar">
    <div>
    <h2>¡Hola, {nombreCorto}! 👋</h2>
    <p>Aquí tenés el estado general de tu gestión contable.</p>
    </div>

    <div className="quick-status">
    <button
    className="status-chip success"
    type="button"
    onClick={revisarAlertas}
    >
    <CheckCircle2 size={18} />
    Sistema activo
    </button>

    <button
    className="status-chip primary"
    type="button"
    onClick={probarTelegram}
    >
    <Send size={18} />
    Telegram conectado
    </button>
    </div>
    </header>

    <section className="kpi-grid">
    <article className="kpi-card purple">
    <div className="kpi-icon">
    <CalendarDays size={28} />
    </div>

    <div>
    <p>Próximo vencimiento</p>
    <h3>
    {proximaObligacion
      ? formatearFecha(proximaObligacion.vencimiento)
      : "Sin pendientes"}
      </h3>
      <span>{proximaObligacion?.titulo || "Todo al día"}</span>
      </div>
      </article>

      <article className="kpi-card red">
      <div className="kpi-icon">
      <AlertCircle size={28} />
      </div>

      <div>
      <p>Obligaciones pendientes</p>
      <h3>{obligacionesPendientes.length}</h3>
      <span>Requieren atención</span>
      </div>
      </article>

      <article className="kpi-card orange">
      <div className="kpi-icon">
      <Shield size={28} />
      </div>

      <div>
      <p>Certificados por vencer</p>
      <h3>{certificadosPorVencer}</h3>
      <span>Según fechas cargadas</span>
      </div>
      </article>

      <article className="kpi-card green">
      <div className="kpi-icon">
      <Database size={28} />
      </div>

      <div>
      <p>Backup de datos</p>
      <h3>Local</h3>
      <span>Exportación JSON disponible</span>
      </div>
      </article>
      </section>

      <section className="content-grid">
      <section className="module-card certificados-card" id="certificados">
      <div className="module-title">
      <div className="module-icon purple-soft">
      <FileCheck2 size={24} />
      </div>

      <div>
      <h2>Certificados</h2>
      <p>Administrá tus certificados digitales</p>
      </div>
      </div>

      <article className="certificate-row">
      <div>
      <strong>Certificado BPS</strong>
      <p>Desde: {formatearFecha(empresa.certificados.bps.desde)}</p>
      <p>Hasta: {formatearFecha(empresa.certificados.bps.hasta)}</p>
      </div>

      <span className={estadoBPS.clase}>{estadoBPS.texto}</span>
      </article>

      <article className="certificate-row">
      <div>
      <strong>Certificado DGI</strong>
      <p>Desde: {formatearFecha(empresa.certificados.dgi.desde)}</p>
      <p>Hasta: {formatearFecha(empresa.certificados.dgi.hasta)}</p>
      </div>

      <span className={estadoDGI.clase}>{estadoDGI.texto}</span>
      </article>

      <button onClick={() => abrirLink(empresa.links.bpsConsulta)}>
      Abrir renovación BPS
      </button>

      <button
      className="button-light"
      onClick={() => abrirLink(empresa.links.dgiCertificado)}
      >
      Abrir renovación DGI
      </button>
      </section>

      <div className="module-card module-wide" id="bps">
      <AutomatizacionBPS />
      </div>

      <div className="module-card" id="iva">
      <ControlIVA />
      </div>

      <div className="module-card" id="anep">
      <CronogramaANEP />
      </div>

      <div className="module-card" id="backup">
      <BackupDatos />
      </div>

      <section className="module-card obligaciones-card" id="obligaciones">
      <div className="module-title">
      <div className="module-icon gray-soft">
      <BellRing size={24} />
      </div>

      <div>
      <h2>Obligaciones manuales</h2>
      <p>Agregá obligaciones personalizadas</p>
      </div>
      </div>

      <form className="formulario" onSubmit={agregarObligacion}>
      <input
      type="text"
      placeholder="Ej: pagar contador"
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

      <button type="submit">+ Agregar</button>
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
            item.estado === "pagado"
            ? "boton-pagado"
            : "boton-alerta"
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
      </section>

      <footer>
      <p>
      Las fechas tributarias deben verificarse siempre contra fuentes
      oficiales de DGI, BPS y FONASA.
      </p>
      </footer>
      </section>
      </main>
  );
}
