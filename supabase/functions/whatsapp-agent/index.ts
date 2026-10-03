// ============================================================
// INISCH - Asistente de IA en WhatsApp (API oficial de Meta)
// ============================================================
// Número PROPIO del asistente, en el portafolio de Fondos Dharma (decisiones del Jefe, 2026-10-03).
// El WhatsApp del Instituto (33 1470 1563) queda para Isabel y los alumnos: ahí atiende una persona.
// v1: solo RESPONDE a quien escribe (no escribe primero, no usa plantillas).
//
// GET  → verificación del webhook (hub.mode, hub.verify_token, hub.challenge)
// POST → mensajes entrantes. Se contesta 200 de inmediato y la respuesta sale en segundo plano.
//
// Secretos (sin ellos el webhook responde 503 y no hace nada; los pone el Jefe en Supabase → Edge Functions → Secrets):
//   WA_TOKEN            token permanente del usuario del sistema de Meta
//   WA_APP_SECRET       clave secreta de la app de Meta (valida la firma de cada aviso)
//   WA_VERIFY_TOKEN     palabra para verificar el webhook (la misma que se escribe en Meta)
//   WA_PHONE_NUMBER_ID  identificador del número en la API de WhatsApp
//   WA_API_VERSION      opcional (v25.0 por defecto)
//   ANTHROPIC_API_KEY / ANTHROPIC_WORKSPACE_ID  los mismos del chat del sitio
// Datos: tablas wa_chats, wa_mensajes y wa_avisos (solo service_role). Los avisos los lee la tarea
// programada inisch-whatsapp-avisos y se los manda al Jefe.
// ============================================================

import { createClient } from "jsr:@supabase/supabase-js@2";
import { SYSTEM_INISCH } from "../_shared/conocimiento.ts";
import {
  BAJA, HUMANO, MAX_DIA, MAX_HISTORIA, RECHAZO, VENTANA_HORAS, VIDEOS,
  aWhatsApp, canonico, contextoWA, historiaParaModelo, hoyMX, procesar, resumen, textoDe,
} from "./logica.ts";

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void };

const env = (k: string) => Deno.env.get(k) || "";
const VERSION = () => env("WA_API_VERSION") || "v25.0";

function listo(): boolean {
  return Boolean(env("WA_TOKEN") && env("WA_APP_SECRET") && env("WA_VERIFY_TOKEN") &&
                 env("WA_PHONE_NUMBER_ID") && env("ANTHROPIC_API_KEY"));
}

async function hmac(secreto: string, cuerpo: string): Promise<string> {
  const llave = await crypto.subtle.importKey("raw", new TextEncoder().encode(secreto),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const firma = await crypto.subtle.sign("HMAC", llave, new TextEncoder().encode(cuerpo));
  return [...new Uint8Array(firma)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function huella(numeroCanonico: string): Promise<string> {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("wa|" + numeroCanonico));
  return [...new Uint8Array(h)].slice(0, 16).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function mandar(para: string, cuerpo: Record<string, unknown>): Promise<boolean> {
  const r = await fetch(`https://graph.facebook.com/${VERSION()}/${env("WA_PHONE_NUMBER_ID")}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env("WA_TOKEN")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: para, ...cuerpo }),
  });
  if (!r.ok) console.error("whatsapp: envío falló", r.status, (await r.text()).slice(0, 300));
  return r.ok;
}

async function marcarLeido(id: string) {
  await fetch(`https://graph.facebook.com/${VERSION()}/${env("WA_PHONE_NUMBER_ID")}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env("WA_TOKEN")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", status: "read", message_id: id }),
  }).catch(() => {});
}

async function generar(mensajes: unknown[], sistema: string): Promise<string> {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env("ANTHROPIC_API_KEY"),
      "anthropic-version": "2023-06-01",
      // Igual que sales-chat: workspace «Default» de Fondos Dharma si no hay secreto (no es secreto)
      "anthropic-workspace-id": env("ANTHROPIC_WORKSPACE_ID") || "wrkspc_01LyujcwYfyx185ZjRP8Qmzm",
    },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 700, system: sistema, messages: mensajes }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const data = await r.json();
  return (data.content || []).filter((c: any) => c.type === "text").map((c: any) => c.text).join("\n").trim();
}

const SB = () => createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });

