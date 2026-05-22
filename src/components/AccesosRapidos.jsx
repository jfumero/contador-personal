import {
  Copy,
  ExternalLink,
  FileCheck2,
  HeartPulse,
  KeyRound,
  Landmark,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { empresa } from "../data/empresa";

const SCRIPT_BPS_CERTIFICADO = `// ==UserScript==
// @name         BPS - Certificado AUTO Descargar Constancia
// @namespace    bps-certificado-auto
// @version      1.0
// @description  Detecta la pantalla de resultado de certificado BPS y ejecuta Descargar Constancia correctamente.
// @match        https://app1.bps.gub.uy/CertificadosConsultasAnonimasWeb/*
// @match        https://*.bps.gub.uy/CertificadosConsultasAnonimasWeb/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const CONFIG = {
    autoDescargar: true,
    esperarMs: 1200,
    reintentoMs: 900,
    maxIntentos: 20,
  };

  let intentos = 0;
  let descargado = false;

  console.log("BPS Certificado AUTO cargado en:", location.href);

  function textoDe(el) {
    return \`\${el.value || ""} \${el.textContent || ""} \${el.title || ""} \${el.alt || ""}\`
      .replace(/\\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function esBotonDescargar(el) {
    const txt = textoDe(el);

    return (
      txt.includes("descargar constancia") ||
      txt.includes("descargar") ||
      txt.includes("constancia") ||
      txt.includes("imprimir") ||
      txt.includes("pdf")
    );
  }

  function buscarBotonDescarga() {
    const candidatos = [
      ...document.querySelectorAll("a, button, input[type='button'], input[type='submit']"),
    ];

    return candidatos.find(esBotonDescargar) || null;
  }

  function clickJSF(el) {
    if (!el) return false;

    try {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (_) {}

    el.focus?.();

    const onclick = el.getAttribute("onclick");

    if (onclick) {
      console.log("BPS Certificado AUTO: ejecutando onclick JSF/Mojarra.");
      el.click();
      return true;
    }

    console.log("BPS Certificado AUTO: click normal en botón de constancia.");
    el.click();
    return true;
  }

  function detectarYDescargar() {
    if (descargado) return;

    intentos += 1;

    const boton = buscarBotonDescarga();

    if (boton) {
      descargado = true;

      console.log("BPS Certificado AUTO: botón encontrado", boton);

      if (CONFIG.autoDescargar) {
        setTimeout(() => {
          clickJSF(boton);
        }, CONFIG.esperarMs);
      }

      return;
    }

    if (intentos < CONFIG.maxIntentos) {
      setTimeout(detectarYDescargar, CONFIG.reintentoMs);
    } else {
      console.warn(
        "BPS Certificado AUTO: no se encontró el botón Descargar Constancia."
      );
    }
  }

  detectarYDescargar();
})();`;

function abrirLink(url) {
  if (!url) {
    alert("Este enlace todavía no está configurado.");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    alert("Copiado.");
  } catch {
    alert("No se pudo copiar automáticamente. Copialo manualmente desde el archivo scripts/tampermonkey-bps-certificados.user.js.");
  }
}

function AccesoBoton({
  icono: Icono,
  titulo,
  descripcion,
  url,
  variante = "normal",
}) {
  return (
    <button
      type="button"
      className={`acceso-boton ${variante}`}
      onClick={() => abrirLink(url)}
    >
      <span className="acceso-boton-icono">
        <Icono size={20} />
      </span>

      <span className="acceso-boton-texto">
        <strong>{titulo}</strong>
        <small>{descripcion}</small>
      </span>

      <ExternalLink size={18} className="acceso-boton-flecha" />
    </button>
  );
}

function AccionBoton({ icono: Icono, titulo, descripcion, onClick }) {
  return (
    <button type="button" className="acceso-boton accion" onClick={onClick}>
      <span className="acceso-boton-icono">
        <Icono size={20} />
      </span>

      <span className="acceso-boton-texto">
        <strong>{titulo}</strong>
        <small>{descripcion}</small>
      </span>

      <Copy size={18} className="acceso-boton-flecha" />
    </button>
  );
}

export default function AccesosRapidos() {
  const links = empresa.links || {};

  return (
    <section className="bloque accesos-rapidos">
      <div className="bloque-header">
        <div>
          <p className="mini oscuro">Sesión externa</p>
          <h2>Accesos rápidos DGI / BPS</h2>
        </div>
      </div>

      <div className="aviso-login-externo">
        <div className="aviso-login-icono">
          <KeyRound size={24} />
        </div>

        <div>
          <strong>Recordá iniciar sesión con Llave Digital.</strong>
          <p>
            Para usar los servicios en línea de DGI y BPS, primero iniciá sesión
            con Usuario gub.uy / Llave Digital. Luego estos accesos rápidos
            reutilizan la sesión activa del navegador durante un tiempo.
          </p>
        </div>
      </div>

      <div className="accesos-grid">
        <div className="accesos-columna">
          <div className="accesos-titulo organismo-dgi">
            <Landmark size={20} />
            <span>DGI / IVA</span>
          </div>

          <AccesoBoton
            icono={KeyRound}
            titulo="Login DGI"
            descripcion="Ingresar con Llave Digital"
            url={links.dgiLogin}
            variante="principal"
          />

          <AccesoBoton
            icono={ReceiptText}
            titulo="Adelantos de pago IVA"
            descripcion="Trabajar con ejercicios y anticipos"
            url={links.dgiAdelantosIVA}
          />

          <AccesoBoton
            icono={FileCheck2}
            titulo="Consulta declaración jurada IRPF"
            descripcion="Consulta de declaraciones presentadas"
            url={links.dgiConsultaDJIRPF}
          />

          <AccesoBoton
            icono={ShieldCheck}
            titulo="Certificado DGI"
            descripcion="Consultar o renovar certificado único"
            url={links.dgiCertificado}
          />
        </div>

        <div className="accesos-columna">
          <div className="accesos-titulo organismo-bps">
            <HeartPulse size={20} />
            <span>BPS / FONASA</span>
          </div>

          <AccesoBoton
            icono={KeyRound}
            titulo="Login BPS"
            descripcion="Ingresar a servicios en línea"
            url={links.bpsLogin}
            variante="principal verde"
          />

          <AccesoBoton
            icono={HeartPulse}
            titulo="Generar boleto FONASA"
            descripcion="Usar luego de iniciar sesión en BPS"
            url={links.fonasa}
          />

          <AccesoBoton
            icono={ShieldCheck}
            titulo="Certificado BPS"
            descripcion="Consulta de vigencia / renovación"
            url={links.bpsConsulta}
          />

          <AccionBoton
            icono={Copy}
            titulo="Script certificado BPS"
            descripcion="Copiar automatización Descargar Constancia"
            onClick={() => copiarTexto(SCRIPT_BPS_CERTIFICADO)}
          />
        </div>
      </div>
    </section>
  );
}
