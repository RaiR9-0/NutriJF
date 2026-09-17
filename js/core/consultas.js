import { CLAVES } from "../config.js";
import { almacenPermanente, generarId } from "./almacenamiento.js";
function leerTodas() {
  const lista = almacenPermanente.leer(CLAVES.permanente.consultas, []);
  return Array.isArray(lista) ? lista : [];
}
function guardarTodas(consultas) {
  almacenPermanente.escribir(CLAVES.permanente.consultas, consultas);
}
function momento(consulta) {
  const valor = new Date(`${consulta.fecha}T${consulta.hora || "00:00"}`).getTime();
  return Number.isFinite(valor) ? valor : 0;
}
export function listar({ pacienteId = null } = {}) {
  return leerTodas()
    .filter((consulta) => !pacienteId || consulta.pacienteId === pacienteId)
    .sort((a, b) => momento(b) - momento(a) || b.registradoEn.localeCompare(a.registradoEn));
}
export function obtener(id) {
  return leerTodas().find((consulta) => consulta.id === id) ?? null;
}
export function contar() {
  return leerTodas().length;
}
function normalizar(datos) {
  return {
    pacienteId: String(datos.pacienteId || ""),
    fecha: String(datos.fecha || ""),
    hora: String(datos.hora || ""),
    evolucion: String(datos.evolucion || "").trim(),
    plan: String(datos.plan || "").trim()
  };
}
function validar(datos) {
  if (!datos.pacienteId) return "Selecciona el paciente de la consulta.";
  if (!datos.fecha) return "Indica la fecha de la consulta.";
  if (!datos.hora) return "Indica la hora de la consulta.";
  if (!datos.evolucion) return "Describe la evolución del paciente.";
  if (!datos.plan) return "Captura el plan de alimentación.";
  return null;
}
export function registrar(datosCrudos, nutriologo) {
  const datos = normalizar(datosCrudos);
  const error = validar(datos);
  if (error) return { ok: false, mensaje: error };
  const consultas = leerTodas();
  consultas.push({
    id: generarId("con"),
    ...datos,
    atendidoPor: nutriologo?.nombre ?? "Sin identificar",
    registradoEn: new Date().toISOString()
  });
  guardarTodas(consultas);
  return { ok: true, mensaje: "Consulta agregada al historial." };
}
export function actualizar(id, datosCrudos) {
  const datos = normalizar(datosCrudos);
  const error = validar(datos);
  if (error) return { ok: false, mensaje: error };
  const consultas = leerTodas();
  const indice = consultas.findIndex((consulta) => consulta.id === id);
  if (indice === -1) return { ok: false, mensaje: "La consulta ya no existe." };
  consultas[indice] = {
    ...consultas[indice],
    ...datos,
    editadoEn: new Date().toISOString()
  };
  guardarTodas(consultas);
  return { ok: true, mensaje: "Consulta actualizada." };
}
export function eliminar(id) {
  guardarTodas(leerTodas().filter((consulta) => consulta.id !== id));
  return { ok: true };
}
export function eliminarPorPaciente(pacienteId) {
  const consultas = leerTodas();
  const restantes = consultas.filter((consulta) => consulta.pacienteId !== pacienteId);
  guardarTodas(restantes);
  return consultas.length - restantes.length;
}
