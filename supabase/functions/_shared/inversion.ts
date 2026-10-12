// ============================================================
// INISCH - Regla de Fondos Dharma para los asistentes publicos del grupo (2026-10-07)
// ============================================================
// La misma de Chispa, Omni y Lia (workers/obrerai-agente/src/inversion.js en el repo del holding).
// A quien pregunte si puede invertir, ser socio, poner dinero, comprar acciones o recibir rendimientos
// en Fondos Dharma, en el Instituto o en cualquier empresa del grupo, el asistente contesta el TEXTO EXACTO;
// si insiste, lo repite UNA vez; a la tercera, el cierre. No pide ni guarda datos por ese motivo y no
// avisa a nadie: solo suma +1 al contador diario «preguntas_inversion» (fecha y asistente).
// Propio de INISCH: «invertir en mi», «la inversion del Taller» o «cuanto tengo que invertir» son
// el precio o el crecimiento personal, no una pregunta de inversion.
// ============================================================

export const INVERSION_TEXTO = "Fondos Dharma no recibe inversiones del público; opera negocios propios y aliados. Tampoco damos asesoría de inversión. Si te interesa alguno de nuestros servicios para tu negocio, con gusto te ayudo.";
export const INVERSION_CIERRE = "Por este medio no puedo ayudarte con eso.";
export const INVERSION_TEXTO_EN = "Fondos Dharma does not accept investments from the public; it runs its own and partner businesses. We don't give investment advice either. If you're interested in any of our services for your business, I'm happy to help.";
export const INVERSION_CIERRE_EN = "I can't help you with that through this channel.";

/** La regla para las INSTRUCCIONES del modelo (sitio y WhatsApp), con la frase exacta. */
export const REGLA_INVERSION = `
=== REGLA DE FONDOS DHARMA (no se rompe) ===
Si alguien pregunta si puede invertir, ser socio, poner dinero, comprar acciones o recibir rendimientos en Fondos Dharma, en el Instituto o en cualquier empresa del grupo, responde EXACTAMENTE: «${INVERSION_TEXTO}» (en ingles: «${INVERSION_TEXTO_EN}»). Luego cierra el tema: sin explicaciones, sin preguntar montos, sin prometer contacto y sin recomendar donde invertir. Si insiste, repite UNA vez la misma frase y regresa a los programas; si insiste otra vez, responde solo: «${INVERSION_CIERRE}». Por ese motivo NO pides ni guardas datos personales y no lo pasas con una persona del Instituto. Ojo: «la inversion» del Taller es su precio, e «invertir en mi» es crecimiento personal; eso lo atiendes normal.
`;

