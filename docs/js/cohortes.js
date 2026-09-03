/* ============================================================
   FECHAS DE LAS PROXIMAS COHORTES
   ============================================================
   EDITA SOLO ESTE ARCHIVO. El sitio se actualiza solo.

   Para cada cohorte:
     etapa     1 = El Despertar
               2 = Especialista en Autoconocimiento
               3 = Formacion de Instructores
               "dc3" = curso DC-3 / STPS
     inicio    fecha en formato AAAA-MM-DD
     fin       opcional, para cursos de varios dias
     horario   texto libre
     modalidad "Presencial", "En linea" o "Mixta"
     ciudad    donde se imparte (o "En linea")
     cupo      numero de lugares, o null si no quieres mostrarlo
     cierre    fecha limite de inscripcion (AAAA-MM-DD), o null
     nota      texto opcional que aparece debajo

   Las cohortes que ya pasaron desaparecen SOLAS del sitio.
   Si dejas la lista vacia, no se muestra ninguna seccion de fechas.
   ============================================================ */

window.INISCH_COHORTES = [

  {
    etapa: 1,
    inicio: "2026-10-10",
    fin: "2026-10-11",
    horario: "10:00 a 18:00 h",
    modalidad: "Presencial y en linea",
    ciudad: "",              // <-- PENDIENTE: escribe la ciudad
    cupo: null,              // <-- opcional: numero de lugares
    cierre: null,            // <-- opcional: fecha limite de inscripcion (AAAA-MM-DD)
    nota: ""
  },

];

/* ------------------------------------------------------------
   De aqui para abajo no hace falta tocar nada.
   ------------------------------------------------------------ */
