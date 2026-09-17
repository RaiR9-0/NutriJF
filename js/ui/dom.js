export const $ = (selector, raiz = document) => raiz.querySelector(selector);
export function crear(etiqueta, opciones = {}, hijos = []) {
  const nodo = document.createElement(etiqueta);
  if (opciones.clase) nodo.className = opciones.clase;
  if (opciones.texto !== undefined) nodo.textContent = opciones.texto;
  if (opciones.atributos) {
    for (const [nombre, valor] of Object.entries(opciones.atributos)) {
      nodo.setAttribute(nombre, valor);
    }
  }
  hijos.filter(Boolean).forEach((hijo) => nodo.appendChild(hijo));
  return nodo;
}
export function vaciar(nodo) {
  while (nodo.firstChild) nodo.removeChild(nodo.firstChild);
}
export function avisar(contenedor, mensaje, tipo = "info") {
  contenedor.textContent = mensaje;
  contenedor.className = `aviso aviso--${tipo}`;
  contenedor.hidden = false;
  clearTimeout(contenedor.dataset.temporizador);
  const temporizador = setTimeout(() => {
    contenedor.hidden = true;
  }, 4000);
  contenedor.dataset.temporizador = String(temporizador);
}
export function limpiarAviso(contenedor) {
  contenedor.hidden = true;
  contenedor.textContent = "";
}
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];
export function formatearFecha(fechaIso) {
  const partes = String(fechaIso).split("-");
  if (partes.length !== 3) return fechaIso;
  const [anio, mes, dia] = partes.map(Number);
  return `${dia} de ${MESES[mes - 1]} de ${anio}`;
}
export function formatearHora(hora) {
  return hora ? `${hora} h` : "";
}
export function hoyIso() {
  const ahora = new Date();
  const desfase = ahora.getTimezoneOffset() * 60000;
  return new Date(ahora.getTime() - desfase).toISOString().slice(0, 10);
}
export function horaActual() {
  const ahora = new Date();
  return `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
}
