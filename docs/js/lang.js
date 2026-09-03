/* Selector de idioma INISCH.
   Coloca un boton visible junto al selector de tema, en TODAS las paginas
   (incluido movil, donde .navlinks esta oculto).
   Usa un mapa explicito para que funcione tambien en paginas cuyo
   nav no trae el enlace ES/EN. */
(function(){

  // ES  ->  EN   (rutas relativas a /docs/)
  var MAP = {
    'index.html'                      : 'en/index.html',
    'nosotros.html'                   : 'en/about.html',
    'isabel.html'                     : 'en/isabel.html',
    'galeria.html'                    : 'en/gallery.html',
    'programas.html'                  : 'en/programs.html',
    'taller.html'                     : 'en/intensive-workshop.html',
    'diplomado.html'                  : 'en/specialist-diploma.html',
    'instructor.html'                 : 'en/instructor-certification.html',
    'formacion.html'                  : 'en/program.html',
    'acompanamiento.html'             : 'en/guidance.html',
    'numerologia.html'                : 'en/numerology.html',
    'calculadora-numerologia.html'    : 'en/numerology-calculator.html',
    'experiencias.html'               : 'en/experiences.html',
    'certificaciones.html'            : 'en/certifications.html',
    'empresas.html'                   : 'en/companies.html',
    'guia-gratuita.html'              : 'en/free-guide.html',
    'faq.html'                        : 'en/faq.html',
    'contacto.html'                   : 'en/contact.html',
    'privacidad.html'                 : 'en/privacy.html',
    'terminos.html'                   : 'en/terms.html',
    'test.html'                       : 'en/quiz.html',
    'blog/index.html'                 : 'en/blog/index.html',
    'blog/amor-real.html'             : 'en/blog/real-love.html',
    'blog/observador-consciente.html' : 'en/blog/conscious-observer.html',
    'blog/perdon-transformacion.html' : 'en/blog/forgiveness-transformation.html',
    'blog/el-control.html'            : 'en/blog/control.html',
    'blog/las-expectativas.html'      : 'en/blog/expectations.html',
    'blog/siete-leyes-universales.html':'en/blog/seven-universal-laws.html'
  };

  // Invertir para EN -> ES
  var RMAP = {};
  for (var k in MAP){
    if (!RMAP[MAP[k]]) RMAP[MAP[k]] = k;
  }

  function isEN(){
    return (document.documentElement.getAttribute('lang')||'es').toLowerCase().indexOf('en') === 0;
  }

  // Ruta actual relativa a /docs/  (soporta el dominio y github.io)
  function currentKey(){
    var p = window.location.pathname;
    p = p.replace(/^\/inisch-web\/docs\//, '/').replace(/^\/docs\//, '/');
    p = p.replace(/^\//, '');
    if (p === '' || p.slice(-1) === '/') p += 'index.html';
    return p;
  }

  // Cuantos niveles hay que subir para llegar a la raiz del sitio
  function upPrefix(key){
    var depth = (key.match(/\//g) || []).length;
    return depth ? new Array(depth+1).join('../') : '';
  }

  function targetHref(){
    var key = currentKey();
    var up  = upPrefix(key);
    var t;
    if (isEN()){
      t = RMAP[key];
      if (!t){
        // respaldo: si no esta mapeada, ir al inicio en espanol
        t = 'index.html';
      }
    } else {
      t = MAP[key];
      if (!t){
        t = 'en/index.html';
      }
    }
    return up + t;
  }

  function build(){
    if (document.querySelector('.lang-toggle')) return;
    var nav = document.querySelector('nav');
    if (!nav) return;

    var a = document.createElement('a');
    a.className = 'lang-toggle';
    a.href = targetHref();
    var to = isEN() ? 'ES' : 'EN';
    a.innerHTML = '<span class="lt-globe" aria-hidden="true">\u2295</span><span class="lt-code">' + to + '</span>';
    a.setAttribute('lang', isEN() ? 'es' : 'en');
    a.setAttribute('title',  isEN() ? 'Ver esta p\u00e1gina en espa\u00f1ol' : 'View this page in English');
    a.setAttribute('aria-label', isEN() ? 'Ver esta p\u00e1gina en espa\u00f1ol' : 'View this page in English');

    // Insertar justo antes del selector de tema
    var theme = nav.querySelector('.theme-toggle');
    if (theme && theme.parentNode === nav){
      nav.insertBefore(a, theme);
    } else {
      nav.appendChild(a);
    }

    // Quitar el enlace de idioma viejo del menu para no duplicarlo
    var links = nav.querySelector('.navlinks');
    if (links){
      var olds = links.querySelectorAll('a');
      for (var i = olds.length - 1; i >= 0; i--){
        var txt = (olds[i].textContent || '').trim().toUpperCase();
        if (txt === 'EN' || txt === 'ES'){ olds[i].parentNode.removeChild(olds[i]); }
      }
    }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
