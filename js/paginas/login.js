import { CLINICA, RUTAS } from "../config.js";
import { iniciarSesion, registrarNutriologo, saltarAlPanelSiHaySesion } from "../core/sesion.js";
import { $, avisar, limpiarAviso } from "../ui/dom.js";
if (!saltarAlPanelSiHaySesion()) {
  document.documentElement.classList.remove("verificando");
}
$("#marca-nombre").textContent = CLINICA.nombre;
$("#marca-iniciales").textContent = CLINICA.iniciales;
$("#anio").textContent = String(new Date().getFullYear());
const panelAcceso = $("#panel-acceso");
const panelAlta = $("#panel-alta");
const aviso = $("#aviso-acceso");
function mostrar(seccion) {
  limpiarAviso(aviso);
  const esAlta = seccion === "alta";
  panelAcceso.hidden = esAlta;
  panelAlta.hidden = !esAlta;
  (esAlta ? $("#alta-nombre") : $("#acceso-usuario")).focus();
}
$("#ir-a-alta").addEventListener("click", () => mostrar("alta"));
$("#ir-a-acceso").addEventListener("click", () => mostrar("acceso"));
$("#forma-acceso").addEventListener("submit", (evento) => {
  evento.preventDefault();
  const resultado = iniciarSesion($("#acceso-usuario").value, $("#acceso-contrasena").value);
  if (!resultado.ok) {
    avisar(aviso, resultado.mensaje, "error");
    $("#acceso-contrasena").value = "";
    return;
  }
  window.location.replace(RUTAS.panel);
});
$("#forma-alta").addEventListener("submit", (evento) => {
  evento.preventDefault();
  const contrasena = $("#alta-contrasena").value;
  if (contrasena !== $("#alta-confirmar").value) {
    avisar(aviso, "Las contraseñas no coinciden.", "error");
    return;
  }
  const resultado = registrarNutriologo({
    usuario: $("#alta-usuario").value,
    nombre: $("#alta-nombre").value,
    contrasena
  });
  if (!resultado.ok) {
    avisar(aviso, resultado.mensaje, "error");
    return;
  }
  const usuarioCreado = $("#alta-usuario").value.trim().toLowerCase();
  $("#forma-alta").reset();
  mostrar("acceso");
  $("#acceso-usuario").value = usuarioCreado;
  avisar(aviso, resultado.mensaje, "exito");
});
