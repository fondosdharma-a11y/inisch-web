# Guía paso a paso — Lo que te toca hacer a ti

Última actualización: 3 de septiembre de 2026

Esta lista es solo de las cosas que **yo no puedo hacer por ti**: requieren tu decisión, tus datos, tu tarjeta o tu identidad. Todo lo demás del sitio ya está construido y publicado.

Están ordenadas por impacto. Si solo puedes hacer tres, haz las tres primeras.

---

## 🔴 PRIORIDAD 1 — Sin esto no puedes cobrar ni capturar clientes

### Paso 1. Crear el proyecto en Supabase (≈25 min)
Esto desbloquea: campus de alumnos, formulario de contacto real, captura de correos en el test, programa de referidos e insignias.

1. Entra a **supabase.com** y crea una cuenta (el plan gratuito alcanza de sobra para empezar).
2. Botón **New Project**. Ponle de nombre `inisch`. Elige la región más cercana (`East US` o `West US`).
3. Te va a pedir una **contraseña de base de datos**. Genera una, y **guárdala en tu gestor de contraseñas** — no te la vuelve a mostrar.
4. Espera unos 2 minutos a que termine de crearse.
5. En el menú izquierdo entra a **SQL Editor** → **New query**.
6. Abre el archivo `database/schema.sql` del repositorio, copia **todo** su contenido y pégalo ahí.
7. Presiona **Run**. Debe decir "Success".
8. Ve a **Storage** → **New bucket**. Nómbralo exactamente `certificates` y marca la casilla **Public bucket**.
9. Ve a **Project Settings** (engrane) → **API**. Copia estos dos valores:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public key** (una cadena larga que empieza con `eyJ`)
10. **Mándame esos dos valores** y yo conecto el campus.

> ⚠️ La `anon key` es segura de compartir: está hecha para ir en el navegador. La que **nunca** debes compartir con nadie (ni conmigo) es la `service_role key`.

---

### Paso 2. Mandarme testimonios reales (≈30 min de tu tiempo)
Es lo que **más convierte** en este mercado y lo único que no puedo inventar.

1. Escoge de 3 a 6 personas que hayan terminado la Taller Intensivo o 2 y hayan tenido buena experiencia.
2. Escríbeles pidiéndoles autorización. Puedes usar este texto:

> *"Hola [nombre]. Estamos estrenando el sitio del Instituto y me encantaría incluir tu experiencia. ¿Me regalarías 3 o 4 líneas contando cómo llegaste y qué se movió en ti? Si te animas a grabarlo en video de 30 a 60 segundos, mejor todavía. Necesito tu permiso para publicarlo con tu nombre y foto — dime cómo prefieres aparecer."*

3. Junta de cada persona: **texto, nombre, ciudad, foto** (opcional) y **autorización por escrito** (basta un mensaje de WhatsApp diciendo que sí).
4. Mándamelos y monto la sección.

> ⚠️ Guarda las autorizaciones. Publicar el testimonio de alguien sin permiso es un problema legal, sobre todo tratándose de procesos personales.

---

### Paso 3. Definir las fechas de las próximas cohortes (≈15 min)
Hoy el sitio no dice cuándo empieza nada. Eso mata conversiones: la gente se interesa y no encuentra por dónde entrar.

Decide y mándame:
- Próxima **Taller Intensivo**: fecha, horario, modalidad (presencial/en línea), ciudad, cupo.
- Próxima **Diplomado**: fecha de inicio.
- Próxima **Certificación como Instructor**: fecha de inicio.
- ¿Hay fecha límite de inscripción?

---

## 🟠 PRIORIDAD 2 — Antes de cobrarle a la primera persona

### Paso 4. Revisión legal con un abogado (≈1 semana)
**Esto no es opcional si vas a cobrar y a guardar datos personales.**

Lleva a un abogado estos tres documentos del repositorio:
1. `docs/privacidad.html` — Aviso de Privacidad
2. `docs/terminos.html` — Términos y Condiciones
3. `internal-docs/politica-cancelacion-BORRADOR.md` — Política de cancelación

Pídele específicamente que revise:
- Cumplimiento con la **LFPDPPP** (ley mexicana de datos personales)
- Que lo que decimos sobre **SEP-CONOCER, RENAP, Apostilla y STPS** sea exacto y no prometa de más
- Que quede claro que **esto no es terapia ni tratamiento psicológico**

Busca un abogado con experiencia en comercio electrónico o protección de datos. Un notario no sirve para esto.

---

### Paso 5. Llenar la política de cancelación (≈20 min)
Abre `internal-docs/politica-cancelacion-BORRADOR.md`. Tiene **6 decisiones con casillas** que solo tú puedes tomar:
1. ¿Se reembolsa la Taller Intensivo y bajo qué condiciones?
2. ¿La inscripción de Programas 2 y 3 es reembolsable?
3. ¿Qué pasa si alguien abandona a medio programa?
4. **¿Cuánto tiempo dura el acceso a las clases grabadas?** ← hoy no está definido en ningún lado
5. Confirmar el trato de los costos de SEP-CONOCER
6. Confirmar qué pasa si INISCH cancela

Marca tus respuestas y mándamelas para redactar el texto final.

