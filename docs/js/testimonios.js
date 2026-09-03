/* ============================================================
   TESTIMONIOS  ·  INISCH
   ============================================================
   EDITA SOLO ESTE ARCHIVO. El sitio se actualiza solo.

   Por cada testimonio:
     texto      lo que escribió la persona (3 o 4 lineas bastan)
     nombre     como quiere aparecer
     ciudad     opcional
     etapa      1, 2, 3 o "" si no aplica
     foto       nombre del archivo en /assets/fotos/ o "" si no hay
     video      enlace de YouTube o Vimeo, o "" si no hay
     lang       "es" o "en"

   >>> IMPORTANTE <<<
   Publica Únicamente testimonios de personas que te dieron
   AUTORIZACION POR ESCRITO para usar su nombre, su foto y sus
   palabras. Se trata de procesos personales: publicarlos sin
   permiso es un problema legal y, sobre todo, una falta de
   respeto al trabajo que esa persona hizo.
   Guarda las autorizaciones aunque sean mensajes de WhatsApp.

   Si la lista queda vacia, la seccion NO se muestra: la pagina
   se ve normal, sin huecos.
   ============================================================ */

window.INISCH_TESTIMONIOS = [

  // ---- EJEMPLO. Borra este bloque y pon los reales ----
  // {
  //   texto: "Llegue pensando que venia a resolver un problema con mi pareja. Me fui entendiendo que llevaba veinte anios repitiendo la misma escena con actores distintos.",
  //   nombre: "Nombre Apellido",
  //   ciudad: "Guadalajara",
  //   etapa: 1,
  //   foto: "",
  //   video: "",
  //   lang: "es"
  // },

];

/* ------------------------------------------------------------
   De aqui para abajo no hace falta tocar nada.
   ------------------------------------------------------------ */
(function(){
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
    var p = n.trim().split(/\s+/);
    return ((p[0]||"")[0]||"").toUpperCase() + ((p[1]||"")[0]||"").toUpperCase();
  }
  function incrustar(url){
    if(!url) return null;
    var m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/);
    if (m) return "https://www.youtube.com/embed/" + m[1] + "?rel=0&modestbranding=1";
    m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return "https://player.vimeo.com/video/" + m[1];
    return null;
  }

  var ETAPA = {
    1: { es:"Taller Intensivo",                en:"Intensive Workshop" },
    2: { es:"Diplomado de Especialista",       en:"Specialist Diploma" },
    3: { es:"Maestr\u00eda para Instructor",       en:"Instructor Master Program" }
  };

  function tarjeta(t, pre){
    var vid = incrustar(t.video);
    var h = '<figure class="testi">';
    if (vid){
      h += '<div class="testi-video"><iframe src="' + esc(vid) + '" loading="lazy" ' +
           'allow="accelerated-destination; encrypted-media; picture-in-picture" allowfullscreen ' +
           'title="' + esc(t.nombre) + '"></iframe></div>';
    }
    h += '<blockquote>' + esc(t.texto) + '</blockquote>';
    h += '<figcaption>';
    if (t.foto){
      h += '<img src="' + pre + 'assets/fotos/' + esc(t.foto) + '" alt="' + esc(t.nombre) + '" ' +
           'loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),' +
           '{className:\'testi-ini\',textContent:\'' + esc(iniciales(t.nombre)) + '\'}))">';
    } else {
      h += '<span class="testi-ini">' + esc(iniciales(t.nombre)) + '</span>';
    }
    h += '<div><b>' + esc(t.nombre) + '</b><span>';
    var meta = [];
    if (t.ciudad) meta.push(esc(t.ciudad));
    if (t.etapa && ETAPA[t.etapa]) meta.push(isEN() ? ETAPA[t.etapa].en : ETAPA[t.etapa].es);
    h += meta.join(" \u00b7 ") + '</span></div>';
    h += '</figcaption></figure>';
    return h;
  }

  function pintar(){
    var zonas = document.querySelectorAll("[data-testimonios]");
    if (!zonas.length) return;

    var idioma = isEN() ? "en" : "es";
    var lista = (window.INISCH_TESTIMONIOS || []).filter(function(t){
      return t && t.texto && (!t.lang || t.lang === idioma);
    });

    for (var i=0;i<zonas.length;i++){
      var z = zonas[i];
      var seccion = z.closest("section") || z.parentNode;
      if (!lista.length){
        // Sin testimonios reales no inventamos nada: se oculta la seccion entera
        if (seccion && seccion.tagName === "SECTION") seccion.style.display = "none";
        else z.style.display = "none";
        continue;
      }
      var limite = parseInt(z.getAttribute("data-testimonios"), 10);
      var sub = (limite > 0) ? lista.slice(0, limite) : lista;
      var pre = z.getAttribute("data-pre") || "";
      var h = "";
      for (var j=0;j<sub.length;j++) h += tarjeta(sub[j], pre);
      z.innerHTML = h;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pintar);
  else pintar();
})();
