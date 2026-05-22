import vencimientos2026 from "./2026";

export const vencimientosBPSPorAnio = {
  2026: vencimientos2026,
};

export function obtenerAnioBPSActivo() {
  const anioActual = new Date().getFullYear();

  if (vencimientosBPSPorAnio[anioActual]) {
    return anioActual;
  }

  return Math.max(...Object.keys(vencimientosBPSPorAnio).map(Number));
}

export function obtenerVencimientosBPS(anio = obtenerAnioBPSActivo()) {
  return vencimientosBPSPorAnio[anio] || null;
}

export default obtenerVencimientosBPS;
