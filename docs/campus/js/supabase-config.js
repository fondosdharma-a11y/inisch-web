// ============================================================
// INISCH CAMPUS — Configuracion de conexion a Supabase
// ============================================================
// PASOS PARA ACTIVAR EL CAMPUS:
// 1. Crea una cuenta gratuita en https://supabase.com y un proyecto nuevo
// 2. Ve a Project Settings -> API
// 3. Copia "Project URL" y pegala abajo en SUPABASE_URL
// 4. Copia "anon public" key y pegala abajo en SUPABASE_ANON_KEY
// 5. Ve a SQL Editor y ejecuta el contenido de /database/schema.sql
// Con eso el login, el catalogo y el progreso ya deberian funcionar.
// ============================================================

const SUPABASE_URL = "PEGA_AQUI_TU_PROJECT_URL";
const SUPABASE_ANON_KEY = "PEGA_AQUI_TU_ANON_PUBLIC_KEY";

const supabaseClient = (SUPABASE_URL.startsWith("PEGA_AQUI"))
  ? null
  : supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
