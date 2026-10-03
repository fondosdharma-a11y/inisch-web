// ============================================================
// INISCH - Agente de admisiones y orientacion
// ============================================================
// Responde dudas sobre los programas con informacion REAL, y
// detecta cuando la persona no necesita un curso sino apoyo.
// Requiere el secreto ANTHROPIC_API_KEY. ANTHROPIC_WORKSPACE_ID es opcional
// (por defecto, el workspace Default de la organizacion).
// Precios: los mismos que inisch.com y Stripe (revisado 2026-09-30,
// con la promocion del 25% vigente desde el 29-sep).
// ============================================================

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

import { SYSTEM_INISCH as SYSTEM } from "../_shared/conocimiento.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!KEY) {
      return new Response(JSON.stringify({
        error: "sin_clave",
        reply: "El asistente todavia no esta configurado. Escribenos por WhatsApp al +52 33 1470 1563 y te atendemos de inmediato.",
      }), { status: 200, headers: CORS });
    }

    const body = await req.json().catch(() => ({}));
    const mensaje = String(body.message || "").slice(0, 2000);
    const historial = Array.isArray(body.history) ? body.history.slice(-10) : [];

    if (!mensaje.trim()) {
      return new Response(JSON.stringify({ reply: "En que te puedo ayudar?" }), { headers: CORS });
    }

    const messages = [
      ...historial
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
        .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) })),
      { role: "user", content: mensaje },
    ];

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": KEY,
        "anthropic-version": "2023-06-01",
        // La llave no esta asignada a un workspace: la API exige este encabezado.
        // Por defecto, el workspace "Default" de Fondos Dharma (no es secreto).
        "anthropic-workspace-id": Deno.env.get("ANTHROPIC_WORKSPACE_ID") || "wrkspc_01LyujcwYfyx185ZjRP8Qmzm",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 700,
        system: SYSTEM,
        messages,
      }),
    });

    if (!r.ok) {
      console.error("Anthropic error:", r.status, await r.text());
      return new Response(JSON.stringify({
        reply: "Tuve un problema para responder. Escribenos por WhatsApp al +52 33 1470 1563 y te ayudamos.",
      }), { status: 200, headers: CORS });
    }

    const data = await r.json();
    let texto = (data.content || [])
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n")
      .trim();

    const apoyo = /\[APOYO\]/.test(texto);
    const consulta = /\[CONSULTA\]/.test(texto);
    texto = texto.replace(/\[APOYO\]/g, "").replace(/\[CONSULTA\]/g, "").trim();

    return new Response(JSON.stringify({ reply: texto, apoyo, consulta }), { headers: CORS });

  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({
      reply: "Algo fallo de mi lado. Escribenos por WhatsApp al +52 33 1470 1563.",
    }), { status: 200, headers: CORS });
  }
});
