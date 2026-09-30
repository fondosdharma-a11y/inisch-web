/* ============================================================
   ENLACES DE PAGO · STRIPE
   ============================================================
   Cuenta: Instituto Internacional del Sistema Codigo Holografico
   Moneda: MXN · Metodos: tarjeta y OXXO
   Estos enlaces son REALES y cobran dinero de verdad.

   Para cambiar un precio NO edites aqui: hazlo en el panel de
   Stripe (Product catalog) y el enlace se actualiza solo.
   ============================================================ */

window.INISCH_PAGOS = {
  diplomado_auto:               "https://buy.stripe.com/4gM28scg0fdKgrza8JgEg0j",
  diplomado_contado:            "https://buy.stripe.com/8x2aEYbbW3v2ejrcgRgEg0e",
  diplomado_ref_contado:        "https://buy.stripe.com/4gM5kEcg0fdKcbjbcNgEg0m",
  instructor_auto:              "https://buy.stripe.com/dRm14o3JufdK6QZa8JgEg0k",
  instructor_auto_reg:          "https://buy.stripe.com/3cI6oI93O5Da1wFbcNgEg0i",
  instructor_contado:           "https://buy.stripe.com/fZu8wQ93O3v27V36WxgEg0g",
  instructor_contado_reg:       "https://buy.stripe.com/28E6oI2Fq3v20sB5StgEg0h",
  instructor_ref_contado:       "https://buy.stripe.com/28EbJ22Fq4z6dfna8JgEg0o",
  instructor_ref_contado_reg:   "https://buy.stripe.com/cNi9AU5RC5Da4IRft3gEg0l",
  taller_contado:               "https://buy.stripe.com/bJe00kdk41mU5MVgx7gEg0f",
  taller_ref_contado:           "https://buy.stripe.com/6oUeVe4NyaXufnv94FgEg0n",
  taller_inscripcion:     "https://buy.stripe.com/8x26oIeo85Da8Z7a8JgEg0a",
  taller:                 "https://buy.stripe.com/bJe14ogwg1mUdfneoZgEg03",
  consulta:               "https://buy.stripe.com/4gMfZicg0c1ygrz3KlgEg04",
  diplomado_inscripcion:  "https://buy.stripe.com/3cI28s2Fqd5C5MVeoZgEg01",
  diplomado_mensualidad:  "https://buy.stripe.com/00w7sM4Ny7LiejreoZgEg0c",
  instructor_inscripcion_reg: "https://buy.stripe.com/00w14o7ZK4z6a3b6WxgEg0d",
  instructor_mensualidad_reg: "https://buy.stripe.com/eVq3cw0xi7Lia3b6WxgEg08",
  instructor_inscripcion: "https://buy.stripe.com/5kQfZi3Ju1mU0sBcgRgEg09",
  retiro_tulum_reserva:   "https://buy.stripe.com/cNicN60xi3v23EN1CdgEg06",
  retiro_tulum_total:     "https://buy.stripe.com/5kQ7sM4Ny0iQgrzdkVgEg07",
  instructor_mensualidad: "https://buy.stripe.com/8x2cN6dk4fdKcbjcgRgEg0b"
};

/* ============================================================
   PROMOCION 25% · desde el 29-sep-2026, hasta nuevo aviso
   ============================================================
   Un solo interruptor: activa. Encendida, los botones usan enlaces
   de Stripe con el 25% ya aplicado (metadata promo=promo25 y el
   MISMO "programa", para que el webhook abra el campus igual) y los
   precios del sitio se ven tachados junto al de promocion.
   No se acumula: referido + contado ya era 25% y se queda en 25%;
   el cupon de referido del 10% no se suma (la comision al que
   refiere se sigue registrando).
   NO entran: Retiro, certificacion SEP (pago al organismo) ni DC-3.
   Para apagarla: activa: false Y reactivar en Stripe los 16 enlaces
   de lista, que quedaron desactivados durante la promocion
   (metadata programa=<clave>, sin promo; se reactivan con active=true).
   ============================================================ */