/** ¿Ya pagó algún programa? Se cruza su número con los pagos que guardó el webhook de Stripe. */
async function esAlumno(sb: any, numero: string): Promise<boolean> {
  const diez = numero.slice(-10);
  if (diez.length < 10) return false;
  const { count } = await sb.from("pagos").select("id", { count: "exact", head: true })
    .eq("estado", "pagado").ilike("whatsapp", `%${diez}`);
  return (count || 0) > 0;
}

async function avisar(sb: any, h: string, motivo: string, extra: Record<string, unknown>) {
  const { error } = await sb.from("wa_avisos").insert({ huella: h, motivo, ...extra });
  if (error) console.error("whatsapp: no se guardó el aviso", motivo, error.message);
}

async function atender(sb: any, msg: any) {
  const para = String(msg.from || "");
  const numero = canonico(para);
  if (!numero) return;
  const h = await huella(numero);
  const texto = textoDe(msg);

  // Fila de la plática (por huella, nunca por número)
  let { data: chat } = await sb.from("wa_chats").select("*").eq("huella", h).maybeSingle();
  if (!chat) {
    const ins = await sb.from("wa_chats").insert({ huella: h, perfil: String(msg.nombre || "").slice(0, 80) || null })
      .select("*").single();
    chat = ins.data || { huella: h, estado: "bot", es_alumno: null, dia: null, n_dia: 0 };
  }

  // Guardar lo que escribió; si Meta reintenta el mismo mensaje, el wamid repetido lo frena aquí
  const { error: dup } = await sb.from("wa_mensajes")
    .insert({ huella: h, rol: "usuario", texto: (texto || `[${msg.type || "mensaje"} sin texto]`).slice(0, 4000), wamid: msg.id });
  if (dup) { if (String(dup.code) !== "23505") console.error("whatsapp: no se guardó el mensaje", dup.message); return; }
  await marcarLeido(msg.id);

  if (BAJA.test(texto) || RECHAZO.test(texto)) {
    await sb.from("wa_chats").update({ estado: "baja", actualizado: new Date().toISOString() }).eq("huella", h);
    const despedida = RECHAZO.test(texto)
      ? "Entendido, una disculpa por la molestia. No te volveremos a escribir. Que te vaya muy bien."
      : "Listo, no te volveremos a enviar mensajes. Si algún día quieres retomarlo, con escribirnos aquí basta.";
    if (await mandar(para, { type: "text", text: { body: despedida } })) {
      await sb.from("wa_mensajes").insert({ huella: h, rol: "asistente", texto: despedida });
    }
    return;
  }

  if (!texto) {
    await mandar(para, { type: "text", text: { body:
      "Por ahora solo puedo leer mensajes de texto. ¿Me lo escribes? Si prefieres hablar con una persona del Instituto: https://wa.me/" + HUMANO } });
    return;
  }

  // Freno de costo por día (hora de México)
  const hoy = hoyMX();
  const n = chat.dia === hoy ? (chat.n_dia || 0) : 0;
  await sb.from("wa_chats").update({
    estado: "bot", dia: hoy, n_dia: n + 1, actualizado: new Date().toISOString(),
    ...(msg.nombre ? { perfil: String(msg.nombre).slice(0, 80) } : {}),
  }).eq("huella", h);
  if (n >= MAX_DIA) {
    if (n === MAX_DIA) await mandar(para, { type: "text", text: { body:
      "Por hoy ya no puedo seguir contestando aquí. Para continuar con una persona del Instituto: https://wa.me/" + HUMANO } });
    return;
  }

  // ¿Ya es alumna? (se revisa una vez por número)
  let alumno = chat.es_alumno;
  if (alumno === null || alumno === undefined) {
    alumno = await esAlumno(sb, numero).catch(() => false);
    await sb.from("wa_chats").update({ es_alumno: alumno }).eq("huella", h);
  }

  // Historia de las últimas 24 h
  const desde = new Date(Date.now() - VENTANA_HORAS * 3600e3).toISOString();
  const { data: filasDesc } = await sb.from("wa_mensajes").select("rol, texto, creado")
    .eq("huella", h).gte("creado", desde).order("creado", { ascending: false }).limit(MAX_HISTORIA);
  const filas = (filasDesc || []).reverse();
  const primero = !filas.some((f: any) => f.rol === "asistente");
  const sistema = SYSTEM_INISCH + contextoWA({ primero, alumno: Boolean(alumno) });

  let r: ReturnType<typeof procesar> | null = null;
  try {
    r = procesar(await generar(historiaParaModelo(filas), sistema));
  } catch (e) {
    console.error("whatsapp: fallo del modelo", (e as Error).message);
    await avisar(sb, h, "error", { resumen: `El asistente no pudo responder: ${(e as Error).message}`.slice(0, 500) });
  }
  const cuerpo = r?.texto ? aWhatsApp(r.texto)
    : "Perdón, no pude responder en este momento. Si prefieres, escribe al WhatsApp del Instituto: https://wa.me/" + HUMANO;

  if (await mandar(para, { type: "text", text: { body: cuerpo, preview_url: true } })) {
    await sb.from("wa_mensajes").insert({ huella: h, rol: "asistente", texto: cuerpo });
  }
  if (!r) return;

  // Videos (cada uno una sola vez por plática)
  for (const k of r.videos) {
    const v = VIDEOS[k];
    const marca = `[video: ${v.nombre}]`;
    if (filas.some((f: any) => f.rol === "asistente" && String(f.texto).includes(marca))) continue;
    if (await mandar(para, { type: "video", video: { link: v.link, caption: v.caption } })) {
      await sb.from("wa_mensajes").insert({ huella: h, rol: "asistente", texto: marca });
    }
  }

  // Avisos para el Jefe
  const todo = [...filas, { rol: "usuario", texto }];
  if (r.humano) {
    await avisar(sb, h, alumno ? "alumno" : "humano",
      { telefono: numero, nombre: String(msg.nombre || chat.perfil || "").slice(0, 80) || null, resumen: resumen(todo) });
  }
  if (r.apoyo && !r.humano) {
    // Posible crisis o tema de salud: el asistente ya dio la Línea de la Vida y no vendió. El aviso va SIN número
    // (la etiqueta también sale con «mi esposa tiene depresión», que no es una crisis): si la persona acepta que la
    // contacten, el asistente pone [HUMANO] y ese aviso sí lleva el número.
    await avisar(sb, h, "crisis", { nombre: String(msg.nombre || chat.perfil || "").slice(0, 80) || null, resumen: resumen(todo) });
  }
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // La verificación solo necesita WA_VERIFY_TOKEN: así el webhook se da de alta en Meta antes que el token y el secreto
  if (req.method === "GET") {
    const ok = Boolean(env("WA_VERIFY_TOKEN")) && url.searchParams.get("hub.mode") === "subscribe" &&
      iguales(url.searchParams.get("hub.verify_token") || "", env("WA_VERIFY_TOKEN"));
    return ok ? new Response(url.searchParams.get("hub.challenge") || "", { status: 200 })
              : new Response("prohibido", { status: 403 });
  }
  if (req.method !== "POST") return new Response("método no permitido", { status: 405 });
  if (!listo()) return new Response("WhatsApp sin configurar", { status: 503 });

  const cuerpo = await req.text();
  const firma = (req.headers.get("X-Hub-Signature-256") || "").replace(/^sha256=/, "");
  if (!firma || !iguales(firma, await hmac(env("WA_APP_SECRET"), cuerpo))) return new Response("firma inválida", { status: 401 });

  let datos: any;
  try { datos = JSON.parse(cuerpo); } catch (_) { return new Response("JSON inválido", { status: 400 }); }
  const mensajes: any[] = [];
  for (const entrada of datos.entry || []) {
    for (const cambio of entrada.changes || []) {
      const v = cambio.value || {};
      if (v.metadata && v.metadata.phone_number_id !== env("WA_PHONE_NUMBER_ID")) continue;
      const nombres = Object.fromEntries((v.contacts || []).map((c: any) => [c.wa_id, c.profile?.name]));
      for (const m of v.messages || []) mensajes.push({ ...m, nombre: nombres[m.from] || "" });
    }
  }
  if (mensajes.length) {
    const sb = SB();
    EdgeRuntime.waitUntil((async () => {
      for (const m of mensajes) {
        try { await atender(sb, m); }
        catch (e) { console.error("whatsapp: fallo al atender", (e as Error).message); }
      }
    })());
  }
  return new Response("ok", { status: 200 }); // Meta quiere el 200 rápido; lo demás sigue en segundo plano
});
