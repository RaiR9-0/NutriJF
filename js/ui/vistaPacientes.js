import { crear, vaciar } from "./dom.js";
import { diagnosticar } from "../core/imc.js";
const SEXOS = { F: "Femenino", M: "Masculino", O: "Otro" };
function celdaAcciones(paciente, { alEditar, alEliminar }) {
  const editar = crear("button", {
    clase: "boton-linea",
    texto: "Editar",
    atributos: { type: "button" }
  });
  editar.addEventListener("click", () => alEditar(paciente.id));
  const eliminar = crear("button", {
    clase: "boton-linea boton-linea--peligro",
    texto: "Eliminar",
    atributos: { type: "button" }
  });
  eliminar.addEventListener("click", () => alEliminar(paciente.id));
  return crear("td", { clase: "columna-acciones" }, [editar, eliminar]);
}
export function pintarTabla(contenedor, pacientes, acciones) {
  vaciar(contenedor);
  if (pacientes.length === 0) {
    contenedor.appendChild(
      crear("p", { clase: "vacio", texto: "Todavía no hay pacientes en el expediente." })
    );
    return;
  }
  const encabezado = crear("thead", {}, [
    crear("tr", {}, [
      crear("th", { texto: "Paciente" }),
      crear("th", { texto: "Edad" }),
      crear("th", { texto: "Medidas" }),
      crear("th", { texto: "IMC" }),
      crear("th", { texto: "Diagnóstico" }),
      crear("th", { texto: "" })
    ])
  ]);
  const cuerpo = crear("tbody");
  pacientes.forEach((paciente) => {
    const rango = diagnosticar(paciente.imc);
    const etiqueta = crear("span", {
      clase: `etiqueta etiqueta--${paciente.diagnostico}`,
      texto: rango ? rango.etiqueta : "—"
    });
    cuerpo.appendChild(
      crear("tr", {}, [
        crear("td", {}, [
          crear("strong", { texto: paciente.nombre }),
          crear("small", { clase: "sub", texto: SEXOS[paciente.sexo] ?? "Otro" })
        ]),
        crear("td", { clase: "compacta", texto: `${paciente.edad} a` }),
        crear("td", { clase: "compacta", texto: `${paciente.estaturaCm} cm · ${paciente.pesoKg} kg` }),
        crear("td", { clase: "numero", texto: paciente.imc.toFixed(2) }),
        crear("td", {}, [etiqueta]),
        celdaAcciones(paciente, acciones)
      ])
    );
  });
  contenedor.appendChild(crear("table", { clase: "tabla" }, [encabezado, cuerpo]));
}
export function pintarOpciones(select, pacientes, { seleccionado = "", textoVacio } = {}) {
  const valorPrevio = seleccionado || select.value;
  vaciar(select);
  select.appendChild(
    crear("option", {
      texto: textoVacio ?? "Selecciona un paciente",
      atributos: { value: "" }
    })
  );
  pacientes.forEach((paciente) => {
    const opcion = crear("option", {
      texto: `${paciente.nombre} · IMC ${paciente.imc.toFixed(2)}`,
      atributos: { value: paciente.id }
    });
    select.appendChild(opcion);
  });
  select.value = pacientes.some((p) => p.id === valorPrevio) ? valorPrevio : "";
}
export function pintarResultado(contenedor, paciente, resultado) {
  vaciar(contenedor);
  contenedor.hidden = false;
  contenedor.appendChild(
    crear("div", { clase: "resultado__cabeza" }, [
      crear("span", { clase: "resultado__titulo", texto: paciente.nombre }),
      crear("span", {
        clase: `etiqueta etiqueta--${resultado.diagnostico}`,
        texto: resultado.etiqueta
      })
    ])
  );
  contenedor.appendChild(crear("p", { clase: "resultado__imc", texto: resultado.imc.toFixed(2) }));
  contenedor.appendChild(crear("p", { clase: "resultado__nota", texto: resultado.descripcion }));
  contenedor.appendChild(
    crear("p", {
      clase: "resultado__medidas",
      texto: `${paciente.edad} años · ${paciente.estaturaCm} cm · ${paciente.pesoKg} kg`
    })
  );
}