window.INISCH_PROMO = {
  activa: true,
  enlaces: {
    taller:                     "https://buy.stripe.com/00w4gAgwgghOgrz80BgEg2s",
    taller_contado:             "https://buy.stripe.com/14AbJ21Bm0iQ3EN3KlgEg2t",
    taller_inscripcion:         "https://buy.stripe.com/7sY9AU7ZKd5Ca3ba8JgEg2u",
    consulta:                   "https://buy.stripe.com/5kQ00keo8ghOgrzbcNgEg2v",
    diplomado_inscripcion:      "https://buy.stripe.com/3cIeVe0xi7Li0sB4OpgEg2w",
    diplomado_mensualidad:      "https://buy.stripe.com/9B628s2Fqe9Gejr3KlgEg2x",
    diplomado_auto:             "https://buy.stripe.com/eVqeVe1Bm0iQ6QZgx7gEg2p",
    diplomado_contado:          "https://buy.stripe.com/3cIaEY4Ny8PmdfndkVgEg2y",
    instructor_inscripcion:     "https://buy.stripe.com/28EfZifscghO4IRa8JgEg2z",
    instructor_mensualidad:     "https://buy.stripe.com/7sYdRafscfdK2AJ94FgEg2A",
    instructor_auto:            "https://buy.stripe.com/7sYaEY7ZK6HegrzbcNgEg2q",
    instructor_contado:         "https://buy.stripe.com/00w8wQfsc6He5MV6WxgEg2B",
    instructor_inscripcion_reg: "https://buy.stripe.com/14A9AU93O4z62AJa8JgEg2C",
    instructor_mensualidad_reg: "https://buy.stripe.com/4gM8wQ2Fq4z6cbj3KlgEg2D",
    instructor_auto_reg:        "https://buy.stripe.com/14A00k93O2qY5MVa8JgEg2r",
    instructor_contado_reg:     "https://buy.stripe.com/5kQeVe2Fqc1y0sB4OpgEg2E"
  },
  // precio de lista -> precio de promocion (solo los que entran)
  mxn: { "8,500":"6,375", "2,000":"1,500", "1,500":"1,125",
         "6,000":"4,500", "3,750":"2,812.50", "36,000":"27,000",
         "3,500":"2,625", "4,881":"3,660.75", "37,666":"28,250",
         "7,800":"5,850", "7,143":"5,357.25", "57,800":"43,350" },
  usd: { "500":"375", "2,118":"1,589", "3,400":"2,550" }
};
if (window.INISCH_PROMO.activa){
  for (var _k in window.INISCH_PROMO.enlaces) window.INISCH_PAGOS[_k] = window.INISCH_PROMO.enlaces[_k];
}

/* ------------------------------------------------------------
   Conecta cualquier elemento con data-pago="clave".
   Si la clave no existe, el boton se oculta en lugar de romperse.
   ------------------------------------------------------------ */
