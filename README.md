# INISCH — Sitio web + Plataforma de Alumnos

Repositorio de trabajo para el desarrollo del sitio institucional y la plataforma de alumnos de **INISCH** (Instituto Internacional del Sistema Código Holográfico).

## Estructura

```
/docs                        -> Documentacion de planeacion del proyecto
/site                        -> Sitio web real (HTML/CSS estatico, sin build)
  /site/css/main.css         -> Hoja de estilos compartida, con modo claro y oscuro
  /site/js/theme.js          -> Logica del boton de modo claro/oscuro (persistente via localStorage)
  /site/index.html           -> Home
  /site/formacion.html       -> Formacion de Especialistas (Etapas 1, 2 y 3 completas)
  /site/acompanamiento.html  -> Acompanamiento Especializado
  /site/numerologia.html     -> Numerologia Holografica
  /site/experiencias.html    -> Rituales, Circulos de Mujeres, Inmersion Sonora, Viajes
  /site/certificaciones.html -> SEP-CONOCER, RENAP, Apostilla de La Haya, STPS/DC-3
  /site/contacto.html        -> Contacto / WhatsApp
  /site/blog/                -> Indice de blog + primer articulo publicado
  /site/propuesta-1-*.html   -> Mockup de diseno original (referencia, no forma parte del sitio real)
  /site/propuesta-3-*.html   -> Mockup de diseno alternativo (referencia, no forma parte del sitio real)
/assets                      -> Logotipo e imagenes de marca (subidas manualmente, ver abajo)
```

## Modo claro / oscuro

Todas las paginas tienen un boton de tema en la barra de navegacion (icono de luna/sol):

- **Modo claro** = direccion de diseno "Codigo Ancestral": fondo marfil, teal + oro, tipografia Cormorant Garamond + Jost.
- **Modo oscuro** = direccion de diseno "Holograma Vivo": fondo teal oscuro casi negro, mismos acentos teal + oro, tipografia Space Grotesk + IBM Plex Sans, fondo con resplandor sutil.

La preferencia se guarda en el navegador del visitante (localStorage) y se respeta en su proxima visita. El banner de marca (masthead con foto de marmol) solo se muestra en modo claro, ya que su fondo esta pensado para tonos claros.

## Estado actual

- [x] Dominio comprado: **INISCH.com** (Porkbun)
- [x] Pasarela de pago decidida: **Stripe** (integracion pendiente)
- [x] Logotipo de marca recibido
- [x] Plan maestro (`/docs/plan-maestro-inisch.md`)
- [x] Sitio web institucional completo en `/site`: Home, Formacion (3 etapas con precios y requisitos reales), Acompanamiento, Numerologia, Experiencias, Certificaciones, Contacto, Blog (1 articulo publicado + 2 en indice)
- [x] Modo claro/oscuro en todas las paginas, usando las 2 direcciones de diseno ya desarrolladas
- [ ] Conectar dominio INISCH.com al hosting del sitio
- [ ] Integrar Stripe para pagos/inscripciones
- [ ] Plataforma de alumnos (campus virtual) — el boton "Campus de alumnos" en el sitio aún no enlaza a nada real
- [ ] Segundo y tercer articulo del blog
- [ ] Primeros agentes de IA (ver `/docs/plan-maestro-inisch.md`, seccion 5)

## ⚠️ Pendiente: subir imágenes de marca a `/assets`

Para que el sitio se vea completo, sube estos 2 archivos a la carpeta `assets/` del repositorio, con estos nombres exactos:

- `assets/LOGO_INISCH_NUEVO_png_copia__1_.png` — logotipo completo (emblema + texto)
- `assets/Screenshot_2026-09-02_at_1_44_09_PM.png` — banner de marca (fondo marmoleado con logo, solo visible en modo claro)

Como subirlos (sin necesidad de Git ni terminal):
1. Entra a https://github.com/fondosdharma-a11y/inisch-web
2. Entra a la carpeta `assets`
3. Boton **Add file -> Upload files**
4. Arrastra los 2 archivos desde tu computadora y da **Commit changes**

## Como ver el sitio localmente

Descarga el repositorio ("Code -> Download ZIP" o `git clone`) y abre `site/index.html` directamente en tu navegador — no requiere servidor ni instalacion, es HTML/CSS/JS puro.

## Proximos pasos

Ver `/docs/plan-maestro-inisch.md`, seccion 6 (Fases 0-5) para la hoja de ruta completa.
