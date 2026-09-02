# INISCH — Sitio web + Plataforma de Alumnos

Repositorio de trabajo para el desarrollo del sitio institucional y la plataforma de alumnos de **INISCH** (Instituto Internacional del Sistema Código Holográfico).

## Sitio publicado

**https://fondosdharma-a11y.github.io/inisch-web/**

Publicado con GitHub Pages desde la carpeta `/docs` de la rama `main`. El repositorio es público (requisito de GitHub Pages en el plan gratuito) — esto es correcto para un sitio de marketing que de todas formas debe ser visible al público.

## Estructura

```
/internal-docs               -> Documentacion de planeacion del proyecto (no se publica)
/docs                        -> Sitio real publicado por GitHub Pages
  /docs/css/main.css         -> Hoja de estilos compartida, con modo claro y oscuro
  /docs/js/theme.js          -> Logica del boton de modo claro/oscuro (persistente via localStorage)
  /docs/index.html           -> Home
  /docs/formacion.html       -> Formacion de Especialistas (Etapas 1, 2 y 3 completas)
  /docs/acompanamiento.html  -> Acompanamiento Especializado
  /docs/numerologia.html     -> Numerologia Holografica
  /docs/experiencias.html    -> Rituales, Circulos de Mujeres, Inmersion Sonora, Viajes
  /docs/certificaciones.html -> SEP-CONOCER, RENAP, Apostilla de La Haya, STPS/DC-3
  /docs/contacto.html        -> Contacto / WhatsApp
  /docs/blog/                -> Indice de blog + 3 articulos publicados
  /docs/propuesta-1-*.html   -> Mockup de diseno original (referencia)
  /docs/propuesta-3-*.html   -> Mockup de diseno alternativo (referencia)
/assets                      -> Logotipo e imagenes de marca (subidas manualmente, ver abajo)
```

## Modo claro / oscuro

Todas las paginas tienen un boton de tema en la barra de navegacion:

- **Modo claro** = direccion "Codigo Ancestral": fondo marfil, teal + oro, tipografia Cormorant Garamond + Jost.
- **Modo oscuro** = direccion "Holograma Vivo": fondo teal oscuro, mismos acentos teal + oro, tipografia Space Grotesk + IBM Plex Sans.

La preferencia se guarda en el navegador del visitante.

## Plataforma de alumnos: decision de arquitectura

Se decidio (ver `/internal-docs/plan-maestro-inisch.md`, seccion 4) construir el campus sobre:

- **Supabase** (Postgres + Auth + Storage + Edge Functions) para autenticacion, base de datos de cursos/progreso/certificados
- **Stripe** para pagos y mensualidades
- **Video** alojado en YouTube/Vimeo no listado (evita costos de almacenamiento)
- **Frontend** estatico, servido igual que el sitio de marca

Esta combinacion da el mejor balance de eficacia, automatizacion y costo (practicamente $0 hasta que haya alumnos pagando en volumen). Detalle completo, esquema de base de datos y proximos pasos en el documento de planeacion.

## Estado actual

- [x] Dominio comprado: **INISCH.com** (Porkbun)
- [x] Pasarela de pago decidida: **Stripe**
- [x] Logotipo de marca recibido
- [x] Sitio institucional completo, publicado en GitHub Pages
- [x] Modo claro/oscuro en todas las paginas
- [x] Blog con 3 articulos publicados
- [x] Arquitectura de la plataforma de alumnos decidida (Supabase + Stripe)
- [ ] Conectar dominio INISCH.com como dominio personalizado de GitHub Pages
- [ ] Crear proyecto de Supabase (requiere que el usuario cree la cuenta)
- [ ] Construir el campus (login, cursos, progreso, certificados)
- [ ] Primeros agentes de IA

## ⚠️ Pendiente: subir imágenes de marca a `/assets`

Para que el sitio se vea completo, sube estos 2 archivos a la carpeta `assets/` del repositorio, con estos nombres exactos:

- `assets/LOGO_INISCH_NUEVO_png_copia__1_.png` — logotipo completo (emblema + texto)
- `assets/Screenshot_2026-09-02_at_1_44_09_PM.png` — banner de marca (solo visible en modo claro)

Como subirlos: entra a https://github.com/fondosdharma-a11y/inisch-web, abre la carpeta `assets`, boton **Add file -> Upload files**, arrastra los 2 archivos y da **Commit changes**. El sitio en GitHub Pages los tomara automaticamente sin ningún paso adicional.

## Conectar el dominio INISCH.com (pendiente, requiere accion del usuario)

1. En GitHub: Settings del repo -> Pages -> Custom domain -> escribir `www.inisch.com` (o `inisch.com`).
2. En Porkbun (donde se compro el dominio): agregar un registro CNAME apuntando `www` a `fondosdharma-a11y.github.io`, y/o registros A apuntando la raíz a las IPs de GitHub Pages (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153).
3. Esperar propagacion DNS (minutos a horas) y activar "Enforce HTTPS" en GitHub una vez verificado.

## Como ver el sitio localmente

Descarga el repositorio ("Code -> Download ZIP" o `git clone`) y abre `docs/index.html` directamente en tu navegador.

## Proximos pasos

Ver `/internal-docs/plan-maestro-inisch.md`, secciones 4 y 6, para el detalle de la plataforma de alumnos y la hoja de ruta completa.
