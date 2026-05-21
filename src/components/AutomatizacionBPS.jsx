import { useState } from "react";
import { empresa } from "../data/empresa";
import {
    obtenerPeriodoFonasaActual,
    obtenerFechaPagoSugerida,
} from "../utils/fonasa";

const STORAGE_KEY = "contador_personal_fonasa_config";

function fechaNacimientoDDMMYYYY(fechaISO) {
    if (!fechaISO) return "04/12/1976";

    const partes = fechaISO.split("-");

    if (partes.length !== 3) return fechaISO;

    const [anio, mes, dia] = partes;
    return `${dia}/${mes}/${anio}`;
}

function generarScriptTampermonkey(config) {
    return `// ==UserScript==
    // @name         BPS - FONASA AUTO FULL
    // @namespace    bps-fonasa-auto
    // @version      1.6
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

const CONFIG = ${JSON.stringify(
    {
        empresa: config.empresa,
        rut: config.rut,
        documento: config.documento,
        nacimiento: config.nacimiento,
        impuesto: config.impuesto,
        monto: config.monto,
        usarMesAnteriorAutomatico: config.usarMesAnteriorAutomatico,
        periodoManual: config.periodo,
        autoAvanzar: config.autoAvanzar,
        autoConfirmar: config.autoConfirmar,
        autoDescargarPDF: config.autoDescargarPDF,
    },
    null,
    4
)};

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
        const txt = \`\${el.value || ""} \${el.textContent || ""} \${el.title || ""}\`.toLowerCase();
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

    return \`\${String(d.getMonth() + 1).padStart(2, "0")}/\${d.getFullYear()}\`;
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
    /imprimir|descargar.*pdf|pdf/i.test(\`\${a.title || ""} \${a.textContent || ""}\`)
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
    })();`;
}

export default function AutomatizacionBPS() {
    const periodoSugerido = obtenerPeriodoFonasaActual();
    const fechaPagoSugerida = obtenerFechaPagoSugerida();

    const [config, setConfig] = useState(() => {
        const guardado = localStorage.getItem(STORAGE_KEY);

        if (guardado) {
            try {
                return {
                    usarMesAnteriorAutomatico: true,
                    autoAvanzar: true,
                    autoConfirmar: true,
                    autoDescargarPDF: true,
                    impuesto: "IRPF",
                    ...JSON.parse(guardado),
                };
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }

        return {
            empresa: empresa.empresaBPS,
            rut: empresa.rut,
            documento: empresa.ci,
            nacimiento: fechaNacimientoDDMMYYYY(empresa.fechaNacimiento),
                                         periodo: periodoSugerido.periodo,
                                         impuesto: "IRPF",
                                         monto: "88114",
                                         fechaPago: fechaPagoSugerida,
                                         aporteMinimo: true,
                                         usarMesAnteriorAutomatico: true,
                                         autoAvanzar: true,
                                         autoConfirmar: true,
                                         autoDescargarPDF: true,
        };
    });

    function actualizar(campo, valor) {
        const nuevo = {
            ...config,
            [campo]: valor,
        };

        setConfig(nuevo);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevo));
    }

    async function copiar(texto) {
        try {
            await navigator.clipboard.writeText(texto);
            alert("Copiado.");
        } catch {
            alert("No se pudo copiar. Copialo manualmente.");
        }
    }

    function abrirBPS() {
        window.open(empresa.links.fonasa, "_blank", "noopener,noreferrer");
    }

    const scriptCompleto = generarScriptTampermonkey(config);

    return (
        <section className="bloque bloque-automatizacion">
        <div className="bloque-header">
        <div>
        <p className="mini oscuro">Automatización BPS</p>
        <h2>Generador FONASA para PC</h2>
        </div>

        <button className="boton-secundario" onClick={abrirBPS}>
        Abrir BPS
        </button>
        </div>

        <p className="nota">
        Este módulo está pensado para usar en computadora con
        Tampermonkey. La app solo prepara el script; la generación real
        del boleto se hace dentro de la web de BPS.
        </p>

        <div className="automatizacion-grid">
        <label>
        Empresa BPS
        <input
        value={config.empresa}
        onChange={(e) => actualizar("empresa", e.target.value)}
        />
        </label>

        <label>
        RUT
        <input
        value={config.rut}
        onChange={(e) => actualizar("rut", e.target.value)}
        />
        </label>

        <label>
        Documento
        <input
        value={config.documento}
        onChange={(e) =>
            actualizar("documento", e.target.value)
        }
        />
        </label>

        <label>
        Fecha nacimiento
        <input
        value={config.nacimiento}
        onChange={(e) =>
            actualizar("nacimiento", e.target.value)
        }
        />
        </label>

        <label>
        Período
        <input
        value={config.periodo}
        onChange={(e) => actualizar("periodo", e.target.value)}
        disabled={config.usarMesAnteriorAutomatico}
        />
        </label>

        <label>
        Monto facturado sin IVA
        <input
        value={config.monto}
        onChange={(e) => actualizar("monto", e.target.value)}
        />
        </label>
        </div>

        <div className="acciones-automatizacion">
        <button onClick={() => copiar(scriptCompleto)}>
        Copiar script Tampermonkey
        </button>

        <button onClick={abrirBPS}>Abrir BPS</button>
        </div>

        <details style={{ marginTop: "18px" }}>
        <summary
        style={{
            cursor: "pointer",
            fontWeight: 900,
            color: "#344054",
        }}
        >
        Opciones avanzadas
        </summary>

        <div className="checks">
        <label>
        <input
        type="checkbox"
        checked={config.aporteMinimo}
        onChange={(e) =>
            actualizar("aporteMinimo", e.target.checked)
        }
        />
        Corresponde pagar aporte mínimo
        </label>

        <label>
        <input
        type="checkbox"
        checked={config.usarMesAnteriorAutomatico}
        onChange={(e) =>
            actualizar(
                "usarMesAnteriorAutomatico",
                e.target.checked
            )
        }
        />
        Usar mes anterior automáticamente
        </label>

        <label>
        <input
        type="checkbox"
        checked={config.autoAvanzar}
        onChange={(e) =>
            actualizar("autoAvanzar", e.target.checked)
        }
        />
        Avanzar automáticamente
        </label>

        <label>
        <input
        type="checkbox"
        checked={config.autoConfirmar}
        onChange={(e) =>
            actualizar("autoConfirmar", e.target.checked)
        }
        />
        Confirmar automáticamente
        </label>

        <label>
        <input
        type="checkbox"
        checked={config.autoDescargarPDF}
        onChange={(e) =>
            actualizar(
                "autoDescargarPDF",
                e.target.checked
            )
        }
        />
        Descargar PDF automáticamente
        </label>
        </div>

        <div className="automatizacion-grid">
        <label>
        Impuesto
        <select
        value={config.impuesto}
        onChange={(e) =>
            actualizar("impuesto", e.target.value)
        }
        >
        <option value="IRPF">IRPF</option>
        <option value="IRAE">IRAE</option>
        </select>
        </label>

        <label>
        Fecha de pago
        <input
        value={config.fechaPago}
        onChange={(e) =>
            actualizar("fechaPago", e.target.value)
        }
        />
        </label>
        </div>

        <pre className="preview-config">
        {JSON.stringify(config, null, 2)}
        </pre>
        </details>
        </section>
    );
}
