// ============================================================
// INISCH - Webhook de Stripe (v6, PREPARADA para Stripe Connect; desplegada: v5)
// ============================================================
// 1. Al confirmarse un pago, abre el acceso al campus.
// 2. Si el pago vino con codigo de referido, acredita el 10%
//    DE ESE PAGO al referidor (nunca por adelantado).
//
// La cuenta vieja de recaudo es compartida con otros negocios: este webhook SOLO
// procesa lo de INISCH y descarta el resto sin guardar nada (datos de clientes ajenos).
//   - checkout: metadata.origen empieza con "inisch"
//   - suscripciones: producto en PRODUCTOS_SUSCRIPCION (o, en Connect, metadata.programa)
//   - reembolsos: el correo ya tiene un pago de INISCH registrado
//
// 3. Mensualidades automaticas: al contratar (y en cada cobro, por si acaso)
//    deja programado en Stripe el fin del plan (8 o 7 cobros exactos).
//
// 4. Stripe Connect (decision del Jefe 2026-10-04): los cobros del Instituto pasan a SU
//    cuenta de Stripe, conectada a la de Fondos Dharma como plataforma. Esta funcion
//    atiende DOS endpoints mientras dure la transicion:
//      - el de la cuenta vieja de recaudo (firma STRIPE_WEBHOOK_SECRET);
//      - el de Connect en la plataforma (firma STRIPE_WEBHOOK_SECRET_CONNECT).
//    Un evento de Connect trae `account`: solo se atiende si es INISCH_CUENTA_CONNECT.
//    Un evento firmado por el endpoint de Connect SIN `account` es de la plataforma
//    (Dharma, Quantify, Forja): fuera, sin guardar nada.
//
// Secretos: STRIPE_WEBHOOK_SECRET, STRIPE_SECRET_KEY (llave restringida de la cuenta
// vieja, ESCRITURA en Subscriptions), y para Connect: STRIPE_WEBHOOK_SECRET_CONNECT,
// INISCH_CUENTA_CONNECT (acct_ del Instituto) y STRIPE_PLATAFORMA_KEY (llave restringida
// de la plataforma; con Stripe-Account programa el fin de las suscripciones del Instituto).
// Antes de desplegar v6: columna pagos.cuenta_stripe (migracion pagos_cuenta_stripe).
// ============================================================

import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = { "Content-Type": "application/json" };

const CUENTA_VIEJA = "acct_1UCKA9L8Oy5fwasW";

const ETAPA: Record<string, number> = {
  taller: 1, taller_inscripcion: 1, taller_contado: 1, taller_ref_contado: 1,
  diplomado_inscripcion: 2, diplomado_contado: 2, diplomado_auto: 2, diplomado_ref_contado: 2,
  instructor_inscripcion: 3, instructor_inscripcion_reg: 3, instructor_contado: 3,
  instructor_contado_reg: 3, instructor_auto: 3, instructor_auto_reg: 3,
  instructor_ref_contado: 3, instructor_ref_contado_reg: 3,
};

// Precio de lista por concepto, solo para referencia en el registro
const LISTA: Record<string, number> = {
  taller: 8500, taller_inscripcion: 8500, taller_contado: 8500, taller_ref_contado: 8500,
  diplomado_inscripcion: 36000, diplomado_contado: 36000, diplomado_auto: 36000, diplomado_ref_contado: 36000,
  instructor_contado_reg: 57800, instructor_inscripcion_reg: 57800, instructor_ref_contado_reg: 57800,
  instructor_contado: 37666, instructor_inscripcion: 37666, instructor_ref_contado: 37666,
};

// Productos de Stripe de los planes de mensualidades automaticas de INISCH (cuenta vieja).
// En la cuenta conectada los productos son otros: ahi manda metadata.programa.
const PRODUCTOS_SUSCRIPCION: Record<string, string> = {
  prod_VDXhQLeNv5EYoi: "diplomado_auto",
  prod_VDXhp2BsuGzko6: "instructor_auto",
  prod_VDXh1D1SuBmCXb: "instructor_auto_reg",
};

// Mensualidades automaticas: cuantos cobros tiene cada plan. El producto promete que
// «se cancela solo al completar el plan»; esto es lo que lo cumple.
const MESES_PLAN: Record<string, number> = {
  diplomado_auto: 8, instructor_auto: 7, instructor_auto_reg: 7,
};

