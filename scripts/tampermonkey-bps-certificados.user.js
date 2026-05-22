// ==UserScript==
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
    return `${el.value || ""} ${el.textContent || ""} ${el.title || ""} ${el.alt || ""}`
      .replace(/\s+/g, " ")
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
})();
