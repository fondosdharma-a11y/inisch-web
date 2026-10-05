// ============================================================
// INISCH - Asistente de WhatsApp: logica pura (sin red ni base de datos)
// ============================================================
// Separada de index.ts para poder probarla en local (node logica.test.ts).
// Patrones tomados de Chispa (workers/obrerai-agente/src/whatsapp.js), ya probados con Meta.
// ============================================================

export const HUMANO = "523314701563";           // WhatsApp del Instituto: ahí atiende una persona
export const MAX_DIA = 40;                      // mensajes atendidos por número al día (freno de costo)
export const MAX_HISTORIA = 20;                 // 10 idas y vueltas
export const VENTANA_HORAS = 24;                // la ventana de servicio de WhatsApp también es de 24 h

/** Videos que el asistente puede mandar con una etiqueta. Cada uno deja de ofrecerse cuando caduca:
 *  los dos hablan del Taller del 10 y 11 de octubre y de los precios de la promoción. */
export const VIDEOS: Record<string, { link: string; caption: string; hasta: string; nombre: string }> = {
  VIDEO_APARTAR: {
    link: "https://www.inisch.com/assets/video/como-apartar.mp4",
    caption: "Así se aparta tu lugar en el Taller Intensivo, paso a paso.",
    hasta: "2026-10-04",   // dicen 10 y 11 de octubre: el Taller pasó al 21-22 de noviembre
    nombre: "Cómo apartar tu lugar",
  },
  VIDEO_TALLER: {
    link: "https://www.inisch.com/assets/video/taller-octubre.mp4",
    caption: "La invitación al Taller Intensivo del 10 y 11 de octubre.",
    hasta: "2026-10-04",   // dicen 10 y 11 de octubre: el Taller pasó al 21-22 de noviembre
    nombre: "Invitación al Taller",
  },
};

export const BAJA = /^\s*(baja|alto|stop|cancelar|dejar de recibir|no me (escriban|escribas|manden|mandes)|ya no (me )?(escriban|escribas|manden|mandes))(?![a-záéíóúñ])/i;
// Rechazo explícito en cualquier parte del mensaje (lección de Chispa, 2026-10-02: a un «no me interesa» se le siguió vendiendo)
export const RECHAZO = /no (me|nos) interesa|no (estoy|estamos) interesad|qui[eé]n (les|le|te) dio (mi|nuestro) n[uú]mero|no (quiero|queremos) (nada|informaci[oó]n|recibir|que me escriban)|no (me|nos) (vuelvan|vuelvas) a (escribir|contactar|molestar)|d[eé]jen(me|nos)? de (escribir|molestar)/i;

/** 5213312345678 → 523312345678 (sin el 1 viejo de celular de México). */
export function canonico(numero: string): string {
  const d = String(numero || "").replace(/\D/g, "");
  return d.length === 13 && d.startsWith("521") ? "52" + d.slice(3) : d;
}

/** Fecha de hoy en hora de México (UTC−6, sin horario de verano). */
export function hoyMX(ahora: Date = new Date()): string {
  return new Date(ahora.getTime() - 6 * 3600e3).toISOString().slice(0, 10);
}

/** Texto de un mensaje de texto, de un botón o de una respuesta rápida; "" si es audio, imagen, etc. */
export function textoDe(msg: any): string {
  if (!msg) return "";
  if (msg.type === "text") return String(msg.text?.body || "");
  if (msg.type === "button") return String(msg.button?.text || msg.button?.payload || "");
  if (msg.type === "interactive") {
    const i = msg.interactive || {};
    return String(i.button_reply?.title || i.list_reply?.title || "");
  }
  return "";
}

export function videosVigentes(ahora: Date = new Date()): string[] {
  const hoy = hoyMX(ahora);
  return Object.entries(VIDEOS).filter(([, v]) => hoy <= v.hasta).map(([k]) => k);
}

