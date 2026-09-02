// ============================================================
// INISCH — Edge Function: agente de ventas / admisiones (IA)
// ============================================================
// Que hace:
//   Recibe el mensaje del visitante del sitio + el historial de la
//   conversacion, y responde usando Claude (Anthropic) con un system
//   prompt que conoce las etapas, precios, requisitos y certificaciones
//   reales de INISCH (ver /internal-docs/plan-maestro-inisch.md).
//
// Requisitos antes de desplegar:
//   1. Consigue una API key en https://console.anthropic.com
//   2. supabase functions deploy sales-chat
//   3. supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Una vez desplegada, actualiza docs/js/chat-widget.js con la URL
// de la funcion (se muestra al desplegar, con forma:
// https://TU-PROYECTO.functions.supabase.co/sales-chat)
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };
}

const SYSTEM_PROMPT = `Eres el asistente de admisiones de INISCH (Instituto Internacional del Sistema Codigo Holografico). Respondes en espanol, con un tono calido, cercano y profesional. Nunca inventas precios, fechas o requisitos: usa unicamente la informacion de abajo. Si no sabes algo, invita a escribir por WhatsApp al +52 33 1470 1563.

INFORMACION OFICIAL DE INISCH:

Programas y experiencias:
- Formacion de Especialistas en Autoconocimiento (3 etapas, con opcion de certificacion SEP-CONOCER)
- Acompanamiento Especializado (consultas individuales 1:1)
- Rituales y Experiencias Transformadoras
- Numerologia Holografica (talleres y consultas)
- Circulos de Mujeres
- Inmersion Sonora - Atencion Fina
- Viajes de Experiencia y Expansion

ETAPA 1 - Iniciacion: El Despertar:
- Duracion: 2 dias, 16 horas. Horario 10:00am a 6:00pm. Modalidad presencial y en linea.
- Requisitos: ninguno, abierto al publico general, solo compromiso con el proceso.
- Inversion: $8,500 MXN o $500 USD.

ETAPA 2 - Maestria: El Encuentro Contigo Mismo (Certificacion como Especialista en Autoconocimiento):
- Duracion total: 8 meses, 128 horas. Sesion semanal en linea de 4 horas (9am-1pm) + una practica presencial intensiva de fin de semana.
- Inversion: $36,000 MXN o $2,118 USD (inscripcion $6,000 MXN/$353 USD + 6 mensualidades de $5,000 MXN/$295 USD).
- Certificacion SEP-CONOCER opcional e independiente: $6,062 MXN total (alineacion $3,693 MXN + emision $2,369 MXN, precio fundadores).

ETAPA 3 - Formacion de Instructores:
- Requisito: haber concluido Etapa 1 y Etapa 2.
- Duracion: 120 horas (clases semanales de 4h en linea + fin de semana intensivo presencial).
- Esquema regular: inscripcion $8,000 MXN/$470 USD + 6 mensualidades de $8,300 MXN/$500 USD.
- Esquema fundadores: inscripcion $1,999 MXN/$118 USD + 9 mensualidades de $3,963 MXN/$233 USD.
- Permite gestionar registro opcional como Agente Capacitador Externo ante la STPS (emitir DC-3).
- Curso complementario DC-3/STPS: 8 horas, $3,999 MXN de lista o $1,999 MXN precio fundadores.

Certificaciones disponibles (opcionales, independientes del costo de formacion):
- SEP-CONOCER, Estandar EC1375, cedula consultable en el RENAP.
- Apostilla de La Haya (validez legal en mas de 120 paises).
- STPS / Constancias DC-3 (solo para instructores de Etapa 3).

Contacto oficial: WhatsApp +52 33 1470 1563.

Tu objetivo es ayudar a la persona a identificar que etapa o servicio le conviene segun lo que cuenta, resolver dudas de precio/duracion/requisitos, y cuando este lista, invitarla a continuar por WhatsApp para inscribirse. Manten las respuestas breves (maximo 4-5 lineas) y humanas, no como un catalogo leido en voz alta.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders() });

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "El agente aun no esta configurado (falta ANTHROPIC_API_KEY)." }),
        { status: 500, headers: corsHeaders() }
      );
    }

    const { message, history } = await req.json();
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Falta el mensaje." }), { status: 400, headers: corsHeaders() });
    }

    const messages = Array.isArray(history) ? history.slice(-10) : [];
    messages.push({ role: "user", content: message });

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return new Response(JSON.stringify({ error: "Error del modelo: " + errText }), {
        status: 500,
        headers: corsHeaders(),
      });
    }

    const data = await anthropicRes.json();
    const reply = data?.content?.[0]?.text ?? "Disculpa, no pude generar una respuesta. Escribenos por WhatsApp al +52 33 1470 1563.";

    return new Response(JSON.stringify({ reply }), { status: 200, headers: corsHeaders() });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders() });
  }
});
