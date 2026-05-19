const BACKUP_KEYS = [
  "contador_personal_obligaciones",
  "contador_personal_iva_pagos",
  "contador_personal_anep_facturas",
  "contador_personal_fonasa_config",
  "contador_personal_alert_secret",
];

function generarNombreArchivo() {
  const fecha = new Date().toISOString().slice(0, 10);
  return `contador-personal-backup-${fecha}.json`;
}

function descargarArchivo(nombre, contenido) {
  const blob = new Blob([contenido], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = nombre;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function BackupDatos() {
  function exportarBackup() {
    const datos = {
      app: "contador-personal",
      version: 1,
      fechaExportacion: new Date().toISOString(),
      datos: {},
    };

    BACKUP_KEYS.forEach((key) => {
      const valor = localStorage.getItem(key);

      if (valor !== null) {
        datos.datos[key] = valor;
      }
    });

    descargarArchivo(generarNombreArchivo(), JSON.stringify(datos, null, 2));
  }

  function importarBackup(evento) {
    const archivo = evento.target.files?.[0];

    if (!archivo) return;

    const lector = new FileReader();

    lector.onload = () => {
      try {
        const backup = JSON.parse(lector.result);

        if (backup.app !== "contador-personal" || !backup.datos) {
          alert("El archivo no parece ser un backup válido de Contador Personal.");
          evento.target.value = "";
          return;
        }

        const confirma = confirm(
          "Esto va a reemplazar los datos guardados en este navegador. ¿Querés continuar?"
        );

        if (!confirma) {
          evento.target.value = "";
          return;
        }

        Object.entries(backup.datos).forEach(([key, value]) => {
          if (BACKUP_KEYS.includes(key)) {
            localStorage.setItem(key, value);
          }
        });

        alert("Backup importado correctamente. La app se va a recargar.");
        window.location.reload();
      } catch (error) {
        alert("No se pudo importar el backup: " + error.message);
      } finally {
        evento.target.value = "";
      }
    };

    lector.readAsText(archivo);
  }

  return (
    <section className="bloque bloque-backup">
      <div className="bloque-header">
        <div>
          <p className="mini oscuro">Respaldo local</p>
          <h2>Backup de datos</h2>
          <p className="nota">
            Exporta o importa obligaciones, IVA, facturación ANEP, configuración FONASA y clave interna local.
          </p>
        </div>
      </div>

      <div className="backup-acciones">
        <button type="button" onClick={exportarBackup}>
          Exportar backup JSON
        </button>

        <label className="boton-importar">
          Importar backup JSON
          <input type="file" accept="application/json" onChange={importarBackup} />
        </label>
      </div>

      <p className="nota">
        Guardá este archivo en un lugar seguro. No lo compartas si contiene tu ALERT_SECRET.
      </p>
    </section>
  );
}
