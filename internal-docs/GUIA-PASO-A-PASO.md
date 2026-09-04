# Guía paso a paso — Lo que te toca a ti

Actualizada: 4 de septiembre de 2026

Solo lo que **yo no puedo hacer**: requiere tu decisión, tus datos, tu tarjeta o tu identidad.
Ordenado por impacto.

---

## 🔴 URGENTE — bloquea cosas que ya están construidas

### 1. Clave de API para los agentes (5 minutos)
Los dos agentes de IA están **desplegados y activos**, pero responden con un mensaje de respaldo
porque falta la clave.

1. Entra a <https://console.anthropic.com> y crea una clave
2. **Ponle un límite de gasto mensual desde el primer día**
3. En Supabase: **Edge Functions → Secrets → Add new secret**
4. Nombre exacto: `ANTHROPIC_API_KEY`

Con eso se activan: el agente de admisiones del sitio y las herramientas del campus.

### 2. Decidir quién es instructor (2 minutos)
Hay **14 cuentas registradas**, todas como "alumno". Nadie puede entrar a *Instructores*
ni a *Herramientas* hasta que asignes roles.

Dime los nombres y yo los cambio. Ten en cuenta que el rol de instructor da acceso a
**el avance de todos los alumnos** (nunca a Mi Película ni a la Bitácora, que son privadas).

### 3. Completar los datos del taller del 10 y 11 de octubre
En `docs/js/cohortes.js` falta:
- **Ciudad** — hoy solo dice "Presencial y en línea"
- **Cupo** — si lo pones, aparece "20 lugares" y genera urgencia real

La fecha límite (3 de octubre) ya está cargada y la etiqueta *"Cierra pronto"* ya se muestra sola.

### 4. Testimonios con autorización escrita
`docs/js/testimonios.js`. La sección se oculta sola mientras esté vacía, así que no se ve mal,
pero es lo que más convierte y lo único que no puedo construir.

---

## 🟠 ANTES DE COBRAR

### 5. Revisión legal
Lleva a un abogado de comercio electrónico o protección de datos:
- `docs/privacidad.html` y `docs/en/privacy.html`
- `docs/terminos.html` y `docs/en/terms.html`
- `internal-docs/politica-cancelacion-BORRADOR.md`

Puntos a revisar específicamente:
- Cumplimiento con la LFPDPPP
- Que lo dicho sobre SEP-CONOCER, RENAP, Apostilla y STPS sea exacto
- El banner de cookies de Google Analytics
- **Los agentes de IA**: que quede claro que no dan consejo terapéutico
- La consulta con Isabel: qué se ofrece exactamente por $1,500 MXN

### 6. Las 6 decisiones de cancelación
En `internal-docs/politica-cancelacion-BORRADOR.md`. Una sigue sin definirse y es importante:
**cuánto dura el acceso a las clases grabadas**.

### 7. Correo institucional
En Porkbun, reenvío de `contacto@inisch.com` a tu Gmail. Suele ser gratis.

### 8. Correo transaccional propio
El correo de Supabase es solo para pruebas y **no aguanta una cohorte inscribiéndose el mismo día**.
Resend tiene plan gratuito de 3,000 al mes. Se configura en **Authentication → Emails → SMTP**.

---

## 🟡 PARA CRECER

### 9. Etiqueta de Analytics dentro de Tag Manager
El contenedor `GTM-5GVFHKR3` carga en las 54 páginas, pero **Google Analytics está conectado
directo en el código**, así que ya mide. No agregues el ID `G-D1VPYL1QY8` dentro de Tag Manager
o contarás doble.

### 10. Grabar los 6 videos del Taller
Guiones en `internal-docs/guiones-video-etapa1.md`. Súbelos a YouTube **como No listado** y pásame
los enlaces. La página de lección ya está construida y guarda el minuto donde se quedó cada alumno.

### 11. Redes sociales
25 publicaciones listas en `internal-docs/contenido-redes.md`. Con el taller a 5 semanas,
**este es el momento**. Publica 3 por semana y cada cuarta menciona la fecha.

### 12. Stripe
Cuando estén listos los puntos 5 y 6. La clave publicable (`pk_live_`) me la puedes pasar;
la secreta (`sk_live_`) va directo en Supabase.

### 13. Google Business Profile
Necesitas domicilio físico. La verificación por correo postal tarda una o dos semanas.

### 14. Facebook y X para inicio de sesión
Google ya funciona. Los botones de los otros dos están puestos y se activan solos al pegar
las credenciales. Instrucciones exactas dadas en el chat.

---

## Qué mandarme

| Qué | Desbloquea |
|---|---|
| Nombres para rol de instructor | Panel de instructores y Herramientas |
| Ciudad y cupo del taller | Ficha completa del evento |
| Testimonios + autorizaciones | Sección de testimonios |
| Decisiones de cancelación | Política final |
| Correo institucional | Contacto por correo |
| Enlaces de los videos | Contenido del campus |
| `pk_live_` de Stripe | Pago en línea |

## Nunca compartir
❌ `service_role` de Supabase · `sk_live_` de Stripe · contraseñas · `ANTHROPIC_API_KEY`
✅ Sí: `anon key` de Supabase y `pk_live_` de Stripe (son públicas por diseño)
