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
  taller:                 "https://buy.stripe.com/bJe14ogwg1mUdfneoZgEg03",
  consulta:               "https://buy.stripe.com/4gMfZicg0c1ygrz3KlgEg04",
  diplomado_inscripcion:  "https://buy.stripe.com/3cI28s2Fqd5C5MVeoZgEg01",
  diplomado_mensualidad:  "https://buy.stripe.com/5kQeVe1Bme9Gb7fa8JgEg02",
  instructor_inscripcion: "https://buy.stripe.com/eVq7sMfsc4z63EN0y9gEg05",
  instructor_mensualidad: "https://buy.stripe.com/3cIaEYcg0e9Gejrgx7gEg00"
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
