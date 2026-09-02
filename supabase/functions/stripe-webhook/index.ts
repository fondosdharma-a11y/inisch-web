// ============================================================
// INISCH CAMPUS — Edge Function: webhook de Stripe
// ============================================================
// Como desplegarla (requiere Supabase CLI instalado):
//   supabase functions deploy stripe-webhook
//   supabase secrets set STRIPE_SECRET_KEY=sk_...
//   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
// Luego en Stripe Dashboard > Developers > Webhooks, agrega un endpoint
// apuntando a la URL que te da Supabase al desplegar, escuchando el evento
// "checkout.session.completed".
//
// Al crear el Checkout de Stripe desde el frontend, se debe enviar:
//   client_reference_id = el id del alumno (auth.uid() de Supabase)
//   metadata.etapa = "1" | "2" | "3"
// para que este webhook sepa a quien y a que etapa activar el acceso.
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature ?? "", webhookSecret);
  } catch (err) {
    return new Response("Webhook error: " + (err as Error).message, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Record<string, any>;
    const studentId = session.client_reference_id;
    const etapa = Number(session.metadata?.etapa ?? 1);

    if (studentId) {
      await supabaseAdmin.from("enrollments").upsert(
        {
          student_id: studentId,
          etapa,
          status: "active",
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription ?? null,
          started_at: new Date().toISOString(),
        },
        { onConflict: "student_id,etapa" }
      );
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
