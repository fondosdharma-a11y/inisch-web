/* ============================================================
   ANALITICA  ·  INISCH
   ============================================================
   ACTIVO: Google Tag Manager (contenedor GTM-5GVFHKR3)

   IMPORTANTE: el contenedor por si solo NO mide nada. Es una
   caja donde se meten etiquetas. Para tener estadisticas hay
   que crear una propiedad de Google Analytics 4 y agregar su
   etiqueta DENTRO del contenedor. Ver instrucciones al final.

   Este archivo implementa el "Modo de consentimiento" (Consent
   Mode v2) que Google exige: el contenedor carga siempre, pero
   arranca con TODOS los permisos denegados. Ninguna cookie de
   medicion se escribe hasta que la persona acepta.
   ============================================================ */

var GTM       = "GTM-5GVFHKR3";   // contenedor de Google Tag Manager
var GA4       = "G-D1VPYL1QY8";   // propiedad de Google Analytics 4
var PLAUSIBLE = "";               // alternativa sin cookies (desactivada)

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

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;

  function leer(){ try { return localStorage.getItem(CLAVE); } catch(e){ return null; } }
  function guardar(v){ try { localStorage.setItem(CLAVE, v); } catch(e){} }

  var noRastrear = (navigator.doNotTrack === "1" || window.doNotTrack === "1" ||
                    navigator.msDoNotTrack === "1");

  /* ---------- 1. Estado inicial: todo denegado ----------
     Se declara ANTES de cargar el contenedor. Asi las etiquetas
     que vivan dentro de GTM respetan el consentimiento solas. */
  function consentimientoPorDefecto(){
    var previo = leer();
    var concedido = (previo === "si") && !noRastrear;
    gtag("consent", "default", {
      ad_storage:              "denied",
      ad_user_data:            "denied",
      ad_personalization:      "denied",
      analytics_storage:       concedido ? "granted" : "denied",
      functionality_storage:   "granted",
      security_storage:        "granted",
      wait_for_update:         500
    });
    gtag("set", "ads_data_redaction", true);
    gtag("set", "url_passthrough", true);
  }

  function conceder(){
    gtag("consent", "update", { analytics_storage: "granted" });
    dataLayer.push({ event: "consentimiento_aceptado" });
    // Reenviar la vista de pagina ahora que ya hay permiso
    if (GA4) gtag("event", "page_view", { send_to: GA4 });
  }

  /* ---------- 2. Cargadores ---------- */
  function cargarGTM(id){
    dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
  }
  function cargarGA4(id){
    gtag("js", new Date());
    gtag("config", id, { anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
  }
  function cargarPlausible(dom){
    var s = document.createElement("script");
    s.defer = true; s.setAttribute("data-domain", dom);
    s.src = "https://plausible.io/js/script.js";
    document.head.appendChild(s);
  }

  /* ---------- 3. Aviso de consentimiento ---------- */
  function pedirPermiso(){
    var caja = document.createElement("div");
    caja.className = "consent";
    caja.setAttribute("role", "dialog");
    caja.setAttribute("aria-label", T("Aviso de cookies", "Cookie notice"));
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

    var btns = caja.querySelectorAll(".btn-consent");
    for (var i = 0; i < btns.length; i++){
      btns[i].addEventListener("click", function(){
        guardar(this.dataset.v);
        caja.classList.remove("on");
        setTimeout(function(){ caja.remove(); }, 320);
        if (this.dataset.v === "si") conceder();
      });
    }
  }

  /* ---------- 4. Arranque ---------- */
  function arranque(){
    if (PLAUSIBLE) cargarPlausible(PLAUSIBLE);   // sin cookies: no requiere permiso

    if (!GTM && !GA4) return;

    consentimientoPorDefecto();

    // Ambos pueden convivir, pero GA4 se carga aqui directamente.
    // Con el Modo de consentimiento, cargan siempre y respetan el permiso.
    if (GA4 && !noRastrear) cargarGA4(GA4);
    if (GTM) cargarGTM(GTM);

    // Si el navegador pide no ser rastreado, respetamos y ni preguntamos
    if (noRastrear) return;

    var previo = leer();
    if (previo === null) pedirPermiso();
  }

  // El consentimiento por defecto debe declararse cuanto antes
  if (document.readyState === "loading"){
    consentimientoPorDefecto();
    document.addEventListener("DOMContentLoaded", arranque);
  } else {
    arranque();
  }
})();

/* ============================================================
   COMO TERMINAR DE CONFIGURARLO (dentro de tagmanager.com)
   ============================================================
   YA ESTA TODO LISTO. Google Analytics (G-D1VPYL1QY8) se carga
   directamente desde este archivo, con el Modo de consentimiento.
   No hace falta configurar nada dentro de Tag Manager para medir.

   >>> ADVERTENCIA IMPORTANTE <<<
   NO agregues una etiqueta de Google Analytics con el ID
   G-D1VPYL1QY8 dentro del contenedor GTM-5GVFHKR3. Si lo haces,
   cada visita se contaria DOS VECES y tus datos quedarian
   inservibles.

   El contenedor de Tag Manager sigue cargando y queda disponible
   por si mas adelante quieres agregar OTRAS etiquetas: pixel de
   Meta para publicidad, conversiones de Google Ads, mapas de
   calor, etc. Para esas si es el lugar correcto.

   COMPROBAR QUE FUNCIONA:
   1. Abre inisch.com y ACEPTA el aviso de cookies.
   2. Ve a analytics.google.com -> Informes -> Tiempo real.
   3. Deberias aparecer en menos de un minuto.
   Si rechazas el aviso, no apareceras: es el comportamiento correcto.
   ============================================================ */
