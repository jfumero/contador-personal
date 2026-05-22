import obtenerCronogramaANEP, {
  obtenerAnioANEPActivo,
  cronogramasANEPPorAnio,
} from "./vencimientos/anep";

export const cronogramaANEP2026 = obtenerCronogramaANEP(2026);
export const cronogramaANEPActual = obtenerCronogramaANEP(obtenerAnioANEPActivo());

export { obtenerCronogramaANEP, obtenerAnioANEPActivo, cronogramasANEPPorAnio };
