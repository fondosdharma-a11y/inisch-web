# INISCH — Sitio web + Plataforma de Alumnos

Repositorio de trabajo para el desarrollo del sitio institucional y la plataforma de alumnos de **INISCH** (Instituto Internacional del Sistema Código Holográfico).

## Sitio publicado

**https://fondosdharma-a11y.github.io/inisch-web/**

Dominio personalizado configurado del lado de GitHub: `www.inisch.com` (falta apuntar el DNS en Porkbun, ver abajo).

## Estructura

```
/internal-docs
  plan-maestro-inisch.md           -> Plan y decisiones del proyecto
  guiones-video-etapa1.md          -> Guiones listos para grabar los 6 videos de la Etapa 1
/database/schema.sql               -> Esquema completo de base de datos para Supabase
/supabase/functions/
  /stripe-webhook                  -> Activa el acceso del alumno al pagar en Stripe
  /generate-certificate            -> Genera el PDF de constancia al completar una etapa
  /sales-chat                      -> Agente de IA de ventas/admisiones (Claude)
/docs                              -> Sitio real publicado por GitHub Pages
  index, formacion, nosotros, acompanamiento, numerologia, experiencias,
  certificaciones, faq, contacto, privacidad, terminos, blog/  -> Paginas del sitio
  robots.txt, sitemap.xml, CNAME   -> SEO y dominio personalizado
  /docs/js/chat-widget.js          -> Widget del chat de IA (activo en todas las paginas)
  /docs/campus/                    -> LA PLATAFORMA DE ALUMNOS (login, dashboard, certificados)
/assets                            -> Logotipo e imagenes de marca (pendiente subir, ver abajo)
```

## Modo claro / oscuro

Todas las paginas (incluido el campus) tienen boton de tema: **claro** = "Codigo Ancestral", **oscuro** = "Holograma Vivo".

## 🚀 Activar el Campus de Alumnos

Ver instrucciones detalladas dentro de este README en la seccion anterior de commits, o directamente: crea proyecto en Supabase -> corre `/database/schema.sql` en el SQL Editor -> crea bucket publico `certificates` en Storage -> pega tus llaves en `docs/campus/js/supabase-config.js`.

## 🤖 Activar el chat de IA

El widget ya esta visible en todo el sitio (sin costo, cae a WhatsApp si no esta configurado). Para activarlo de verdad: despliega `supabase/functions/sales-chat` con tu ANTHROPIC_API_KEY como secreto, y agrega `window.INISCH_CHAT_FUNCTION_URL = 'tu-url';` antes del script del widget en cada pagina (avisame cuando tengas la URL).

## Páginas nuevas en esta iteración

- **Nosotros** (`nosotros.html`): historia de Isabel Elizalde y del Sistema Código Holográfico.
- **Preguntas frecuentes** (`faq.html`): 8 dudas comunes resueltas con información real.
- **Aviso de Privacidad** y **Términos y Condiciones** (`privacidad.html`, `terminos.html`): plantillas base — revisar con un abogado antes del lanzamiento oficial.
- **SEO técnico**: `robots.txt` y `sitemap.xml` ya publicados.
- **Guiones de video** para las 6 lecciones de la Etapa 1, listos para grabar (`internal-docs/guiones-video-etapa1.md`).

## Plataforma de alumnos: decision de arquitectura

Se decidió (ver `/internal-docs/plan-maestro-inisch.md`) construir el campus sobre **Supabase** + **Stripe** + **video en YouTube/Vimeo no listado**: la combinación de mejor costo/automatización/eficacia.

## Estado actual

- [x] Dominio comprado y configurado del lado de GitHub Pages
- [x] Sitio institucional completo: 13 páginas + blog (3 artículos) + FAQ + legal
- [x] Modo claro/oscuro en todo el sitio
- [x] Campus construido: login, registro, progreso, certificado PDF automático
- [x] Agente de IA de ventas construido (widget + Edge Function)
- [x] SEO técnico básico (robots.txt, sitemap.xml)
- [x] Guiones de los 6 videos de la Etapa 1 listos para grabar
- [ ] Apuntar el DNS de INISCH.com en Porkbun (ver abajo)
- [ ] Subir 2 imágenes de marca a `/assets` (ver abajo)
- [ ] Crear proyecto de Supabase y completar la conexión (gratis, requiere el usuario)
- [ ] Grabar los 6 videos de la Etapa 1 usando los guiones ya listos
- [ ] Desplegar las 3 Edge Functions (requiere Supabase CLI)
- [ ] Revisar Aviso de Privacidad / Términos con un abogado

## ⚠️ Pendiente: subir imágenes de marca a `/assets`

Sube estos 2 archivos (Add file -> Upload files), con estos nombres exactos:
- `assets/LOGO_INISCH_NUEVO_png_copia__1_.png`
- `assets/Screenshot_2026-09-02_at_1_44_09_PM.png`

## Conectar el dominio INISCH.com (requiere acción en Porkbun)

El lado de GitHub ya está listo. En Porkbun:
1. Registro **CNAME**: `www` -> `fondosdharma-a11y.github.io`
2. (Opcional) Registros **A** en la raíz -> 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
3. Esperar propagación DNS y activar "Enforce HTTPS" en GitHub cuando el dominio se verifique.

## Cómo ver el sitio localmente

Descarga el repositorio ("Code -> Download ZIP") y abre `docs/index.html` en tu navegador.

## Próximos pasos

Ver `/internal-docs/plan-maestro-inisch.md` para el detalle completo y la hoja de ruta por fases.
