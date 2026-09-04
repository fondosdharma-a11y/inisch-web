# INISCH — Sitio web + Plataforma de Alumnos

## 🌐 SITIO EN VIVO

### https://www.inisch.com

| | |
|---|---|
| **Español** | https://www.inisch.com |
| **English** | https://www.inisch.com/en/ |
| **Campus de Alumnos** | https://www.inisch.com/campus/login.html |

- Dominio propio activo con **HTTPS forzado** (certificado válido hasta 2026-12-01, renovación automática)
- `inisch.com` redirige automáticamente a `www.inisch.com`
- 34 rutas verificadas funcionando (ES + EN + campus + SEO)

---

## Estructura

```
/internal-docs
  plan-maestro-inisch.md           -> Plan y decisiones del proyecto
  guiones-video-etapa1.md          -> Guiones para grabar los 6 videos de la Taller Intensivo
/database/schema.sql               -> Esquema de base de datos para Supabase
/supabase/functions/
  /stripe-webhook                  -> Activa el acceso del alumno al pagar en Stripe
  /generate-certificate            -> Genera el PDF de constancia al completar un programa
  /sales-chat                      -> Agente de IA de ventas/admisiones (Claude)
/docs                              -> Sitio publicado por GitHub Pages
  CNAME                            -> www.inisch.com
  index, formacion, nosotros, acompanamiento, numerologia, experiencias,
  certificaciones, faq, contacto, privacidad, terminos, blog/  -> Sitio en espanol
  /docs/en/                        -> Sitio completo en ingles (15 paginas)
  /docs/campus/                    -> Plataforma de alumnos (login, dashboard, certificados)
  robots.txt, sitemap.xml          -> SEO (28 URLs)
/assets                            -> Logotipo e imagenes de marca (PENDIENTE subir)
```

## Idiomas

Sitio completo en **español** e **inglés**, con selector EN/ES en cada página que enlaza a su equivalente exacto. Ambos comparten CSS, modo claro/oscuro, widget de chat y el mismo Campus de Alumnos.

## Modo claro / oscuro

Botón de tema en todas las páginas: **claro** = "Código Ancestral" (marfil, teal + oro), **oscuro** = "Holograma Vivo" (teal oscuro).

## Estado actual

- [x] **Dominio www.inisch.com activo con HTTPS**
- [x] Sitio institucional completo ES + EN (34 rutas verificadas)
- [x] Modo claro/oscuro en todo el sitio
- [x] Blog con 3 artículos en ambos idiomas
- [x] Campus construido (login, progreso, certificado PDF automático)
- [x] Agente de IA de ventas construido (widget + Edge Function)
- [x] SEO técnico (robots.txt, sitemap.xml)
- [x] Guiones de los 6 videos de la Taller Intensivo
- [ ] Subir 2 imágenes de marca a `/assets` — el logo y el banner aún no se ven en el sitio
- [ ] Crear proyecto de Supabase y pegar llaves en `docs/campus/js/supabase-config.js`
- [ ] Grabar los 6 videos de la Taller Intensivo
- [ ] Desplegar las 3 Edge Functions (requiere Supabase CLI)
- [ ] Revisar Aviso de Privacidad / Términos con un abogado

## ⚠️ Siguiente paso inmediato: subir imágenes de marca

Link directo: https://github.com/fondosdharma-a11y/inisch-web/upload/main/assets

Sube estos 2 archivos con estos nombres exactos:
- `LOGO_INISCH_NUEVO_png_copia__1_.png`
- `Screenshot_2026-09-02_at_1_44_09_PM.png`

En cuanto estén, el logo y el banner aparecen automáticamente en las 34 páginas.

## Activar el Campus de Alumnos

1. Crea proyecto gratuito en https://supabase.com
2. Corre `/database/schema.sql` en el SQL Editor
3. Crea bucket público `certificates` en Storage
4. Pega Project URL + anon key en `docs/campus/js/supabase-config.js`

## Nota histórica sobre el dominio

El dominio tardo en activarse porque Porkbun tenia un servicio de **parking/URL forwarding** que interceptaba el trafico y lo redirigia a su pagina promocional (`inisch-com.l.ink`), ignorando los registros DNS. Al desactivarlo, el dominio funciono de inmediato. Si en el futuro el sitio vuelve a mostrar una pagina de Porkbun, revisar que ese forwarding no se haya reactivado.

## Cómo ver el sitio localmente

Descarga el repositorio ("Code -> Download ZIP") y abre `docs/index.html` (español) o `docs/en/index.html` (inglés).
