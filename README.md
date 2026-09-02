# INISCH — Sitio web + Plataforma de Alumnos

Repositorio de trabajo para el desarrollo del sitio institucional y la plataforma de alumnos de **INISCH** (Instituto Internacional del Sistema Código Holográfico).

## Sitio publicado

**https://fondosdharma-a11y.github.io/inisch-web/**

Dominio personalizado configurado del lado de GitHub: `www.inisch.com` (falta apuntar el DNS en Porkbun, ver abajo). Publicado con GitHub Pages desde `/docs` en la rama `main`.

## Estructura

```
/internal-docs                     -> Documentacion de planeacion del proyecto (no se publica)
/database/schema.sql               -> Esquema completo de base de datos para Supabase
/supabase/functions/
  /stripe-webhook                  -> Activa el acceso del alumno al pagar en Stripe
  /generate-certificate            -> Genera el PDF de constancia cuando el alumno termina una etapa
  /sales-chat                      -> Agente de IA de ventas/admisiones (usa Claude)
/docs                              -> Sitio real publicado por GitHub Pages
  /docs/CNAME                      -> Dominio personalizado (www.inisch.com)
  /docs/js/chat-widget.js          -> Widget del chat de IA (activo en todas las paginas)
  /docs/campus/                    -> LA PLATAFORMA DE ALUMNOS (campus virtual)
    /docs/campus/login.html        -> Inicio de sesion / registro
    /docs/campus/dashboard.html    -> Catalogo, progreso y certificado de la Etapa 1
    /docs/campus/js/supabase-config.js -> AQUI SE PEGAN LAS LLAVES DE SUPABASE
/assets                            -> Logotipo e imagenes de marca (subidas manualmente, ver abajo)
```

## Modo claro / oscuro

Todas las paginas (incluido el campus) tienen un boton de tema: **claro** = "Codigo Ancestral" (marfil, teal + oro), **oscuro** = "Holograma Vivo" (teal oscuro, mismos acentos).

## 🚀 Como activar el Campus de Alumnos (requiere crear una cuenta gratuita)

**Paso 1 — Crear el proyecto en Supabase**
1. Ve a https://supabase.com, crea cuenta gratuita y un proyecto nuevo.
2. Espera 1-2 minutos mientras se aprovisiona.

**Paso 2 — Cargar el esquema de base de datos**
1. En Supabase, entra a **SQL Editor**.
2. Copia todo el contenido de `/database/schema.sql` de este repo y pegalo ahi. Dale **Run**.

**Paso 3 — Crear el bucket de certificados**
1. En Supabase, ve a **Storage -> New bucket**.
2. Nombre: `certificates`. Marca la opcion **Public bucket**. Crear.

**Paso 4 — Conectar las llaves al sitio**
1. En Supabase: **Project Settings -> API**. Copia "Project URL" y "anon public" key.
2. En GitHub, edita `docs/campus/js/supabase-config.js` y pega ambos valores.

Con esto, el login, registro, progreso y certificados (generados automaticamente en PDF cuando el alumno completa todas las lecciones) ya funcionan de verdad.

**Paso 5 (opcional) — Activar cobros automaticos por Stripe**
Instala la CLI de Supabase y sigue las instrucciones dentro de `/supabase/functions/stripe-webhook/index.ts`.

## 🤖 Como activar el agente de IA de ventas (chat del sitio)

Ya esta el widget de chat visible en todas las paginas (esquina inferior derecha). Mientras no se active, responde invitando a escribir por WhatsApp —no rompe nada. Para activarlo de verdad:

1. Consigue una API key en https://console.anthropic.com
2. Instala la CLI de Supabase y corre: `supabase functions deploy sales-chat`
3. `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`
4. Copia la URL que te da el despliegue (algo como `https://TU-PROYECTO.functions.supabase.co/sales-chat`)
5. En cada pagina de `/docs`, antes de `<script src="js/chat-widget.js">`, agrega:
   `<script>window.INISCH_CHAT_FUNCTION_URL = 'TU_URL_AQUI';</script>`
   (avisame cuando tengas la URL y yo hago este cambio en las 11 paginas de una vez).

El agente ya conoce todas las etapas, precios, requisitos y certificaciones reales de INISCH (esta todo escrito en su system prompt dentro de `/supabase/functions/sales-chat/index.ts`).

## Plataforma de alumnos: decision de arquitectura

Se decidio (ver `/internal-docs/plan-maestro-inisch.md`) construir el campus sobre **Supabase** + **Stripe** + **video en YouTube/Vimeo no listado**, por ser la combinacion de mejor costo/automatizacion/eficacia: practicamente $0 hasta que haya alumnos pagando en volumen real.

## Estado actual

- [x] Dominio comprado: **INISCH.com** (Porkbun) y configurado del lado de GitHub Pages
- [x] Pasarela de pago decidida: **Stripe**
- [x] Logotipo de marca recibido
- [x] Sitio institucional completo, publicado en GitHub Pages
- [x] Modo claro/oscuro en todas las paginas
- [x] Blog con 3 articulos publicados
- [x] Campus construido: login, registro, catalogo Etapa 1, progreso, certificado PDF automatico
- [x] Agente de IA de ventas/admisiones construido (widget + Edge Function con system prompt real de INISCH)
- [x] Edge Function de Stripe lista (falta desplegar)
- [ ] Crear el proyecto de Supabase y completar los pasos 1-4 de arriba (requiere accion del usuario, es gratis)
- [ ] Apuntar el DNS de INISCH.com en Porkbun hacia GitHub Pages (ver abajo)
- [ ] Desplegar las 3 Edge Functions (requiere Supabase CLI)
- [ ] Cargar videos reales de la Etapa 1 (YouTube/Vimeo no listado) en la tabla `lessons`

## ⚠️ Pendiente: subir imágenes de marca a `/assets`

Sube estos 2 archivos a la carpeta `assets/` (Add file -> Upload files), con estos nombres exactos:

- `assets/LOGO_INISCH_NUEVO_png_copia__1_.png`
- `assets/Screenshot_2026-09-02_at_1_44_09_PM.png`

## Conectar el dominio INISCH.com (pendiente, requiere accion del usuario en Porkbun)

El lado de GitHub ya esta listo (`docs/CNAME` = `www.inisch.com`). Falta en Porkbun:
1. Agregar un registro **CNAME** con nombre `www` apuntando a `fondosdharma-a11y.github.io`.
2. (Opcional, para que `inisch.com` sin "www" tambien funcione) Agregar 4 registros **A** en la raiz apuntando a: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153.
3. Esperar propagacion DNS (minutos a horas). En GitHub, Settings -> Pages, activar "Enforce HTTPS" cuando el dominio aparezca verificado.

## Como ver el sitio localmente

Descarga el repositorio ("Code -> Download ZIP") y abre `docs/index.html` en tu navegador.

## Proximos pasos

Ver `/internal-docs/plan-maestro-inisch.md` para el detalle completo y la hoja de ruta por fases.
