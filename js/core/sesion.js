import { CLAVES, RUTAS } from "../config.js";
import { almacenPermanente, almacenDeSesion } from "./almacenamiento.js";
function leerUsuarios() {
  return almacenPermanente.leer(CLAVES.permanente.usuarios, {});
}
function guardarUsuarios(usuarios) {
  almacenPermanente.escribir(CLAVES.permanente.usuarios, usuarios);
}
export function registrarNutriologo({ usuario, nombre, contrasena }) {
  const clave = String(usuario || "").trim().toLowerCase();
  const nombreLimpio = String(nombre || "").trim();
  if (!clave || !nombreLimpio || !contrasena) {
    return { ok: false, mensaje: "Completa todos los campos." };
  }
  if (contrasena.length < 4) {
    return { ok: false, mensaje: "La contraseña debe tener al menos 4 caracteres." };
  }
  const usuarios = leerUsuarios();
  if (usuarios[clave]) {
    return { ok: false, mensaje: "Ese usuario ya está registrado." };
  }
  usuarios[clave] = {
    usuario: clave,
    nombre: nombreLimpio,
    contrasena,
    altaEn: new Date().toISOString()
  };
  guardarUsuarios(usuarios);
  return { ok: true, mensaje: "Usuario creado. Ya puedes iniciar sesión." };
}
export function iniciarSesion(usuario, contrasena) {
  const clave = String(usuario || "").trim().toLowerCase();
  const registro = leerUsuarios()[clave];
  if (!registro || registro.contrasena !== contrasena) {
    return { ok: false, mensaje: "Usuario o contraseña incorrectos." };
  }
  almacenDeSesion.escribir(CLAVES.deSesion.nutriologo, {
    usuario: registro.usuario,
    nombre: registro.nombre,
    entradaEn: new Date().toISOString()
  });
  return { ok: true, mensaje: "Acceso concedido." };
}
export function obtenerSesion() {
  return almacenDeSesion.leer(CLAVES.deSesion.nutriologo, null);
}
export function cerrarSesion() {
  almacenDeSesion.eliminar(CLAVES.deSesion.nutriologo);
}
export function exigirSesion() {
  const sesion = obtenerSesion();
  if (!sesion) {
    window.location.replace(RUTAS.acceso);
    return null;
  }
  return sesion;
}
export function saltarAlPanelSiHaySesion() {
  if (obtenerSesion()) {
    window.location.replace(RUTAS.panel);
    return true;
  }
  return false;
}
