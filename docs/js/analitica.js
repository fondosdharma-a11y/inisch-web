/* ============================================================
   ANALITICA  ·  INISCH
   ============================================================
   Sirve para saber cuanta gente entra, por donde llega y donde
   se va. Hoy estas decidiendo a ciegas.

   ELIGE UNA OPCION y llena su dato. Si dejas las dos vacias,
   no se carga nada y el sitio funciona igual.

   ------------------------------------------------------------
   OPCION A · Plausible  (recomendada)
     Sin cookies, no rastrea personas, cumple con GDPR y con la
     ley mexicana sin necesidad de banner de consentimiento.
     Cuesta desde 9 USD al mes.
     1. Crea cuenta en plausible.io y agrega el dominio inisch.com
     2. Escribe abajo:  PLAUSIBLE = "inisch.com"

   ------------------------------------------------------------
   OPCION B · Google Analytics 4  (gratis)
     Usa cookies y envia datos a Google, asi que SI requiere
     pedir consentimiento. El banner ya esta programado aqui.
     1. Entra a analytics.google.com, crea una propiedad
     2. Copia el identificador (empieza con G-)
     3. Escribe abajo:  GA4 = "G-XXXXXXXXXX"
   ============================================================ */

var PLAUSIBLE = "";     // ejemplo: "inisch.com"
var GA4       = "";     // ejemplo: "G-ABC1234567"

/* ------------------------------------------------------------
   De aqui para abajo no hace falta tocar nada.
   ------------------------------------------------------------ */
(function(){
  "use strict";

  var CLAVE = "inisch-consentimiento";

  function isEN(){
    return (document.documentElement.getAttribute("lang")||"es").toLowerCase().indexOf("en") === 0;
  }
  function T(es, en){ return isEN() ? en : es; }

  function cargar(src, attrs){
    var s = document.createElement("script");
    s.async = true; s.src = src;
    if (attrs) for (var k in attrs) s.setAttribute(k, attrs[k]);
    document.head.appendChild(s);
    return s;
  }

  /* ---------- Plausible: sin cookies, no necesita permiso ---------- */
  function iniciarPlausible(){
    cargar("https://plausible.io/js/script.js", { "data-domain": PLAUSIBLE, defer: "defer" });
  }

  /* ---------- Google Analytics: solo tras aceptar ---------- */
  function iniciarGA(){
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    // Menos invasivo: sin publicidad y con la IP anonimizada
    gtag("config", GA4, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
    cargar("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4));
  }

  /* ---------- Aviso de consentimiento (solo si hace falta) ---------- */
  function pedirPermiso(){
    var caja = document.createElement("div");
    caja.className = "consent";
    caja.innerHTML =
      '<p>' + T(
        'Usamos cookies de medici\u00f3n para entender c\u00f3mo se usa el sitio. Puedes rechazarlas y todo seguir\u00e1 funcionando igual.',
        'We use measurement cookies to understand how the site is used. You can decline and everything will keep working.'
      ) + ' <a href="' + (isEN() ? 'privacy.html' : 'privacidad.html') + '">' +
        T('Aviso de privacidad','Privacy notice') + '</a></p>' +
      '<div class="consent-btns">' +
        '<button class="btn-line btn-consent" data-v="no">' + T('Rechazar','Decline') + '</button>' +
        '<button class="btn-teal btn-consent" data-v="si">' + T('Aceptar','Accept') + '</button>' +
      '</div>';
    document.body.appendChild(caja);
    requestAnimationFrame(function(){ caja.classList.add("on"); });

    caja.querySelectorAll(".btn-consent").forEach(function(b){
      b.addEventListener("click", function(){
        try { localStorage.setItem(CLAVE, b.dataset.v); } catch(e){}
        caja.classList.remove("on");
        setTimeout(function(){ caja.remove(); }, 320);
        if (b.dataset.v === "si") iniciarGA();
      });
    });
  }

  function arranque(){
    // Respetar la senal "no rastrear" del navegador
    var noRastrear = (navigator.doNotTrack === "1" || window.doNotTrack === "1");

    if (PLAUSIBLE) iniciarPlausible();   // no usa cookies: siempre se puede

    if (!GA4 || noRastrear) return;
    var previo = null;
    try { previo = localStorage.getItem(CLAVE); } catch(e){}
    if (previo === "si") iniciarGA();
    else if (previo !== "no") pedirPermiso();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arranque);
  else arranque();
})();