(function(){
  function pintar(){
    var els = document.querySelectorAll("[data-pago]");
    for (var i = 0; i < els.length; i++){
      var e = els[i], k = e.getAttribute("data-pago");
      var url = window.INISCH_PAGOS[k];
      if (!url){ e.style.display = "none"; continue; }
      e.setAttribute("href", url);
      e.setAttribute("target", "_blank");
      e.setAttribute("rel", "noopener");
      // marcar el clic para la analitica
      e.addEventListener("click", function(){
        try {
          if (window.gtag) window.gtag("event", "begin_checkout", {
            currency: "MXN", items: [{ item_id: this.getAttribute("data-pago") }]
          });
        } catch(err){}
      });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pintar);
  else pintar();
})();

/* ============================================================
   REFERIDOS Y DESCUENTOS
   ============================================================
   El enlace de referido es:  inisch.com/?ref=CODIGO
   Guardamos el codigo 60 dias y lo aplicamos al pagar.

   Descuentos:
     contado            -> 15%
     referido           -> 10%
     contado + referido -> 25% (enlace propio, precio exacto)
   ============================================================ */
(function(){
  var CLAVE = "inisch-ref";
  var DIAS = 60;

  function guardarRef(){
    var m = /[?&]ref=([A-Za-z0-9\-]{3,30})/.exec(location.search);
    if (!m) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ c: m[1].toUpperCase(), t: Date.now() }));
    } catch(e){}
    // limpiar la URL para que no se comparta con el codigo pegado
    if (history.replaceState){
      try { history.replaceState(null,"",location.pathname + location.hash); } catch(e){}
    }
  }
  function leerRef(){
    try {
      var d = JSON.parse(localStorage.getItem(CLAVE) || "null");
      if (!d || !d.c) return null;
      if (Date.now() - d.t > DIAS*86400000){ localStorage.removeItem(CLAVE); return null; }
      return d.c;
    } catch(e){ return null; }
  }
  window.INISCH_ref = leerRef;

  guardarRef();

  /* Ajusta cada boton de pago segun haya o no codigo de referido */
  function aplicar(){
    var ref = leerRef();
    var els = document.querySelectorAll("[data-pago]");
    for (var i=0;i<els.length;i++){
      var e = els[i], k = e.getAttribute("data-pago");
      var url = window.INISCH_PAGOS[k];
      if (!url) continue;

      if (ref){
        // Contado + referido: enlace propio con el 25% ya aplicado
        var combinado = window.INISCH_PAGOS[k.replace("_contado","_ref_contado")];
        if (k.indexOf("_contado") > 0 && combinado){
          url = combinado;
        } else if (window.INISCH_PROMO.activa && window.INISCH_PROMO.enlaces[k]){
          // Promocion: el 25% ya viene en el precio; el 10% no se acumula
        } else {
          // Resto de conceptos: cupon del 10%
          var cupon = (k.indexOf("_auto") > 0) ? "REFERIDO10M" : "REFERIDO10";
          url += (url.indexOf("?") < 0 ? "?" : "&") + "prefilled_promo_code=" + cupon;
        }
        // Atribucion: viaja con el pago hasta el webhook
        url += (url.indexOf("?") < 0 ? "?" : "&") + "client_reference_id=" + encodeURIComponent(ref);
      }
      e.setAttribute("href", url);
    }

    if (ref) mostrarAviso(ref);
  }

  function mostrarAviso(ref){
    if (document.querySelector(".ref-aviso")) return;
    var zonas = document.querySelectorAll(".price-box");
    if (!zonas.length) return;
    var d = document.createElement("div");
    d.className = "ref-aviso";
    d.innerHTML = '<b>&#10003; Vienes recomendado por ' + ref.split("-")[0] + '</b>' +
      (window.INISCH_PROMO.activa
        ? '<span>Durante la promoci&oacute;n ya tienes el 25% de descuento en el precio. Tu recomendaci&oacute;n queda registrada al pagar.</span>'
        : '<span>Tu 10% de descuento se aplica solo al pagar. Si adem&aacute;s liquidas de contado, el descuento total es del 25%.</span>');
    zonas[0].parentNode.insertBefore(d, zonas[0]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", aplicar);
  else aplicar();
})();

/* ------------------------------------------------------------
   PROMOCION: precio de lista tachado + precio de promocion,
   aviso en el sello de descuentos y etiqueta en la barra superior.
   ------------------------------------------------------------ */
