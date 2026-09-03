/* Registro del trabajador de servicio: permite instalar el campus como app */
(function(){
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", function(){
    navigator.serviceWorker.register("/campus/sw.js", { scope: "/campus/" })
      .catch(function(e){ console.warn("No se pudo registrar el service worker:", e); });
  });

  /* Aviso discreto para instalar, solo una vez */
  var evento = null;
  window.addEventListener("beforeinstallprompt", function(e){
    e.preventDefault(); evento = e;
    try { if (localStorage.getItem("inisch-instalar") === "no") return; } catch(err){}
    setTimeout(mostrar, 4000);
  });

  function mostrar(){
    if (!evento || document.querySelector(".nudge-app")) return;
    var d = document.createElement("div");
    d.className = "consent nudge-app";
    d.innerHTML =
      '<p>Puedes instalar el campus en tu teléfono y abrirlo como una app, sin buscar el enlace cada vez.</p>' +
      '<div class="consent-btns">' +
        '<button class="btn-line" id="app-no">Ahora no</button>' +
        '<button class="btn-teal" id="app-si">Instalar</button>' +
      '</div>';
    document.body.appendChild(d);
    requestAnimationFrame(function(){ d.classList.add("on"); });
    d.querySelector("#app-no").addEventListener("click", function(){
      try { localStorage.setItem("inisch-instalar","no"); } catch(e){}
      cerrar(d);
    });
    d.querySelector("#app-si").addEventListener("click", function(){
      cerrar(d);
      if (evento){ evento.prompt(); evento = null; }
    });
  }
  function cerrar(d){ d.classList.remove("on"); setTimeout(function(){ d.remove(); }, 320); }
})();
