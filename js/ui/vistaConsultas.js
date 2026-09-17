import { crear, vaciar, formatearFecha, formatearHora } from "./dom.js";
function bloque(titulo, contenido) {
  return crear("div", { clase: "nota__bloque" }, [
    crear("span", { clase: "nota__rotulo", texto: titulo }),
    crear("p", { clase: "nota__texto", texto: contenido })
  ]);
}
function acciones(consulta, { alEditar, alEliminar }) {
  const editar = crear("button", {
    clase: "boton-linea",
    texto: "Editar",
    atributos: { type: "button" }
  });
  editar.addEventListener("click", () => alEditar(consulta.id));
  const eliminar = crear("button", {
    clase: "boton-linea boton-linea--peligro",
    texto: "Eliminar",
    atributos: { type: "button" }
  });
  eliminar.addEventListener("click", () => alEliminar(consulta.id));
  return crear("div", { clase: "nota__acciones" }, [editar, eliminar]);
}
export function pintarHistorial(contenedor, consultas, mapaPacientes, opciones) {
  vaciar(contenedor);
  if (consultas.length === 0) {
    contenedor.appendChild(
      crear("p", { clase: "vacio", texto: "Sin consultas registradas para este filtro." })
    );
    return;
  }
  consultas.forEach((consulta) => {
    const paciente = mapaPacientes.get(consulta.pacienteId);
    const nombre = paciente ? paciente.nombre : "Paciente dado de baja";
    const articulo = crear("article", {
      clase: `nota${consulta.id === opciones.idEnEdicion ? " nota--editando" : ""}`
    });
    articulo.appendChild(
      crear("header", { clase: "nota__cabeza" }, [
        crear("div", {}, [
          crear("h4", { clase: "nota__paciente", texto: nombre }),
          crear("span", {
            clase: "nota__fecha",
            texto: `${formatearFecha(consulta.fecha)} · ${formatearHora(consulta.hora)}`
          })
        ]),
        paciente
          ? crear("span", {
              clase: `etiqueta etiqueta--${paciente.diagnostico}`,
              texto: `IMC ${paciente.imc.toFixed(2)}`
            })
          : crear("span", { clase: "etiqueta etiqueta--huerfana", texto: "Sin expediente" })
      ])
    );
    articulo.appendChild(bloque("Evolución", consulta.evolucion));
    articulo.appendChild(bloque("Plan de alimentación", consulta.plan));
    const pie = crear("footer", { clase: "nota__pie" }, [
      crear("small", {
        texto: `Atendió: ${consulta.atendidoPor}${consulta.editadoEn ? " · editada" : ""}`
      }),
      acciones(consulta, opciones)
    ]);
    articulo.appendChild(pie);
    contenedor.appendChild(articulo);
  });
}
