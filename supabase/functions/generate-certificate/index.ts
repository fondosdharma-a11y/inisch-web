// ============================================================
// INISCH CAMPUS — Edge Function: generar certificado PDF
// ============================================================
// Que hace:
//   Verifica que el alumno autenticado completó el 100% de las
//   lecciones de una etapa, genera un PDF de constancia, lo sube
//   a Supabase Storage (bucket "certificates") y guarda el registro
//   en la tabla certificates. Si ya existe, devuelve el existente.
//
// Requisitos antes de desplegar:
//   1. En Supabase: Storage -> New bucket -> nombre "certificates" -> Public bucket: SI
//   2. Desplegar: supabase functions deploy generate-certificate
//      (no requiere configurar secrets extra: SUPABASE_URL,
//      SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY ya vienen
//      incluidos automaticamente en toda Edge Function de Supabase)
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };
}

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const ETAPA_NOMBRES: Record<number, string> = {
  1: "Etapa 1: Iniciacion - El Despertar",
  2: "Etapa 2: Maestria - El Encuentro Contigo Mismo",
  3: "Etapa 3: Formacion de Instructores",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders() });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401, headers: corsHeaders() });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData } = await supabaseUser.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401, headers: corsHeaders() });
    }

    const body = await req.json();
    const etapa = Number(body?.etapa ?? 1);

    const { data: course } = await supabaseAdmin.from("courses").select("id, title").eq("etapa", etapa).single();
    if (!course) {
      return new Response(JSON.stringify({ error: "Etapa no encontrada" }), { status: 404, headers: corsHeaders() });
    }

    const { data: lessons } = await supabaseAdmin.from("lessons").select("id").eq("course_id", course.id);
    const lessonIds = (lessons ?? []).map((l: any) => l.id);

    const { data: progressRows } = await supabaseAdmin
      .from("progress")
      .select("lesson_id")
      .eq("student_id", user.id)
      .in("lesson_id", lessonIds.length ? lessonIds : ["00000000-0000-0000-0000-000000000000"]);

    const doneCount = (progressRows ?? []).length;
    if (lessonIds.length === 0 || doneCount < lessonIds.length) {
      return new Response(
        JSON.stringify({ error: "Aun no completas todas las lecciones de esta etapa" }),
        { status: 400, headers: corsHeaders() }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from("certificates")
      .select("folio, pdf_url")
      .eq("student_id", user.id)
      .eq("etapa", etapa)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ pdf_url: existing.pdf_url, folio: existing.folio }), {
        status: 200,
        headers: corsHeaders(),
      });
    }

    const { data: profile } = await supabaseAdmin.from("profiles").select("full_name").eq("id", user.id).single();
    const studentName = profile?.full_name || user.email || "Alumno INISCH";

    const folio = "INISCH-E" + etapa + "-" + Date.now().toString(36).toUpperCase();

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const teal = rgb(0.145, 0.298, 0.345);
    const gold = rgb(0.776, 0.627, 0.231);
    const gray = rgb(0.4, 0.4, 0.4);

    page.drawRectangle({ x: 20, y: 20, width: 802, height: 555, borderColor: gold, borderWidth: 1.5 });
    page.drawText("INISCH", { x: 60, y: 505, size: 24, font: bold, color: teal });
    page.drawText("Instituto Internacional del Sistema Codigo Holografico", { x: 60, y: 480, size: 11, font: regular, color: gray });

    page.drawText("Constancia de participacion", { x: 60, y: 420, size: 16, font: bold, color: gold });
    page.drawText("Se otorga la presente constancia a:", { x: 60, y: 380, size: 12, font: regular, color: gray });
    page.drawText(String(studentName), { x: 60, y: 348, size: 26, font: bold, color: teal });
    page.drawText("Por haber concluido satisfactoriamente:", { x: 60, y: 308, size: 12, font: regular, color: gray });
    page.drawText(ETAPA_NOMBRES[etapa] ?? course.title, { x: 60, y: 280, size: 15, font: bold, color: teal });

    page.drawText("Folio: " + folio, { x: 60, y: 75, size: 10, font: regular, color: gray });
    page.drawText("Fecha de emision: " + new Date().toLocaleDateString("es-MX"), { x: 60, y: 58, size: 10, font: regular, color: gray });

    const pdfBytes = await pdfDoc.save();
    const filePath = "certificados/" + folio + ".pdf";

    const { error: uploadError } = await supabaseAdmin.storage
      .from("certificates")
      .upload(filePath, pdfBytes, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: "No se pudo guardar el PDF. Verifica que exista el bucket 'certificates' en Supabase Storage. Detalle: " + uploadError.message }),
        { status: 500, headers: corsHeaders() }
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from("certificates").getPublicUrl(filePath);
    const pdfUrl = publicUrlData.publicUrl;

    await supabaseAdmin.from("certificates").insert({ student_id: user.id, etapa, folio, pdf_url: pdfUrl });

    return new Response(JSON.stringify({ pdf_url: pdfUrl, folio }), { status: 200, headers: corsHeaders() });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders() });
  }
});
