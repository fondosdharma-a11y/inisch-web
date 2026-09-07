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
      '<span>Tu 10% de descuento se aplica solo al pagar. Si adem&aacute;s liquidas de contado, el descuento total es del 25%.</span>';
    zonas[0].parentNode.insertBefore(d, zonas[0]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", aplicar);
  else aplicar();
})();
