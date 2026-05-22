import vencimientos2026 from "./2026";

export const vencimientosDGIPorAnio = {
  2026: vencimientos2026,
};

export function obtenerAnioDGIActivo() {
  const anioActual = new Date().getFullYear();

  if (vencimientosDGIPorAnio[anioActual]) {
    return anioActual;
  }

  return Math.max(...Object.keys(vencimientosDGIPorAnio).map(Number));
}

export function obtenerVencimientosDGI(anio = obtenerAnioDGIActivo()) {
  return vencimientosDGIPorAnio[anio] || [];
}

export default obtenerVencimientosDGI;