// cuenta = null → cuenta vieja con su llave; cuenta = acct_… → cuenta conectada, con la
// llave de la plataforma y el encabezado Stripe-Account.
async function stripeApi(ruta: string, metodo = "GET", cuerpo?: URLSearchParams, cuenta?: string | null): Promise<any> {
  const KEY = cuenta ? Deno.env.get("STRIPE_PLATAFORMA_KEY") : Deno.env.get("STRIPE_SECRET_KEY");
  if (!KEY) throw new Error(cuenta ? "sin_STRIPE_PLATAFORMA_KEY" : "sin_STRIPE_SECRET_KEY");
  const cabeceras: Record<string, string> = {
    Authorization: `Bearer ${KEY}`, "Content-Type": "application/x-www-form-urlencoded",
  };
  if (cuenta) cabeceras["Stripe-Account"] = cuenta;
  const r = await fetch(`https://api.stripe.com/v1/${ruta}`, { method: metodo, headers: cabeceras, body: cuerpo });
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`stripe ${r.status}: ${JSON.stringify(datos?.error ?? datos).slice(0, 300)}`);
  return datos;
}

// Deja programado el fin de la suscripcion si aun no lo tiene. N cobros: el primero al
// contratar y uno por mes; se corta a la mitad del periodo N, sin prorrateo, para que el
// cobro N+1 no exista y no quede saldo a favor ni en contra.
async function asegurarFin(subId: string, programa: string, cuenta?: string | null): Promise<string> {
  const meses = MESES_PLAN[programa];
  if (!subId || !meses) return "no_aplica";
  try {
    const sub = await stripeApi(`subscriptions/${subId}`, "GET", undefined, cuenta);
    if (sub.cancel_at || sub.status === "canceled") return "ya_tenia_fin";
    const fin = new Date((sub.start_date || sub.created) * 1000);
    fin.setUTCMonth(fin.getUTCMonth() + meses - 1);
    fin.setUTCDate(fin.getUTCDate() + 15);
    await stripeApi(`subscriptions/${subId}`, "POST", new URLSearchParams({
      cancel_at: String(Math.floor(fin.getTime() / 1000)),
      proration_behavior: "none",
      "metadata[programa]": programa,
      "metadata[mensualidades]": String(meses),
      "metadata[origen]": "inisch-web",
    }), cuenta);
    console.log(`Suscripcion ${subId} (${programa}${cuenta ? ", " + cuenta : ""}): fin programado ${fin.toISOString().slice(0, 10)}`);
    return "programada";
  } catch (e) {
    // Sin esto el alumno pagaria de mas: que se vea en los logs, sin tumbar el acceso.
    console.error(`ALERTA cancel_at ${subId} (${programa}):`, String(e));
    return "error";
  }
}

const ignorar = (motivo: string) =>
  new Response(JSON.stringify({ ok: true, ignorado: motivo }), { headers: CORS });

