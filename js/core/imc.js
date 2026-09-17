export function calcularImc(pesoKg, estaturaCm) {
  const metros = estaturaCm / 100;
  if (!Number.isFinite(pesoKg) || !Number.isFinite(metros) || metros <= 0) return null;
  return Number((pesoKg / (metros * metros)).toFixed(2));
}
const DIAGNOSTICOS = [
  {
    clave: "bajo",
    etiqueta: "Bajo peso",
    limite: 18.5,
    descripcion:
      "El índice está por debajo del rango saludable. Conviene una valoración nutricional para incrementar la ingesta calórica de forma controlada."
  },
  {
    clave: "normal",
    etiqueta: "Peso normal",
    limite: 25,
    descripcion:
      "El índice se encuentra dentro del rango saludable para la estatura registrada. Se sugiere mantener alimentación balanceada y actividad física regular."
  },
  {
    clave: "sobrepeso",
    etiqueta: "Sobrepeso",
    limite: 30,
    descripcion:
      "El índice indica sobrepeso. Se recomienda ajustar hábitos alimenticios, aumentar actividad física y programar consulta de seguimiento."
  },
  {
    clave: "obesidad",
    etiqueta: "Obesidad",
    limite: Infinity,
    descripcion:
      "El índice indica obesidad. Se recomienda iniciar plan nutricional supervisado y evaluación médica complementaria."
  }
];
export function diagnosticar(imc) {
  if (!Number.isFinite(imc)) return null;
  return DIAGNOSTICOS.find((rango) => imc < rango.limite) ?? null;
}
export function evaluar(pesoKg, estaturaCm) {
  const imc = calcularImc(pesoKg, estaturaCm);
  const diagnostico = diagnosticar(imc);
  if (imc === null || !diagnostico) return null;
  return { imc, diagnostico: diagnostico.clave, etiqueta: diagnostico.etiqueta, descripcion: diagnostico.descripcion };
}
export { DIAGNOSTICOS };
