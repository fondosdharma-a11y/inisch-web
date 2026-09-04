// ============================================================
// INISCH — Widget de chat de ventas/admisiones (IA)
// ============================================================
// Como activarlo en una pagina del sitio:
//   <script>window.INISCH_CHAT_FUNCTION_URL = 'https://TU-PROYECTO.functions.supabase.co/sales-chat';</script>
//   <script src="js/chat-widget.js"></script>
// (o "../js/chat-widget.js" y ajustar la URL con "../" si la pagina esta en /blog)
//
// Antes de que la URL este configurada, el widget muestra un
// mensaje invitando a escribir por WhatsApp, para no romper la pagina.
// ============================================================

(function () {
  var FUNCTION_URL = window.INISCH_CHAT_FUNCTION_URL ||
                     "https://ygzpxtwozqfrncvqrgqo.functions.supabase.co/sales-chat";
  var history = [];

  var bubble = document.createElement('button');
  bubble.setAttribute('aria-label', 'Abrir chat de INISCH');
  bubble.textContent = '\uD83D\uDCAC';
  bubble.style.cssText = 'position:fixed; bottom:24px; right:24px; width:56px; height:56px; border-radius:50%; background:#254C58; color:#F7F2E7; border:none; font-size:22px; cursor:pointer; box-shadow:0 6px 20px rgba(0,0,0,0.25); z-index:999;';

  var panel = document.createElement('div');
  panel.style.cssText = 'position:fixed; bottom:92px; right:24px; width:320px; max-width:88vw; height:420px; max-height:70vh; background:var(--bg,#F7F2E7); color:var(--ink,#25353C); border:1px solid var(--line-gold,rgba(198,160,59,0.35)); border-radius:10px; box-shadow:0 12px 40px rgba(0,0,0,0.3); display:none; flex-direction:column; overflow:hidden; z-index:999; font-family:inherit;';

  var header = document.createElement('div');
  header.textContent = 'Habla con INISCH';
  header.style.cssText = 'padding:14px 16px; font-weight:600; border-bottom:1px solid var(--line-gold,rgba(198,160,59,0.35)); background:var(--bg-2,#EFE5D0);';

  var messagesEl = document.createElement('div');
  messagesEl.style.cssText = 'flex:1; overflow-y:auto; padding:14px 16px; font-size:14px; display:flex; flex-direction:column; gap:10px;';

  var inputRow = document.createElement('div');
  inputRow.style.cssText = 'display:flex; border-top:1px solid var(--line-gold,rgba(198,160,59,0.35));';

  var input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Escribe tu pregunta...';
  input.style.cssText = 'flex:1; border:none; padding:12px 14px; font-size:14px; background:transparent; color:inherit;';

  var sendBtn = document.createElement('button');
  sendBtn.textContent = 'Enviar';
  sendBtn.style.cssText = 'border:none; background:var(--teal-deep,#254C58); color:var(--bg,#F7F2E7); padding:0 16px; cursor:pointer; font-size:13px;';

  inputRow.appendChild(input);
  inputRow.appendChild(sendBtn);
  panel.appendChild(header);
  panel.appendChild(messagesEl);
  panel.appendChild(inputRow);

  function addMessage(text, who) {
    var row = document.createElement('div');
    row.style.cssText = 'max-width:85%; padding:8px 12px; border-radius:10px; line-height:1.4; ' +
      (who === 'user'
        ? 'align-self:flex-end; background:var(--teal-deep,#254C58); color:var(--bg,#F7F2E7);'
        : 'align-self:flex-start; background:var(--bg-2,#EFE5D0); color:var(--ink,#25353C);');
    row.textContent = text;
    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  var greeted = false;
  bubble.addEventListener('click', function () {
    var open = panel.style.display === 'flex';
    panel.style.display = open ? 'none' : 'flex';
    if (!open && !greeted) {
      greeted = true;
      addMessage('Hola, soy el asistente de INISCH. Cuentame que te gustaria saber sobre las formaciones, precios o certificaciones.', 'bot');
    }
  });

  async function send() {
    var text = input.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    input.value = '';

    if (!FUNCTION_URL) {
      addMessage('Este asistente aun no esta activado. Escribenos directo por WhatsApp: +52 33 1470 1563.', 'bot');
      return;
    }

    addMessage('Escribiendo...', 'bot');
    var thinkingEl = messagesEl.lastChild;

    try {
      var resp = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history }),
      });
      var data = await resp.json();
      if (data && (data.apoyo || data.consulta)) { setTimeout(function(){ window.INISCH_ofrecerConsulta(!!data.apoyo); }, 400); }
      thinkingEl.remove();
      if (!resp.ok) {
        addMessage(data.error || 'Ocurrio un error. Escribenos por WhatsApp: +52 33 1470 1563.', 'bot');
        return;
      }
      addMessage(data.reply, 'bot');
      history.push({ role: 'user', content: text });
      history.push({ role: 'assistant', content: data.reply });
    } catch (e) {
      thinkingEl.remove();
      addMessage('No pude conectarme. Escribenos por WhatsApp: +52 33 1470 1563.', 'bot');
    }
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(bubble);
    document.body.appendChild(panel);
  });

  /* Si el agente detecta que la persona necesita apoyo, ofrecemos
     la consulta con Isabel en lugar de seguir vendiendo un curso. */
  function ofrecerConsulta(urgente){
    try{
      var caja = document.querySelector(".cw-msgs") || document.querySelector(".cw-body");
      if(!caja) return;
      var d = document.createElement("div");
      d.style.cssText = "margin:12px 0;padding:14px 16px;border-radius:10px;border:1px solid rgba(216,180,90,.45);background:rgba(216,180,90,.10);font-size:14px;line-height:1.55";
      d.innerHTML = (urgente
        ? "<b>Antes que nada, tu bienestar.</b><br>Si estás pasando por un momento crítico, en México puedes llamar a la <b>Línea de la Vida: 800 911 2000</b>, las 24 horas.<br><br>"
        : "") +
        "Si quieres un espacio uno a uno, Isabel ofrece consultas de una hora." +
        '<br><a href="/consulta.html" style="display:inline-block;margin-top:10px;padding:8px 16px;border-radius:14px;border:1px solid var(--gold,#C6A03B);color:var(--gold,#C6A03B);text-decoration:none">Ver agenda</a>';
      caja.appendChild(d);
      caja.scrollTop = caja.scrollHeight;
    }catch(e){}
  }
  window.INISCH_ofrecerConsulta = ofrecerConsulta;
})();