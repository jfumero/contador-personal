import {
  ExternalLink,
  FileCheck2,
  HeartPulse,
  KeyRound,
  Landmark,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { empresa } from "../data/empresa";

function abrirLink(url) {
  if (!url) {
    alert("Este enlace todavía no está configurado.");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

function AccesoBoton({ icono: Icono, titulo, descripcion, url, variante = "normal" }) {
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
        </div>
      </div>
    </section>
  );
}
