export const obligacionesIniciales = [
    {
        id: crypto.randomUUID(),
        titulo: "IVA bimestral",
        tipo: "DGI",
        fechaVencimiento: "2026-06-25",
        estado: "pendiente",
        notas: "Verificar vencimiento oficial en DGI.",
    },
{
    id: crypto.randomUUID(),
    titulo: "Certificado común BPS",
    tipo: "BPS",
    fechaVencimiento: "2026-07-10",
    estado: "pendiente",
    notas: "Revisar vigencia en portal BPS.",
},
{
    id: crypto.randomUUID(),
    titulo: "Certificado DGI",
    tipo: "DGI",
    fechaVencimiento: "2026-07-15",
    estado: "pendiente",
    notas: "Verificar fecha oficial en DGI.",
},
];
