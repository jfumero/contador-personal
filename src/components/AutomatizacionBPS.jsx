import { useState } from "react";
import { empresa } from "../data/empresa";
import {
    obtenerPeriodoFonasaActual,
    obtenerFechaPagoSugerida,
} from "../utils/fonasa";

const STORAGE_KEY = "contador_personal_fonasa_config";

export default function AutomatizacionBPS() {
    const periodoSugerido = obtenerPeriodoFonasaActual();
    const fechaPagoSugerida = obtenerFechaPagoSugerida();

    const [config, setConfig] = useState(() => {
        const guardado = localStorage.getItem(STORAGE_KEY);

        if (guardado) {
            return JSON.parse(guardado);
        }

        return {
            empresa: empresa.empresaBPS,
            rut: empresa.rut,
            documento: empresa.ci,
            nacimiento: "04/12/1976",
            periodo: periodoSugerido.periodo,
            impuesto: "IRPF",
            monto: "88114",
            fechaPago: fechaPagoSugerida,
            aporteMinimo: true,
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

    const jsonConfig = JSON.stringify(config, null, 2);
    const bloqueData = `const DATA = ${JSON.stringify(config, null, 2)};`;

    return (
        <section className="bloque bloque-automatizacion">
        <div className="bloque-header">
        <div>
        <p className="mini oscuro">Automatización BPS</p>
        <h2>Motor FONASA</h2>
        </div>

        <button className="boton-secundario" onClick={abrirBPS}>
        Abrir BPS
        </button>
        </div>

        <p className="nota">
        Configurá los datos de la factura FONASA. Luego copiá el bloque DATA
        para usarlo en Tampermonkey.
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
        onChange={(e) => actualizar("documento", e.target.value)}
        />
        </label>

        <label>
        Fecha nacimiento
        <input
        value={config.nacimiento}
        onChange={(e) => actualizar("nacimiento", e.target.value)}
        />
        </label>

        <label>
        Período
        <input
        value={config.periodo}
        onChange={(e) => actualizar("periodo", e.target.value)}
        />
        </label>

        <label>
        Impuesto
        <select
        value={config.impuesto}
        onChange={(e) => actualizar("impuesto", e.target.value)}
        >
        <option value="IRPF">IRPF</option>
        <option value="IRAE">IRAE</option>
        </select>
        </label>

        <label>
        Monto facturado sin IVA
        <input
        value={config.monto}
        onChange={(e) => actualizar("monto", e.target.value)}
        />
        </label>

        <label>
        Fecha de pago
        <input
        value={config.fechaPago}
        onChange={(e) => actualizar("fechaPago", e.target.value)}
        />
        </label>
        </div>

        <div className="checks">
        <label>
        <input
        type="checkbox"
        checked={config.aporteMinimo}
        onChange={(e) => actualizar("aporteMinimo", e.target.checked)}
        />
        Corresponde pagar aporte mínimo
        </label>

        <label>
        <input
        type="checkbox"
        checked={config.autoAvanzar}
        onChange={(e) => actualizar("autoAvanzar", e.target.checked)}
        />
        Avanzar automáticamente
        </label>

        <label>
        <input
        type="checkbox"
        checked={config.autoConfirmar}
        onChange={(e) => actualizar("autoConfirmar", e.target.checked)}
        />
        Confirmar automáticamente
        </label>

        <label>
        <input
        type="checkbox"
        checked={config.autoDescargarPDF}
        onChange={(e) => actualizar("autoDescargarPDF", e.target.checked)}
        />
        Descargar PDF automáticamente
        </label>
        </div>

        <div className="acciones-automatizacion">
        <button onClick={() => copiar(jsonConfig)}>
        Copiar configuración JSON
        </button>

        <button onClick={() => copiar(bloqueData)}>
        Copiar bloque DATA
        </button>
        </div>

        <pre className="preview-config">{jsonConfig}</pre>
        </section>
    );
}
