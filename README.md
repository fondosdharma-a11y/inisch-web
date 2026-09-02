# INISCH — Sitio web + Plataforma de Alumnos

Repositorio de trabajo para el desarrollo del sitio institucional y la plataforma de alumnos de **INISCH** (Instituto Internacional del Sistema Código Holográfico).

## Sitio publicado

**Español:** https://fondosdharma-a11y.github.io/inisch-web/
**English:** https://fondosdharma-a11y.github.io/inisch-web/en/

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
  certificaciones, faq, contacto, privacidad, terminos, blog/  -> Sitio en espanol
  /docs/en/                        -> SITIO COMPLETO EN INGLES (15 paginas, misma estructura)
  robots.txt, sitemap.xml, CNAME   -> SEO y dominio personalizado
  /docs/js/chat-widget.js          -> Widget del chat de IA (activo en ambos idiomas)
  /docs/campus/                    -> LA PLATAFORMA DE ALUMNOS (login, dashboard, certificados) — compartida entre idiomas
/assets                            -> Logotipo e imagenes de marca (pendiente subir, ver abajo)
```

## Idiomas

El sitio existe completo en **español** (`/docs/*.html`) e **inglés** (`/docs/en/*.html`), con un selector "EN"/"ES" en la barra de navegación de cada página que enlaza a su equivalente exacto en el otro idioma. Ambos idiomas comparten:

- La misma hoja de estilos y modo claro/oscuro (`/docs/css/main.css`)
- El mismo widget de chat de IA
- El mismo Campus de Alumnos (no duplicado; el botón "Student Portal"/"Campus de alumnos" lleva al mismo login sin importar el idioma de origen)

Páginas en inglés: `index, program, about, guidance, numerology, experiences, certifications, faq, contact, privacy, terms, blog/index, blog/conscious-observer, blog/forgiveness-transformation, blog/real-love`.

## Modo claro / oscuro

Todas las páginas (ambos idiomas + campus) tienen botón de tema: **claro** = "Código Ancestral", **oscuro** = "Holograma Vivo".

## 🚀 Activar el Campus de Alumnos

1. Crea proyecto gratuito en https://supabase.com
2. Corre `/database/schema.sql` en el SQL Editor
3. Crea bucket público `certificates` en Storage
4. Pega tus llaves en `docs/campus/js/supabase-config.js`

## 🤖 Activar el chat de IA

Despliega `supabase/functions/sales-chat` con tu ANTHROPIC_API_KEY, y agrega `window.INISCH_CHAT_FUNCTION_URL = 'tu-url';` antes del script del widget (avisame y lo hago en las 15+13 = 28 páginas de una vez).

## Estado actual

- [x] Dominio comprado y configurado del lado de GitHub Pages
- [x] Sitio institucional completo en español e inglés (28 páginas en total)
- [x] Selector de idioma EN/ES en todas las páginas
- [x] Modo claro/oscuro en todo el sitio
- [x] Blog con 3 artículos publicados en ambos idiomas
- [x] Campus construido: login, registro, progreso, certificado PDF automático (compartido entre idiomas)
- [x] Agente de IA de ventas construido (widget + Edge Function)
- [x] SEO técnico (robots.txt, sitemap.xml con las 28 URLs)
- [x] Guiones de los 6 videos de la Etapa 1 listos para grabar
- [ ] Apuntar el DNS de INISCH.com en Porkbun (ver abajo)
- [ ] Subir 2 imágenes de marca a `/assets` (ver abajo)
- [ ] Crear proyecto de Supabase y completar la conexión (gratis, requiere el usuario)
- [ ] Grabar los 6 videos de la Etapa 1
- [ ] Desplegar las 3 Edge Functions (requiere Supabase CLI)
- [ ] Revisar Aviso de Privacidad / Términos (ambos idiomas) con un abogado

## ⚠️ Pendiente: subir imágenes de marca a `/assets`

Sube estos 2 archivos (Add file -> Upload files), con estos nombres exactos:
- `assets/LOGO_INISCH_NUEVO_png_copia__1_.png`
- `assets/Screenshot_2026-09-02_at_1_44_09_PM.png`

## Conectar el dominio INISCH.com (requiere acción en Porkbun)

1. Registro **CNAME**: `www` -> `fondosdharma-a11y.github.io`
2. (Opcional) Registros **A** en la raíz -> 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
3. Esperar propagación DNS y activar "Enforce HTTPS" en GitHub.

## Cómo ver el sitio localmente

Descarga el repositorio ("Code -> Download ZIP") y abre `docs/index.html` (español) o `docs/en/index.html` (inglés) en tu navegador.

## Próximos pasos

Ver `/internal-docs/plan-maestro-inisch.md` para el detalle completo y la hoja de ruta por fases.