---

### Paso 6. Correo electrónico institucional (≈20 min)
Hoy el único contacto es WhatsApp. Un correo `@inisch.com` da mucha más seriedad, sobre todo para empresas.

1. Entra a tu cuenta de **Porkbun** (donde está el dominio).
2. Busca la sección de **Email** o **Email Forwarding**.
3. La opción más barata: crear un reenvío de `contacto@inisch.com` hacia tu Gmail actual. Suele ser gratis o casi.
4. Si quieres algo más profesional (poder *responder* desde esa dirección), contrata Google Workspace o Zoho Mail.
5. Mándame la dirección y la agrego a todas las páginas.

---

## 🟡 PRIORIDAD 3 — Para crecer

### Paso 7. Fotografía profesional (lo que más cambiaría el sitio)
Te lo digo con franqueza: el sitio ya tiene buena estructura visual, pero **no tiene una sola foto de una persona**. Eso es lo que más lo separa de verse como un instituto establecido.

Contrata una sesión de fotos —cuesta menos que casi cualquier herramienta— y consigue:
- 3 a 5 fotos de **Isabel** (retrato, dando clase, en consulta)
- Fotos de un **grupo en sesión** (con permiso de los participantes)
- Fotos del **espacio** donde imparten
- Fotos de una **inmersión sonora** o **círculo de mujeres**
- Alguna foto de **detalle**: manos, cuencos, el material

Formato: horizontales, buena luz natural, sin filtros. Mándamelas y las integro.

---

### Paso 8. Conectar Stripe para cobrar en línea (≈45 min)
Hoy el botón "Inscribirme" manda a WhatsApp. Funciona, pero pierdes a quien quiere pagar a las 11 de la noche.

1. Crea cuenta en **stripe.com** con los datos fiscales de INISCH.
2. Completa la verificación de identidad (te pedirán RFC y datos bancarios).
3. Crea los productos con los precios reales: Taller Intensivo, Diplomado (inscripción + mensualidad), Certificación como Instructor, curso DC-3.
4. Copia la **clave publicable** (`pk_live_...`) y mándamela.
5. La **clave secreta** (`sk_live_...`) **NO me la mandes**: se configura directo en Supabase.

> Antes de activar cobros necesitas terminado el Paso 4 (revisión legal) y el Paso 5 (política de cancelación).

---

### Paso 9. Perfil de Google Business (≈30 min)
Para que INISCH aparezca en Google Maps y en búsquedas locales.

1. Entra a **business.google.com** y crea el perfil.
2. Necesitas un **domicilio físico** o definir un área de servicio.
3. Google te va a enviar un **código de verificación por correo postal** — tarda entre 1 y 2 semanas.
4. Llena horarios, teléfono, sitio web (`https://www.inisch.com`) y sube fotos.
5. Pide reseñas a tus egresados.

---

### Paso 10. Grabar los 6 videos de la Taller Intensivo (≈1 día)
Los guiones ya están escritos en `internal-docs/guiones-video-etapa1.md`.

1. Grábalos con buena luz y buen audio (**el audio importa más que la imagen** — un micrófono de solapa de $500 pesos hace más diferencia que una cámara cara).
2. Súbelos a **YouTube como "No listado"** (no privado, no público).
3. Copia los enlaces y mándamelos para cargarlos en el campus.

---

### Paso 11. Redes sociales (continuo)
Ya te dejé **25 publicaciones listas** en `internal-docs/contenido-redes.md`, sacadas del Manual de Isabel.

1. Abre el archivo y escoge las 3 primeras.
2. Publica 3 veces por semana: un carrusel, un reel y un post.
3. Cada 4 publicaciones, incluye una que lleve al sitio (guía gratuita, calculadora o test).

---

### Paso 12. Comunidad de egresados (≈1 hora)
1. Decide entre **Discord** (gratis, más informal) o **Circle** (de pago, más profesional).
2. Crea el espacio con canales por etapa.
3. Mándame el enlace de invitación para ponerlo en el campus.

---

## Resumen: qué mandarme

Cuando tengas cualquiera de estas cosas, mándamela y yo la integro:

| Qué | De qué paso | Qué desbloquea |
|---|---|---|
| Project URL + anon key de Supabase | 1 | Campus, formularios, captura de correos |
| Testimonios + autorizaciones | 2 | Sección de testimonios |
| Fechas de cohortes | 3 | Fechas visibles en todo el sitio |
| Decisiones de cancelación | 5 | Política final redactada |
| Correo institucional | 6 | Contacto por correo en todo el sitio |
| Fotografías | 7 | Rediseño con imágenes reales |
| Clave publicable de Stripe | 8 | Pago en línea |
| Enlaces de los videos | 10 | Contenido del campus |
| Enlace de la comunidad | 12 | Acceso desde el campus |

---

## Seguridad: qué NO compartir nunca

- ❌ `service_role key` de Supabase
- ❌ `sk_live_...` de Stripe
- ❌ Contraseña de la base de datos
- ❌ Contraseñas de Porkbun, GitHub o Google
- ✅ Sí puedes compartir: `anon key` de Supabase y `pk_live_...` de Stripe (están diseñadas para ir públicas en el navegador)
