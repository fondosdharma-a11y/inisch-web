# Plan Maestro — Sitio Web + Plataforma de Alumnos + Agentes IA
## Instituto Internacional del Sistema Código Holográfico (INISCH)

*Documento vivo — se actualiza conforme avanza el proyecto.*

---

## 1. Diagnóstico de lo que ya existe

- **Marca e identidad conceptual clara**: INISCH, Sistema Código Holográfico, guía Isabel Elizalde.
- **7 líneas de negocio/producto**: Formación de Especialistas (3 etapas), Acompañamiento Especializado, Rituales y Experiencias, Numerología Holográfica, Círculos de Mujeres, Inmersión Sonora, Viajes de Experiencia.
- **Programa formativo en 3 etapas** con objetivos, requisitos, duración, precios (MXN/USD) y rutas de certificación oficial (SEP-CONOCER EC1375, RENAP, Apostilla de La Haya, STPS/DC-3).
- **Contenido pedagógico extenso** (el Manual del Código Holográfico) convertible directamente en material de curso.
- **Canal de atención actual**: WhatsApp.

---

## 2. Estudio comparativo de instituciones similares

| Institución | Fortalezas | Debilidades | Qué se adapta para INISCH |
|---|---|---|---|
| Colegio Mexicano de Numerología | Identidad de marca fuerte, storytelling místico | Web poco estructurada por producto | Narrativa de marca + comunidad de egresados |
| ISEIH | Campus 24/7, "facultades" por área | Diseño genérico de plantilla LMS | Estructura de "Facultades" = 7 líneas de producto |
| Espacio Orión / CETEOH | Acceso de por vida, rutas aceleradas | Poca automatización de ventas | Ritmo flexible (regular vs. acelerado) |
| Escuelas SEP-CONOCER (IDEC, HDiosaBlanca) | Valor curricular/legal como gancho de venta | Checkout y soporte manual vía WhatsApp | Página dedicada de Certificación y Validez |
| Kajabi / Thinkific / Teachable / LearnWorlds | Cursos + comunidad + pagos + marketing integrados | Costo recurrente en USD, personalización limitada | Definen el piso tecnológico mínimo a igualar/superar |

**Conclusión:** los competidores directos tienen sitios funcionales pero visualmente genéricos y con poca automatización real. Ninguno combina narrativa de marca profunda + campus por etapas + automatización con IA. Ahí está la diferenciación de INISCH.

---

## 3. Arquitectura del sitio web institucional ✅ IMPLEMENTADO

Sitio publicado en GitHub Pages (`/docs` del repositorio, rama `main`): https://fondosdharma-a11y.github.io/inisch-web/

1. Inicio — propuesta de valor, 7 líneas de producto, CTA
2. El Sistema Código Holográfico — historia, fundamentos, Isabel Elizalde
3. Formación de Especialistas — Etapa 1 / 2 / 3, con precios y requisitos reales
4. Acompañamiento Especializado
5. Numerología Holográfica
6. Experiencias — Rituales, Círculos de Mujeres, Inmersión Sonora, Viajes
7. Certificaciones y Validez Oficial
8. Blog (3 artículos publicados)
9. Modo claro/oscuro en todas las páginas
10. Contacto / WhatsApp

Pendiente: conectar el dominio INISCH.com como dominio personalizado de GitHub Pages (requiere que el usuario agregue los registros DNS en Porkbun).

---

## 4. Plataforma de Alumnos (Campus Virtual)

### 4.1 Módulos funcionales necesarios
- Autenticación y perfil (alumno / instructor / admin)
- Catálogo de cursos por Etapa + cursos complementarios
- Reproductor de clases (on-demand + en vivo)
- Progreso y avance con desbloqueo por etapa
- Evaluaciones y prácticas supervisadas
- Certificados automáticos en PDF
- Comunidad tipo "Círculos"
- Pagos y mensualidades (Stripe)
- Calendario de sesiones en vivo
- Biblioteca de recursos descargables
- Panel de administración

### 4.2 DECISIÓN DE ARQUITECTURA (tomada por criterio de eficacia, automatización y menor costo)

Se descartaron las plataformas todo-en-uno (Kajabi/Thinkific) por su costo mensual recurrente en USD y baja capacidad de automatización a medida. Se descartó también WordPress+LMS por requerir mantenimiento de servidor y ser menos eficiente para integrar agentes de IA vía API.

**Stack elegido:**

