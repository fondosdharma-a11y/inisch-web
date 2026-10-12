// Pruebas de la regla de inversion de los asistentes de INISCH. Correr: node supabase/functions/_shared/inversion.test.ts
import {
  INVERSION_CIERRE, INVERSION_TEXTO, INVERSION_TEXTO_EN, preguntaInversion, respuestaInversion,
} from "./inversion.ts";
import { sistemaINISCH } from "./conocimiento.ts";

let fallas = 0;
function ok(cond: boolean, nombre: string) {
  if (!cond) { fallas++; console.log("FALLA:", nombre); }
}

// Texto exacto de la regla de Fondos Dharma (CLAUDE.md §3)
ok(INVERSION_TEXTO === "Fondos Dharma no recibe inversiones del público; opera negocios propios y aliados. Tampoco damos asesoría de inversión. Si te interesa alguno de nuestros servicios para tu negocio, con gusto te ayudo.", "texto exacto");
ok(INVERSION_CIERRE === "Por este medio no puedo ayudarte con eso.", "cierre exacto");

// Sí son preguntas de inversión
for (const t of [
  "¿Puedo invertir en el Instituto?",
  "Quiero ser socia",
  "¿Fondos Dharma da rendimientos?",
  "me gustaría invertir con ustedes",
  "¿Puedo comprar acciones?",
  "¿Cuánto dan de rendimientos?",
  "¿Aceptan inversionistas?",
  "quiero poner mi dinero con ustedes",
]) ok(preguntaInversion(t) === "es", `detecta: ${t}`);
ok(preguntaInversion("Can I invest in your institute?") === "en", "detecta en inglés");

// No son preguntas de inversión (precio del programa o crecimiento personal)
for (const t of [
  "¿Cuál es la inversión del Taller?",
  "¿Cuánto tengo que invertir?",
  "Quiero invertir en mí",
  "quiero invertir en mi desarrollo personal",
  "¿La inversión total es de 8,500?",
  "Hola, quiero información del Taller",
  "Me gustaría invertir en el taller de noviembre",
  "¿El campus tiene lecciones en video?",
]) ok(preguntaInversion(t) === "", `no detecta: ${t}`);

// Respuesta fija e insistencia
ok(respuestaInversion("¿Puedo invertir en el Instituto?") === INVERSION_TEXTO, "primera vez: texto exacto");
ok(respuestaInversion("Pero sí quiero ser socia", [INVERSION_TEXTO]) === INVERSION_TEXTO, "segunda vez: repite una vez");
ok(respuestaInversion("¿Aceptan inversionistas?", [INVERSION_TEXTO, INVERSION_TEXTO]) === INVERSION_CIERRE, "tercera vez: cierre");
ok(respuestaInversion("Can I invest in your institute?") === INVERSION_TEXTO_EN, "inglés");
ok(respuestaInversion("¿Puedo invertir en el Instituto o inscribirme al Taller?") === null, "si también pide un programa, lo atiende el modelo");
ok(respuestaInversion("¿Cuánto cuesta el Taller?") === null, "pregunta normal: sin respuesta fija");

// Las instrucciones del modelo llevan la regla y nada en dólares
const sis = sistemaINISCH(new Date("2026-10-12T18:00:00Z"));
ok(sis.includes(INVERSION_TEXTO), "las instrucciones llevan el texto exacto");
ok(!/USD|d[oó]lares/i.test(sis.replace("no conviertas a dolares", "")), "las instrucciones no dan montos en dólares");

console.log(fallas ? `${fallas} FALLAS` : "TODO BIEN");
if (fallas) throw new Error(`${fallas} fallas`);
