import obtenerVencimientosDGI, {
  obtenerAnioDGIActivo,
  vencimientosDGIPorAnio,
} from "./vencimientos/dgi";

export const vencimientosDGI2026 = obtenerVencimientosDGI(2026);
export const vencimientosDGIActuales = obtenerVencimientosDGI(obtenerAnioDGIActivo());

export { obtenerVencimientosDGI, obtenerAnioDGIActivo, vencimientosDGIPorAnio };