async function firmaValida(cuerpo: string, cabecera: string, secreto: string): Promise<boolean> {
  try {
    const partes: Record<string, string> = {};
    cabecera.split(",").forEach((p) => {
      const i = p.indexOf("=");
      partes[p.slice(0, i).trim()] = p.slice(i + 1).trim();
    });
    const t = partes["t"], v1 = partes["v1"];
    if (!t || !v1) return false;
    const edad = Math.abs(Math.floor(Date.now() / 1000) - Number(t));
    if (!Number.isFinite(edad) || edad > 300) return false;

    const clave = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(secreto),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
    );
    const mac = await crypto.subtle.sign("HMAC", clave, new TextEncoder().encode(`${t}.${cuerpo}`));
    const esperado = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");
    if (esperado.length !== v1.length) return false;
    let dif = 0;
    for (let i = 0; i < esperado.length; i++) dif |= esperado.charCodeAt(i) ^ v1.charCodeAt(i);
    return dif === 0;
  } catch (_e) { return false; }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "metodo_no_permitido" }), { status: 405, headers: CORS });
  }
  const SECRETO = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const SECRETO_CONNECT = Deno.env.get("STRIPE_WEBHOOK_SECRET_CONNECT");
  const cuerpo = await req.text();
  const firma = req.headers.get("stripe-signature") || "";

  if (!SECRETO && !SECRETO_CONNECT) {
    return new Response(JSON.stringify({ error: "sin_configurar" }), { status: 500, headers: CORS });
  }
  const porVieja = !!SECRETO && await firmaValida(cuerpo, firma, SECRETO);
  const porConnect = !porVieja && !!SECRETO_CONNECT && await firmaValida(cuerpo, firma, SECRETO_CONNECT);
  if (!porVieja && !porConnect) {
    return new Response(JSON.stringify({ error: "firma_invalida" }), { status: 400, headers: CORS });
  }

  let evento: any;
  try { evento = JSON.parse(cuerpo); }
  catch (_e) { return new Response(JSON.stringify({ error: "json_invalido" }), { status: 400, headers: CORS }); }

  // Connect: solo la cuenta del Instituto. Lo de la plataforma o de otra cuenta conectada, fuera.
  const cuenta: string | null = porConnect ? (evento.account || null) : null;
  if (porConnect) {
    const propia = Deno.env.get("INISCH_CUENTA_CONNECT");
    if (!cuenta) return ignorar("evento_de_la_plataforma");
    if (!propia || cuenta !== propia) return ignorar("otra_cuenta_conectada");
  }
  const cuentaStripe = cuenta || CUENTA_VIEJA;

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const tipo = evento.type as string;
  const obj = evento.data?.object ?? {};

  // Checkout de otro negocio de la misma cuenta: fuera, sin guardar nada
  if (tipo.startsWith("checkout.session.") && !String(obj.metadata?.origen || "").startsWith("inisch")) {
    return ignorar("otro_negocio");
  }

  try {
    // ---------- Pago de checkout confirmado ----------
    const esPagoBueno =
      (tipo === "checkout.session.completed" && obj.payment_status === "paid") ||
      tipo === "checkout.session.async_payment_succeeded";

    if (esPagoBueno) {
      const email = obj.customer_details?.email || obj.customer_email || null;
      const nombre = obj.customer_details?.name || null;
      const tel = obj.customer_details?.phone || null;
      const programa = obj.metadata?.programa || null;
      const monto = obj.amount_total ? Math.round(obj.amount_total / 100) : 0;
      const metodo = Array.isArray(obj.payment_method_types) ? obj.payment_method_types.join(",") : null;
      const refCodigo = obj.client_reference_id || null;

      const { error: errIns } = await sb.from("pagos").insert({
        stripe_event_id: evento.id, stripe_session_id: obj.id,
        email, nombre, whatsapp: tel, programa, monto_mxn: monto,
        metodo, estado: "pagado", bruto: obj, cuenta_stripe: cuentaStripe,
      });
      if (errIns && String(errIns.code) === "23505") {
        return new Response(JSON.stringify({ ok: true, repetido: true }), { headers: CORS });
      }
      if (errIns) console.error("pagos.insert:", errIns);

      // Plan de mensualidades automaticas: dejar programado su fin
      if (obj.mode === "subscription" && obj.subscription && programa && MESES_PLAN[programa]) {
        await asegurarFin(String(obj.subscription), programa, cuenta);
      }

      // Acceso al campus
      const etapa = programa ? ETAPA[programa] : undefined;
      if (etapa && email) {
        const { error } = await sb.rpc("otorgar_acceso", {
          p_email: email, p_etapa: etapa, p_programa: programa,
          p_nota: `Pago confirmado en Stripe (${metodo || "tarjeta"}) - sesion ${obj.id}`,
        });
        if (error) console.error("otorgar_acceso:", error);
      }

      // Comision del referido: 10% DE ESTE PAGO
      if (refCodigo && monto > 0) {
        const { data, error } = await sb.rpc("registrar_referencia", {
          p_codigo: refCodigo, p_email: email, p_nombre: nombre,
          p_programa: programa, p_lista: programa ? (LISTA[programa] ?? null) : null,
          p_pagado: monto, p_session: obj.id,
        });
        if (error) console.error("registrar_referencia:", error);
        else console.log(`Referido ${refCodigo}: ${data} (${monto} MXN)`);
      }

      return new Response(JSON.stringify({ ok: true }), { headers: CORS });
    }

    // ---------- Mensualidad automatica cobrada ----------
    // Cada recibo de la suscripcion tambien devenga comision.
    if (tipo === "invoice.paid" && obj.billing_reason === "subscription_cycle") {
      const linea = obj.lines?.data?.[0] ?? {};
      const producto = linea.price?.product || linea.pricing?.price_details?.product || linea.plan?.product || "";
      const progMeta = obj.subscription_details?.metadata?.programa
                     || obj.parent?.subscription_details?.metadata?.programa
                     || linea.metadata?.programa || linea.price?.metadata?.programa || "";
      // Cuenta vieja: por id de producto (es compartida). Cuenta del Instituto: toda es suya,
      // basta con que el programa sea un plan de mensualidades.
      const plan = PRODUCTOS_SUSCRIPCION[producto] || (cuenta && MESES_PLAN[progMeta] ? progMeta : "");
      if (!plan) return ignorar("suscripcion_de_otro_negocio");

      const monto = obj.amount_paid ? Math.round(obj.amount_paid / 100) : 0;
      const email = obj.customer_email || null;
      const programa = progMeta || plan;

      // Red de seguridad: si la suscripcion se quedo sin fecha de fin, se programa ahora
      const subId = obj.subscription || obj.parent?.subscription_details?.subscription || "";
      if (subId) await asegurarFin(String(subId), plan, cuenta);

      await sb.from("pagos").insert({
        stripe_event_id: evento.id, stripe_session_id: obj.id,
        email, programa, monto_mxn: monto, metodo: "card",
        estado: "pagado", bruto: obj, cuenta_stripe: cuentaStripe,
      });

      // Buscar si el alumno vino referido, por su correo
      if (email && monto > 0) {
        const { data: prev } = await sb.from("referencias")
          .select("codigo").eq("email_referido", String(email).toLowerCase())
          .limit(1).maybeSingle();
        if (prev?.codigo) {
          const { error } = await sb.rpc("registrar_referencia", {
            p_codigo: prev.codigo, p_email: email, p_nombre: null,
            p_programa: programa, p_lista: null, p_pagado: monto, p_session: obj.id,
          });
          if (error) console.error("comision mensualidad:", error);
        }
      }
      return new Response(JSON.stringify({ ok: true }), { headers: CORS });
    }

    if (tipo === "checkout.session.completed" && obj.payment_status === "unpaid") {
      return new Response(JSON.stringify({ ok: true, pendiente: true }), { headers: CORS });
    }

    if (tipo === "checkout.session.async_payment_failed") {
      await sb.from("pagos").insert({
        stripe_event_id: evento.id, stripe_session_id: obj.id,
        email: obj.customer_details?.email ?? null,
        programa: obj.metadata?.programa ?? null, estado: "fallido", bruto: obj,
        cuenta_stripe: cuentaStripe,
      });
      return new Response(JSON.stringify({ ok: true }), { headers: CORS });
    }

    // ---------- Reembolso: retirar acceso y cancelar comision ----------
    // Solo si ese correo ya tiene un pago de INISCH registrado.
    if (tipo === "charge.refunded") {
      const email = obj.billing_details?.email || obj.receipt_email || null;
      if (!email) return ignorar("reembolso_sin_correo");
      const { data: suyo } = await sb.from("pagos").select("id")
        .ilike("email", String(email)).not("programa", "is", null).eq("estado", "pagado")
        .limit(1).maybeSingle();
      if (!suyo) return ignorar("reembolso_de_otro_negocio");

      await sb.rpc("retirar_acceso", {
        p_email: email, p_etapa: 1,
        p_nota: "Acceso retirado: pago reembolsado en Stripe",
      });
      await sb.from("referencias")
        .update({ estado: "cancelada", nota: "Cancelada: el pago fue reembolsado" })
        .eq("email_referido", String(email).toLowerCase())
        .eq("estado", "confirmada");
      await sb.from("pagos").insert({
        stripe_event_id: evento.id, email, estado: "reembolsado", bruto: obj,
        cuenta_stripe: cuentaStripe,
      });
      return new Response(JSON.stringify({ ok: true }), { headers: CORS });
    }

    return new Response(JSON.stringify({ ok: true, ignorado: tipo }), { headers: CORS });

  } catch (e) {
    console.error("Error procesando el evento:", e);
    return new Response(JSON.stringify({ error: "fallo_interno" }), { status: 500, headers: CORS });
  }
});
