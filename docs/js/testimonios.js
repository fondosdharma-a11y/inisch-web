/* ============================================================
   TESTIMONIOS  ·  INISCH
   ============================================================
   EDITA SOLO LA LISTA DE ABAJO. El sitio se actualiza solo.

   Por cada testimonio:
     nombre    como quiere aparecer
     video     enlace de YouTube o Vimeo (opcional)
     texto     lo que escribio, si lo hay (opcional)
     ciudad    opcional
     programa  1 = Taller Intensivo
               2 = Diplomado de Especialista
               3 = Certificacion como Instructor
               "retiro" / "numerologia" / "" si no aplica
     foto      archivo en /assets/fotos/ (opcional; si no hay, se usan iniciales)
     lang      "es" o "en"

   >>> IMPORTANTE <<<
   Publica unicamente testimonios de personas que dieron
   AUTORIZACION POR ESCRITO para usar su nombre, su imagen y sus
   palabras. Son procesos personales: publicarlos sin permiso es
   un problema legal y una falta de respeto al trabajo que
   esa persona hizo. Guarda las autorizaciones, aunque sean
   mensajes de WhatsApp.

   Si la lista queda vacia, la seccion NO se muestra.
   ============================================================ */

window.INISCH_TESTIMONIOS = [

  { nombre: "Aurora",      video: "https://youtu.be/adDGuazRgAg", programa: 2, lang: "es" },
  { nombre: "Blanca",      video: "https://youtu.be/tCMRjQ7b8zc", programa: 2, lang: "es" },
  { nombre: "Jos\u00e9 Miguel", video: "https://youtu.be/XyAizBFjW8s", programa: 2, lang: "es" },
  { nombre: "Livier",      video: "https://youtu.be/53ivUzQBTFc", programa: 2, lang: "es" },
  { nombre: "Lupita",      video: "https://youtu.be/RksajDLI9ig", programa: 2, lang: "es" },
  { nombre: "Mariana",     video: "https://youtu.be/MB6OX6ZrOtg", programa: 2, lang: "es" },
  { nombre: "Maye",        video: "https://youtu.be/FDRTd0Hx2RQ", programa: 2, lang: "es" },

];

/* ------------------------------------------------------------
   De aqui para abajo no hace falta tocar nada.
   ------------------------------------------------------------ */
