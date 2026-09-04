# Funciones desplegadas en Supabase

Proyecto: `ygzpxtwozqfrncvqrgqo`

| Funcion | Estado | JWT | Que hace |
|---|---|---|---|
| `sales-chat` | ACTIVA | no requiere | Agente de admisiones del sitio publico. Responde dudas sobre los tres programas con informacion real y **detecta cuando la persona necesita apoyo profesional en lugar de un curso**. Devuelve las banderas `apoyo` y `consulta`. |
| `campus-agent` | ACTIVA | requerido | Agentes internos del campus: `tipo:"redes"` genera contenido para redes; `tipo:"instructor"` ayuda a preparar sesiones. Verifica que el rol sea `instructor` o `admin`. |
| `generate-certificate` | escrita, sin desplegar | — | Genera el PDF de la constancia. |
| `stripe-webhook` | escrita, sin desplegar | — | Activa el acceso al recibir el pago. Requiere claves de Stripe. |

## Secreto pendiente

Las dos funciones activas necesitan `ANTHROPIC_API_KEY`:

1. Consigue una clave en <https://console.anthropic.com>
2. Supabase → **Edge Functions → Secrets** → Add new secret
3. Nombre exacto: `ANTHROPIC_API_KEY`

Sin ella responden con un mensaje de respaldo que remite a WhatsApp: no se rompe nada, simplemente no hay IA.

## Como probarlas

```bash
curl -X POST https://ygzpxtwozqfrncvqrgqo.functions.supabase.co/sales-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"¿Cuánto cuesta el taller?","history":[]}'
```

## Costo

Cada conversacion consume API de Anthropic. Con volumen bajo son unos pocos dolares al mes.
Conviene poner un limite de gasto en la consola de Anthropic desde el primer dia.

## Nota importante sobre el agente

El `sales-chat` tiene instruccion explicita de **no vender** cuando detecta crisis emocional,
ideas de hacerse dano o sintomas clinicos. En ese caso remite a apoyo profesional y, si hay
riesgo, a la Linea de la Vida (800 911 2000). Esa regla no debe quitarse del prompt.
