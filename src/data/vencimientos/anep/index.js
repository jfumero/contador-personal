import cronograma2026 from "./2026";

export const cronogramasANEPPorAnio = {
  2026: cronograma2026,
};

export function obtenerAnioANEPActivo() {
  const anioActual = new Date().getFullYear();

  if (cronogramasANEPPorAnio[anioActual]) {
    return anioActual;
  }

  return Math.max(...Object.keys(cronogramasANEPPorAnio).map(Number));
}

export function obtenerCronogramaANEP(anio = obtenerAnioANEPActivo()) {
  return cronogramasANEPPorAnio[anio] || [];
}

export default obtenerCronogramaANEP;