(function(){
  var MESES = ["enero","febrero","marzo","abril","mayo","junio",
               "julio","agosto","septiembre","octubre","noviembre","diciembre"];
  var MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

  function isEN(){
    return (document.documentElement.getAttribute("lang")||"es").toLowerCase().indexOf("en") === 0;
  }
  function T(es, en){ return isEN() ? en : es; }

  function parse(f){
    if (!f) return null;
    var p = String(f).split("-");
    return new Date(+p[0], +p[1]-1, +p[2]);
  }
  function fecha(d){
    if (!d) return "";
    var M = isEN() ? MONTHS : MESES;
    return isEN()
      ? M[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear()
      : d.getDate() + " de " + M[d.getMonth()] + " de " + d.getFullYear();
  }
  function rango(a, b){
    if (!b) return fecha(a);
    var M = isEN() ? MONTHS : MESES;
    if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()){
      return isEN()
        ? M[a.getMonth()] + " " + a.getDate() + "\u2013" + b.getDate() + ", " + a.getFullYear()
        : a.getDate() + " y " + b.getDate() + " de " + M[a.getMonth()] + " de " + a.getFullYear();
    }
    return fecha(a) + " \u2013 " + fecha(b);
  }
  function dias(d){
    var hoy = new Date(); hoy.setHours(0,0,0,0);
    return Math.round((d - hoy) / 86400000);
  }
  function esc(s){
    return String(s==null?"":s).replace(/[&<>"']/g, function(m){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]; });
  }

  var NOMBRE = {
    1:   { es:"Taller Intensivo del SCH",            en:"SCH Intensive Workshop" },
    2:   { es:"Diplomado de Especialista en Autoconocimiento", en:"Self-Knowledge Specialist Diploma" },
    3:   { es:"Certificaci\u00f3n como Instructor del SCH",  en:"SCH Instructor Certification" },
    dc3: { es:"Curso DC-3 \u00b7 STPS",                  en:"DC-3 Course \u00b7 STPS" }
  };
  var ENLACE = {
    1: "taller.html", 2: "diplomado.html",
    3: "instructor.html", dc3: "empresas.html"
  };
  var ENLACE_EN = {
    1: "awakening.html", 2: "specialist.html",
    3: "instructor-training.html", dc3: "companies.html"
  };

  function vigentes(){
    var lista = window.INISCH_COHORTES || [];
    var hoy = new Date(); hoy.setHours(0,0,0,0);
    return lista
      .map(function(c){ var o = {}; for(var k in c) o[k]=c[k];
                        o._d = parse(c.inicio); o._f = parse(c.fin); return o; })
      .filter(function(c){ return c._d && (c._f || c._d) >= hoy; })
      .sort(function(a,b){ return a._d - b._d; });
  }

  function tarjeta(c){
    var n = NOMBRE[c.etapa] || { es:"Programa", en:"Program" };
    var href = (isEN() ? ENLACE_EN : ENLACE)[c.etapa] || "#";
    var d = dias(c._d);
    var urgente = (c.cierre && dias(parse(c.cierre)) <= 14 && dias(parse(c.cierre)) >= 0);

    var h = '<div class="cohorte">';
    h += '<div class="co-fecha"><span class="co-dia">' + c._d.getDate() + '</span>' +
         '<span class="co-mes">' + (isEN()?MONTHS:MESES)[c._d.getMonth()].slice(0,3) + '</span></div>';
    h += '<div class="co-cuerpo">';
    h += '<b>' + esc(isEN() ? n.en : n.es) + '</b>';
    h += '<p class="co-meta">' + esc(rango(c._d, c._f));
    if (c.horario)   h += ' &middot; ' + esc(c.horario);
    h += '</p>';
    h += '<p class="co-meta">';
    if (c.modalidad) h += esc(c.modalidad);
    if (c.ciudad)    h += ' &middot; ' + esc(c.ciudad);
    if (c.cupo)      h += ' &middot; ' + c.cupo + ' ' + T("lugares","places");
    h += '</p>';
    if (c.nota) h += '<p class="co-nota">' + esc(c.nota) + '</p>';
    h += '</div>';
    h += '<div class="co-accion">';
    if (urgente) h += '<span class="co-tag">' + T("Cierra pronto","Closing soon") + '</span>';
    else if (d >= 0 && d <= 30) h += '<span class="co-tag suave">' + (d===0 ? T("Hoy","Today") : T("En "+d+" d\u00edas","In "+d+" days")) + '</span>';
    h += '<a class="btn-line" href="' + href + '">' + T("Ver detalles","See details") + '</a>';
    h += '</div></div>';
    return h;
  }

  function pintar(){
    var zonas = document.querySelectorAll("[data-cohortes]");
    if (!zonas.length) return;
    var lista = vigentes();
    for (var i=0;i<zonas.length;i++){
      var z = zonas[i];
      var filtro = z.getAttribute("data-cohortes");   // "todas" o "1" / "2" / "3"
      var sub = (filtro && filtro !== "todas")
        ? lista.filter(function(c){ return String(c.etapa) === filtro; })
        : lista;

      if (!sub.length){
        // Sin fechas cargadas: no dejamos un hueco raro, mostramos invitacion
        z.innerHTML = '<div class="cohorte vacia">' +
          '<div class="co-cuerpo"><b>' + T("Pr\u00f3ximas fechas","Upcoming dates") + '</b>' +
          '<p class="co-meta">' + T("Escr\u00edbenos y te avisamos en cuanto se abra la siguiente generaci\u00f3n.",
                                    "Write to us and we'll let you know as soon as the next group opens.") + '</p></div>' +
          '<div class="co-accion"><a class="btn-teal" target="_blank" ' +
          'href="https://wa.me/523314701563">' + T("Preguntar fechas","Ask about dates") + '</a></div></div>';
        continue;
      }
      var h = "";
      for (var j=0;j<sub.length;j++) h += tarjeta(sub[j]);
      z.innerHTML = h;
    }
  }

  /* ------------------------------------------------------------
     BARRA DE ANUNCIO
     Aparece arriba del todo con la proxima fecha. Se calcula sola
     a partir de la lista de arriba: cuando la fecha pasa,
     desaparece. Si se cierra, no vuelve a molestar ese dia.
     ------------------------------------------------------------ */
  function pintarBarra(){
    if (document.querySelector(".anuncio")) return;
    var lista = vigentes();
    if (!lista.length) return;

    var c = lista[0];
    var d = dias(c._d);
    if (d > 120) return;                 // demasiado lejos, no vale la pena

    var clave = "inisch-anuncio-" + c.inicio;
    try { if (sessionStorage.getItem(clave) === "x") return; } catch(e){}

    var n = NOMBRE[c.etapa] || { es:"Programa", en:"Program" };
    var href = (isEN() ? ENLACE_EN : ENLACE)[c.etapa] || "#";
    // ajustar la ruta si estamos dentro de una subcarpeta
    var prof = (location.pathname.replace(/^\/|\/$/g,"").split("/").length - 1);
    var enSub = /\/(en|blog)\//.test(location.pathname);
    if (isEN() && location.pathname.indexOf("/en/blog/") >= 0) href = "../" + href;
    else if (!isEN() && location.pathname.indexOf("/blog/") >= 0) href = "../" + href;

    var cuando;
    if (d === 0)      cuando = T("es hoy", "is today");
    else if (d === 1) cuando = T("es ma\u00f1ana", "is tomorrow");
    else if (d <= 45) cuando = T("en " + d + " d\u00edas", "in " + d + " days");
    else              cuando = "";

    var b = document.createElement("div");
    b.className = "anuncio";
    b.innerHTML =
      '<div class="an-in">' +
        '<span class="an-tag">' + T("Pr\u00f3xima fecha", "Next date") + '</span>' +
        '<span class="an-txt"><b>' + esc(isEN() ? n.en : n.es) + '</b> \u00b7 ' +
          esc(rango(c._d, c._f)) + (cuando ? ' \u00b7 ' + cuando : '') + '</span>' +
        '<a class="an-btn" href="' + href + '">' + T("Ver detalles", "See details") + '</a>' +
        '<button class="an-x" aria-label="' + T("Cerrar","Close") + '">&times;</button>' +
      '</div>';
    document.body.insertBefore(b, document.body.firstChild);
    document.documentElement.classList.add("con-anuncio");

    b.querySelector(".an-x").addEventListener("click", function(){
      try { sessionStorage.setItem(clave, "x"); } catch(e){}
      b.remove();
      document.documentElement.classList.remove("con-anuncio");
    });
  }

  function arrancar(){ pintar(); pintarBarra(); }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar);
  else arrancar();
})();
