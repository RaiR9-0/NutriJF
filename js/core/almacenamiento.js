function leerJson(almacen, clave, valorPorDefecto) {
  try {
    const crudo = almacen.getItem(clave);
    if (crudo === null) return valorPorDefecto;
    return JSON.parse(crudo);
  } catch (error) {
    console.warn(`No se pudo leer "${clave}", se usa el valor por defecto.`, error);
    return valorPorDefecto;
  }
}
function escribirJson(almacen, clave, valor) {
  try {
    almacen.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    console.error(`No se pudo guardar "${clave}".`, error);
    return false;
  }
}
function envolver(almacen) {
  return {
    leer: (clave, valorPorDefecto = null) => leerJson(almacen, clave, valorPorDefecto),
    escribir: (clave, valor) => escribirJson(almacen, clave, valor),
    eliminar: (clave) => almacen.removeItem(clave)
  };
}
export const almacenPermanente = envolver(window.localStorage);
export const almacenDeSesion = envolver(window.sessionStorage);
export function generarId(prefijo) {
  const marca = Date.now().toString(36);
  const azar = Math.random().toString(36).slice(2, 7);
  return `${prefijo}-${marca}-${azar}`;
}
export function aNumero(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}
