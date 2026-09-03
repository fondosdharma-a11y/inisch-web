/* ============================================================
   FECHAS DE LAS PROXIMAS COHORTES
   ============================================================
   EDITA SOLO ESTE ARCHIVO. El sitio se actualiza solo.

   Para cada cohorte:
     etapa     1, 2 o 3   (o "dc3" para el curso STPS)
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

  // ---- EJEMPLO: borra esta linea y pon tus fechas reales ----
  // {
  //   etapa: 1,
  //   inicio: "2026-10-18",
  //   fin: "2026-10-19",
  //   horario: "10:00 a 18:00 h",
  //   modalidad: "Presencial",
  //   ciudad: "Guadalajara",
  //   cupo: 20,
  //   cierre: "2026-10-10",
  //   nota: ""
  // },

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
    1:   { es:"Etapa 1 \u00b7 Iniciaci\u00f3n",  en:"Stage 1 \u00b7 Awakening" },
    2:   { es:"Etapa 2 \u00b7 Maestr\u00eda",    en:"Stage 2 \u00b7 Mastery" },
    3:   { es:"Etapa 3 \u00b7 Instructores",     en:"Stage 3 \u00b7 Instructors" },
    dc3: { es:"Curso DC-3 \u00b7 STPS",          en:"DC-3 Course \u00b7 STPS" }
  };
  var ENLACE = {
    1: "formacion.html#etapa1", 2: "formacion.html#etapa2",
    3: "formacion.html#etapa3", dc3: "empresas.html"
  };
  var ENLACE_EN = {
    1: "program.html#stage1", 2: "program.html#stage2",
    3: "program.html#stage3", dc3: "companies.html"
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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pintar);
  else pintar();
})();