const sinAcentos = (t: string) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Espanol (sin acentos, minusculas). La pregunta tiene que ser sobre NOSOTROS o en primera persona.
const GRUPO = "(ustedes|su empresa|sus empresas|el grupo|su grupo|el instituto|inisch|forja( labs)?|obrerai|omnistudio|likealia|quantify)";
const ES: RegExp[] = [
  /\b(puedo|podria|podemos|podriamos|quiero|queremos|quisiera|quisieramos|me gustaria|nos gustaria|aceptan|reciben|buscan|admiten)\b[^.?!\n]{0,40}\b(invertir|invertirle|inversionistas?|soci[oa]s? (capitalistas?|inversionistas?)|ser (su |un )?soci[oa]s?|hacerme (su )?soci[oa]|aportar (capital|dinero)|accionistas?|participacion accionaria)\b/,
  new RegExp(`\\b(invertir|invertirle|invierto|invertimos)\\b[^.?!\\n]{0,40}\\b${GRUPO}\\b`),
  new RegExp(`\\b${GRUPO}\\b[^.?!\\n]{0,60}\\b(invertir|inversionistas?|soci[oa]s? capitalistas?|accionistas?|rendimientos?|dividendos?)\\b`),
  /\b(fondos? )?dharma\b[^.?!\n]{0,60}\b(invertir|inversion(es)?|inversionistas?|soci[oa]s?|accionistas?|acciones|rendimientos?|dividendos?|capital|ganancias)\b/,
  /\b(invertir|inversion(es)?|inversionistas?|soci[oa]s?|accionistas?|acciones|rendimientos?|dividendos?|capital|ganancias)\b[^.?!\n]{0,60}\b(fondos? )?dharma\b/,
  /\b(ser|hacerme|volverme|entrar como) (su |un |tu )?soci[oa]s?\b/,
  /\b(buscan|aceptan|admiten|reciben|necesitan) (nuevos |mas )?(soci[oa]s|inversionistas|inversion|capital)\b/,
  /\bcomprar (sus |unas |)acciones\b/,
  /\b(dan|ofrecen|pagan|garantizan|prometen|generan)\b[^.?!\n]{0,20}\b(rendimientos?|dividendos?|intereses)\b/,
  /\b(rendimientos?|dividendos?)\b[^.?!\n]{0,20}\b(dan|ofrecen|pagan|garantizan|prometen|generan|tienen)\b/,
  /\b(poner|meter|aportar) (mi|nuestro|el|un|algo de|su)? ?(dinero|capital|lana) (con|en) (ustedes|su empresa|el grupo|el instituto)\b/,
];
// No es pregunta sobre nosotros: el precio («cuanto tengo que invertir», «la inversion del Taller»),
// el crecimiento personal («invertir en mi») o un programa del Instituto.
const NO_ES: RegExp[] = [
  /\b(cuanto|que tanto|cuanta|cual)\b[^.?!\n]{0,30}\b(invertir|inversion)\b/,
  /\binvert\w*\b[^.?!\n]{0,25}\b(en mi|en mi mism[oa]|en mi persona|en uno mismo|en mi (desarrollo|crecimiento|formacion|salud|bienestar|proceso|vida|familia)|en el (taller|diplomado|retiro|campus|curso|programa)|en la (certificacion|consulta|formacion))\b/,
  /\binversion (total|del (taller|diplomado|retiro|campus|curso|programa)|de la (certificacion|consulta|formacion))\b/,
];
const EN: RegExp[] = [
  /\b(can i|could i|how (do|can) i|i want to|i'd like to|we'd like to|do you (accept|take)|are you (looking|seeking))\b[^.?!\n]{0,40}\b(invest|investors?|shareholders?|equity)\b/,
  /\binvest(ing)? (in|with) (you|your company|your institute|inisch|fondos dharma|dharma|forja|obrerai|the group)\b/,
  /\b(buy|purchase) (your )?shares\b/,
  /\bbecome (a|your) partner\b/,
  /\b(do you|you) (offer|give|pay|guarantee)\b[^.?!\n]{0,20}\b(returns|dividends?|yield)\b/,
  /\b(returns|dividends?|yield)\b[^.?!\n]{0,20}\b(do you|you) (offer|give|pay|guarantee)\b/,
];

/** ¿El mensaje pregunta por invertir en el grupo? Devuelve "es", "en" o "" (no). */
export function preguntaInversion(texto: string): "es" | "en" | "" {
  const t = sinAcentos(texto);
  if (!t.trim()) return "";
  if (NO_ES.some((r) => r.test(t)) && !/dharma/.test(t)) return "";
  if (ES.some((r) => r.test(t))) return "es";
  if (EN.some((r) => r.test(t))) return "en";
  return "";
}

// Si el mismo mensaje tambien pregunta por un programa, no se contesta en automatico: el modelo aplica
// la regla (la frase exacta) y ademas lo atiende.
const PIDE_PROGRAMA = /\b(taller|diplomado|especialista|instructor|certificacion|campus|retiro|tulum|consulta|sesion|acompanamiento|programa|inscrib\w*|curso|workshop|diploma|retreat|portal)\b/;

/** Respuesta fija (sin IA) o null. `previas` = respuestas del asistente en esta platica (para la insistencia). */
export function respuestaInversion(texto: string, previas: string[] = [], lang = ""): string | null {
  const idioma = preguntaInversion(texto);
  if (!idioma || PIDE_PROGRAMA.test(sinAcentos(texto))) return null;
  const en = lang ? lang === "en" : idioma === "en";
  const ya = previas.filter((m) => /no recibe inversiones del p[uú]blico|does not accept investments from the public/.test(String(m || ""))).length;
  if (ya >= 2) return en ? INVERSION_CIERRE_EN : INVERSION_CIERRE;
  return en ? INVERSION_TEXTO_EN : INVERSION_TEXTO;
}

/**
 * +1 al contador diario (sin datos personales): tabla contador_diario por la funcion sumar_contador
 * (fecha de Mexico la pone la base). asistente: inisch_sitio | inisch_whatsapp. Nunca truena la respuesta.
 */
export async function contarPreguntaInversion(asistente: string): Promise<void> {
  const url = Deno.env.get("SUPABASE_URL"), llave = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !llave) return;
  try {
    const r = await fetch(`${url}/rest/v1/rpc/sumar_contador`, {
      method: "POST",
      headers: { "content-type": "application/json", apikey: llave, authorization: `Bearer ${llave}` },
      body: JSON.stringify({ p_nombre: "preguntas_inversion", p_asistente: asistente }),
    });
    if (!r.ok) console.error("contador (inversion):", r.status, (await r.text()).slice(0, 200));
  } catch (e) {
    console.error("contador (inversion):", (e as Error).message);
  }
}
