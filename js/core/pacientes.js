import { CLAVES } from "../config.js";
import { almacenPermanente, generarId } from "./almacenamiento.js";
import { evaluar } from "./imc.js";
function leerTodos() {
  const lista = almacenPermanente.leer(CLAVES.permanente.pacientes, []);
  return Array.isArray(lista) ? lista : [];
}
function guardarTodos(pacientes) {
  almacenPermanente.escribir(CLAVES.permanente.pacientes, pacientes);
}
export function listar() {
  return leerTodos().sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}
export function obtener(id) {
  return leerTodos().find((paciente) => paciente.id === id) ?? null;
}
export function comoMapa() {
  return new Map(leerTodos().map((paciente) => [paciente.id, paciente]));
}
function normalizar(datos) {
  return {
    nombre: String(datos.nombre || "").trim(),
    sexo: datos.sexo,
    edad: Number(datos.edad),
    estaturaCm: Number(datos.estaturaCm),
    pesoKg: Number(datos.pesoKg)
  };
}
function validar(datos) {
  if (!datos.nombre) return "Escribe el nombre del paciente.";
  if (!Number.isFinite(datos.edad) || datos.edad < 1 || datos.edad > 120) return "La edad debe estar entre 1 y 120 años.";
  if (!Number.isFinite(datos.estaturaCm) || datos.estaturaCm < 50 || datos.estaturaCm > 250) return "La estatura debe estar entre 50 y 250 cm.";
  if (!Number.isFinite(datos.pesoKg) || datos.pesoKg < 10 || datos.pesoKg > 400) return "El peso debe estar entre 10 y 400 kg.";
  return null;
}
export function registrar(datosCrudos) {
  const datos = normalizar(datosCrudos);
  const error = validar(datos);
  if (error) return { ok: false, mensaje: error };
  const resultado = evaluar(datos.pesoKg, datos.estaturaCm);
  const pacientes = leerTodos();
  const repetido = pacientes.some((p) => p.nombre.toLowerCase() === datos.nombre.toLowerCase());
  if (repetido) {
    return { ok: false, mensaje: "Ya existe un paciente con ese nombre. Usa el botón Editar de la tabla." };
  }
  const paciente = {
    id: generarId("pac"),
    ...datos,
    imc: resultado.imc,
    diagnostico: resultado.diagnostico,
    altaEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString()
  };
  pacientes.push(paciente);
  guardarTodos(pacientes);
  return { ok: true, paciente, resultado, mensaje: `Paciente ${paciente.nombre} registrado.` };
}
export function actualizar(id, datosCrudos) {
  const datos = normalizar(datosCrudos);
  const error = validar(datos);
  if (error) return { ok: false, mensaje: error };
  const pacientes = leerTodos();
  const indice = pacientes.findIndex((paciente) => paciente.id === id);
  if (indice === -1) return { ok: false, mensaje: "El paciente ya no existe." };
  const repetido = pacientes.some(
    (p) => p.id !== id && p.nombre.toLowerCase() === datos.nombre.toLowerCase()
  );
  if (repetido) return { ok: false, mensaje: "Otro paciente ya usa ese nombre." };
  const resultado = evaluar(datos.pesoKg, datos.estaturaCm);
  pacientes[indice] = {
    ...pacientes[indice],
    ...datos,
    imc: resultado.imc,
    diagnostico: resultado.diagnostico,
    actualizadoEn: new Date().toISOString()
  };
  guardarTodos(pacientes);
  return { ok: true, paciente: pacientes[indice], resultado, mensaje: `Expediente de ${datos.nombre} actualizado.` };
}
export function eliminar(id) {
  const pacientes = leerTodos().filter((paciente) => paciente.id !== id);
  guardarTodos(pacientes);
  return { ok: true };
}
