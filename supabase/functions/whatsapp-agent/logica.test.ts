// Pruebas de la lógica del asistente de WhatsApp. Correr: node supabase/functions/whatsapp-agent/logica.test.ts
import {
  BAJA, RECHAZO, aWhatsApp, canonico, contextoWA, historiaParaModelo, hoyMX, procesar, textoDe, videosVigentes,
} from "./logica.ts";

let fallas = 0;
function ok(cond: boolean, nombre: string) {
  if (!cond) { fallas++; console.log("FALLA:", nombre); }
}

// Números
ok(canonico("5213312345678") === "523312345678", "quita el 1 viejo de celular");
ok(canonico("+52 33 1234 5678") === "523312345678", "limpia símbolos");
ok(canonico("14155550100") === "14155550100", "otros países sin cambio");

// Fecha de México
ok(hoyMX(new Date("2026-10-03T05:00:00Z")) === "2026-10-02", "antes de las 6 UTC sigue siendo ayer en México");

// Texto de cada tipo
ok(textoDe({ type: "text", text: { body: "Hola" } }) === "Hola", "texto");
ok(textoDe({ type: "interactive", interactive: { button_reply: { title: "Sí" } } }) === "Sí", "botón");
ok(textoDe({ type: "audio", audio: {} }) === "", "audio sin texto");

// Baja y rechazo
ok(BAJA.test("BAJA"), "baja");
ok(BAJA.test("no me escriban más"), "no me escriban");
ok(!BAJA.test("bajar de peso"), "«bajar» no es baja");
ok(RECHAZO.test("La verdad no me interesa, gracias"), "rechazo en medio");
ok(!RECHAZO.test("me interesa el taller"), "interés no es rechazo");

// Etiquetas
const antes = new Date("2026-10-05T18:00:00Z"), despues = new Date("2026-10-12T18:00:00Z");
let r = procesar("Claro, te mando un video corto.\n[VIDEO_APARTAR]", antes);
ok(r.videos.length === 1 && r.videos[0] === "VIDEO_APARTAR" && !r.texto.includes("["), "video vigente se manda y la etiqueta se borra");
r = procesar("Claro.\n[VIDEO_APARTAR]", despues);
ok(r.videos.length === 0 && !r.texto.includes("["), "video caducado no se manda");
r = procesar("Lo siento mucho.\n[APOYO]", antes);
ok(r.apoyo && !r.texto.includes("APOYO"), "crisis");
r = procesar("Listo, te escriben pronto.\n[HUMANO]", antes);
ok(r.humano && r.texto === "Listo, te escriben pronto.", "humano");
ok(videosVigentes(despues).length === 0 && videosVigentes(antes).length === 2, "vigencia de videos");

// Contexto
const c1 = contextoWA({ primero: true, alumno: false, ahora: antes });
ok(c1.includes("primer mensaje") && c1.includes("[VIDEO_APARTAR]") && !c1.includes("YA ES ALUMNA"), "contexto de primer mensaje");
const c2 = contextoWA({ primero: false, alumno: true, ahora: despues });
ok(c2.includes("YA ES ALUMNA") && !c2.includes("VIDEO_") && c2.includes("no te vuelvas a presentar"), "contexto de alumna, sin videos caducados");

// Formato de WhatsApp
ok(aWhatsApp("**Hola**\n## Título\n[inisch.com](https://www.inisch.com)") === "*Hola*\nTítulo\ninisch.com: https://www.inisch.com", "formato");
ok(aWhatsApp("x".repeat(5000)).length === 4000, "tope de largo");

// Historia
const h = historiaParaModelo([
  { rol: "asistente", texto: "hola" }, { rol: "usuario", texto: "a" }, { rol: "usuario", texto: "b" }, { rol: "asistente", texto: "c" },
]);
ok(h.length === 2 && h[0].role === "user" && h[0].content === "a\nb", "historia empieza con la persona y une turnos seguidos");

console.log(fallas ? `${fallas} FALLAS` : "TODO BIEN");
if (fallas) process.exit(1);
