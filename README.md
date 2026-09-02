# INISCH — Sitio web + Plataforma de Alumnos

Repositorio de trabajo para el desarrollo del sitio institucional y la plataforma de alumnos de **INISCH** (Instituto Internacional del Sistema Código Holográfico).

## Sitio publicado

**https://fondosdharma-a11y.github.io/inisch-web/**

Publicado con GitHub Pages desde la carpeta `/docs` de la rama `main`. El repositorio es público (requisito de GitHub Pages en el plan gratuito).

## Estructura

```
/internal-docs                     -> Documentacion de planeacion del proyecto (no se publica)
/database/schema.sql               -> Esquema completo de base de datos para Supabase
/supabase/functions/stripe-webhook -> Edge Function que activa el acceso al pagar en Stripe
/docs                              -> Sitio real publicado por GitHub Pages
  /docs/css/main.css               -> Hoja de estilos compartida, con modo claro y oscuro
  /docs/js/theme.js                -> Logica del boton de modo claro/oscuro
  /docs/index.html ... contacto.html, blog/  -> Paginas del sitio de marca
  /docs/campus/                    -> LA PLATAFORMA DE ALUMNOS (campus virtual)
    /docs/campus/login.html        -> Inicio de sesion / registro
    /docs/campus/dashboard.html    -> Catalogo de la Etapa 1 y progreso del alumno
    /docs/campus/js/supabase-config.js -> AQUI SE PEGAN LAS LLAVES DE SUPABASE (ver abajo)
    /docs/campus/js/app.js         -> Logica compartida de sesion/logout
    /docs/campus/css/campus.css    -> Estilos del campus
/assets                            -> Logotipo e imagenes de marca (subidas manualmente, ver abajo)
```

## Modo claro / oscuro

Todas las paginas (incluido el campus) tienen un boton de tema en la barra de navegacion:

- **Modo claro** = direccion "Codigo Ancestral": fondo marfil, teal + oro.
- **Modo oscuro** = direccion "Holograma Vivo": fondo teal oscuro, mismos acentos.

## 🚀 Como activar el Campus de Alumnos (3 pasos, ~10 minutos)

El campus ya esta construido (login, registro, catalogo de la Etapa 1, seguimiento de progreso). Le falta un solo paso para funcionar de verdad: conectarlo a una base de datos gratuita.

**Paso 1 — Crear el proyecto en Supabase**
1. Ve a https://supabase.com y crea una cuenta gratuita (con tu correo o con GitHub).
2. Crea un proyecto nuevo (elige cualquier nombre, por ejemplo "inisch-campus", y una contraseña segura para la base de datos — guardala).
3. Espera 1-2 minutos mientras Supabase aprovisiona el proyecto.

**Paso 2 — Cargar el esquema de base de datos**
1. En el menu izquierdo de Supabase, entra a **SQL Editor**.
2. Abre el archivo `/database/schema.sql` de este repositorio, copia todo su contenido.
3. Pegalo en el SQL Editor de Supabase y presiona **Run**.
4. Esto crea todas las tablas (perfiles, cursos, lecciones, inscripciones, progreso, certificados) y carga la Etapa 1 como catalogo piloto.

**Paso 3 — Conectar las llaves**
1. En Supabase, ve a **Project Settings -> API**.
2. Copia el valor de **Project URL**.
3. Copia el valor de **anon public** (la llave publica, NO la "service_role").
4. En GitHub, edita el archivo `docs/campus/js/supabase-config.js` (boton del lapiz para editar directo en la web) y pega ambos valores donde dice `PEGA_AQUI_TU_...`.
5. Guarda (Commit changes).

Listo — en cuanto GitHub Pages vuelva a publicar (1-2 minutos), el botón "Campus de alumnos" del sitio ya permite crear cuenta, iniciar sesion y ver el progreso real guardado en tu base de datos.

### Activar cobros automaticos (opcional, mas adelante)
Cuando quieras que Stripe active el acceso automaticamente al pagar, sigue las instrucciones dentro de `/supabase/functions/stripe-webhook/index.ts` (requiere instalar la CLI de Supabase). Mientras tanto, puedes dar de alta manualmente a un alumno como "activo" desde el Table Editor de Supabase.

## Plataforma de alumnos: decision de arquitectura

Se decidio (ver `/internal-docs/plan-maestro-inisch.md`, seccion 4) construir el campus sobre **Supabase** (Postgres + Auth + Storage + Edge Functions) + **Stripe** para pagos + **video en YouTube/Vimeo no listado** para evitar costos de almacenamiento. Esta combinacion da el mejor balance de eficacia, automatizacion y costo: practicamente $0 hasta que haya alumnos pagando en volumen real.

## Estado actual

- [x] Dominio comprado: **INISCH.com** (Porkbun)
- [x] Pasarela de pago decidida: **Stripe**
- [x] Logotipo de marca recibido
- [x] Sitio institucional completo, publicado en GitHub Pages
- [x] Modo claro/oscuro en todas las paginas
- [x] Blog con 3 articulos publicados
- [x] Arquitectura de la plataforma de alumnos decidida y **construida** (login, dashboard, esquema SQL, Edge Function de Stripe)
- [ ] Crear el proyecto de Supabase y pegar las llaves (ver instrucciones arriba — requiere accion del usuario, es gratis)
- [ ] Conectar dominio INISCH.com como dominio personalizado de GitHub Pages
- [ ] Cargar videos reales de la Etapa 1 (YouTube/Vimeo no listado) en la tabla `lessons`
- [ ] Desplegar la Edge Function de Stripe para activacion automatica de pagos
- [ ] Generacion automatica de certificados en PDF
- [ ] Primeros agentes de IA

## ⚠️ Pendiente: subir imágenes de marca a `/assets`

Sube estos 2 archivos a la carpeta `assets/` del repositorio (Add file -> Upload files), con estos nombres exactos:

- `assets/LOGO_INISCH_NUEVO_png_copia__1_.png`
- `assets/Screenshot_2026-09-02_at_1_44_09_PM.png`

## Conectar el dominio INISCH.com (pendiente, requiere accion del usuario)

1. En GitHub: Settings del repo -> Pages -> Custom domain -> escribir `www.inisch.com`.
2. En Porkbun: agregar un registro CNAME apuntando `www` a `fondosdharma-a11y.github.io`, y/o registros A apuntando la raiz a 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153.
3. Esperar propagacion DNS y activar "Enforce HTTPS" en GitHub.

## Como ver el sitio localmente

Descarga el repositorio ("Code -> Download ZIP") y abre `docs/index.html` en tu navegador. El campus (`docs/campus/login.html`) tambien funciona localmente una vez conectadas las llaves de Supabase.

## Proximos pasos

Ver `/internal-docs/plan-maestro-inisch.md` para el detalle completo y la hoja de ruta por fases.