/** Lo que se agrega a las instrucciones del Instituto cuando la plática es por WhatsApp. */
export function contextoWA(o: { primero: boolean; alumno: boolean; ahora?: Date; abierto?: boolean }): string {
  const videos = videosVigentes(o.ahora);
  let s =
    "\n\n=== CONTEXTO DE ESTA CONVERSACION ===\n" +
    "La persona te escribe por WhatsApp al numero del asistente de INISCH (no esta en el sitio web). Eres un asistente de inteligencia artificial del Instituto, no una persona. " +
    (o.primero
      ? "Es su primer mensaje: presentate en una linea como el asistente virtual del Instituto (IA) y dile que, si prefiere hablar con una persona, se la conectas cuando quiera. "
      : "Ya te presentaste antes: no te vuelvas a presentar. ") +
    "Escribe como en WhatsApp: mensajes cortos (2 a 4 parrafos breves como maximo), sin titulos, tablas ni listas largas; para resaltar usa *asterisco sencillo*, nunca doble. " +
    "Escribe los enlaces completos (https://...), sin formato de markdown. " +
    "En este numero solo contestas tu: nunca digas que una persona contesta en este mismo chat. Una persona del Instituto atiende en otro WhatsApp: +52 33 1470 1563 (https://wa.me/" + HUMANO + ").\n" +
    "UNA PERSONA: si pide hablar con alguien, que le llamen, factura, reembolso, una queja, o algo que no este en tu informacion, ofrecele dos caminos: " +
    "que escriba al WhatsApp del Instituto (dale el enlace), o que una persona del Instituto le escriba a ella. Para lo segundo preguntale si esta de acuerdo en que compartamos su numero con el equipo para eso. " +
    "SOLO cuando diga que si, confirma en una linea que le escribiran pronto (sin prometer hora) y pon la etiqueta [HUMANO] en una linea aparte al final.\n" +
    "Nunca te corrijas a ti mismo dentro del mensaje: manda el texto ya limpio y definitivo.\n" +
    "LISTA DE ESPERA: " + (o.abierto === false
      ? "la proxima generacion del Taller todavia no tiene fecha. Si le interesa el Taller, ofrecele anotarle en la lista de espera para avisarle por este WhatsApp en cuanto haya fecha. "
      : "si le interesa el Taller pero no puede en la fecha vigente, ofrecele anotarle en la lista de espera de la siguiente generacion. ") +
    "Preguntale si esta de acuerdo en que guardemos su numero solo para avisarle de la fecha. SOLO cuando diga que si, confirma en una linea que le avisaremos por aqui y pon la etiqueta [LISTA_ESPERA] en una linea aparte al final. Nunca inventes una fecha.";
  if (videos.length) {
    s += "\nVIDEOS (se mandan solos si pones la etiqueta en una linea aparte al final; cada uno una sola vez por conversacion):";
    if (videos.includes("VIDEO_APARTAR")) s += " si pregunta como inscribirse, apartar o pagar el Taller, pon [VIDEO_APARTAR];";
    if (videos.includes("VIDEO_TALLER")) s += " si quiere conocer de que se trata el Taller, pon [VIDEO_TALLER];";
    s += " avisa en tu texto que le mandas un video corto.";
  }
  if (o.alumno) {
    s += "\n\n=== ESTA PERSONA YA ES ALUMNA DEL INSTITUTO ===\n" +
      "(Dato interno: ya pago un programa. No lo recites ni digas como lo sabes.) No le ofrezcas ni le vendas nada. " +
      "Ayudale con su campus: entra en https://inisch.com/campus con el mismo correo con que pago; ahi estan sus lecciones con video, Mi Pelicula, la Bitacora y su practica. " +
      "Para fechas, sede, acceso, factura o cualquier tema de su programa, ofrecele que una persona del Instituto le escriba (mismo procedimiento con [HUMANO]).";
  }
  return s;
}

/** Saca las etiquetas del texto del modelo y dice qué hacer con ellas. */
export function procesar(crudo: string, ahora: Date = new Date()) {
  const t = String(crudo || "");
  const vigentes = videosVigentes(ahora);
  const videos = Object.keys(VIDEOS).filter((k) => t.includes(`[${k}]`) && vigentes.includes(k));
  const texto = t.replace(/\[(APOYO|CONSULTA|HUMANO|LISTA_ESPERA|VIDEO_[A-Z]+)\]/g, "").trim();
  return {
    texto,
    apoyo: /\[APOYO\]/.test(t),
    consulta: /\[CONSULTA\]/.test(t),
    humano: /\[HUMANO\]/.test(t),
    lista: /\[LISTA_ESPERA\]/.test(t),
    videos,
  };
}

/** De dónde llegó la persona: si escribió desde un anuncio de Facebook o Instagram con botón de WhatsApp,
 *  Meta manda `referral` en su primer mensaje. Se guarda para saber qué anuncio trae conversaciones (sin datos de la persona). */
export function origenDe(msg: any): Record<string, string> | null {
  const r = msg?.referral;
  if (!r || typeof r !== "object") return null;
  const o: Record<string, string> = { tipo: String(r.source_type || "referral") };
  for (const k of ["source_id", "source_url", "headline", "media_type", "ctwa_clid"]) {
    if (r[k]) o[k] = String(r[k]).slice(0, 300);
  }
  return o;
}

/** Formato de WhatsApp: *negritas sencillas*, sin títulos ni enlaces de markdown, tope de 4,096 caracteres. */
export function aWhatsApp(texto: string): string {
  return String(texto || "")
    .replace(/\*\*(.+?)\*\*/g, "*$1*")
    .replace(/__(.+?)__/g, "_$1_")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_m, t, u) => (t.trim() === u ? u : `${t}: ${u}`))
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 4000);
}

/** Historia de la base → mensajes para el modelo: empieza con la persona y no repite turnos seguidos del mismo rol. */
export function historiaParaModelo(filas: { rol: string; texto: string }[]) {
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (const f of filas.slice(-MAX_HISTORIA)) {
    const role = f.rol === "asistente" ? "assistant" : "user";
    const content = String(f.texto || "").slice(0, 1500);
    if (!content) continue;
    if (out.length && out[out.length - 1].role === role) out[out.length - 1].content += "\n" + content;
    else out.push({ role, content });
  }
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

/** Resumen corto para el aviso al Jefe: lo último que escribió la persona. */
export function resumen(filas: { rol: string; texto: string }[]): string {
  return filas.filter((f) => f.rol === "usuario").slice(-4).map((f) => f.texto).join(" / ").slice(0, 700);
}
