import obtenerVencimientosBPS, {
  obtenerAnioBPSActivo,
  vencimientosBPSPorAnio,
} from "./vencimientos/bps";

export const vencimientosBPS2026 = obtenerVencimientosBPS(2026);
export const vencimientosBPSActuales = obtenerVencimientosBPS(obtenerAnioBPSActivo());

export { obtenerVencimientosBPS, obtenerAnioBPSActivo, vencimientosBPSPorAnio };