(function(){
  var P = window.INISCH_PROMO;
  if (!P || !P.activa) return;
  var ES = !/^en/i.test(document.documentElement.lang || "");
  var RX = /\$\s?(\d{1,3}(?:,\d{3})+(?:\.\d{2})?|\d+)(\s?USD)?/g;

  var css = document.createElement("style");
  css.textContent =
    ".promo-antes{opacity:.55;font-weight:400;font-size:.72em;margin-right:.25em;text-decoration-thickness:1.5px}" +
    ".promo-ahora{color:var(--gold,#D8B45A)}" +
    ".an-promo{background:var(--gold,#D8B45A)!important;color:#0D1A1E!important}" +
    ".promo-nota{margin:0 0 16px;padding:10px 14px;border:1px solid var(--gold,#D8B45A);border-radius:10px;font-size:14px;line-height:1.45}";
  document.head.appendChild(css);

  function precios(){
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), nodos = [], n;
    while ((n = w.nextNode())){
      var p = n.parentNode;
      if (!p || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|S)$/.test(p.nodeName)) continue;
      if (p.closest && p.closest("[data-sin-promo],.promo-ahora")) continue;
      RX.lastIndex = 0;
      if (RX.test(n.nodeValue)) nodos.push(n);
    }
    nodos.forEach(function(t){
      var boton = t.parentNode.closest && t.parentNode.closest("a,button");
      var s = t.nodeValue, frag = document.createDocumentFragment(), ult = 0, m, hubo = false;
      RX.lastIndex = 0;
      while ((m = RX.exec(s))){
        var nv = (m[2] ? P.usd : P.mxn)[m[1]];
        if (!nv) continue;
        hubo = true;
        frag.appendChild(document.createTextNode(s.slice(ult, m.index)));
        if (!boton){
          var a = document.createElement("s");
          a.className = "promo-antes"; a.textContent = m[0];
          frag.appendChild(a);
        }
        var b = document.createElement("span");
        b.className = "promo-ahora"; b.textContent = "$" + nv + (m[2] || "");
        frag.appendChild(b);
        ult = m.index + m[0].length;
      }
      if (!hubo) return;
      frag.appendChild(document.createTextNode(s.slice(ult)));
      t.parentNode.replaceChild(frag, t);
    });

    var sellos = document.querySelectorAll(".sello-mini .sm-txt");
    for (var i = 0; i < sellos.length; i++){
      if (sellos[i].textContent.indexOf("15%") < 0) continue;
      sellos[i].innerHTML = ES
        ? "<b>Promoci&oacute;n: 25% de descuento en todos los programas.</b> Ya est&aacute; aplicado en los precios y en los botones de pago, de contado o en mensualidades. No se acumula con otros descuentos."
        : "<b>Promotion: 25% off every program.</b> It is already applied to the prices and payment buttons, whether you pay in full or monthly. It cannot be combined with other discounts.";
    }

    // Cajas de precio sin sello (ingles, consulta, fundadores): una nota breve
    var cajas = document.querySelectorAll(".price-box");
    for (var j = 0; j < cajas.length; j++){
      var c = cajas[j];
      if (!c.querySelector(".promo-ahora") || c.querySelector(".sello-mini,.promo-nota")) continue;
      var nota = document.createElement("div");
      nota.className = "promo-nota";
      nota.innerHTML = ES
        ? "<b>Promoci&oacute;n: 25% de descuento.</b> Ya est&aacute; aplicado en el precio y en el bot&oacute;n de pago; no se acumula con otros descuentos."
        : "<b>Promotion: 25% off.</b> Already applied to the price and the payment button; it cannot be combined with other discounts.";
      c.insertBefore(nota, c.firstChild);
    }
  }

  function barra(){
    var an = document.querySelector(".anuncio .an-in");
    if (!an || an.querySelector(".an-promo")) return;
    var t = document.createElement("span");
    t.className = "an-tag an-promo";
    t.textContent = ES ? "25% de descuento" : "25% off";
    an.insertBefore(t, an.firstChild.nextSibling);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", precios);
  else precios();
  window.addEventListener("load", barra);
  setTimeout(barra, 1500);
})();
