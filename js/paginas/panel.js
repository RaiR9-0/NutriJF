import { CLINICA, RUTAS } from "../config.js";
import { exigirSesion, cerrarSesion } from "../core/sesion.js";
import * as pacientes from "../core/pacientes.js";
import * as consultas from "../core/consultas.js";
import * as vistaPacientes from "../ui/vistaPacientes.js";
import { pintarHistorial } from "../ui/vistaConsultas.js";
import { $, avisar, limpiarAviso, hoyIso, horaActual, formatearFecha } from "../ui/dom.js";
const estado = {
  nutriologo: null,
  pacienteEnEdicion: null,
  consultaEnEdicion: null,
  filtroPaciente: ""
};
const formaPaciente = $("#forma-paciente");
const formaConsulta = $("#forma-consulta");
const avisoPaciente = $("#aviso-paciente");
const avisoConsulta = $("#aviso-consulta");
const filtro = $("#filtro-paciente");
function refrescar() {
  const lista = pacientes.listar();
  const mapa = pacientes.comoMapa();
  vistaPacientes.pintarTabla($("#tabla-pacientes"), lista, {
    alEditar: editarPaciente,
    alEliminar: eliminarPaciente
  });
  vistaPacientes.pintarOpciones($("#consulta-paciente"), lista, {
    seleccionado: formaConsulta.dataset.pacienteSeleccionado || ""
  });
  vistaPacientes.pintarOpciones(filtro, lista, {
    seleccionado: estado.filtroPaciente,
    textoVacio: "Todos los pacientes"
  });
  const historial = consultas.listar({ pacienteId: estado.filtroPaciente || null });
  pintarHistorial($("#historial"), historial, mapa, {
    idEnEdicion: estado.consultaEnEdicion,
    alEditar: editarConsulta,
    alEliminar: eliminarConsulta
  });
  const hoy = hoyIso();
  $("#dato-pacientes").textContent = String(lista.length);
  $("#dato-consultas").textContent = String(consultas.contar());
  $("#dato-hoy").textContent = String(
    consultas.listar().filter((consulta) => consulta.fecha === hoy).length
  );
}
function leerFormaPaciente() {
  return {
    nombre: $("#paciente-nombre").value,
    edad: $("#paciente-edad").value,
    sexo: $("#paciente-sexo").value,
    estaturaCm: $("#paciente-estatura").value,
    pesoKg: $("#paciente-peso").value
  };
}
function salirDeEdicionPaciente() {
  estado.pacienteEnEdicion = null;
  formaPaciente.reset();
  $("#boton-paciente").textContent = "Guardar paciente y calcular IMC";
  $("#cancelar-paciente").hidden = true;
  $("#editando-paciente").hidden = true;
}
function guardarPaciente(evento) {
  evento.preventDefault();
  const datos = leerFormaPaciente();
  const resultado = estado.pacienteEnEdicion
    ? pacientes.actualizar(estado.pacienteEnEdicion, datos)
    : pacientes.registrar(datos);
  if (!resultado.ok) {
    avisar(avisoPaciente, resultado.mensaje, "error");
    return;
  }
  vistaPacientes.pintarResultado($("#resultado-imc"), resultado.paciente, resultado.resultado);
  avisar(avisoPaciente, resultado.mensaje, "exito");
  salirDeEdicionPaciente();
  refrescar();
}
function editarPaciente(id) {
  const paciente = pacientes.obtener(id);
  if (!paciente) return;
  estado.pacienteEnEdicion = id;
  $("#paciente-nombre").value = paciente.nombre;
  $("#paciente-edad").value = paciente.edad;
  $("#paciente-sexo").value = paciente.sexo;
  $("#paciente-estatura").value = paciente.estaturaCm;
  $("#paciente-peso").value = paciente.pesoKg;
  $("#boton-paciente").textContent = "Guardar cambios";
  $("#cancelar-paciente").hidden = false;
  $("#editando-paciente").hidden = false;
  $("#editando-paciente").textContent = `Editando el expediente de ${paciente.nombre}.`;
  $("#paciente-nombre").focus();
}
function eliminarPaciente(id) {
  const paciente = pacientes.obtener(id);
  if (!paciente) return;
  const cuantas = consultas.listar({ pacienteId: id }).length;
  const detalle = cuantas > 0 ? ` Se borrarán también sus ${cuantas} consulta(s).` : "";
  if (!window.confirm(`¿Dar de baja a ${paciente.nombre}?${detalle}`)) return;
  consultas.eliminarPorPaciente(id);
  pacientes.eliminar(id);
  if (estado.pacienteEnEdicion === id) salirDeEdicionPaciente();
  if (estado.filtroPaciente === id) estado.filtroPaciente = "";
  $("#resultado-imc").hidden = true;
  avisar(avisoPaciente, `${paciente.nombre} fue dado de baja.`, "exito");
  refrescar();
}
function leerFormaConsulta() {
  return {
    pacienteId: $("#consulta-paciente").value,
    fecha: $("#consulta-fecha").value,
    hora: $("#consulta-hora").value,
    evolucion: $("#consulta-evolucion").value,
    plan: $("#consulta-plan").value
  };
}
function salirDeEdicionConsulta() {
  estado.consultaEnEdicion = null;
  formaConsulta.reset();
  delete formaConsulta.dataset.pacienteSeleccionado;
  $("#consulta-fecha").value = hoyIso();
  $("#consulta-hora").value = horaActual();
  $("#boton-consulta").textContent = "Agregar al historial";
  $("#cancelar-consulta").hidden = true;
  $("#editando-consulta").hidden = true;
}
function guardarConsulta(evento) {
  evento.preventDefault();
  const datos = leerFormaConsulta();
  const resultado = estado.consultaEnEdicion
    ? consultas.actualizar(estado.consultaEnEdicion, datos)
    : consultas.registrar(datos, estado.nutriologo);
  if (!resultado.ok) {
    avisar(avisoConsulta, resultado.mensaje, "error");
    return;
  }
  avisar(avisoConsulta, resultado.mensaje, "exito");
  salirDeEdicionConsulta();
  refrescar();
}
function editarConsulta(id) {
  const consulta = consultas.obtener(id);
  if (!consulta) return;
  estado.consultaEnEdicion = id;
  formaConsulta.dataset.pacienteSeleccionado = consulta.pacienteId;
  $("#consulta-paciente").value = consulta.pacienteId;
  $("#consulta-fecha").value = consulta.fecha;
  $("#consulta-hora").value = consulta.hora;
  $("#consulta-evolucion").value = consulta.evolucion;
  $("#consulta-plan").value = consulta.plan;
  const paciente = pacientes.obtener(consulta.pacienteId);
  $("#boton-consulta").textContent = "Guardar cambios";
  $("#cancelar-consulta").hidden = false;
  $("#editando-consulta").hidden = false;
  $("#editando-consulta").textContent =
    `Editando la consulta de ${paciente ? paciente.nombre : "paciente dado de baja"} del ${formatearFecha(consulta.fecha)}.`;
  refrescar();
  $("#consulta-evolucion").focus();
}
function eliminarConsulta(id) {
  if (!window.confirm("¿Eliminar esta consulta del historial?")) return;
  consultas.eliminar(id);
  if (estado.consultaEnEdicion === id) salirDeEdicionConsulta();
  avisar(avisoConsulta, "Consulta eliminada.", "exito");
  refrescar();
}
function iniciarPanel(nutriologo) {
  estado.nutriologo = nutriologo;
  document.documentElement.classList.remove("verificando");
  $("#marca-nombre").textContent = CLINICA.nombre;
  $("#marca-iniciales").textContent = CLINICA.iniciales;
  $("#nutriologo-nombre").textContent = nutriologo.nombre;
  $("#fecha-hoy").textContent = formatearFecha(hoyIso());
  $("#salir").addEventListener("click", () => {
    cerrarSesion();
    window.location.replace(RUTAS.acceso);
  });
  formaPaciente.addEventListener("submit", guardarPaciente);
  $("#cancelar-paciente").addEventListener("click", () => {
    salirDeEdicionPaciente();
    limpiarAviso(avisoPaciente);
  });
  formaConsulta.addEventListener("submit", guardarConsulta);
  $("#cancelar-consulta").addEventListener("click", () => {
    salirDeEdicionConsulta();
    limpiarAviso(avisoConsulta);
    refrescar();
  });
  filtro.addEventListener("change", () => {
    estado.filtroPaciente = filtro.value;
    refrescar();
  });
  $("#consulta-fecha").value = hoyIso();
  $("#consulta-hora").value = horaActual();
  refrescar();
}
const sesionActiva = exigirSesion();
if (sesionActiva) iniciarPanel(sesionActiva);