(function(){
  "use strict";

  function isEN(){
    return (document.documentElement.getAttribute("lang")||"es").toLowerCase().indexOf("en") === 0;
  }
  function T(es, en){ return isEN() ? en : es; }
  function esc(s){
    return String(s==null?"":s).replace(/[&<>"']/g, function(m){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]; });
  }
  function iniciales(n){
    if(!n) return "\u00b7\u00b7";
    var p = String(n).trim().split(/\s+/);
    return ((p[0]||"")[0]||"").toUpperCase() + ((p[1]||"")[0]||"").toUpperCase();
  }

  /* Reconoce el identificador del video para poder usar la miniatura */
  function idYouTube(url){
    if(!url) return null;
    var m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/);
    return m ? m[1] : null;
  }
  function idVimeo(url){
    if(!url) return null;
    var m = String(url).match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? m[1] : null;
  }

  var PROGRAMA = {
    1: { es:"Taller Intensivo",          en:"Intensive Workshop" },
    2: { es:"Diplomado de Especialista", en:"Specialist Diploma" },
    3: { es:"Certificaci\u00f3n como Instructor", en:"Instructor Certification" },
    retiro:      { es:"Retiro",       en:"Retreat" },
    numerologia: { es:"Numerolog\u00eda", en:"Numerology" }
  };

  /* ------------------------------------------------------------
     Tarjeta con "fachada": mostramos la miniatura y solo cargamos
     el reproductor al hacer clic. Asi la pagina no arrastra siete
     reproductores de YouTube (que pesan y rastrean) desde el inicio.
     ------------------------------------------------------------ */
  function tarjeta(t, pre){
    var yt = idYouTube(t.video), vm = idVimeo(t.video);
    var h = '<figure class="testi">';

    if (yt || vm){
      var miniatura = yt
        ? "https://i.ytimg.com/vi/" + yt + "/hqdefault.jpg"
        : (t.foto ? pre + "assets/fotos/" + t.foto : "");
      h += '<button class="testi-video fachada" data-yt="' + esc(yt||"") + '" data-vm="' + esc(vm||"") + '" ' +
           'aria-label="' + T("Reproducir el testimonio de ","Play the testimonial from ") + esc(t.nombre) + '">';
      if (miniatura) h += '<img src="' + esc(miniatura) + '" alt="" loading="lazy" decoding="async">';
      h += '<span class="testi-play" aria-hidden="true">&#9654;</span>';
      h += '</button>';
    }

    if (t.texto) h += '<blockquote>' + esc(t.texto) + '</blockquote>';

    h += '<figcaption>';
    if (t.foto && !(yt||vm)){
      h += '<img src="' + pre + 'assets/fotos/' + esc(t.foto) + '" alt="' + esc(t.nombre) + '" loading="lazy">';
    } else {
      h += '<span class="testi-ini">' + esc(iniciales(t.nombre)) + '</span>';
    }
    var meta = [];
    if (t.ciudad) meta.push(esc(t.ciudad));
    var p = PROGRAMA[t.programa];
    if (p) meta.push(isEN() ? p.en : p.es);
    h += '<div><b>' + esc(t.nombre) + '</b><span>' + meta.join(" \u00b7 ") + '</span></div>';
    h += '</figcaption></figure>';
    return h;
  }

  function activarFachadas(zona){
    var bs = zona.querySelectorAll(".fachada");
    for (var i=0;i<bs.length;i++){
      bs[i].addEventListener("click", function(){
        var yt = this.getAttribute("data-yt"), vm = this.getAttribute("data-vm");
        var src = yt
          ? "https://www.youtube-nocookie.com/embed/" + yt + "?autoplay=1&rel=0&modestbranding=1"
          : "https://player.vimeo.com/video/" + vm + "?autoplay=1";
        var d = document.createElement("div");
        d.className = "testi-video";
        d.innerHTML = '<iframe src="' + src + '" allow="accelerated-destination; autoplay; encrypted-media; picture-in-picture" ' +
                      'allowfullscreen title="testimonio"></iframe>';
        this.parentNode.replaceChild(d, this);
        try {
          if (window.gtag) window.gtag("event", "ver_testimonio", { video_id: yt || vm });
        } catch(e){}
      });
    }
  }

  function pintar(){
    var zonas = document.querySelectorAll("[data-testimonios]");
    if (!zonas.length) return;

    var idioma = isEN() ? "en" : "es";
    var lista = (window.INISCH_TESTIMONIOS || []).filter(function(t){
      return t && (t.video || t.texto) && (!t.lang || t.lang === idioma);
    });

    for (var i=0;i<zonas.length;i++){
      var z = zonas[i];
      var seccion = z.closest("section") || z.parentNode;

      // Filtrar por programa si la zona lo pide: data-programa="2"
      var filtro = z.getAttribute("data-programa");
      var sub = filtro ? lista.filter(function(t){ return String(t.programa) === filtro; }) : lista.slice();

      if (!sub.length){
        // Sin testimonios reales no inventamos nada: se oculta la seccion
        if (seccion && seccion.tagName === "SECTION") seccion.style.display = "none";
        else z.style.display = "none";
        continue;
      }

      var limite = parseInt(z.getAttribute("data-testimonios"), 10);
      if (limite > 0) sub = sub.slice(0, limite);

      var pre = z.getAttribute("data-pre") || "";
      var h = "";
      for (var j=0;j<sub.length;j++) h += tarjeta(sub[j], pre);
      z.innerHTML = h;
      activarFachadas(z);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pintar);
  else pintar();
})();
