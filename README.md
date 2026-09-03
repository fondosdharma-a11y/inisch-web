# INISCH — Sitio web + Plataforma de Alumnos

## ✅ SITIO ACTIVO Y FUNCIONANDO

**Español:** https://fondosdharma-a11y.github.io/inisch-web/
**English:** https://fondosdharma-a11y.github.io/inisch-web/en/

Las 34 páginas del sitio (ES + EN + campus + sitemap) fueron verificadas y responden correctamente.

---

## ⚠️ IMPORTANTE: por qué inisch.com todavía no funciona

**Causa identificada:** Porkbun tiene activado un servicio de **parking / redirección** en el dominio. Al abrir `www.inisch.com` o `inisch.com`, Porkbun redirige a su propia página promocional (`inisch-com.l.ink` — "A Brand New Domain!"), **ignorando los registros DNS configurados**.

Esto también estaba rompiendo el acceso por `github.io`, porque el archivo `CNAME` hacía que GitHub redirigiera todo el tráfico al dominio secuestrado. Por eso se removió el CNAME temporalmente y el sitio volvió a estar accesible.

### Cómo arreglarlo (acción del usuario en Porkbun)

1. Entra a **porkbun.com** → tu dominio **inisch.com**
2. Busca y **DESACTIVA** cualquiera de estas opciones si está encendida:
   - **URL Forwarding** / **Domain Forwarding** / **Redirect**
   - **Parking** / **Parked page** / **Coming Soon page**
   - Cualquier entrada de tipo **ALIAS** o **URL Redirect** en los DNS Records apuntando a `l.ink` o a Porkbun
3. Verifica que en **DNS Records** solo queden estos 5 registros:

| Type | Host | Answer |
|---|---|---|
| CNAME | `www` | `fondosdharma-a11y.github.io` |
| A | (vacío) | 185.199.108.153 |
| A | (vacío) | 185.199.109.153 |
| A | (vacío) | 185.199.110.153 |
| A | (vacío) | 185.199.111.153 |

4. Cuando el parking esté desactivado y los registros correctos, avisa para volver a activar el dominio personalizado en GitHub Pages (volver a crear `docs/CNAME` con `www.inisch.com` y activar Enforce HTTPS).

---

## Estructura

```
/internal-docs
  plan-maestro-inisch.md           -> Plan y decisiones del proyecto
  guiones-video-etapa1.md          -> Guiones para grabar los 6 videos de la Etapa 1
/database/schema.sql               -> Esquema de base de datos para Supabase
/supabase/functions/
  /stripe-webhook                  -> Activa el acceso del alumno al pagar en Stripe
  /generate-certificate            -> Genera el PDF de constancia al completar una etapa
  /sales-chat                      -> Agente de IA de ventas/admisiones (Claude)
/docs                              -> Sitio publicado por GitHub Pages
  index, formacion, nosotros, acompanamiento, numerologia, experiencias,
  certificaciones, faq, contacto, privacidad, terminos, blog/  -> Sitio en espanol
  /docs/en/                        -> Sitio completo en ingles (15 paginas)
  /docs/campus/                    -> Plataforma de alumnos (login, dashboard, certificados)
  robots.txt, sitemap.xml          -> SEO (28 URLs indexadas)
/assets                            -> Logotipo e imagenes de marca (PENDIENTE subir)
```

## Idiomas

Sitio completo en **español** e **inglés**, con selector EN/ES en cada página que enlaza a su equivalente exacto. Ambos comparten CSS, modo claro/oscuro, widget de chat y el mismo Campus de Alumnos.

## Modo claro / oscuro

Botón de tema en todas las páginas: **claro** = "Código Ancestral" (marfil, teal + oro), **oscuro** = "Holograma Vivo" (teal oscuro).

## Estado actual

- [x] Sitio institucional completo ES + EN (34 rutas verificadas funcionando)
- [x] Publicado y accesible en GitHub Pages con HTTPS
- [x] Modo claro/oscuro en todo el sitio
- [x] Blog con 3 artículos en ambos idiomas
- [x] Campus construido (login, progreso, certificado PDF automático)
- [x] Agente de IA de ventas construido (widget + Edge Function)
- [x] SEO técnico (robots.txt, sitemap.xml)
- [x] Guiones de los 6 videos de la Etapa 1
- [ ] **Desactivar el parking/forwarding de Porkbun** (ver arriba — bloquea el dominio propio)
- [ ] Subir 2 imágenes de marca a `/assets`
- [ ] Crear proyecto de Supabase y pegar llaves en `docs/campus/js/supabase-config.js`
- [ ] Grabar los 6 videos de la Etapa 1
- [ ] Desplegar las 3 Edge Functions (requiere Supabase CLI)
- [ ] Revisar Aviso de Privacidad / Términos con un abogado

## ⚠️ Pendiente: subir imágenes de marca a `/assets`

Link directo: https://github.com/fondosdharma-a11y/inisch-web/upload/main/assets

Sube estos 2 archivos con estos nombres exactos:
- `LOGO_INISCH_NUEVO_png_copia__1_.png`
- `Screenshot_2026-09-02_at_1_44_09_PM.png`

## Activar el Campus de Alumnos

1. Crea proyecto gratuito en https://supabase.com
2. Corre `/database/schema.sql` en el SQL Editor
3. Crea bucket público `certificates` en Storage
4. Pega Project URL + anon key en `docs/campus/js/supabase-config.js`

## Cómo ver el sitio localmente

Descarga el repositorio ("Code -> Download ZIP") y abre `docs/index.html` (español) o `docs/en/index.html` (inglés).