| Capa | Herramienta | Por qué | Costo |
|---|---|---|---|
| Sitio de marca | GitHub Pages | Ya implementado, gratis, sin mantenimiento de servidor | $0 |
| Frontend del campus | App estática (HTML/JS o framework ligero) servida igual en GitHub Pages o Cloudflare Pages | Coherente con el resto del sitio, sin backend propio que mantener | $0 |
| Autenticación + Base de datos + Storage | **Supabase** (Postgres administrado) | Auth de alumnos, tablas de cursos/progreso/certificados, almacenamiento de PDFs, todo con API lista para usar desde el frontend estático. Plan gratuito: 500MB BD, 50,000 usuarios activos/mes, 1GB storage — suficiente para arrancar y crecer varios años antes de pagar | $0 al inicio, ~$25 USD/mes al escalar |
| Pagos | **Stripe** (ya decidido) | Checkout, suscripciones para mensualidades, webhooks | Solo comisión por transacción |
| Automatización (webhooks Stripe → activar acceso, recordatorios, etc.) | **Supabase Edge Functions** | Sin servidor propio que mantener, se ejecutan bajo demanda | Incluido en plan gratuito hasta cierto volumen |
| Video de clases | YouTube o Vimeo en modo "no listado", embebido en el campus | Evita costos de almacenamiento/ancho de banda de video, que son el gasto más caro en cualquier LMS propio | $0 |
| Certificados PDF | Generados por Edge Function a partir de una plantilla, guardados en Supabase Storage | Automatizado, sin intervención manual | Incluido |

**Por qué esta combinación gana en los 3 criterios pedidos:**
- **Eficacia:** Supabase da en una sola herramienta lo que en WordPress requeriría 4-5 plugins distintos (auth, base de datos, storage, API).
- **Automatización:** las Edge Functions permiten conectar Stripe → activación de acceso → notificación al alumno sin intervención manual, y son la misma tecnología que usarán después los agentes de IA (sección 5) para leer/escribir datos de alumnos.
- **Costo:** $0 de infraestructura hasta que haya un volumen real de alumnos pagando, momento en el cual el costo (~$25 USD/mes) es marginal frente al ingreso que ya estaría generando la Etapa 2/3.

### 4.3 Esquema inicial de base de datos (borrador)

```
students        (id, email, full_name, created_at)
enrollments     (id, student_id, etapa, status, stripe_subscription_id, started_at)
courses         (id, etapa, title, order_index)
lessons         (id, course_id, title, video_url, order_index, unlocks_after_lesson_id)
progress        (id, student_id, lesson_id, completed_at)
certificates    (id, student_id, etapa, issued_at, pdf_url, folio)
```

### 4.4 Próximos pasos de implementación
1. Crear proyecto en Supabase (gratuito) — requiere que el usuario cree la cuenta (correo + verificación), Claude puede diseñar el esquema y el código pero no puede crear la cuenta por él.
2. Definir las tablas del esquema 4.3 y las políticas de seguridad (Row Level Security) para que cada alumno solo vea su propio progreso.
3. Construir la pantalla de login/registro del campus (frontend estático + supabase-js).
4. Cargar el catálogo de cursos de la Etapa 1 como piloto.
5. Conectar Stripe Checkout → Edge Function → activación automática de acceso.

---

## 5. Agentes de IA por área

| Área | Agente | Prioridad |
|---|---|---|
| Ventas / Admisiones | Chat WhatsApp/Web | Alta |
| Onboarding de alumnos | Bienvenida en campus | Alta |
| Soporte 24/7 | Mesa de ayuda | Alta |
| Cobranza | Recordatorios de pago | Media-alta |
| Tutor de contenido | Guía IA del Código Holográfico | Media-alta |
| Marketing de contenido | Generador de blog/redes | Media |
| Retroalimentación de tareas | Revisión asistida | Media |
| Reportes | Dashboard analítico | Media |
| Certificación/trámites | Gestión documental | Baja-media |

*Nota: en procesos con datos sensibles de alumnos, los agentes de IA son apoyo/borrador, nunca decisores únicos.*

---

## 6. Plan de trabajo por fases

### Fase 0 — Fundamentos ✅ completado
- [x] Dominio INISCH.com (Porkbun)
- [x] Stripe como pasarela de pago
- [x] Logotipo recibido
- [x] Arquitectura de información del sitio definida

### Fase 1 — Sitio web institucional ✅ completado
- [x] Dirección de diseño definida (con modo claro/oscuro usando ambas propuestas)
- [x] Todas las páginas internas construidas con datos reales
- [x] Blog con 3 artículos publicados
- [x] Publicado en GitHub Pages
- [ ] Conectar dominio INISCH.com (DNS en Porkbun)
- [ ] Primer agente IA: chat de ventas/WhatsApp

### Fase 2 — Plataforma de alumnos / Campus 🔄 siguiente
- [x] Arquitectura técnica decidida (Supabase + Stripe + frontend estático)
- [ ] Cuenta de Supabase creada (requiere acción del usuario)
- [ ] Esquema de base de datos implementado
- [ ] Login/registro del campus
- [ ] Catálogo Etapa 1 como piloto
- [ ] Progreso, certificados, pagos
- [ ] Comunidad / Círculos

### Fase 3 — Agentes IA avanzados
- [ ] Agente tutor entrenado con el Manual
- [ ] Agente de cobranza
- [ ] Agente de marketing de contenido
- [ ] Dashboard analítico

### Fase 4 — Piloto y lanzamiento
- [ ] Cohorte piloto Etapa 1
- [ ] Ajustes de UX
- [ ] Lanzamiento oficial

### Fase 5 — Optimización continua
- [ ] Iterar agentes con datos reales
- [ ] Evaluar migración a plataforma a medida
- [ ] Expandir catálogo reservable en línea
