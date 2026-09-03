/* Aparicion progresiva al hacer scroll.
   Marca los elementos automaticamente, sin tocar el HTML de cada pagina.
   Respeta la preferencia de movimiento reducido del sistema. */
(function(){

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  if (!('IntersectionObserver' in window)) return;

  function mark(){
    // Bloques individuales que entran de uno en uno
    var solo = document.querySelectorAll(
      '.section-head, .cta-final, .pull-quote, .page-hero .lead, article > h2, article > blockquote'
    );
    for (var i=0;i<solo.length;i++){ solo[i].classList.add('reveal'); }

    // Rejillas: los hijos entran escalonados
    var grids = document.querySelectorAll(
      '.card-grid, .etapa-grid, .who-grid, .pillars, .blog-grid, .foot-grid, .contrast'
    );
    for (var j=0;j<grids.length;j++){ grids[j].classList.add('reveal-stagger'); }
  }

  function observe(){
    var els = document.querySelectorAll('.reveal, .reveal-stagger');
    if (!els.length) return;

    var io = new IntersectionObserver(function(entries){
      for (var i=0;i<entries.length;i++){
        if (entries[i].isIntersecting){
          entries[i].target.classList.add('in');
          io.unobserve(entries[i].target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    for (var k=0;k<els.length;k++){
      // Lo que ya esta visible al cargar aparece de inmediato, sin esperar scroll
      var r = els[k].getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92){
        els[k].classList.add('in');
      } else {
        io.observe(els[k]);
      }
    }
  }

  function init(){ mark(); observe(); }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
