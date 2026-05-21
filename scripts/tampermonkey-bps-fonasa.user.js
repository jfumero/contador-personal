// ==UserScript==
// @name         BPS - FONASA AUTO FULL
// @namespace    bps-fonasa-auto
// @version      1.5
// @description  Automatiza flujo completo FONASA BPS
// @match        https://*.bps.gub.uy/*
// @match        https://serviciosenlinea.bps.gub.uy/*
// @include      https://serviciosenlinea.bps.gub.uy/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    console.log("FONASA AUTO cargado en:", location.href);

    const CONFIG = {
        empresa: "3688078",
        rut: "214105600019",
        documento: "38539916",
        nacimiento: "04/12/1976",
        impuesto: "IRPF",
        monto: "88114",
        usarMesAnteriorAutomatico: true,
        periodoManual: "",
        autoAvanzar: true,
        autoConfirmar: true,
        autoDescargarPDF: true,
    };

    let donePaso1 = false;
    let donePaso2 = false;
    let donePaso3 = false;
    let donePaso4 = false;

    function ev(el, type) {
        el.dispatchEvent(new Event(type, { bubbles: true }));
    }

    function setVal(id, value) {
        const el = document.getElementById(id);
        if (!el) return false;

        el.focus();
        el.value = value;
        ev(el, "input");
        ev(el, "change");
        ev(el, "blur");

        return true;
    }

    function clickByText(textos) {
        const btn = [...document.querySelectorAll("input, button, a")].find((el) => {
            const txt = `${el.value || ""} ${el.textContent || ""} ${
                el.title || ""
            }`.toLowerCase();

            return textos.some((t) => txt.includes(t));
        });

        if (btn) {
            btn.click();
            return true;
        }

        return false;
    }

    function prevMonth() {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);

        return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    }

    function obtenerPeriodo() {
        if (!CONFIG.usarMesAnteriorAutomatico && CONFIG.periodoManual) {
            return CONFIG.periodoManual;
        }

        return prevMonth();
    }

    function runPaso1() {
        if (donePaso1) return false;

        const empresa = document.getElementById("frmBasico:txtEmpresat");
        const rut = document.getElementById("frmBasico:txtRut");
        const doc = document.getElementById("frmBasico:txtDocumento");
        const nac = document.getElementById("frmBasico:txtFechaNac");

        if (!empresa || !rut || !doc || !nac) return false;

        console.log("Ejecutando Paso 1");

        setVal("frmBasico:txtEmpresat", CONFIG.empresa);
        setVal("frmBasico:txtRut", CONFIG.rut);
        setVal("frmBasico:txtDocumento", CONFIG.documento);
        setVal("frmBasico:txtFechaNac", CONFIG.nacimiento);

        donePaso1 = true;

        if (CONFIG.autoAvanzar) {
            setTimeout(() => {
                clickByText(["siguiente", "continuar"]);
            }, 1000);
        }

        return true;
    }

    function runPaso2() {
        if (donePaso2) return false;

        const desde = document.getElementById("frmBasico:txtFechaDesde");
        const hasta = document.getElementById("frmBasico:txtFechaHasta");

        if (!desde || !hasta) return false;

        console.log("Ejecutando Paso 2");

        const radio = document.getElementById("frmBasico:rad25:0");

        if (radio && !radio.checked) {
            radio.click();
            ev(radio, "change");
        }

        const fecha = obtenerPeriodo();

        setVal("frmBasico:txtFechaDesde", fecha);
        setVal("frmBasico:txtFechaHasta", fecha);

        donePaso2 = true;

        if (CONFIG.autoAvanzar) {
            setTimeout(() => {
                clickByText(["siguiente", "continuar"]);
            }, 1000);
        }

        return true;
    }

    function runPaso3() {
        if (donePaso3) return false;

        const impuesto = document.getElementById("frmBasico:impuesto");
        if (!impuesto) return false;

        console.log("Ejecutando Paso 3");

        if (impuesto.value !== CONFIG.impuesto) {
            impuesto.focus();
            impuesto.value = CONFIG.impuesto;

            const e = document.createEvent("HTMLEvents");
            e.initEvent("change", true, true);
            impuesto.dispatchEvent(e);

            setTimeout(runPaso3, 2500);
            return true;
        }

        const monto =
        document.querySelector(
            'input[name="frmBasico:rptLineasNOPROF:0:j_id67"]'
        ) ||
        document.querySelector(
            'input[name^="frmBasico:rptLineasNOPROF"][class*="inputDecimal"]'
        );

        if (!monto) {
            console.log("Esperando campo monto...");
            setTimeout(runPaso3, 1500);
            return true;
        }

        monto.focus();
        monto.value = CONFIG.monto;
        ev(monto, "keyup");
        ev(monto, "input");
        ev(monto, "change");
        monto.blur();

        try {
            if (typeof window.recalcular === "function") {
                window.recalcular(CONFIG.monto, "_1noProfImporte");
            }
        } catch (e) {
            console.warn("No se pudo ejecutar recalcular:", e);
        }

        donePaso3 = true;

        if (CONFIG.autoConfirmar) {
            setTimeout(() => {
                const frm = document.getElementById("frmBasico");

                if (frm && window.mojarra && window.mojarra.jsfcljs) {
                    try {
                        if (typeof window.showEspere === "function") window.showEspere();
                    } catch (e) {
                        console.warn("No se pudo ejecutar showEspere:", e);
                    }

                    window.mojarra.jsfcljs(
                        frm,
                        { "frmBasico:j_id89": "frmBasico:j_id89" },
                        ""
                    );
                } else {
                    clickByText(["confirmar anticipos fonasa", "confirmar"]);
                }
            }, 1200);
        }

        return true;
    }

    function runPaso4() {
        if (donePaso4) return false;

        const btn = [...document.querySelectorAll("a.btnGrande, a")].find((a) =>
        /imprimir|descargar.*pdf|pdf/i.test(`${a.title || ""} ${a.textContent || ""}`)
        );

        if (!btn) return false;

        console.log("Ejecutando Paso 4");

        donePaso4 = true;

        if (CONFIG.autoDescargarPDF) {
            setTimeout(() => {
                btn.click();
            }, 1000);
        }

        return true;
    }

    function detectar() {
        runPaso1() || runPaso2() || runPaso3() || runPaso4();
    }

    setInterval(detectar, 800);
})();
