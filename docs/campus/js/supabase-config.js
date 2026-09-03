// ============================================================
// INISCH CAMPUS · Conexion a Supabase
// ============================================================
// PARA ACTIVAR EL CAMPUS CON DATOS REALES:
//
//  1. En Supabase, ve a Project Settings (engrane) -> API
//  2. Copia "Project URL"      y pegalo en SUPABASE_URL
//  3. Copia "anon public" key  y pegala en SUPABASE_ANON_KEY
//  4. En SQL Editor ejecuta, en este orden:
//        database/schema.sql
//        database/schema-v2.sql
//  5. En Storage crea un bucket PUBLICO llamado: certificates
//  6. En Authentication -> URL Configuration, pon como Site URL:
//        https://www.inisch.com
//     y agrega a Redirect URLs:
//        https://www.inisch.com/campus/dashboard.html
//
// MIENTRAS NO PEGUES LAS CLAVES, el campus funciona en MODO DEMOSTRACION:
// puedes recorrer todas las pantallas y los datos se guardan solo en tu
// navegador. Nada se pierde al activar Supabase: son almacenes distintos.
//
// La "anon key" es segura de publicar (esta hecha para el navegador).
// NUNCA pongas aqui la "service_role key".
// ============================================================

const SUPABASE_URL      = "PEGA_AQUI_TU_PROJECT_URL";
const SUPABASE_ANON_KEY  = "PEGA_AQUI_TU_ANON_PUBLIC_KEY";

const CAMPUS_CONFIGURED = !SUPABASE_URL.startsWith("PEGA_AQUI") &&
                          !SUPABASE_ANON_KEY.startsWith("PEGA_AQUI");

const supabaseClient = CAMPUS_CONFIGURED
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
